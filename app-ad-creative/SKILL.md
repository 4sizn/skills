---
name: app-ad-creative
description: Make professional ad creative for the user's mobile apps (PhoneSwing Golf, Lonely Candle, Cloud Minesweeper, Moa) from REAL iPhone footage — an Instagram carousel (1080×1350 slides), a TV/YouTube-grade 9:16 ad reel (kinetic type, 3D phone mockups, whip cuts, beat-synced original music), and an App Store App Preview cut (886×1920, footage-only per Apple rules). Includes iOS screen-recording capture via the phone, a Remotion template driven by one config file, and an original music generator. Use this whenever the user asks for an ad, 광고 영상/이미지, 릴스, 인스타 게시물 이미지, promo video, App Store 프리뷰 영상, or marketing creative for any of their apps — even if they only say "광고 만들어줘" for one of these app names. Posting is done by instagram-post; App Store upload by appstore-media.
---

# app-ad-creative

Turn real app footage into ads that look produced, not screen-captured. This workflow was worked out on PhoneSwing Golf (Oct 2026) — the user rejected raw gameplay-with-captions as "not a real ad" and approved the current style. Reuse it.

## Rules (each one was learned the hard way)

- **Never modify the app's code or config for an ad.** Not scripts, scenes, assets, project files, test harnesses, or temporary override files. Use only what the shipped app already does. If a shot is impossible with the current app, stop and ask; real app changes go through a separate feature PR. (This is in the app repos' CLAUDE.md.)
- **Footage must be real and honest.** Real device recording of the real app. Don't show staged/teleported results (e.g. test-harness hole-in-ones) as achievements — blur them out, or capture a real play. Don't promise unreleased features; if something is in App Store review, say so in the caption.
- **Quality bar = TV/YouTube ad.** Motion design (kinetic headlines, phone mockups, whip transitions, flashes/particles), color grade + vignette, music cut to the beat, 15–20 s. Pure captioned gameplay was rejected.
- **Music:** the approved sound is `scripts/compose_music.py` (original, synthesized, no licensing). The user explicitly preferred it over a tropical/steel-pan version and over a "sounds like <famous game BGM>" version — don't offer those again. Never imitate a copyrighted track's melody; tempo/rhythm/instrumentation are fine to match, melody must be original.
- **Audience is international** — English copy by default (the user asked for it). Keep text inside the safe area (≥80 px sides, ≥100 px top/bottom at 1080 wide), headlines ≥84 px.
- Unposted renders are failures, not alternatives: once the user approves one, archive the rest (`rejected/`) instead of re-offering them.
- You can't hear audio: verify music with a spectrogram/loudness (`scripts/footage.sh specs`), and tell the user to listen before posting.

## Workflow

App facts (bundle IDs, repos, how to capture each app): `references/apps.md`.

### 1. Capture real footage (iPhone 15 Pro, iOS screen recording)
1. Install/launch the release-like build. Back up any app save first if automation will play (PhoneSwing: see apps.md).
2. Start iOS screen recording via Control Center with agent-device (env vars as in instagram-post):
   `agent-device open com.apple.springboard --foreground` → `agent-device gesture pan 360 4 0 420 400` (pull down) → press `[button] "화면 기록"` → wait ~4 s countdown → `agent-device gesture pan 200 820 0 -500 300` (close).
3. Play the scenes the ad needs (automation, agent-device taps, or ask the user to play). Then stop the recording the same way.
4. Bring it to the Mac: Photos → open the recording → Share → **AirDrop → the MacBook** (lands in `~/Downloads/ScreenRecording_*.MP4`). Verify/restore the app save afterwards.
5. `scripts/footage.sh prep <in.MP4> public/rec.mp4` (HEVC VFR → H.264 30 fps CFR), then `scripts/footage.sh sheet public/rec.mp4 timeline.png 1` and read the sheet to pick clip in-points. Use `frame` + `crop` to grab in-app elements (e.g. speech bubbles) to magnify as callouts.

### 2. Build the reel + App Store preview (Remotion)
1. Copy `template/` into the marketing folder, `npm i`. Put assets in `public/`: `rec.mp4`, app icon (1024 PNG), brand fonts (or keep Pretendard/Lilita from PhoneSwing), callout crops, `track.wav`.
2. Edit **only `src/ad.config.ts`**: app name, colors, fonts, `reel` and `preview` scene lists. Scene kinds:
   - `slam` (words punch in on the beat — cold open), `hero` (3D phone tilting in), `full` (full-screen footage + headline, optional flash/burst), `callout` (blurred footage + magnified in-app element), `versus` (two phones, a card flies between — for social/multiplayer features), `end` (logo + tagline; App Store badge in the reel).
   - Durations are in beats (`beat: 15` = 120 BPM). Typical structure: slam 4 · hero 6 · full 5 · full 4 · feature 7 · callout 4 · callout 4 · end 6 = 40 beats = 20 s.
   - The **preview** list must use only `slam`/`full`/`callout`/`end` over app footage — Apple rejects device frames, hands, and non-app scenes.
3. Music: set the TIMING block in `scripts/compose_music.py` (END_BEAT = beats before the end scene, CUT_BEATS = scene boundaries, DING/SPARKLE = accent moments in seconds) → `python3 compose_music.py raw.wav` → `ffmpeg -i raw.wav -af loudnorm=I=-14:TP=-1:LRA=11 public/track.wav`.
4. Preview with stills, not by guessing: `npx remotion still Reel out/s.png --frame=N` for one frame per scene; check text legibility, nothing important under headlines, no status bar, no personal data in shot. Open Studio (`npx remotion studio`) if the user wants to watch.
5. Render:
   - Reel: `npx remotion render Reel out/reel.mp4 --codec=h264 --crf=17 --audio-bitrate=192k`
   - Preview: `npx remotion render AppPreview out/raw.mp4 --crf=14` then encode to Apple spec: `ffmpeg -i out/raw.mp4 -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p -r 30 -b:v 10M -maxrate 12M -bufsize 20M -c:a aac -b:a 256k -ar 44100 -ac 2 -movflags +faststart <App>_AppPreview_886x1920.mp4`
   - Verify with `scripts/footage.sh specs` (1080×1920 / 886×1920, 30 fps, ~-14 LUFS, 15–30 s for the preview).

### 3. Instagram carousel (images)
1. Copy `carousel/` into the marketing folder with the fonts and icon. Crop 4 screenshots (1179-wide device captures → ~1240-px-tall bands) as `e1.png…e4.png`.
2. Edit the `EDIT PER APP` block in `slide.html` (brand, colors, slide copy, CTA). Don't write "link in bio" unless the profile has a link.
3. `carousel/render.sh <folder> 5` → `slide1..5.png` at 1080×1350. Look at them.

### 4. Hand off
- Show the user the outputs (open the mp4 in QuickTime, list slide PNGs) and the caption you propose. Post with **instagram-post**; put the preview on the store with **appstore-media**.
- Save what was made and the user's verdict to project memory (which version they approved, what they rejected and why).
