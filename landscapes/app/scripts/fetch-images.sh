#!/bin/sh
# Puts the photos and the app icon of Apple's Landmarks sample in assets/apple/, which Git ignores.
#
#   sh scripts/fetch-images.sh          fetch them if any is missing; otherwise exit at once
#   sh scripts/fetch-images.sh --check  say whether assets/apple/ is complete (exit 0) or not (exit 1); no network
#   sh scripts/fetch-images.sh --force  fetch them again
#   sh scripts/fetch-images.sh --help   print this
#
# Run it from any directory, as often as you like: when assets/apple/ is complete it downloads nothing.
# It needs only what macOS ships: curl, tar and sips.
#
# Why: Landscapes is a port of Apple's sample "Landmarks: Building an app with Liquid Glass".
# Apple's license (the sample's LICENSE.txt) lets anyone redistribute the sample's code and text,
# but it "does not include any accompanying photographs". So this template holds none: each copy
# of the app fetches them from Apple, and the icon the same way. assets/apple/.gitignore keeps all
# of it out of Git, wherever the app lives.
#
# How: one HTTP range request for the part of the sample's zip that holds the 42 photos and the
# icon (about 168 MB of its 336 MB); tar extracts them as the bytes arrive, so no zip is saved;
# sips makes the photos small enough to ship in the app: the backgrounds 1,600 px wide and the
# thumbnails 600 (a card is 196 points wide, 588 px at 3x), both at JPEG quality 70, about 9.5 MB in
# all against the originals' 168 MB. Each file then moves into assets/apple/, and a stamp records this
# version, so a change of URL, size or quality fetches again.
# When the stamp and every file are there, the script exits before doing anything else.

set -eu

URL='https://docs-assets.developer.apple.com/published/a88428e6793e/LandmarksBuildingAnAppWithLiquidGlass.zip'
# Where the zip's second half begins, at an entry's header: the first half is the sample's .git pack
OFFSET=168091967
IDS='1001 1002 1003 1004 1005 1006 1007 1008 1009 1010 1011 1012 1014 1015 1016 1017 1018 1019 1020 1021 1022'
BACKGROUND=1600
THUMBNAIL=600
QUALITY=70
VERSION="$URL $OFFSET $BACKGROUND $THUMBNAIL $QUALITY"

# The app is the script's folder's parent. No process is started before the check below.
case $0 in */*) scripts=${0%/*} ;; *) scripts=. ;; esac
assets="$scripts/../assets/apple"
stamp="$assets/.fetched"

complete() {
  [ -f "$stamp" ] || return 1
  IFS= read -r have < "$stamp" || return 1
  [ "$have" = "$VERSION" ] || return 1
  for id in $IDS; do
    [ -f "$assets/$id.jpg" ] && [ -f "$assets/$id-thumb.jpg" ] || return 1
  done
  [ -f "$assets/Landmarks.icon/icon.json" ]
}

fail() {
  printf 'fetch-images: %s\n' "$*" >&2
  exit 1
}

force=
case "${1:-}" in
  '') ;;
  --force) force=1 ;;
  --check)
    if complete; then echo "fetch-images: assets/apple/ is complete"; exit 0; fi
    echo "fetch-images: assets/apple/ is incomplete; run sh scripts/fetch-images.sh"
    exit 1 ;;
  -h | --help)
    sed -n '2,/^$/s/^# \{0,1\}//p' "$0"
    exit 0 ;;
  *)
    printf 'fetch-images: unknown option %s; see sh scripts/fetch-images.sh --help\n' "$1" >&2
    exit 2 ;;
esac

if [ -z "$force" ] && complete; then exit 0; fi

assets=$(CDPATH='' cd -- "$scripts/.." && pwd)/assets/apple
stamp="$assets/.fetched"
for tool in curl tar sips; do
  command -v "$tool" > /dev/null 2>&1 || fail "$tool is not on PATH. The script uses curl, tar and sips, which macOS ships; run it on a Mac, or copy a Mac's complete assets/apple/ folder to $assets."
done
tar --version 2> /dev/null | grep -q bsdtar ||
  fail "tar is not bsdtar, so it cannot read a zip as a stream. macOS's tar is bsdtar; run the script on a Mac."

mkdir -p "$assets"
printf '%s\n' "# Apple's photos and icon, which scripts/fetch-images.sh fetches: never commit them" '*' > "$assets/.gitignore"

# One fetch at a time: another build may be fetching now. A lock whose process is gone is taken over.
lock="$assets/.fetching"
waited=0
until mkdir "$lock" 2> /dev/null; do
  holder=$(cat "$lock/pid" 2> /dev/null || true)
  if [ -n "$holder" ] && ! kill -0 "$holder" 2> /dev/null; then
    rm -rf "$lock"
    continue
  fi
  [ "$waited" -lt 900 ] || fail "another fetch has held $lock for 15 minutes. If no fetch-images.sh is running, delete that folder and run the script again."
  sleep 1
  waited=$((waited + 1))
  if [ -z "$force" ] && complete; then exit 0; fi
done
echo $$ > "$lock/pid"
# Its own work folder, inside assets/apple/ so that each finished file moves into place by a rename
work=$(mktemp -d "$assets/.work.XXXXXX")
trap 'rm -rf "$work"; [ "$(cat "$lock/pid" 2> /dev/null)" != $$ ] || rm -rf "$lock"' EXIT
trap 'exit 1' INT TERM HUP
# A run that was killed leaves its work folder; only the lock's holder works in one
for old in "$assets"/.work.*; do
  [ "$old" = "$work" ] || rm -rf "$old"
done
if [ -z "$force" ] && complete; then exit 0; fi

rm -f "$stamp"
echo "fetch-images: downloading Apple's Landmarks photos and icon (about 168 MB, once) into $assets" >&2
progress=--silent
if [ -t 2 ]; then progress=--progress-bar; fi
extracted=0
{
  status=0
  curl --fail --location --show-error $progress --range "$OFFSET-" "$URL" || status=$?
  echo "$status" > "$work/curl-status"
} | (cd "$work" && tar -xf - --include '*/Landmark backgrounds/*.jpg' --include '*/Landmark thumbnails/*.jpg' --include '*/Landmarks App Icon.icon/*') ||
  extracted=$?
status=$(cat "$work/curl-status")
[ "$status" = 0 ] || fail "curl could not download $URL (exit $status, above). Check the network and run sh scripts/fetch-images.sh again."
[ "$extracted" = 0 ] || fail "tar could not read the download (above). If Apple has moved or changed the sample, update URL and OFFSET in this script."

resources="$work/Landmarks/Landmarks/Resources"
mkdir "$work/out"
for id in $IDS; do
  sips --resampleWidth "$BACKGROUND" -s formatOptions "$QUALITY" "$resources/Assets.xcassets/Landmark backgrounds/$id.imageset/$id@2x.jpg" --out "$work/out/$id.jpg" > /dev/null 2>&1 &
  sips --resampleWidth "$THUMBNAIL" -s formatOptions "$QUALITY" "$resources/Assets.xcassets/Landmark thumbnails/$id-thumb.imageset/$id-thumb@2x.jpg" --out "$work/out/$id-thumb.jpg" > /dev/null 2>&1 &
done
wait
for id in $IDS; do
  for name in "$id" "$id-thumb"; do
    [ -s "$work/out/$name.jpg" ] || fail "$name.jpg is missing from the download or sips could not scale it. If the sample changed, update IDS in this script."
  done
done
[ -f "$resources/Landmarks App Icon.icon/icon.json" ] || fail "the icon is missing from the download. If the sample changed, update this script."

# Each file appears complete or not at all: a rename within assets/apple/
for id in $IDS; do
  mv -f "$work/out/$id.jpg" "$assets/$id.jpg"
  mv -f "$work/out/$id-thumb.jpg" "$assets/$id-thumb.jpg"
done
rm -rf "$assets/Landmarks.icon"
mv "$resources/Landmarks App Icon.icon" "$assets/Landmarks.icon"
printf '%s\n' "$VERSION" > "$work/stamp"
mv "$work/stamp" "$stamp"
echo "fetch-images: assets/apple/ is complete" >&2
