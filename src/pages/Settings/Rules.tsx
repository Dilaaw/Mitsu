import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  TerminalSquare,
  MessageSquareQuote,
  BookOpenCheck,
} from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

declare global {
  interface Window {
    electron: {
      ipcRenderer: any;
    };
  }
}

interface PromptState {
  content: string;
  isCustom: boolean;
  originalContent: string;
}

const Rules = () => {
  const [buildPrompt, setBuildPrompt] = useState<PromptState>({
    content: "",
    isCustom: false,
    originalContent: "",
  });
  const [askPrompt, setAskPrompt] = useState<PromptState>({
    content: "",
    isCustom: false,
    originalContent: "",
  });
  const [aiRules, setAiRules] = useState<PromptState>({
    content: "",
    isCustom: false,
    originalContent: "",
  });
  const router = useRouter();

  const loadPrompts = () => {
    window.electron.ipcRenderer.invoke("prompts:load").then(
      (
        data: {
          buildPrompt: Omit<PromptState, "originalContent">;
          askPrompt: Omit<PromptState, "originalContent">;
          aiRules: Omit<PromptState, "originalContent">;
        } | null,
      ) => {
        if (data) {
          setBuildPrompt({
            ...data.buildPrompt,
            originalContent: data.buildPrompt.content,
          });
          setAskPrompt({
            ...data.askPrompt,
            originalContent: data.askPrompt.content,
          });
          setAiRules({
            ...data.aiRules,
            originalContent: data.aiRules.content,
          });
        }
      },
    );
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const handleSave = (
    promptName: "buildPrompt" | "askPrompt" | "aiRules",
    content: string,
  ) => {
    window.electron.ipcRenderer
      .invoke("prompts:save", { promptName, content })
      .then(() => {
        loadPrompts();
      });
  };

  const handleReset = (promptName: "buildPrompt" | "askPrompt" | "aiRules") => {
    window.electron.ipcRenderer.invoke("prompts:reset", promptName).then(() => {
      loadPrompts();
    });
  };

  return (
    <div className="min-h-screen px-8 py-4">
      <div className="max-w-5xl mx-auto">
        <Button
          onClick={() => router.history.back()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 mb-4 bg-(--background-lightest) py-5"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Prompts
          </h1>
        </div>

        <div className="space-y-6">
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <TerminalSquare className="h-5 w-5 text-blue-500" /> Build
                  Prompt
                </CardTitle>
                <span
                  className={`ml-3 text-sm font-medium px-2 py-1 rounded-full ${
                    buildPrompt.isCustom
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  {buildPrompt.isCustom ? "Custom" : "Default"}
                </span>
              </div>
              <CardDescription>
                This prompt is used when you are in "Build" mode. It guides the
                AI to generate code and interact with the file system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="buildPrompt"
                value={buildPrompt.content}
                onChange={(e) =>
                  setBuildPrompt({ ...buildPrompt, content: e.target.value })
                }
                className="bg-slate-100 dark:bg-gray-700"
                rows={15}
              />
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {buildPrompt.isCustom && (
                <Button
                  onClick={() => handleReset("buildPrompt")}
                  variant="destructive"
                >
                  Reset to Default
                </Button>
              )}
              <Button
                onClick={() => handleSave("buildPrompt", buildPrompt.content)}
                disabled={buildPrompt.content === buildPrompt.originalContent}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareQuote className="h-5 w-5 text-purple-500" /> Ask
                  Prompt
                </CardTitle>
                <span
                  className={`ml-3 text-sm font-medium px-2 py-1 rounded-full ${
                    askPrompt.isCustom
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  {askPrompt.isCustom ? "Custom" : "Default"}
                </span>
              </div>
              <CardDescription>
                This prompt is used when you are in "Ask" mode. It guides the AI
                to answer questions and provide explanations without generating
                code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="askPrompt"
                value={askPrompt.content}
                onChange={(e) =>
                  setAskPrompt({ ...askPrompt, content: e.target.value })
                }
                className="bg-slate-100 dark:bg-gray-700"
                rows={15}
              />
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {askPrompt.isCustom && (
                <Button
                  onClick={() => handleReset("askPrompt")}
                  variant="destructive"
                >
                  Reset to Default
                </Button>
              )}
              <Button
                onClick={() => handleSave("askPrompt", askPrompt.content)}
                disabled={askPrompt.content === askPrompt.originalContent}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card className="dark:bg-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <BookOpenCheck className="h-5 w-5 text-yellow-500" /> AI Rules
                </CardTitle>
                <span
                  className={`ml-3 text-sm font-medium px-2 py-1 rounded-full ${
                    aiRules.isCustom
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  {aiRules.isCustom ? "Custom" : "Default"}
                </span>
              </div>
              <CardDescription>
                These are the general rules that the AI follows, regardless of
                the mode. They define the AI's personality and constraints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="aiRules"
                value={aiRules.content}
                onChange={(e) =>
                  setAiRules({ ...aiRules, content: e.target.value })
                }
                className="bg-slate-100 dark:bg-gray-700"
                rows={15}
              />
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {aiRules.isCustom && (
                <Button
                  onClick={() => handleReset("aiRules")}
                  variant="destructive"
                >
                  Reset to Default
                </Button>
              )}
              <Button
                onClick={() => handleSave("aiRules", aiRules.content)}
                disabled={aiRules.content === aiRules.originalContent}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Rules;
