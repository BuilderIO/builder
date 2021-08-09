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

/** Mark DocumentReference to conform to Codable. */

/**
 * A protocol describing the encodable properties of a DocumentReference.
 *
 * Note: this protocol exists as a workaround for the Swift compiler: if the DocumentReference class
 * was extended directly to conform to Codable, the methods implementing the protocol would be need
 * to be marked required but that can't be done in an extension. Declaring the extension on the
 * protocol sidesteps this issue.
 */
private protocol CodableDocumentReference: Codable {}

/**
 * DocumentReference's codable implmentation will just throw for most
 * encoder/decoder however. It is only meant to be encoded by Firestore.Encoder/Firestore.Decoder.
 */
extension CodableDocumentReference {
  public init(from decoder: Decoder) throws {
    throw FirestoreDecodingError.decodingIsNotSupported(
      "DocumentReference values can only be decoded with Firestore.Decoder"
    )
  }

  public func encode(to encoder: Encoder) throws {
    throw FirestoreEncodingError.encodingIsNotSupported(
      "DocumentReference values can only be encoded with Firestore.Encoder"
    )
  }
}

extension DocumentReference: CodableDocumentReference {}
