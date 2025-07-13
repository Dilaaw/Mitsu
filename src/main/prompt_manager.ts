import Store from "electron-store";
import { ipcMain } from "electron";
import {
  BUILD_SYSTEM_PROMPT,
  ASK_MODE_SYSTEM_PROMPT,
  DEFAULT_AI_RULES,
} from "../prompts/default_prompts";

const store = new Store();

interface CustomPrompts {
  buildPrompt?: string;
  askPrompt?: string;
  aiRules?: string;
}

const normalize = (str: string) => str.replace(/\r\n/g, "\n").trim();

const defaultPrompts = {
  buildPrompt: BUILD_SYSTEM_PROMPT,
  askPrompt: ASK_MODE_SYSTEM_PROMPT,
  aiRules: DEFAULT_AI_RULES,
};

ipcMain.handle(
  "prompts:save",
  (
    _,
    {
      promptName,
      content,
    }: { promptName: keyof CustomPrompts; content: string },
  ) => {
    const customPrompts = store.get("customPrompts", {}) as CustomPrompts;

    if (normalize(content) === normalize(defaultPrompts[promptName])) {
      delete customPrompts[promptName];
    } else {
      customPrompts[promptName] = content;
    }

    if (Object.keys(customPrompts).length === 0) {
      store.delete("customPrompts");
    } else {
      store.set("customPrompts", customPrompts);
    }
  },
);

ipcMain.handle("prompts:load", () => {
  const storedPrompts = store.get("customPrompts", {}) as CustomPrompts;

  const finalPrompts = {
    buildPrompt: {
      content: storedPrompts.buildPrompt ?? defaultPrompts.buildPrompt,
      isCustom: storedPrompts.hasOwnProperty("buildPrompt"),
    },
    askPrompt: {
      content: storedPrompts.askPrompt ?? defaultPrompts.askPrompt,
      isCustom: storedPrompts.hasOwnProperty("askPrompt"),
    },
    aiRules: {
      content: storedPrompts.aiRules ?? defaultPrompts.aiRules,
      isCustom: storedPrompts.hasOwnProperty("aiRules"),
    },
  };

  return finalPrompts;
});

ipcMain.handle("prompts:reset", (_, promptName: keyof CustomPrompts) => {
  const customPrompts = store.get("customPrompts", {}) as CustomPrompts;
  delete customPrompts[promptName];

  if (Object.keys(customPrompts).length === 0) {
    store.delete("customPrompts");
  } else {
    store.set("customPrompts", customPrompts);
  }
});

export const getPrompts = (): Omit<CustomPrompts, "aiRules"> & {
  aiRules: string;
} => {
  const storedPrompts = store.get("customPrompts", {}) as CustomPrompts;
  return {
    buildPrompt: storedPrompts.buildPrompt ?? defaultPrompts.buildPrompt,
    askPrompt: storedPrompts.askPrompt ?? defaultPrompts.askPrompt,
    aiRules: storedPrompts.aiRules ?? defaultPrompts.aiRules,
  };
};
