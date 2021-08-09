/*
 * Copyright 2019 Google
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import FirebaseFirestore

#if compiler(>=5.1)
  /// A type that can initialize itself from a Firestore `DocumentReference`,
  /// which makes it suitable for use with the `@DocumentID` property wrapper.
  ///
  /// Firestore includes extensions that make `String` and `DocumentReference`
  /// conform to `DocumentIDWrappable`.
  ///
  /// Note that Firestore ignores fields annotated with `@DocumentID` when writing
  /// so there is no requirement to convert from the wrapped type back to a
  /// `DocumentReference`.
  public protocol DocumentIDWrappable {
    /// Creates a new instance by converting from the given `DocumentReference`.
    static func wrap(_ documentReference: DocumentReference) throws -> Self
  }

  extension String: DocumentIDWrappable {
    public static func wrap(_ documentReference: DocumentReference) throws -> Self {
      return documentReference.documentID
    }
  }

  extension DocumentReference: DocumentIDWrappable {
    public static func wrap(_ documentReference: DocumentReference) throws -> Self {
      // Swift complains that values of type DocumentReference cannot be returned
      // as Self which is nonsensical. The cast forces this to work.
      return documentReference as! Self
    }
  }

  /// An internal protocol that allows Firestore.Decoder to test if a type is a
  /// DocumentID of some kind without knowing the specific generic parameter that
  /// the user actually used.
  ///
  /// This is required because Swift does not define an existential type for all
  /// instances of a generic class--that is, it has no wildcard or raw type that
  /// matches a generic without any specific parameter. Swift does define an
  /// existential type for protocols though, so this protocol (to which DocumentID
  /// conforms) indirectly makes it possible to test for and act on any
  /// `DocumentID<Value>`.
  internal protocol DocumentIDProtocol {
    /// Initializes the DocumentID from a DocumentReference.
    init(from documentReference: DocumentReference?) throws
  }

  /// A value that is populated in Codable objects with the `DocumentReference`
  /// of the current document by the Firestore.Decoder when a document is read.
  ///
  /// If the field name used for this type conflicts with a read document field,
  /// an error is thrown. For example, if a custom object has a field `firstName`
  /// annotated with `@DocumentID`, and there is a property from the document
  /// named `firstName` as well, an error is thrown when you try to read the
  /// document.
  ///
  /// When writing a Codable object containing an `@DocumentID` annotated field,
  /// its value is ignored. This allows you to read a document from one path and
  /// write it into another without adjusting the value here.
  ///
  /// NOTE: Trying to encode/decode this type using encoders/decoders other than
  /// Firestore.Encoder leads to an error.
  @propertyWrapper
  public struct DocumentID<Value: DocumentIDWrappable & Codable>:
    DocumentIDProtocol, Codable {
    var value: Value?

    public init(wrappedValue value: Value?) {
      self.value = value
    }

    public var wrappedValue: Value? {
      get { value }
      set { value = newValue }
    }

    // MARK: - `DocumentIDProtocol` conformance

    public init(from documentReference: DocumentReference?) throws {
      if let documentReference = documentReference {
        value = try Value.wrap(documentReference)
      } else {
        value = nil
      }
    }

    // MARK: - `Codable` implementation.

    public init(from decoder: Decoder) throws {
      throw FirestoreDecodingError.decodingIsNotSupported(
        "DocumentID values can only be decoded with Firestore.Decoder"
      )
    }

    public func encode(to encoder: Encoder) throws {
      throw FirestoreEncodingError.encodingIsNotSupported(
        "DocumentID values can only be encoded with Firestore.Encoder"
      )
    }
  }

  extension DocumentID: Equatable where Value: Equatable {}

  extension DocumentID: Hashable where Value: Hashable {}
#endif // compiler(>=5.1)
