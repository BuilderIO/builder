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

import Foundation
import FirebaseFirestore

extension WriteBatch {
  /// Encodes an instance of `Encodable` and overwrites the encoded data
  /// to the document referred by `doc`. If no document exists,
  /// it is created. If a document already exists, it is overwritten.
  ///
  /// See `Firestore.Encoder` for more details about the encoding process.
  ///
  /// - Parameters:
  ///   - value: An instance of `Encodable` to be encoded to a document.
  ///   - encoder: The encoder instance to use to run the encoding.
  ///   - doc: The document to create/overwrite the encoded data to.
  /// - Returns: This instance of `WriteBatch`. Used for chaining method calls.
  @discardableResult
  public func setData<T: Encodable>(from value: T,
                                    forDocument doc: DocumentReference,
                                    encoder: Firestore.Encoder = Firestore
                                      .Encoder()) throws -> WriteBatch {
    setData(try encoder.encode(value), forDocument: doc)
    return self
  }

  /// Encodes an instance of `Encodable` and overwrites the encoded data
  /// to the document referred by `doc`. If no document exists,
  /// it is created. If a document already exists, it is overwritten.  If you pass
  /// merge:true, the provided `Encodable` will be merged into any existing document.
  ///
  /// See `Firestore.Encoder` for more details about the encoding process.
  ///
  /// - Parameters:
  ///   - value: An instance of `Encodable` to be encoded to a document.
  ///   - doc: The document to create/overwrite the encoded data to.
  ///   - merge: Whether to merge the provided `Encodable` into any existing
  ///            document.
  ///   - encoder: The encoder instance to use to run the encoding.
  /// - Returns: This instance of `WriteBatch`. Used for chaining method calls.
  @discardableResult
  public func setData<T: Encodable>(from value: T,
                                    forDocument doc: DocumentReference,
                                    merge: Bool,
                                    encoder: Firestore.Encoder = Firestore
                                      .Encoder()) throws -> WriteBatch {
    setData(try encoder.encode(value), forDocument: doc, merge: merge)
    return self
  }

  /// Encodes an instance of `Encodable` and writes the encoded data to the document referred
  /// by `doc` by only replacing the fields specified under `mergeFields`.
  /// Any field that is not specified in mergeFields is ignored and remains untouched. If the
  /// document doesn’t yet exist, this method creates it and then sets the data.
  ///
  /// It is an error to include a field in `mergeFields` that does not have a corresponding
  /// field in the `Encodable`.
  ///
  /// See `Firestore.Encoder` for more details about the encoding process.
  ///
  /// - Parameters:
  ///   - value: An instance of `Encodable` to be encoded to a document.
  ///   - doc: The document to create/overwrite the encoded data to.
  ///   - mergeFields: Array of `String` or `FieldPath` elements specifying which fields to
  ///                  merge. Fields can contain dots to reference nested fields within the
  ///                  document.
  ///   - encoder: The encoder instance to use to run the encoding.
  /// - Returns: This instance of `WriteBatch`. Used for chaining method calls.
  @discardableResult
  public func setData<T: Encodable>(from value: T,
                                    forDocument doc: DocumentReference,
                                    mergeFields: [Any],
                                    encoder: Firestore.Encoder = Firestore
                                      .Encoder()) throws -> WriteBatch {
    setData(try encoder.encode(value), forDocument: doc, mergeFields: mergeFields)
    return self
  }
}
