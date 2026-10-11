// Everything app-specific lives here. Scenes are played back-to-back; durations are in beats
// (BEAT frames each) so cuts land on the music. Times like `from` are seconds in public/rec.mp4.
// This example is the PhoneSwing Golf ad that was posted on 2026-10-12 — replace per app.

export type Line = { t: string; c?: "accent" };
export type Scene =
  | { kind: "slam"; beats: number; words: string[]; bg?: { from: number } }             // words punch in one per beat
  | { kind: "hero"; beats: number; from: number; lines: Line[] }                          // 3D phone mockup (reel only)
  | { kind: "full"; beats: number; from: number; lines: Line[]; bottom?: boolean; zoom?: number; origin?: string; flashAt?: number }
  | { kind: "callout"; beats: number; image: string; bg: { from: number } | { still: string }; lines: Line[]; burst?: string }
  | { kind: "versus"; beats: number; left: { from: number; label: string }; right: { from: number; label: string }; card: string; lines: Line[]; sub?: string } // reel only
  | { kind: "end"; beats: number; tagline: string; bg?: { from: number } };

export const config = {
  appName: "PhoneSwing Golf",
  colors: { deep: "#06180C", accent: "#5ED45E", cream: "#F4F8EF", glow1: "#1F6B33", glow2: "#0C3318" },
  fonts: { body: "Pretendard-Bold.otf", display: "LilitaOne-Regular.ttf" },   // files in public/
  icon: "icon_1024.png",
  footage: "rec.mp4",       // real iPhone screen recording, transcoded to 30fps CFR
  music: "track.wav",       // scripts/compose_music.py output (original, no licensing)
  beat: 15,                 // frames per beat @30fps — 15 = 120 BPM (must match the music)
  recW: 1180, recH: 2556,   // recording size (iPhone 15 Pro); used to hide the status bar

  reel: [
    { kind: "slam", beats: 4, words: ["SWING", "YOUR", "PHONE."] },
    { kind: "hero", beats: 6, from: 46.6, lines: [{ t: "It's the" }, { t: "golf club.", c: "accent" }] },
    { kind: "full", beats: 5, from: 48.2, zoom: 1.15, origin: "50% 45%", lines: [{ t: "Real swing." }, { t: "Real distance.", c: "accent" }] },
    { kind: "full", beats: 4, from: 52.4, zoom: 1.25, origin: "50% 62%", bottom: true, flashAt: 36, lines: [{ t: "Sink it." }] },
    { kind: "versus", beats: 7, left: { from: 56.6, label: "YOU" }, right: { from: 21.0, label: "MIA" }, card: "Beat my round 😏",
      lines: [{ t: "Challenge" }, { t: "a friend.", c: "accent" }], sub: "One link. Same course. Same wind." },
    { kind: "callout", beats: 4, image: "bub_taunt.png", bg: { from: 42.0 }, lines: [{ t: "Their ghost" }, { t: "talks back.", c: "accent" }] },
    { kind: "callout", beats: 4, image: "bub_cry.png", bg: { still: "cry.png" }, burst: "#5BB8F5", lines: [{ t: "Beat it." }, { t: "Make it cry.", c: "accent" }] },
    { kind: "end", beats: 6, tagline: "Swing your phone like a golf club" },
  ] as Scene[],

  // App Store preview: app footage only (no hero/versus — device mockups are rejected by Apple).
  preview: [
    { kind: "slam", beats: 4, words: ["SWING", "YOUR", "PHONE."], bg: { from: 46.4 } },
    { kind: "full", beats: 6, from: 47.6, lines: [{ t: "Swing your phone" }, { t: "like a golf club.", c: "accent" }] },
    { kind: "full", beats: 5, from: 49.2, lines: [{ t: "Real swing." }, { t: "Real distance.", c: "accent" }] },
    { kind: "full", beats: 4, from: 52.3, zoom: 1.12, origin: "50% 70%", bottom: true, lines: [{ t: "Sink the putt." }] },
    { kind: "full", beats: 7, from: 21.0, lines: [{ t: "Challenge a friend." }, { t: "Race their ghost.", c: "accent" }] },
    { kind: "callout", beats: 4, image: "bub_taunt.png", bg: { from: 42.0 }, lines: [{ t: "It talks back…" }] },
    { kind: "callout", beats: 4, image: "bub_cry.png", bg: { still: "cry.png" }, lines: [{ t: "Beat it." }, { t: "Make it cry.", c: "accent" }] },
    { kind: "end", beats: 6, tagline: "Swing. Challenge. Win.", bg: { from: 11.0 } },
  ] as Scene[],
};

export const totalBeats = (s: Scene[]) => s.reduce((n, x) => n + x.beats, 0);
