import React, { useState } from "react";
import { usePrompts } from "@/hooks/usePrompts";
import {
  CreatePromptDialog,
  CreateOrEditPromptDialog,
} from "@/components/CreatePromptDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { Info, X } from "lucide-react";

export default function LibraryPage() {
  const { prompts, isLoading, createPrompt, updatePrompt, deletePrompt } =
    usePrompts();
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  return (
    <div className="min-h-screen px-8 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mr-4">Library: Prompts</h1>
          <CreatePromptDialog onCreatePrompt={createPrompt} />
        </div>

        {showInfoBanner && (
          <div className="mb-6 bg-blue-600/20 border-l-4 border-blue-500 rounded-lg p-4 relative">
            <button
              onClick={() => setShowInfoBanner(false)}
              className="absolute top-3 right-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <Info
                className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Prompt Library
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  Create, organize, and manage your AI prompts in one place.
                  Build a collection of reusable prompts to streamline your
                  workflow and maintain consistency across your projects. Each
                  prompt can be customized with titles, descriptions, and
                  detailed content.
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div>Loading...</div>
        ) : prompts.length === 0 ? (
          <div className="text-muted-foreground">
            No prompts yet. Create one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {prompts.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                onUpdate={updatePrompt}
                onDelete={deletePrompt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PromptCard({
  prompt,
  onUpdate,
  onDelete,
}: {
  prompt: {
    id: number;
    title: string;
    description: string | null;
    content: string;
  };
  onUpdate: (p: {
    id: number;
    title: string;
    description?: string;
    content: string;
  }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  return (
    <div
      data-testid="prompt-card"
      className="border rounded-lg p-4 bg-(--background-lightest) min-w-80"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{prompt.title}</h3>
            {prompt.description && (
              <p className="text-sm text-muted-foreground">
                {prompt.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <CreateOrEditPromptDialog
              mode="edit"
              prompt={prompt}
              onUpdatePrompt={onUpdate}
            />
            <DeleteConfirmationDialog
              itemName={prompt.title}
              itemType="Prompt"
              onDelete={() => onDelete(prompt.id)}
            />
          </div>
        </div>
        <pre className="text-sm whitespace-pre-wrap bg-transparent border rounded p-2 max-h-48 overflow-auto">
          {prompt.content}
        </pre>
      </div>
    </div>
  );
}
