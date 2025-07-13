import path from "node:path";
import fs from "node:fs";
import log from "electron-log";
import {
  ASK_MODE_SYSTEM_PROMPT,
  BUILD_SYSTEM_PROMPT,
  DEFAULT_AI_RULES,
} from "./default_prompts";

const logger = log.scope("system_prompt");

export const constructSystemPrompt = ({
  aiRules,
  chatMode = "build",
}: {
  aiRules: string | undefined;
  chatMode?: "build" | "ask";
}) => {
  const systemPrompt =
    chatMode === "ask" ? ASK_MODE_SYSTEM_PROMPT : BUILD_SYSTEM_PROMPT;

  return systemPrompt.replace("[[AI_RULES]]", aiRules ?? DEFAULT_AI_RULES);
};

export const readAiRules = async (dyadAppPath: string) => {
  const aiRulesPath = path.join(dyadAppPath, "AI_RULES.md");
  try {
    const aiRules = await fs.promises.readFile(aiRulesPath, "utf8");
    return aiRules;
  } catch (error) {
    logger.info(
      `Error reading AI_RULES.md, fallback to default AI rules: ${error}`,
    );
    return DEFAULT_AI_RULES;
  }
};
