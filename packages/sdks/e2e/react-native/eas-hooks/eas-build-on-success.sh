#!/usr/bin/env bash

# Reference:
# https://docs.expo.dev/build-reference/e2e-tests/#configure-eas-build-1

function cleanup() {
  echo 'Cleaning up...'
  if [[ "$EAS_BUILD_PLATFORM" == "android" ]]; then
    # Kill emulator
    adb emu kill &
  fi
}

if [[ "$EAS_BUILD_PROFILE" != "test" ]]; then
  exit
fi

# Fail if anything errors
set -eox pipefail
# If this script exits, trap it first and clean up the emulator
trap cleanup EXIT

ANDROID_EMULATOR=pixel_4

if [[ "$EAS_BUILD_PLATFORM" == "android" ]]; then
  # Start emulator
  $ANDROID_SDK_ROOT/emulator/emulator @$ANDROID_EMULATOR -no-audio -no-boot-anim -no-window -use-system-libs 2>&1 >/dev/null &

  # Wait for emulator
  max_retry=10
  counter=0
  until adb shell getprop sys.boot_completed; do
    sleep 10
    [[ counter -eq $max_retry ]] && echo "Failed to start the emulator!" && exit 1
    counter=$((counter + 1))
  done

  # Execute Android tests
  if [[ "$EAS_BUILD_PROFILE" == "test" ]]; then
    detox test --configuration android.release
  fi
else
  # Execute iOS tests
  if [[ "$EAS_BUILD_PROFILE" == "test" ]]; then
    detox test --configuration ios.release
  fi
fi
