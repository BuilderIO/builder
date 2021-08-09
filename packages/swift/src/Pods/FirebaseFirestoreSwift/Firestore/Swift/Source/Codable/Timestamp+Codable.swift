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

/**
 * A protocol describing the encodable properties of a Timestamp.
 *
 * Note: this protocol exists as a workaround for the Swift compiler: if the Timestamp class
 * was extended directly to conform to Codable, the methods implementing the protocol would be need
 * to be marked required but that can't be done in an extension. Declaring the extension on the
 * protocol sidesteps this issue.
 */
private protocol CodableTimestamp: Codable {
  var seconds: Int64 { get }
  var nanoseconds: Int32 { get }

  init(seconds: Int64, nanoseconds: Int32)
}

/** The keys in a Timestamp. Must match the properties of CodableTimestamp. */
private enum TimestampKeys: String, CodingKey {
  case seconds
  case nanoseconds
}

/**
 * An extension of Timestamp that implements the behavior of the Codable protocol.
 *
 * Note: this is implemented manually here because the Swift compiler can't synthesize these methods
 * when declaring an extension to conform to Codable.
 */
extension CodableTimestamp {
  public init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: TimestampKeys.self)
    let seconds = try container.decode(Int64.self, forKey: .seconds)
    let nanoseconds = try container.decode(Int32.self, forKey: .nanoseconds)
    self.init(seconds: seconds, nanoseconds: nanoseconds)
  }

  public func encode(to encoder: Encoder) throws {
    var container = encoder.container(keyedBy: TimestampKeys.self)
    try container.encode(seconds, forKey: .seconds)
    try container.encode(nanoseconds, forKey: .nanoseconds)
  }
}

/** Extends Timestamp to conform to Codable. */
extension Timestamp: CodableTimestamp {}
