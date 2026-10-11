#!/usr/bin/env bash
# Save PNG/JPG files into iPhone Photos via Safari (no AirDrop needed), in the given order.
# Serves the folder over LAN, opens each URL in iPhone Safari, long-presses the image and taps "사진 앱에 저장".
# Usage: safari_save_images.sh <folder> <file1> [file2 ...]
# Needs: agent-device session env (see SKILL.md), iPhone on the same Wi-Fi.
set -u
DIR="$1"; shift
UDID="${IPHONE_UDID:-00008130-001A69C00C60001C}"
IP=$(ipconfig getifaddr en0)
(cd "$DIR" && python3 -m http.server 8778 --bind 0.0.0.0 >/dev/null 2>&1 &)
sleep 1
agent-device open com.apple.mobilesafari --foreground --device "${IPHONE_NAME:-신희석의 iPhone}" >/dev/null 2>&1
for f in "$@"; do
  ok=""
  for try in 1 2 3; do
    xcrun devicectl device process launch --device "$UDID" --payload-url "http://$IP:8778/$f?r=$try$RANDOM" com.apple.mobilesafari >/dev/null 2>&1
    sleep 5
    for y in 400 300 470; do
      if agent-device longpress 196 $y 1800 --settle 2>&1 | grep -q "사진 앱에 저장"; then
        agent-device press 'label="사진 앱에 저장"' --settle >/dev/null 2>&1 && ok=1; break 2
      fi
    done
  done
  [ -n "$ok" ] && echo "saved $f" || echo "FAILED $f"
  sleep 1.5
done
pkill -f "http.server 8778"
