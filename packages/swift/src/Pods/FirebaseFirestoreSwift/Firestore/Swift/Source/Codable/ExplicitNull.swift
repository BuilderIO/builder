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
  /// Wraps an `Optional` field in a `Codable` object such that when the field
  /// has a `nil` value it will encode to a null value in Firestore. Normally,
  /// optional fields are omitted from the encoded document.
  ///
  /// This is useful for ensuring a field is present in a Firestore document,
  /// even when there is no associated value.
  @propertyWrapper
  public struct ExplicitNull<Value> {
    var value: Value?

    public init(wrappedValue value: Value?) {
      self.value = value
    }

    public var wrappedValue: Value? {
      get { value }
      set { value = newValue }
    }
  }

  extension ExplicitNull: Equatable where Value: Equatable {}

  extension ExplicitNull: Hashable where Value: Hashable {}

  extension ExplicitNull: Encodable where Value: Encodable {
    public func encode(to encoder: Encoder) throws {
      var container = encoder.singleValueContainer()
      if let value = value {
        try container.encode(value)
      } else {
        try container.encodeNil()
      }
    }
  }

  extension ExplicitNull: Decodable where Value: Decodable {
    public init(from decoder: Decoder) throws {
      let container = try decoder.singleValueContainer()
      if container.decodeNil() {
        value = nil
      } else {
        value = try container.decode(Value.self)
      }
    }
  }
#endif // compiler(>=5.1)

/// A compatibility version of `ExplicitNull` that does not use property
/// wrappers, suitable for use in older versions of Swift.
///
/// Wraps an `Optional` field in a `Codable` object such that when the field
/// has a `nil` value it will encode to a null value in Firestore. Normally,
/// optional fields are omitted from the encoded document.
///
/// This is useful for ensuring a field is present in a Firestore document,
/// even when there is no associated value.
@available(swift, deprecated: 5.1)
public enum Swift4ExplicitNull<Wrapped> {
  case none
  case some(Wrapped)

  /// Create a `ExplicitNull` object from `Optional`.
  public init(_ optional: Wrapped?) {
    switch optional {
    case .none:
      self = .none
    case let .some(wrapped):
      self = .some(wrapped)
    }
  }

  /// Returns this value as an `Optional<Wrapped>`.
  public var optionalValue: Wrapped? {
    switch self {
    case .none:
      return .none
    case let .some(wrapped):
      return .some(wrapped)
    }
  }
}

@available(swift, deprecated: 5.1)
extension Swift4ExplicitNull: Equatable where Wrapped: Equatable {}

@available(swift, deprecated: 5.1)
extension Swift4ExplicitNull: Encodable where Wrapped: Encodable {
  public func encode(to encoder: Encoder) throws {
    var container = encoder.singleValueContainer()
    switch self {
    case .none:
      try container.encodeNil()
    case let .some(wrapped):
      try container.encode(wrapped)
    }
  }
}

@available(swift, deprecated: 5.1)
extension Swift4ExplicitNull: Decodable where Wrapped: Decodable {
  public init(from decoder: Decoder) throws {
    let container = try decoder.singleValueContainer()
    if container.decodeNil() {
      self = .none
    } else {
      self = .some(try container.decode(Wrapped.self))
    }
  }
}
