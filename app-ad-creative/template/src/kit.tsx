import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { config, Line, Scene } from "./ad.config";

const C = config.colors;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Fonts: React.FC = () => (
  <style>{`
@font-face { font-family: 'AdBody'; src: url('${staticFile(config.fonts.body)}'); font-weight: 700; }
@font-face { font-family: 'AdDisplay'; src: url('${staticFile(config.fonts.display)}'); }
`}</style>
);

// ---------- footage ----------

// Real recording. `cover` keeps the aspect; a small zoom anchored at the bottom hides the iOS status bar.
export const Footage: React.FC<{ from: number; dur: number; zoom?: number; origin?: string; style?: React.CSSProperties }> = ({
  from,
  dur,
  zoom = 1.08,
  origin = "50% 100%",
  style,
}) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000", ...style }}>
      <Video
        src={staticFile(config.footage)}
        trimBefore={Math.round(from * fps)}
        durationInFrames={dur}
        muted
        premountFor={fps}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, transformOrigin: origin }}
      />
    </AbsoluteFill>
  );
};

const Bg: React.FC<{ bg: { from: number } | { still: string }; dur: number; blur?: number }> = ({ bg, dur, blur = 16 }) => (
  <AbsoluteFill style={{ filter: `blur(${blur}px) brightness(0.55)`, transform: "scale(1.1)" }}>
    {"still" in bg ? (
      <Img src={staticFile(bg.still)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    ) : (
      <Footage from={bg.from} dur={dur} />
    )}
  </AbsoluteFill>
);

export const Backdrop: React.FC<{ hue?: number }> = ({ hue = 0 }) => {
  const f = useCurrentFrame();
  const a = (f * 0.6 + hue) % 360;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(90% 60% at ${50 + 20 * Math.sin(a / 57)}% ${30 + 10 * Math.cos(a / 57)}%, ${C.glow1} 0%, ${C.glow2} 45%, ${C.deep} 100%)` }}>
      <AbsoluteFill style={{ background: `conic-gradient(from ${a}deg at 50% 20%, transparent, ${C.accent}1A, transparent 25%, #ffffff10 40%, transparent 60%)`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

// iPhone-style frame with 3D tilt (reel only — never in App Store previews).
export const Phone: React.FC<{ width: number; x: number; y: number; rotY?: number; rotX?: number; rotZ?: number; scale?: number; children: React.ReactNode }> = ({
  width, x, y, rotY = 0, rotX = 0, rotZ = 0, scale = 1, children,
}) => {
  const h = width * 2.165;
  return (
    <div style={{ position: "absolute", left: x - width / 2, top: y - h / 2, width, height: h, perspective: 2400 }}>
      <div style={{ width: "100%", height: "100%", transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${scale})`, borderRadius: width * 0.16, background: "linear-gradient(145deg,#3a3d41,#0d0e10 40%,#26282b)", padding: width * 0.035, boxShadow: `0 ${width * 0.12}px ${width * 0.25}px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(255,255,255,0.12)` }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: width * 0.13, overflow: "hidden", background: "#000" }}>
          {children}
          <div style={{ position: "absolute", top: width * 0.03, left: "50%", width: width * 0.3, height: width * 0.085, transform: "translateX(-50%)", borderRadius: 999, background: "#000" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 35%)" }} />
        </div>
      </div>
    </div>
  );
};

// ---------- type & fx ----------

export const Kinetic: React.FC<{ lines: Line[]; size: number; top?: number; bottom?: number; align?: "left" | "center"; shade?: boolean }> = ({
  lines, size: size1080, top, bottom, align = "left", shade = true,
}) => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const size = size1080 * (width / 1080); // sizes are authored for a 1080-wide canvas
  return (
    <AbsoluteFill>
      {shade ? (
        <div style={{ position: "absolute", left: 0, right: 0, height: 600, ...(bottom !== undefined ? { bottom: 0 } : { top: 0 }), background: `linear-gradient(${bottom !== undefined ? "0deg" : "180deg"}, ${C.deep}F5 0%, ${C.deep}E0 25%, ${C.deep}00 100%)` }} />
      ) : null}
      <div style={{ position: "absolute", left: width * 0.07, right: width * 0.07, ...(bottom !== undefined ? { bottom } : { top: top ?? 160 }), textAlign: align }}>
        {lines.map((l, i) => {
          const p = spring({ frame: f - i * 4, fps, config: { damping: 13, stiffness: 220 } });
          return (
            <div key={i} style={{ fontFamily: "AdBody", fontWeight: 700, fontSize: size, lineHeight: 1.03, letterSpacing: -size * 0.035, color: l.c === "accent" ? C.accent : C.cream, transform: `translateY(${(1 - p) * 70}px) skewY(${(1 - p) * 6}deg)`, opacity: p, textShadow: "0 10px 30px rgba(0,0,0,0.45)" }}>
              {l.t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Flash: React.FC<{ at: number }> = ({ at }) => {
  const o = interpolate(useCurrentFrame(), [at, at + 1, at + 6], [0, 0.85, 0], clamp);
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: o }} />;
};

export const Burst: React.FC<{ at: number; x: number; y: number; color?: string }> = ({ at, x, y, color = C.accent }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 30) return null;
  return (
    <>
      {Array.from({ length: 24 }).map((_, i) => {
        const ang = random(`a${i}${at}`) * Math.PI * 2;
        const d = (120 + random(`d${i}${at}`) * 260) * interpolate(f, [0, 18], [0, 1], clamp);
        const s = 10 + random(`s${i}${at}`) * 18;
        return <div key={i} style={{ position: "absolute", left: x + Math.cos(ang) * d, top: y + Math.sin(ang) * d + f * f * 0.25, width: s, height: s, borderRadius: i % 3 ? 3 : 999, background: i % 4 === 0 ? "#FFD34D" : i % 5 === 0 ? "#fff" : color, opacity: interpolate(f, [16, 30], [1, 0], clamp), transform: `rotate(${f * 20 + i * 30}deg)` }} />;
      })}
    </>
  );
};

const Whip: React.FC<{ children: React.ReactNode; dir: 1 | -1 }> = ({ children, dir }) => {
  const f = useCurrentFrame();
  const { width } = useVideoConfig();
  const x = interpolate(f, [0, 6], [dir * width, 0], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return <AbsoluteFill style={{ transform: `translateX(${x}px)`, filter: `blur(${interpolate(f, [0, 6], [28, 0], clamp)}px)` }}>{children}</AbsoluteFill>;
};

// ---------- scenes ----------

const Slam: React.FC<{ s: Extract<Scene, { kind: "slam" }>; dur: number }> = ({ s, dur }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const size = width * 0.24;
  return (
    <AbsoluteFill style={{ backgroundColor: C.deep }}>
      {s.bg ? <Bg bg={s.bg} dur={dur} blur={6} /> : null}
      {s.words.map((w, i) => {
        const at = i * config.beat;
        if (f < at) return null;
        const p = spring({ frame: f - at, fps, config: { damping: 9, stiffness: 260 } });
        const shake = f < at + 6 ? (random(`k${f}`) - 0.5) * 24 : 0;
        const last = i === s.words.length - 1;
        return (
          <div key={i} style={{ position: "absolute", top: height * 0.33 + i * size * 0.88, width: "100%", textAlign: "center", fontFamily: "AdDisplay", fontSize: size, color: last ? C.accent : "#fff", transform: `scale(${2.4 - 1.4 * p}) translateX(${shake}px) skewX(-8deg)`, opacity: Math.min(1, p * 1.4), WebkitTextStroke: `10px ${C.deep}`, paintOrder: "stroke fill" }}>
            {w}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Hero: React.FC<{ s: Extract<Scene, { kind: "hero" }>; dur: number }> = ({ s, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f, fps, config: { damping: 16, stiffness: 90 } });
  const sweep = interpolate(f, [20, 50], [-600, 1400], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <Phone width={640} x={540} y={interpolate(p, [0, 1], [1900, 1180])} rotY={interpolate(p, [0, 1], [55, -10]) + Math.sin(f / 18) * 3} rotX={6} rotZ={-3}>
        <Footage from={s.from} dur={dur} zoom={1} origin="50% 50%" />
      </Phone>
      <div style={{ position: "absolute", top: 0, left: sweep, width: 260, height: 1920, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)", transform: "skewX(-18deg)", mixBlendMode: "screen" }} />
      <Kinetic lines={s.lines} size={110} top={170} shade={false} />
    </AbsoluteFill>
  );
};

const Full: React.FC<{ s: Extract<Scene, { kind: "full" }>; dur: number; idx: number; whip: boolean }> = ({ s, dur, idx, whip }) => {
  const body = (
    <AbsoluteFill>
      <Footage from={s.from} dur={dur} zoom={s.zoom} origin={s.origin} />
      <Kinetic lines={s.lines} size={s.lines.length > 1 ? 96 : 140} {...(s.bottom ? { bottom: 170 } : { top: 160 })} />
      {s.flashAt !== undefined ? (<><Flash at={s.flashAt} /><Burst at={s.flashAt} x={540} y={1100} /></>) : null}
    </AbsoluteFill>
  );
  return whip ? <Whip dir={idx % 2 ? -1 : 1}>{body}</Whip> : body;
};

const Callout: React.FC<{ s: Extract<Scene, { kind: "callout" }>; dur: number }> = ({ s, dur }) => {
  const f = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const pop = spring({ frame: f - 6, fps, config: { damping: 9, stiffness: 200 } });
  return (
    <AbsoluteFill>
      <Bg bg={s.bg} dur={dur} />
      <div style={{ position: "absolute", left: 60, right: 60, top: height * 0.37, transform: `scale(${pop}) rotate(${(1 - pop) * -10}deg)`, transformOrigin: "50% 100%", filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.55))" }}>
        <Img src={staticFile(s.image)} style={{ width: "100%", borderRadius: 40 }} />
      </div>
      <Burst at={8} x={540} y={height * 0.43} color={s.burst} />
      <Kinetic lines={s.lines} size={104} bottom={170} align="center" />
    </AbsoluteFill>
  );
};

const Versus: React.FC<{ s: Extract<Scene, { kind: "versus" }>; dur: number }> = ({ s, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inL = spring({ frame: f, fps, config: { damping: 15 } });
  const inR = spring({ frame: f - 6, fps, config: { damping: 15 } });
  const t = interpolate(f, [24, 52], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const land = spring({ frame: f - 52, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill>
      <Backdrop hue={120} />
      <Phone width={400} x={300} y={1130 + (1 - inL) * 900} rotY={14} rotZ={-4}><Footage from={s.left.from} dur={dur} zoom={1} origin="50% 50%" /></Phone>
      <Phone width={400} x={780} y={1130 + (1 - inR) * 900} rotY={-14} rotZ={4} scale={1 + land * 0.04}><Footage from={s.right.from} dur={dur} zoom={1} origin="50% 50%" /></Phone>
      {[s.left, s.right].map((side, i) => (
        <div key={i} style={{ position: "absolute", top: 1610, left: (i ? 780 : 300) - 140, width: 280, textAlign: "center", fontFamily: "AdDisplay", fontSize: 64, color: i ? C.cream : C.accent, opacity: i ? inR : inL }}>{side.label}</div>
      ))}
      <div style={{ position: "absolute", top: 1035, width: "100%", textAlign: "center", fontFamily: "AdDisplay", fontSize: 90, color: "#FFD34D", opacity: inR }}>VS</div>
      {f >= 24 && f < 60 ? (
        <div style={{ position: "absolute", left: interpolate(t, [0, 1], [300, 780]) - 170, top: 1050 - Math.sin(t * Math.PI) * 360 - 70, width: 340, display: "flex", alignItems: "center", gap: 16, padding: 18, background: "#fff", borderRadius: 26, boxShadow: "0 20px 40px rgba(0,0,0,0.45)", transform: `rotate(${(t - 0.5) * 20}deg) scale(${1 - Math.max(0, t - 0.85) * 3})`, fontFamily: "AdBody", fontWeight: 700, color: C.deep, fontSize: 30 }}>
          <Img src={staticFile(config.icon)} style={{ width: 72, height: 72, borderRadius: 16 }} />
          {s.card}
        </div>
      ) : null}
      <Burst at={52} x={780} y={1000} color="#FFD34D" />
      <Kinetic lines={s.lines} size={104} top={170} shade={false} />
      {s.sub ? <div style={{ position: "absolute", top: 420, left: 80, fontFamily: "AdBody", fontWeight: 700, fontSize: 44, color: `${C.cream}CC`, opacity: inR }}>{s.sub}</div> : null}
    </AbsoluteFill>
  );
};

const End: React.FC<{ s: Extract<Scene, { kind: "end" }>; dur: number; store: boolean }> = ({ s, dur, store }) => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const drop = spring({ frame: f, fps, config: { damping: 8, stiffness: 140 } });
  const t1 = spring({ frame: f - 10, fps, config: { damping: 16 } });
  const t2 = spring({ frame: f - 18, fps, config: { damping: 14 } });
  const icon = width * 0.34;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      {s.bg ? <Bg bg={s.bg} dur={dur} blur={14} /> : <Backdrop hue={200} />}
      <Img src={staticFile(config.icon)} style={{ width: icon, height: icon, borderRadius: icon * 0.23, transform: `translateY(${(1 - drop) * -900}px) rotate(${(1 - drop) * -20}deg)`, boxShadow: `0 18px 0 ${C.accent}, 0 50px 90px rgba(0,0,0,0.5)` }} />
      <div style={{ marginTop: 80, fontFamily: "AdDisplay", fontSize: width * 0.11, color: "#fff", transform: `skewX(-8deg) translateY(${(1 - t1) * 50}px)`, opacity: t1, WebkitTextStroke: `12px ${C.deep}`, paintOrder: "stroke fill", textShadow: `0 10px 0 ${C.accent}` }}>{config.appName}</div>
      <div style={{ marginTop: 24, fontFamily: "AdBody", fontWeight: 700, fontSize: width * 0.044, color: `${C.cream}DD`, opacity: t1 }}>{s.tagline}</div>
      {store ? (
        <div style={{ marginTop: 64, display: "flex", alignItems: "center", gap: 22, padding: "26px 56px", background: "#000", color: "#fff", borderRadius: 30, border: "3px solid rgba(255,255,255,0.35)", opacity: t2, transform: `scale(${t2 * (1 + Math.sin(Math.max(0, f - 30) / 6) * 0.025)})`, fontFamily: "AdBody", fontWeight: 700 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#fff"><path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.7-3.19-1.72-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.75 2.21 1.1-.04 1.52-.71 2.85-.71s1.71.71 2.88.69c1.19-.02 1.94-1.08 2.67-2.15.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.34-3.55zM14.18 6.15c.61-.74 1.02-1.76.91-2.78-.88.04-1.94.59-2.57 1.32-.56.65-1.06 1.69-.93 2.69.98.08 1.98-.5 2.59-1.23z" /></svg>
          <div style={{ textAlign: "left" }}><div style={{ fontSize: 26, opacity: 0.8 }}>Download on the</div><div style={{ fontSize: 48, lineHeight: 1 }}>App Store</div></div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// `mode` = "reel" (Instagram/TikTok: mockups, whips, store badge) or "preview" (App Store: footage only).
export const SceneView: React.FC<{ s: Scene; dur: number; idx: number; mode: "reel" | "preview" }> = ({ s, dur, idx, mode }) => {
  switch (s.kind) {
    case "slam": return <Slam s={s} dur={dur} />;
    case "hero": return <Hero s={s} dur={dur} />;
    case "full": return <Full s={s} dur={dur} idx={idx} whip={mode === "reel"} />;
    case "callout": return <Callout s={s} dur={dur} />;
    case "versus": return <Versus s={s} dur={dur} />;
    case "end": return <End s={s} dur={dur} store={mode === "reel"} />;
  }
};

export const Grade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: "contrast(1.08) saturate(1.18)" }}>
    {children}
    <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
  </AbsoluteFill>
);
