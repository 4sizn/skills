import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Composition, Sequence, staticFile, useVideoConfig } from "remotion";
import { config, Scene, totalBeats } from "./ad.config";
import { Fonts, Grade, SceneView } from "./kit";

const Timeline: React.FC<{ scenes: Scene[]; mode: "reel" | "preview" }> = ({ scenes, mode }) => {
  const { fps } = useVideoConfig();
  let at = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: config.colors.deep }}>
      <Fonts />
      <Audio src={staticFile(config.music)} />
      <Grade>
        {scenes.map((s, i) => {
          const dur = s.beats * config.beat;
          const el = (
            <Sequence key={i} name={`${i + 1}. ${s.kind}`} from={at} durationInFrames={dur} premountFor={fps}>
              <SceneView s={s} dur={dur} idx={i} mode={mode} />
            </Sequence>
          );
          at += dur;
          return el;
        })}
      </Grade>
    </AbsoluteFill>
  );
};

const Reel: React.FC = () => <Timeline scenes={config.reel} mode="reel" />;
const Preview: React.FC = () => <Timeline scenes={config.preview} mode="preview" />;

export const RemotionRoot: React.FC = () => (
  <>
    {/* Instagram / TikTok / YouTube Shorts — 9:16 */}
    <Composition id="Reel" component={Reel} durationInFrames={totalBeats(config.reel) * config.beat} fps={30} width={1080} height={1920} />
    {/* App Store App Preview — iPhone 6.9"/6.5" portrait */}
    <Composition id="AppPreview" component={Preview} durationInFrames={totalBeats(config.preview) * config.beat} fps={30} width={886} height={1920} />
  </>
);
