---
name: appstore-media
description: Put marketing media on the App Store for the lotus/letspets iOS apps (PhoneSwing Golf, Lonely Candle, Cloud Minesweeper, Moa) through the App Store Connect API — upload App Preview videos (the auto-playing video at the top of the product page), check which preview/screenshot sets a version has, and create/submit App Store featuring nominations ("Today tab" editorial requests). Use this whenever the user wants an ad video or app preview on the App Store page, asks to "App Store 대문/앱 미리보기/프리뷰 영상 올려", wants to request App Store featuring/피처링 추천, or after app-ad-creative produced an App Store preview cut. Screenshot uploads and text metadata stay with the appstore-aso skill.
---

# appstore-media

App Store media and featuring for the user's apps, via `scripts/asc_media.swift` (same auth as `appstore-aso/scripts/asc.swift`).

## Auth

The API key lives in each project's `tools/release-env.sh` (gitignored). Run every command through it:

```bash
cd <project>   # e.g. ~/Documents/lotus/phoneswing-golf
bash -c 'source tools/release-env.sh >/dev/null 2>&1; swift <skill>/scripts/asc_media.swift status --bundle-id <bundle>'
```

If a project has no `release-env.sh`, reuse PhoneSwing Golf's — it is the same Apple team (VN497S6KK3), and the key reads every app in the team. App registry (bundle IDs, repos): see `../app-ad-creative/references/apps.md`.

## Commands

| Command | What it does |
|---|---|
| `status --bundle-id B` | Editable version, its state, and the preview sets per locale |
| `previews --bundle-id B --locale L --file F.mp4 [--type IPHONE_67] [--frame 00:00:05:00] [--replace]` | Upload one App Preview to that locale's preview set |
| `nominations [--state DRAFT\|SUBMITTED\|ARCHIVED]` | List featuring nominations on the account |
| `nominate --bundle-id B --in nom.json [--submit]` | Create a nomination draft from attributes JSON; `--submit` sends it to Apple |

## App Previews — the rules that decide whether it ships

Previews belong to a **version**, and only a version in `PREPARE_FOR_SUBMISSION` (or rejected) accepts them. While a version is `WAITING_FOR_REVIEW` / `IN_REVIEW` the script refuses — tell the user the two options instead of forcing it:
- attach to the **next** version once it is created (no release delay — usually the right call), or
- developer-reject the version in review, attach, resubmit (costs a new review, ~1 day).

Before uploading, confirm the file meets Apple's spec — reject-at-upload is silent and slow to surface:
- portrait **886×1920** for `IPHONE_67` (6.9"/6.7") and `IPHONE_65`; 15–30 s; ≤30 fps; H.264 High ≤ level 4.0 (~10 Mbps) or ProRes; AAC stereo 44.1/48 kHz ~256 kbps. `ffprobe` it.
- Content must be **app footage only**: no device frames/mockups, no hands, no scenes the app can't show. Text overlays and music are fine. A cut made for Instagram with 3D phones is NOT a valid preview — produce a separate preview cut (app-ad-creative does this).
- Upload the same file to each locale you want covered (en-US at minimum; the user's audience is international). `--frame` picks the poster frame shown before playback — choose a moment that reads without motion.
- After upload Apple transcodes; run `status` a few minutes later. A processing failure means the spec was off.

## Featuring nominations

Nominations ask Apple's editors to feature an app launch, a significant update, or new content. Apple decides; nothing is guaranteed — say so.

`nom.json` = attributes only (the script adds the app relationship and keeps it a draft unless `--submit`):

```json
{
  "name": "PhoneSwing Golf 1.10 — Challenge a friend, race their ghost",
  "type": "APP_ENHANCEMENTS",
  "description": "What it is, what's new, why it's interesting (who made it, how many languages, no account needed…). 2–5 sentences, concrete.",
  "publishStartDate": "2026-10-14T00:00:00Z",
  "deviceFamilies": ["IPHONE"],
  "locales": ["en-US", "ko"],
  "supplementalMaterialsUris": ["https://www.letspets.co.kr/projects/<slug>"],
  "hasInAppEvents": false,
  "launchInSelectMarketsFirst": false,
  "preOrderEnabled": false,
  "notes": "Release status / anything the editor should know."
}
```

- `type`: `APP_LAUNCH` (new app), `APP_ENHANCEMENTS` (update), `NEW_CONTENT` (content drop).
- Apple asks for ~2 weeks of lead time before `publishStartDate`; late is allowed but less likely to be picked. Mention this to the user.
- Write the description in English for editors: what makes the app distinctive, then what's new. Don't claim features that aren't shipped or in review.
- Submitting is outward-facing — submit when the user asked for the nomination; otherwise create the draft and show it.

## Report back

State plainly what changed in App Store Connect (preview uploaded to which version/locales, nomination id + state), what is still pending (Apple processing, version not yet created), and what the user should check.
