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

/** Extends FieldValue to conform to Encodable. */
extension FieldValue: Encodable {
  /// Encoding a FieldValue will throw by default unless the encoder implementation
  /// explicitly handles it, which is what Firestore.Encoder does.
  public func encode(to encoder: Encoder) throws {
    throw FirestoreEncodingError.encodingIsNotSupported(
      "FieldValue values can only be encoded with Firestore.Encoder"
    )
  }
}
