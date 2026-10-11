#!/usr/bin/env bash
# Render the carousel: content slides + 1 CTA slide, 1080x1350 (Instagram 4:5) PNGs.
# Usage: render.sh <folder-with-slide.html-and-assets> <num_slides_including_cta>
set -eu
DIR=$(cd "$1" && pwd); N=$2
(cd "$DIR" && python3 -m http.server 8779 --bind 127.0.0.1 >/dev/null 2>&1 &)
sleep 1
agent-browser set viewport 1080 1350 >/dev/null 2>&1
for i in $(seq 1 "$N"); do agent-browser open "http://127.0.0.1:8779/slide.html?n=$i&v=$RANDOM#$i" >/dev/null 2>&1; sleep 1.2; agent-browser screenshot "$DIR/slide$i.png" >/dev/null 2>&1; echo "slide$i.png"; done
pkill -f "http.server 8779"; agent-browser close >/dev/null 2>&1 || true
