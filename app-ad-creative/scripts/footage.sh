#!/usr/bin/env bash
# Footage helpers for ad editing. Pure ffmpeg + Pillow, nothing touches the app project.
#   footage.sh prep <in.MP4> <out.mp4>            iOS HEVC/VFR screen recording -> H.264 30fps CFR (what Remotion wants)
#   footage.sh sheet <video> <out.png> [step=1]   contact sheet, one frame per <step> s, labeled with the time — pick clip in/out points from it
#   footage.sh frame <video> <sec> <out.png>      full-res still (freeze frames, crops)
#   footage.sh crop <in.png> <x> <y> <w> <h> <out.png>   crop an in-app element (e.g. a speech bubble) to magnify as a callout
#   footage.sh specs <video>                      resolution / fps / duration / loudness
set -eu
cmd=$1; shift
case $cmd in
  prep)  ffmpeg -v error -y -i "$1" -vf fps=30 -c:v libx264 -preset medium -crf 16 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$2" ;;
  sheet) v=$1; out=$2; step=${3:-1}; tmp=$(mktemp -d)
         dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v")
         ffmpeg -v error -i "$v" -vf "fps=1/$step,scale=110:-1" "$tmp/f_%04d.png"
         python3 - "$tmp" "$out" "$step" <<'PY'
import sys, glob
from PIL import Image, ImageDraw
d, out, step = sys.argv[1], sys.argv[2], float(sys.argv[3])
fs = sorted(glob.glob(d + "/f_*.png")); ims = [Image.open(f) for f in fs]
w, h = ims[0].size; cols = 20; rows = (len(ims) + cols - 1) // cols
c = Image.new("RGB", (cols * (w + 4), rows * (h + 16)), "white"); dr = ImageDraw.Draw(c)
for k, im in enumerate(ims):
    x, y = (k % cols) * (w + 4), (k // cols) * (h + 16); c.paste(im, (x, y)); dr.text((x + 2, y + h + 2), f"{k*step:.1f}s", fill="black")
c.save(out); print(out, len(ims), "frames")
PY
         rm -rf "$tmp" ;;
  frame) ffmpeg -v error -y -ss "$2" -i "$1" -frames:v 1 "$3" ;;
  crop)  python3 -c "from PIL import Image;import sys;a=sys.argv;Image.open(a[1]).convert('RGB').crop((int(a[2]),int(a[3]),int(a[2])+int(a[4]),int(a[3])+int(a[5]))).save(a[6])" "$@" ;;
  specs) ffprobe -v error -show_entries format=duration,size:stream=codec_name,profile,level,width,height,r_frame_rate,bit_rate,sample_rate,channels -of compact "$1"
         ffmpeg -nostats -i "$1" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 || true ;;
  *) echo "unknown: $cmd"; exit 1 ;;
esac
