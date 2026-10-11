---
name: instagram-post
description: Publish posts to the user's Instagram ad account (lotus91.dev) by driving the Instagram app on their real iPhone — photo carousels and Reels videos, with caption and hashtags. Covers getting the files from the Mac into iPhone Photos (AirDrop / Safari save), Instagram's limited-photo-access picker, selecting media in the right order, typing captions and #hashtags reliably, and verifying the post is live. Use this whenever the user says "인스타에 올려", "릴스로 게시", "post this to Instagram", or after app-ad-creative produced creative for any of their apps (PhoneSwing Golf, Lonely Candle, Cloud Minesweeper, Moa), even if they don't name the account.
---

# instagram-post

Posts to **lotus91.dev** through the Instagram app on the user's iPhone 15 Pro, automated with `agent-device` over Wi-Fi. There is no Instagram API path for this account — everything goes through the phone UI, so read the screen after every step instead of assuming it worked.

## Before you start

- Posting is public and permanent-ish (deleting is possible but the post was seen). The user asking to post is the authorization; still **stop before the final 공유/Share tap if anything doesn't match** what they asked (wrong media, wrong order, wrong account, unwanted audio).
- Don't advertise what users can't get: if a feature is still in App Store review, say "in the next update (in review)". Don't write "link in bio" unless the profile actually has a link. Match the account language (English — international audience) unless the user says otherwise.
- The phone holds the user's personal photos and chats. Touch only what the task needs; don't read or describe personal content you happen to see; never type into a conversation that isn't the intended one.

## Driving the iPhone

```bash
export AGENT_DEVICE_STATE_DIR=$HOME/.agent-device-phoneswing AGENT_DEVICE_IOS_TEAM_ID=VN497S6KK3 AGENT_DEVICE_IOS_BUNDLE_ID=com.lotus.agentdevice.runner
agent-device open com.burbn.instagram --foreground --device "신희석의 iPhone"
```

- The separate state dir avoids stale daemons in `~/.agent-device`. If `devices` shows the iPhone `claimed by session …` from another project, ask before releasing it.
- First `open` can time out while the XCTest runner warms up — retry. If the phone shows `unavailable`, ask the user to unlock it / keep Wi-Fi on.
- Refs (`@e12~s34`) go stale after every tap — re-snapshot. When the tree is unreadable ("requires a valid viewport"), use `agent-device screenshot` and tap coordinates (screenshot px ÷ 3 on iPhone 15 Pro).
- Always look at a screenshot before a destructive or public action.

## 1. Get media into iPhone Photos

- **Videos (and any file):** `scripts/airdrop_to_iphone.sh <file>` — opens the macOS AirDrop picker and clicks the iPhone (same Apple ID → lands in Photos, no prompt). It prints `sent: …`.
- **Images in a fixed order:** `scripts/safari_save_images.sh <folder> slide1.png slide2.png …` — serves over LAN, saves each through Safari's long-press → "사진 앱에 저장". Retry any `FAILED` file once by hand (long-press at a different y).
- iOS screen recordings / Photos items can also be AirDropped **to** the Mac from Photos → Share → the MacBook (they land in `~/Downloads`).

## 2. Create the post

1. Profile tab (`label="프로필"`) → **+** (`만들기 메뉴를 열려면 누르세요`) → **게시물** (carousel) or **릴스** (video).
   - Pressing 릴스 by label can open the Reels *viewer*; tap the menu row by coordinates (~70, 521) instead and confirm the screen title is "새 릴스".
2. **Grant photo access** — the account uses limited access, so new media is invisible until added: **관리 → 사진 더 선택** → in the system picker select only the new items by their labels (`[image] "사진, <date>, <time>"` / `"비디오, …"`), re-snapshotting between taps → **완료**. Never grant full library access.
3. **Select in order:** enable multi-select (선택). Instagram pre-selects the preview item — often a personal photo — so deselect it first. Select cells by ref (`[cell] "사진 썸네일, …"` / `"동영상 썸네일, 동영상 길이: 0:20, …"`, newest first), not by coordinates (coordinate taps on the grid often only change the preview). Screenshot and confirm the 1…N badges match the intended order before 다음.
4. Editor: dismiss tips (확인). Leave "추천 오디오" **unapplied** unless the user wants it — our videos carry original audio. 다음.
5. Info sheets ("공개 게시물…", "릴스 다운로드…") → 확인/계속.

## 3. Caption and hashtags

- Tap the caption field (`캡션 추가...`), then type **line by line** with `agent-device type "<line>"` (prefix `\n` for every line after the first). `fill` fails with mismatch on long multi-line text; one huge `type` exceeds the runner budget.
- **Hashtags:** typing `#` via the runner gets dropped once Instagram's tag suggestions appear. Instead tap the keyboard's own **#** key (≈ 363, 752 on the Korean keyboard; confirm on a screenshot) and type the word + space. 4–6 tags is plenty.
- Verify the caption on a screenshot (scroll if needed), then tap ✓ (top right) to close the editor.

## 4. Publish and verify

- Tap **공유**. Wait ~20 s, then screenshot: the feed/profile should show the new post (carousel shows "1/N"; reels show "오리지널 오디오" when no Instagram track was added).
- If the user stops midway, **discard the draft** (X → "수정 사항 삭제 후 종료") and confirm on a screenshot that it's gone — a label tap can silently miss.
- `agent-device close` when done.

## Report back

What was posted (type, media, caption summary, tags), the screenshot-verified state, anything left on the phone (saved slide images in Photos the user may want to delete), and a short next step (e.g., check reach in 1–2 days).
