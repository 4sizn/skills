# App registry (letspets / lotus apps)

All iOS apps are in Apple team VN497S6KK3 — one ASC API key (`~/Documents/lotus/phoneswing-golf/tools/release-env.sh`) covers them. Marketing output for an app goes in that app's repo under a gitignored folder (e.g. `build/marketing/`) or, if the repo has no gitignored build dir, in `~/Documents/lotus/marketing/<slug>/`.

| App | Bundle ID | ASC app ID | Repo | Tech | What it is (the ad's hook) |
|---|---|---|---|---|---|
| PhoneSwing Golf (폰스윙 골프) | com.lotus.phoneswinggolf | 6796625813 | `~/Documents/lotus/phoneswing-golf` | Godot 4.7 | Swing the phone like a golf club; 3-hole rounds, island courses, friend ghost challenge |
| Lonely Candle (손안의 촛불) | com.lotus91.candle | 6796374959 | `~/Documents/lotus/lonely-candle` | Godot 4.7 (Blender look) | A realistic candle: tilt the phone and the flame leans, blow into the mic to put it out, relight |
| Cloud Minesweeper (지뢰찾기:구름 / 나의 하늘) | com.lotus.cloudMinesweeper | 6814490793 | `~/Documents/lotus/cloud-minesweeper` | Flutter | Cloud-shaped minesweeper; finished clouds become pieces you place in the sky where the phone points |
| Moa (모아: 스크린샷 정리) | com.4sizn.moa | 6812988615 | `~/Documents/lotus/letspets-app-sources/moa` | SwiftUI (iOS 18+) | On-device screenshot sorting: auto tags and folders, no server/account |

Brand page per app: `https://www.letspets.co.kr/projects/<slug>` (slugs: `swing-golf`, `lonely-candle`, `cloud-minesweeper`, `moa`).

## Footage — how to get real app screens for each

Always capture the shipped (or about-to-ship) app on the real iPhone 15 Pro with **iOS screen recording** (60 fps). `agent-device record` is ~6 fps — unusable for video.

- **PhoneSwing Golf** — the app has a proof harness that plays real shots: launch with `xcrun devicectl device process launch --terminate-existing --device <udid> com.lotus.phoneswinggolf --proof --proof-no-ad --proof-locale=en --log-file user://rec.log` while recording. Back up/verify the save (see project memory `proof-harness-device-safety`). Ghost/friend name comes from Settings → nickname (change it in the UI for the shoot, restore the save after).
- **Lonely Candle / Cloud Minesweeper / Moa** — no harness assumed: drive the app with `agent-device` taps/gestures (or have the user play) while recording. Lonely Candle reacts to tilt and mic — physical motion can't be automated; ask the user to perform it during the recording, or film the idle/flicker states only. Moa needs screenshots in the library; use a demo set, never the user's private screenshots.
- Read each repo's README/CLAUDE.md before capturing: some apps have demo modes, store-screenshot scripts (`appstore/`, `store/`, `playstore/` folders) or existing demo videos (e.g. `lonely-candle/godot_candle_preview.mp4`) that may already be usable.
