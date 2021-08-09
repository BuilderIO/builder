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

#include "Firestore/core/include/firebase/firestore/geo_point.h"

#include <cmath>
#include <iostream>

#include "Firestore/core/src/util/hard_assert.h"
#include "absl/strings/str_cat.h"

namespace firebase {
namespace firestore {

GeoPoint::GeoPoint(double latitude, double longitude)
    : latitude_(latitude), longitude_(longitude) {
  HARD_ASSERT(!std::isnan(latitude) && -90 <= latitude && latitude <= 90,
              "Latitude must be in the range of [-90, 90]");
  HARD_ASSERT(!std::isnan(longitude) && -180 <= longitude && longitude <= 180,
              "Latitude must be in the range of [-180, 180]");
}

std::string GeoPoint::ToString() const {
  return absl::StrCat("GeoPoint(latitude=", latitude_,
                      ", longitude=", longitude_, ")");
}

std::ostream& operator<<(std::ostream& out, const GeoPoint& geo_point) {
  return out << geo_point.ToString();
}

bool operator<(const GeoPoint& lhs, const GeoPoint& rhs) {
  if (lhs.latitude() == rhs.latitude()) {
    return lhs.longitude() < rhs.longitude();
  } else {
    return lhs.latitude() < rhs.latitude();
  }
}

}  // namespace firestore
}  // namespace firebase
