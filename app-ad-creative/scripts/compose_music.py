"""Original ad track — synthesized from scratch (no samples, no licensing). This exact sound (120 BPM electronic,
A minor, impacts + riser cold open, sidechained groove, whooshes on cuts, held chord on the end card) is what the
user approved on the posted PhoneSwing Golf reel. Keep the sound; adapt only the TIMING block below to the new edit.

Usage: python3 compose_music.py [out.wav]   then master:  ffmpeg -i out.wav -af loudnorm=I=-14:TP=-1:LRA=11 track.wav
Beat grid: 0.5 s per beat = 15 frames @30fps, matching ad.config.ts ."""
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

import sys
SR = 44100
BPM = 120
B = 60 / BPM            # seconds per beat
# ---------- TIMING (edit per ad; units = beats unless noted) ----------
END_BEAT = 34                    # end-card hit = sum of scene beats before the end scene
DUR = END_BEAT * 0.5 + 3.0       # seconds: end card plays 3 s after the hit
CUT_BEATS = (10, 15, 19, 26, 30) # whoosh+hit on these scene boundaries
DING_SEC = 261 / 30              # e.g. a putt dropping / a success moment (seconds), or None
SPARKLE_SEC = ((19 * 15 + 52) / 30, (26 * 15 + 8) / 30, (30 * 15 + 8) / 30)  # pops / reveals (seconds)
N = int(SR * DUR)
rng = np.random.default_rng(7)

L = np.zeros(N); R = np.zeros(N)


def t_(sec): return np.arange(int(sec * SR)) / SR


def add(sig, at, pan=0.0, gain=1.0):
    i = int(at * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def lp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), "low"); return lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), "high"); return lfilter(b, a, x)


def env(n, a=0.002, d=0.2, s=0.0, total=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    return e * (s + (1 - s) * np.exp(-np.maximum(0, t - a) / d))


def note(m): return 440 * 2 ** ((m - 69) / 12)


# ---------- instruments ----------
def kick():
    t = t_(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) * 1.0 + np.tanh(np.sin(ph) * 3) * np.exp(-t * 30) * 0.3


def clap():
    t = t_(0.3)
    n = rng.standard_normal(len(t))
    e = np.zeros(len(t))
    for off in (0, 0.012, 0.024):
        i = int(off * SR); e[i:] += np.exp(-(t[: len(t) - i]) * 22)
    return hp(lp(n, 6000), 900) * e * 0.5


def hat(open_=False):
    t = t_(0.25 if open_ else 0.06)
    n = hp(rng.standard_normal(len(t)), 7000)
    return lp(n, 12000) * np.exp(-t * (12 if open_ else 70)) * 0.13


def saw(f, t, det=0.0):
    out = np.zeros_like(t)
    for d in (-det, 0, det):
        out += 2 * ((t * f * (1 + d)) % 1) - 1
    return out / 3


def bass(m, dur):
    t = t_(dur)
    s = saw(note(m), t, 0.004) + 0.5 * np.sin(2 * np.pi * note(m - 12) * t)
    return lp(s, 900) * env(len(t), 0.004, dur * 0.7, 0.6) * 0.55


def stab(ms, dur=0.22):
    t = t_(dur)
    s = sum(saw(note(m), t, 0.008) for m in ms) / len(ms)
    return lp(s, 3200) * env(len(t), 0.003, 0.09, 0.0) * 0.5


def pluck(m, dur=0.2):
    t = t_(dur)
    s = saw(note(m), t, 0.003) + 0.3 * np.sin(2 * np.pi * note(m + 12) * t)
    return lp(s, 4200) * np.exp(-t * 14) * 0.32


def impact():
    t = t_(1.4)
    boom = np.sin(2 * np.pi * (38 + 90 * np.exp(-t * 18)) * t) * np.exp(-t * 3.2)
    noise = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 6) * 0.5
    return np.tanh((boom + noise) * 1.6) * 0.9


def whoosh(dur=0.5):
    t = t_(dur)
    n = rng.standard_normal(len(t))
    sweep = np.linspace(400, 7000, len(t))
    out = np.zeros(len(t)); y = 0.0
    # cheap moving band: high-pass the noise progressively by blending filtered versions
    lo = lp(n, 1200); hi = hp(n, 3000)
    mix = np.linspace(0, 1, len(t))
    out = lo * (1 - mix) + hi * mix
    shape = np.sin(np.pi * np.linspace(0, 1, len(t))) ** 2
    return out * shape * 0.45


def riser(dur):
    t = t_(dur)
    n = hp(rng.standard_normal(len(t)), 1500)
    tone = saw(220 * 2 ** (t / dur * 1.5), t, 0.01)
    return (n * 0.5 + lp(tone, 5000) * 0.25) * (t / dur) ** 2 * 0.6


def ding():
    t = t_(1.2)
    s = sum(np.sin(2 * np.pi * note(m) * t) * a for m, a in ((88, 1), (95, 0.5), (100, 0.3)))
    return s * np.exp(-t * 4) * 0.28


def sparkle():
    t = t_(0.6)
    s = sum(np.sin(2 * np.pi * note(84 + k * 7) * t) * np.exp(-np.maximum(0, t - k * 0.05) * 9) * (t > k * 0.05) for k in range(4))
    return s * 0.15


def pad(ms, dur):
    t = t_(dur)
    s = sum(saw(note(m), t, 0.01) for m in ms) / len(ms)
    e = np.minimum(1, t / 0.05) * np.exp(-t / (dur * 0.6))
    return lp(s, 2200) * e * 0.35


# ---------- arrangement ----------
beat = lambda k: k * B
prog = [(57, [69, 72, 76]), (53, [65, 69, 72]), (48, [67, 72, 76]), (55, [67, 71, 74])]  # Am F C G (bass root, chord)

# cold open: impacts on the three word slams, riser into the groove
for k in (0, 1, 2):
    add(impact(), beat(k), gain=0.9 - 0.1 * k)
add(riser(1.0), beat(2))

kick_track = np.zeros(N)
for k in range(4, END_BEAT):
    i = int(beat(k) * SR); kk = kick()[: N - i]; kick_track[i:i + len(kk)] += kk
    if k % 2 == 1: add(clap(), beat(k), pan=0.05, gain=0.65)
    for h in (0.0, 0.5):
        add(hat(open_=(h == 0.5 and k % 4 == 3)), beat(k + h), pan=0.25 if h else -0.15)

# bass + stabs per bar (4 beats), from beat 4 to 34
for bar, k in enumerate(range(4, END_BEAT, 4)):
    root, chord = prog[bar % 4]
    for h in (0, 0.75, 1.5, 2.5, 3.0, 3.5):
        add(bass(root - 12 + (12 if h in (1.5, 3.5) else 0), 0.24), beat(k + h), gain=0.9)
    for h in (0.5, 1.25, 2.5, 3.25):
        add(stab(chord), beat(k + h), pan=-0.3 if h < 2 else 0.3, gain=0.8)

# arp lead from beat 19 (battle) to 34
for k in np.arange(19, END_BEAT, 0.25):
    bar = int((k - 4) // 4) % 4
    _, chord = prog[bar]
    m = chord[int(k * 4) % 3] + 12
    add(pluck(m), beat(k), pan=0.4 * np.sin(k), gain=0.85)

# transitions
for k in CUT_BEATS:
    add(whoosh(0.45), beat(k) - 0.4, pan=0.0, gain=1.0)
    add(impact(), beat(k), gain=0.35)
if DING_SEC is not None: add(ding(), DING_SEC)
for sec in SPARKLE_SEC:
    add(sparkle(), sec)

# end card: big hit + held chord
add(whoosh(0.6), beat(END_BEAT) - 0.55)
add(impact(), beat(END_BEAT), gain=1.0)
add(pad([57, 64, 69, 72, 76], 3.0), beat(END_BEAT), gain=1.2)
add(ding(), beat(END_BEAT) + 0.05, gain=0.7)

# sidechain duck everything but kicks/impacts on the kick
duck = np.ones(N)
for k in range(4, END_BEAT):
    i = int(beat(k) * SR); n = int(0.18 * SR)
    duck[i:i + n] = np.minimum(duck[i:i + n], 0.45 + 0.55 * np.linspace(0, 1, n) ** 1.5)
L *= duck; R *= duck
L += kick_track * 0.95; R += kick_track * 0.95

# room reverb
ir_t = t_(1.2)
ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 5)
ir = lp(ir, 5000) * 0.03
L = L + fftconvolve(L, ir)[:N]; R = R + fftconvolve(R, ir[::-1] * 0.95)[:N]

# master: high-pass rumble, soft-clip limiter, fade
mix = np.stack([hp(L, 30), hp(R, 30)], 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.8) / np.tanh(1.8) * 0.92
fade = np.ones(N); fn = int(1.2 * SR); fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade[:, None]
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else "track_raw.wav", SR, (mix * 32767).astype(np.int16))
print("ok", mix.shape, float(np.sqrt(np.mean(mix ** 2))))
