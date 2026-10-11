#!/usr/bin/env bash
# Send one file (video or image) from this Mac to the user's iPhone over AirDrop. It lands in Photos.
# Opens the macOS AirDrop picker (airdrop_share.swift) and clicks the first device in it with Orca computer-use.
# Usage: airdrop_to_iphone.sh <file>
set -eu
FILE="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
HERE="$(cd "$(dirname "$0")" && pwd)"
LOG="$(mktemp -t airdrop)"
swift "$HERE/airdrop_share.swift" "$FILE" >"$LOG" 2>&1 &
for i in $(seq 1 20); do sleep 1; PID=$(pgrep -f swift-frontend | head -1); [ -n "$PID" ] && orca computer get-app-state --app "pid:$PID" --json 2>/dev/null | grep -q '8 버튼\|8 button' && break; done
PID=$(pgrep -f swift-frontend | head -1)
[ -z "$PID" ] && { echo "AirDrop window did not open"; exit 1; }
# element 8 = first AirDrop target (the iPhone signed into the same Apple ID). Verify the window name lists it if this fails.
orca computer click --app "pid:$PID" --element-index 8 --json >/dev/null
for i in $(seq 1 60); do sleep 2; orca computer get-app-state --app "pid:$PID" --json 2>/dev/null | grep -qE '전송됨|Sent' && { echo "sent: $(basename "$FILE")"; break; }; done
orca computer click --app "pid:$PID" --element-index 9 --json >/dev/null 2>&1 || true   # 완료/Done
sleep 1; pkill -f airdrop_share.swift || true; pkill -f swift-frontend || true
