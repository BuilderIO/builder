// This file is derived from swift/stdlib/public/SDK/Foundation/JSONEncoder.swift
// and swift/stdlib/public/SDK/Foundation/PlistEncoder.swift

//===----------------------------------------------------------------------===//
//
// This source file is part of the Swift.org open source project
//
// Copyright (c) 2014 - 2017 Apple Inc. and the Swift project authors
// Licensed under Apache License v2.0 with Runtime Library Exception
//
// See https://swift.org/LICENSE.txt for license information
// See https://swift.org/CONTRIBUTORS.txt for the list of Swift project authors
//
//===----------------------------------------------------------------------===//

import FirebaseFirestore
import Foundation

extension Firestore {
  public struct Encoder {
    public init() {}
    /// Returns encoded data that Firestore API recognizes.
    ///
    /// If possible, all types will be converted to compatible types Firestore
    /// can handle. This means certain Firestore specific types will be encoded
    /// as pass-through: this encoder will only pass those types along since that
    /// is what Firestore can handle. The same types will be encoded differently
    /// with other encoders (for example: JSONEncoder).
    ///
    /// The Firestore pass-through types are:
    ///   - GeoPoint
    ///   - Timestamp
    ///   - DocumentReference
    ///
    /// - Parameter value: The Encodable object to convert to encoded data.
    /// - Returns: A Map keyed by String representing a document Firestore
    ///            API can work with.
    public func encode<T: Encodable>(_ value: T) throws -> [String: Any] {
      // SelfDocumentID, DocumentReference and FieldValue cannot be
      // encoded directly.
      guard T.self != DocumentReference.self,
        T.self != FieldValue.self else {
        throw EncodingError
          .invalidValue(value,
                        EncodingError
                          .Context(codingPath: [],
                                   debugDescription: "Top-level \(T.self) is not allowed."))
      }
      guard let topLevel = try _FirestoreEncoder().box_(value) else {
        throw EncodingError.invalidValue(value,
                                         EncodingError.Context(codingPath: [],
                                                               debugDescription: "Top-level \(T.self) did not encode any values."))
      }

      // This is O(n) check. Consider refactoring box_ to return [String: Any].
      guard let dict = topLevel as? [String: Any] else {
        throw EncodingError.invalidValue(value,
                                         EncodingError.Context(codingPath: [],
                                                               debugDescription: "Top-level \(T.self) encoded not as dictionary."))
      }
      return dict
    }
  }
}

private class _FirestoreEncoder: Encoder {
  /// A stack of data containers storing encoded results. When a new object is being encoded,
  /// a corresponding storage is pushed to the stack; and when the field and all of its children objects
  /// are encoded, the stoage should have the entire encoded result for the sub-tree, it is then poped
  /// out and written to the proper place of the new stack top container by referencing to the top of `codingPath`.
  fileprivate var storage: _FirestoreEncodingStorage
  /// An array used as a stack to keep track of where in the encoded data tree the encoder is trying to process
  /// at the moment.
  public fileprivate(set) var codingPath: [CodingKey]
  public var userInfo: [CodingUserInfoKey: Any] = [:]

  init() {
    storage = _FirestoreEncodingStorage()
    codingPath = []
  }

  /// Returns whether we should allocate new container to store encoded result for the current
  /// codingPath.
  ///
  /// `true` if no container has been allocated for this coding path; `false` otherwise.
  fileprivate var shouldAllocateNewContainer: Bool {
    // The encoder starts with storage.count == codingPath.count == 0, which means it is encoding the root
    // object without any container allocated, so when a container is requested, it must be allocated
    // first. When a container is requested again with the same codingPath however, for another field from the root object possibly,
    // because now storage.count == codingPath + 1, we should not allocate new containers because there are
    // already encoded results in the container. This relation between the two stacks is maintained
    // throughout the encoding process.
    return storage.count == codingPath.count
  }

  // MARK: - Encoder Methods

  public func container<Key>(keyedBy _: Key.Type) -> KeyedEncodingContainer<Key> {
    // If an existing keyed container was already requested, return that one.
    let topContainer: NSMutableDictionary
    if shouldAllocateNewContainer {
      // We haven't yet pushed a container at this level; do so here.
      topContainer = storage.pushKeyedContainer()
    } else {
      guard let container = storage.containers.last as? NSMutableDictionary else {
        preconditionFailure(
          "Attempt to push new keyed encoding container when already previously encoded at this path."
        )
      }

      topContainer = container
    }

    let container = _FirestoreKeyedEncodingContainer<Key>(referencing: self, codingPath: codingPath,
                                                          wrapping: topContainer)
    return KeyedEncodingContainer(container)
  }

  public func unkeyedContainer() -> UnkeyedEncodingContainer {
    // If an existing unkeyed container was already requested, return that one.
    let topContainer: NSMutableArray
    if shouldAllocateNewContainer {
      // We haven't yet pushed a container at this level; do so here.
      topContainer = storage.pushUnkeyedContainer()
    } else {
      guard let container = storage.containers.last as? NSMutableArray else {
        preconditionFailure(
          "Attempt to push new unkeyed encoding container when already previously encoded at this path."
        )
      }

      topContainer = container
    }

    return _FirestoreUnkeyedEncodingContainer(referencing: self, codingPath: codingPath,
                                              wrapping: topContainer)
  }

  public func singleValueContainer() -> SingleValueEncodingContainer {
    return self
  }
}

private struct _FirestoreEncodingStorage {
  // MARK: Properties

  /// The container stack.
  /// Elements may be any one of the plist types (NSNumber, NSString, NSDate, NSArray, NSDictionary).
  fileprivate private(set) var containers: [NSObject] = []

  // MARK: - Initialization

  /// Initializes `self` with no containers.
  fileprivate init() {}

  // MARK: - Modifying the Stack

  fileprivate var count: Int {
    return containers.count
  }

  fileprivate mutating func pushKeyedContainer() -> NSMutableDictionary {
    let dictionary = NSMutableDictionary()
    containers.append(dictionary)
    return dictionary
  }

  fileprivate mutating func pushUnkeyedContainer() -> NSMutableArray {
    let array = NSMutableArray()
    containers.append(array)
    return array
  }

  fileprivate mutating func push(container: NSObject) {
    containers.append(container)
  }

  fileprivate mutating func popContainer() -> NSObject {
    precondition(containers.count > 0, "Empty container stack.")
    let ret = containers.popLast()!
    return ret
  }
}

private struct _FirestoreKeyedEncodingContainer<K: CodingKey>: KeyedEncodingContainerProtocol {
  typealias Key = K

  // MARK: Properties

  /// A reference to the encoder we're writing to.
  private let encoder: _FirestoreEncoder

  /// A reference to the container we're writing to.
  private let container: NSMutableDictionary

  /// The path of coding keys taken to get to this point in encoding.
  public private(set) var codingPath: [CodingKey]

  // MARK: - Initialization

  /// Initializes `self` with the given references.
  fileprivate init(referencing encoder: _FirestoreEncoder,
                   codingPath: [CodingKey],
                   wrapping container: NSMutableDictionary) {
    self.encoder = encoder
    self.codingPath = codingPath
    self.container = container
  }

  // MARK: - KeyedEncodingContainerProtocol Methods

  public mutating func encodeNil(forKey key: Key) throws { container[key.stringValue] = NSNull() }
  public mutating func encode(_ value: Bool, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: Int, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: Int8, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: Int16, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: Int32, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: Int64, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: UInt, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: UInt8, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: UInt16, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: UInt32, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: UInt64, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: String, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: Float, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode(_ value: Double, forKey key: Key) throws {
    container[key.stringValue] = encoder.box(value)
  }

  public mutating func encode<T: Encodable>(_ value: T, forKey key: Key) throws {
    #if compiler(>=5.1)
      // `DocumentID`-annotated fields are ignored during encoding.
      if T.self is DocumentIDProtocol.Type {
        return
      }
    #endif // compiler(>=5.1)

    encoder.codingPath.append(key)
    defer {
      encoder.codingPath.removeLast()
    }
    container[key.stringValue] = try encoder.box(value)
  }

  public mutating func nestedContainer<NestedKey>(keyedBy _: NestedKey.Type,
                                                  forKey key: Key)
    -> KeyedEncodingContainer<NestedKey> {
    let dictionary = NSMutableDictionary()
    self.container[key.stringValue] = dictionary

    codingPath.append(key)
    defer {
      codingPath.removeLast()
    }

    let container = _FirestoreKeyedEncodingContainer<NestedKey>(referencing: encoder,
                                                                codingPath: codingPath,
                                                                wrapping: dictionary)
    return KeyedEncodingContainer(container)
  }

  public mutating func nestedUnkeyedContainer(forKey key: Key) -> UnkeyedEncodingContainer {
    let array = NSMutableArray()
    container[key.stringValue] = array

    codingPath.append(key)
    defer {
      codingPath.removeLast()
    }
    return _FirestoreUnkeyedEncodingContainer(referencing: encoder, codingPath: codingPath,
                                              wrapping: array)
  }

  public mutating func superEncoder() -> Encoder {
    return _FirestoreReferencingEncoder(referencing: encoder, at: _FirestoreKey.super,
                                        wrapping: container)
  }

  public mutating func superEncoder(forKey key: Key) -> Encoder {
    return _FirestoreReferencingEncoder(referencing: encoder, at: key, wrapping: container)
  }
}

private struct _FirestoreUnkeyedEncodingContainer: UnkeyedEncodingContainer {
  // MARK: Properties

  /// A reference to the encoder we're writing to.
  private let encoder: _FirestoreEncoder

  /// A reference to the container we're writing to.
  private let container: NSMutableArray

  /// The path of coding keys taken to get to this point in encoding.
  public private(set) var codingPath: [CodingKey]

  /// The number of elements encoded into the container.
  public var count: Int {
    return container.count
  }

  // MARK: - Initialization

  /// Initializes `self` with the given references.
  fileprivate init(referencing encoder: _FirestoreEncoder,
                   codingPath: [CodingKey],
                   wrapping container: NSMutableArray) {
    self.encoder = encoder
    self.codingPath = codingPath
    self.container = container
  }

  // MARK: - UnkeyedEncodingContainer Methods

  public mutating func encodeNil() throws { container.add(NSNull()) }
  public mutating func encode(_ value: Bool) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: Int) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: Int8) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: Int16) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: Int32) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: Int64) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: UInt) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: UInt8) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: UInt16) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: UInt32) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: UInt64) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: Float) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: Double) throws { container.add(encoder.box(value)) }
  public mutating func encode(_ value: String) throws { container.add(encoder.box(value)) }

  public mutating func encode<T: Encodable>(_ value: T) throws {
    encoder.codingPath.append(_FirestoreKey(index: count))
    defer { encoder.codingPath.removeLast()
    }
    container.add(try encoder.box(value))
  }

  public mutating func nestedContainer<NestedKey>(keyedBy _: NestedKey
    .Type) -> KeyedEncodingContainer<NestedKey> {
    codingPath.append(_FirestoreKey(index: count))
    defer {
      self.codingPath.removeLast()
    }

    let dictionary = NSMutableDictionary()
    self.container.add(dictionary)

    let container = _FirestoreKeyedEncodingContainer<NestedKey>(referencing: encoder,
                                                                codingPath: codingPath,
                                                                wrapping: dictionary)
    return KeyedEncodingContainer(container)
  }

  public mutating func nestedUnkeyedContainer() -> UnkeyedEncodingContainer {
    codingPath.append(_FirestoreKey(index: count))
    defer {
      self.codingPath.removeLast()
    }

    let array = NSMutableArray()
    container.add(array)
    return _FirestoreUnkeyedEncodingContainer(referencing: encoder, codingPath: codingPath,
                                              wrapping: array)
  }

  public mutating func superEncoder() -> Encoder {
    return _FirestoreReferencingEncoder(referencing: encoder, at: container.count,
                                        wrapping: container)
  }
}

struct _FirestoreKey: CodingKey {
  public var stringValue: String
  public var intValue: Int?

  public init?(stringValue: String) {
    self.stringValue = stringValue
    intValue = nil
  }

  public init?(intValue: Int) {
    stringValue = "\(intValue)"
    self.intValue = intValue
  }

  init(index: Int) {
    stringValue = "Index \(index)"
    intValue = index
  }

  static let `super` = _FirestoreKey(stringValue: "super")!
}

extension _FirestoreEncoder {
  /// Returns the given value boxed in a container appropriate for pushing onto the container stack.
  fileprivate func box(_ value: Bool) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: Int) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: Int8) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: Int16) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: Int32) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: Int64) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: UInt) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: UInt8) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: UInt16) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: UInt32) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: UInt64) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: Float) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: Double) -> NSObject { return NSNumber(value: value) }
  fileprivate func box(_ value: String) -> NSObject { return NSString(string: value) }

  fileprivate func box<T: Encodable>(_ value: T) throws -> NSObject {
    return try box_(value) ?? NSDictionary()
  }

  func box_<T: Encodable>(_ value: T) throws -> NSObject? {
    if T.self == Date.self || T.self == NSDate.self {
      return (value as! NSDate)
    } else if T.self == Data.self || T.self == NSData.self {
      return (value as! NSData)
    } else if T.self == URL.self || T.self == NSURL.self {
      return box((value as! URL).absoluteString)
    } else if T.self == Decimal.self || T.self == NSDecimalNumber.self {
      return (value as! NSDecimalNumber)
    } else if isFirestorePassthroughType(value) {
      // This is a native Firestore types that we don't need to encode.
      return (value as! NSObject)
    }

    // The value should request a container from the _FirestoreEncoder.
    let depth = storage.count
    do {
      try value.encode(to: self)
    } catch {
      // If the value pushed a container before throwing, pop it back off to restore state.
      if storage.count > depth {
        _ = storage.popContainer()
      }

      throw error
    }

    // The top container should be a new container.
    guard storage.count > depth else {
      return nil
    }

    return storage.popContainer()
  }
}

extension _FirestoreEncoder: SingleValueEncodingContainer {
  // MARK: - SingleValueEncodingContainer Methods

  private func assertCanEncodeNewValue() {
    precondition(shouldAllocateNewContainer,
                 "Attempt to encode value through single value container when previously value already encoded.")
  }

  public func encodeNil() throws {
    assertCanEncodeNewValue()
    storage.push(container: NSNull())
  }

  public func encode(_ value: Bool) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: Int) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: Int8) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: Int16) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: Int32) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: Int64) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: UInt) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: UInt8) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: UInt16) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: UInt32) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: UInt64) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: String) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: Float) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode(_ value: Double) throws {
    assertCanEncodeNewValue()
    storage.push(container: box(value))
  }

  public func encode<T: Encodable>(_ value: T) throws {
    assertCanEncodeNewValue()
    try storage.push(container: box(value))
  }
}

/// Special subclass of `_FirestoreEncoder` used by `superEncoder`.
/// It inherits the codingPath from the referencing `_FirestoreEncoder` but uses its own
/// storage. The encoded result will be written back to the referencing encoder's storage
/// when it is `deinit`-ed.
private class _FirestoreReferencingEncoder: _FirestoreEncoder {
  // MARK: Reference types.

  /// The type of container we're referencing, and where to write the encoded result to.
  private enum Reference {
    /// Referencing a specific index in an array container.
    case array(NSMutableArray, Int)

    /// Referencing a specific key in a dictionary container.
    case dictionary(NSMutableDictionary, String)
  }

  // MARK: - Properties

  /// The encoder we're referencing.
  private let encoder: _FirestoreEncoder

  /// The container reference itself.
  private let reference: Reference

  // MARK: - Initialization

  /// Initializes `self` by referencing the given array container in the given encoder.
  fileprivate init(referencing encoder: _FirestoreEncoder,
                   at index: Int,
                   wrapping array: NSMutableArray) {
    self.encoder = encoder
    reference = .array(array, index)
    super.init()
    codingPath = encoder.codingPath

    codingPath.append(_FirestoreKey(index: index))
  }

  /// Initializes `self` by referencing the given dictionary container in the given encoder.
  fileprivate init(referencing encoder: _FirestoreEncoder,
                   at key: CodingKey,
                   wrapping dictionary: NSMutableDictionary) {
    self.encoder = encoder
    reference = .dictionary(dictionary, key.stringValue)
    super.init()
    codingPath = encoder.codingPath
    codingPath.append(key)
  }

  // MARK: - Coding Path Operations

  override fileprivate var shouldAllocateNewContainer: Bool {
    // With a regular encoder, the storage and coding path grow together.
    // A referencing encoder, however, inherits its parents coding path, as well as the key it was created for.
    // We have to take this into account.
    return storage.count == codingPath.count - encoder.codingPath.count - 1
  }

  // MARK: - Deinitialization

  // Finalizes `self` by writing the contents of our storage to the referenced encoder's storage.
  deinit {
    let value: Any
    switch storage.count {
    case 0: value = NSDictionary()
    case 1: value = self.storage.popContainer()
    default: fatalError("Referencing encoder deallocated with multiple containers on stack.")
    }

    switch self.reference {
    case let .array(array, index):
      array.insert(value, at: index)

    case let .dictionary(dictionary, key):
      dictionary[NSString(string: key)] = value
    }
  }
}
