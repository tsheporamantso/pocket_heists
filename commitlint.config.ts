import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      headerPattern:
        /^(?<emoji>[\p{Emoji_Presentation}\p{Extended_Pictographic}]\s*)?(?<type>[\w-]+)(?:\((?<scope>[^)]*)\))?(?<excl>!)?: (?<subject>.+)$/u,
    },
  },
};

export default config;
