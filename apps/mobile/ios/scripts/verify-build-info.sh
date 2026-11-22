#!/bin/sh
# Release guard, the iOS twin of verifyReleaseBuildInfo in apps/mobile/android/app/build.gradle.
# Xcode runs it before every build (the "Verify release export" phase); it only checks Release.
# It refuses to package a web export whose build-info.json is missing, is not an iOS export,
# names a host that is not https or is local, was built from another commit, or carries
# another version than this Xcode build. Fix the export (`npm run build:ios` in apps/mobile
# with CICLO_API_BASE set); never weaken or skip the guard.
set -eu

if [ "${CONFIGURATION:-}" != "Release" ]; then
  exit 0
fi

INFO="${SRCROOT}/App/public/build-info.json"

fail() {
  echo "error: $1 Run 'CICLO_API_BASE=https://<host> npm run build:ios' in apps/mobile." >&2
  exit 1
}

[ -f "$INFO" ] || fail "App/public/build-info.json is missing."

field() {
  /usr/bin/plutil -extract "$1" raw -o - "$INFO" 2>/dev/null || true
}

TARGET="$(field target)"
API_BASE="$(field apiBase)"
COMMIT="$(field commit)"
VERSION_CODE="$(field versionCode)"
VERSION_NAME="$(field versionName)"

[ "$TARGET" = "ios" ] || fail "The web export is not an iOS export (target: $TARGET)."

case "$API_BASE" in
  https://localhost*|https://127.0.0.1*|https://\[::1\]*) fail "The web export calls a local host ($API_BASE)." ;;
  https://*) ;;
  *) fail "The web export does not call an https host ($API_BASE)." ;;
esac

HEAD_COMMIT="$(git -C "$SRCROOT" rev-parse HEAD 2>/dev/null || true)"
[ -n "$HEAD_COMMIT" ] || fail "git rev-parse HEAD failed."
[ "$COMMIT" = "$HEAD_COMMIT" ] || fail "The web export was built from another commit ($COMMIT; HEAD is $HEAD_COMMIT)."

[ "$VERSION_CODE" = "${CURRENT_PROJECT_VERSION:-}" ] || fail "The web export has build $VERSION_CODE; Xcode has ${CURRENT_PROJECT_VERSION:-none}."
[ "$VERSION_NAME" = "${MARKETING_VERSION:-}" ] || fail "The web export has version $VERSION_NAME; Xcode has ${MARKETING_VERSION:-none}."
