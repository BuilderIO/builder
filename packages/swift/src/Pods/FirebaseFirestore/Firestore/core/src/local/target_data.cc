/*
 * Copyright 2018 Google LLC
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

#include "Firestore/core/src/local/target_data.h"

#include <ostream>
#include <sstream>
#include <utility>

namespace firebase {
namespace firestore {
namespace local {
namespace {

using core::Target;
using model::ListenSequenceNumber;
using model::SnapshotVersion;
using model::TargetId;
using nanopb::ByteString;

// MARK: - QueryPurpose

const char* ToString(QueryPurpose purpose) {
  switch (purpose) {
    case QueryPurpose::Listen:
      return "Listen";
    case QueryPurpose::ExistenceFilterMismatch:
      return "ExistenceFilterMismatch";
    case QueryPurpose::LimboResolution:
      return "LimboResolution";
  }

  UNREACHABLE();
}

}  // namespace

std::ostream& operator<<(std::ostream& os, QueryPurpose purpose) {
  return os << ToString(purpose);
}

// MARK: - TargetData

TargetData::TargetData(Target target,
                       TargetId target_id,
                       ListenSequenceNumber sequence_number,
                       QueryPurpose purpose,
                       SnapshotVersion snapshot_version,
                       SnapshotVersion last_limbo_free_snapshot_version,
                       ByteString resume_token)
    : target_(std::move(target)),
      target_id_(target_id),
      sequence_number_(sequence_number),
      purpose_(purpose),
      snapshot_version_(std::move(snapshot_version)),
      last_limbo_free_snapshot_version_(
          std::move(last_limbo_free_snapshot_version)),
      resume_token_(std::move(resume_token)) {
}

TargetData::TargetData(Target target,
                       int target_id,
                       ListenSequenceNumber sequence_number,
                       QueryPurpose purpose)
    : TargetData(std::move(target),
                 target_id,
                 sequence_number,
                 purpose,
                 SnapshotVersion::None(),
                 SnapshotVersion::None(),
                 ByteString()) {
}

TargetData TargetData::Invalid() {
  return TargetData({}, /*target_id=*/-1, /*sequence_number=*/-1,
                    QueryPurpose::Listen,
                    SnapshotVersion(SnapshotVersion::None()),
                    SnapshotVersion(SnapshotVersion::None()), {});
}

TargetData TargetData::WithSequenceNumber(
    ListenSequenceNumber sequence_number) const {
  return TargetData(target_, target_id_, sequence_number, purpose_,
                    snapshot_version_, last_limbo_free_snapshot_version_,
                    resume_token_);
}

TargetData TargetData::WithResumeToken(ByteString resume_token,
                                       SnapshotVersion snapshot_version) const {
  return TargetData(target_, target_id_, sequence_number_, purpose_,
                    std::move(snapshot_version),
                    last_limbo_free_snapshot_version_, std::move(resume_token));
}

TargetData TargetData::WithLastLimboFreeSnapshotVersion(
    SnapshotVersion last_limbo_free_snapshot_version) const {
  return TargetData(target_, target_id_, sequence_number_, purpose_,
                    snapshot_version_,
                    std::move(last_limbo_free_snapshot_version), resume_token_);
}

bool operator==(const TargetData& lhs, const TargetData& rhs) {
  return lhs.target() == rhs.target() && lhs.target_id() == rhs.target_id() &&
         lhs.sequence_number() == rhs.sequence_number() &&
         lhs.purpose() == rhs.purpose() &&
         lhs.snapshot_version() == rhs.snapshot_version() &&
         lhs.resume_token() == rhs.resume_token();
}

size_t TargetData::Hash() const {
  return util::Hash(target_, target_id_, sequence_number_, purpose_,
                    snapshot_version_, resume_token_);
}

std::string TargetData::ToString() const {
  std::ostringstream ss;
  ss << *this;
  return ss.str();
}

std::ostream& operator<<(std::ostream& os, const TargetData& value) {
  return os << "TargetData(target=" << value.target_
            << ", target_id=" << value.target_id_
            << ", purpose=" << value.purpose_
            << ", version=" << value.snapshot_version_
            << ", last_limbo_free_snapshot_version="
            << value.last_limbo_free_snapshot_version_
            << ", resume_token=" << value.resume_token_ << ")";
}

}  // namespace local
}  // namespace firestore
}  // namespace firebase
