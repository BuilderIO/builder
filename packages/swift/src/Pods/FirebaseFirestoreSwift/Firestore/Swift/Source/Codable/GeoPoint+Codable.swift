/*
 * Copyright 2018 Google
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
 * A protocol describing the encodable properties of a GeoPoint.
 *
 * Note: this protocol exists as a workaround for the Swift compiler: if the GeoPoint class
 * was extended directly to conform to Codable, the methods implementing the protocol would be need
 * to be marked required but that can't be done in an extension. Declaring the extension on the
 * protocol sidesteps this issue.
 */
private protocol CodableGeoPoint: Codable {
  var latitude: Double { get }
  var longitude: Double { get }

  init(latitude: Double, longitude: Double)
}

/** The keys in a GeoPoint. Must match the properties of CodableGeoPoint. */
private enum GeoPointKeys: String, CodingKey {
  case latitude
  case longitude
}

/**
 * An extension of GeoPoint that implements the behavior of the Codable protocol.
 *
 * Note: this is implemented manually here because the Swift compiler can't synthesize these methods
 * when declaring an extension to conform to Codable.
 */
extension CodableGeoPoint {
  public init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: GeoPointKeys.self)
    let latitude = try container.decode(Double.self, forKey: .latitude)
    let longitude = try container.decode(Double.self, forKey: .longitude)
    self.init(latitude: latitude, longitude: longitude)
  }

  public func encode(to encoder: Encoder) throws {
    var container = encoder.container(keyedBy: GeoPointKeys.self)
    try container.encode(latitude, forKey: .latitude)
    try container.encode(longitude, forKey: .longitude)
  }
}

/** Extends GeoPoint to conform to Codable. */
extension GeoPoint: CodableGeoPoint {}
