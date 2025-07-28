import { normalizePath } from "../../../shared/normalizePath";
import log from "electron-log";
import { SqlQuery } from "../../lib/schemas";

const logger = log.scope("dyad_tag_parser");

export function getDyadWriteTags(fullResponse: string): {
  path: string;
  content: string;
  description?: string;
}[] {
  const dyadWriteRegex = /<mitsu-write([^>]*)>([\s\S]*?)<\/mitsu-write>/gi;
  const pathRegex = /path="([^"]+)"/;
  const descriptionRegex = /description="([^"]+)"/;

  let match;
  const tags: { path: string; content: string; description?: string }[] = [];

  while ((match = dyadWriteRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1];
    let content = match[2].trim();

    const pathMatch = pathRegex.exec(attributesString);
    const descriptionMatch = descriptionRegex.exec(attributesString);

    if (pathMatch && pathMatch[1]) {
      const path = pathMatch[1];
      const description = descriptionMatch?.[1];

      const contentLines = content.split("\n");
      if (contentLines[0]?.startsWith("```")) {
        contentLines.shift();
      }
      if (contentLines[contentLines.length - 1]?.startsWith("```")) {
        contentLines.pop();
      }
      content = contentLines.join("\n");

      tags.push({ path: normalizePath(path), content, description });
    } else {
      logger.warn(
        "Found <mitsu-write> tag without a valid 'path' attribute:",
        match[0],
      );
    }
  }
  return tags;
}

export function getDyadRenameTags(fullResponse: string): {
  from: string;
  to: string;
}[] {
  const dyadRenameRegex =
    /<mitsu-rename from="([^"]+)" to="([^"]+)"[^>]*>([\s\S]*?)<\/mitsu-rename>/g;
  let match;
  const tags: { from: string; to: string }[] = [];
  while ((match = dyadRenameRegex.exec(fullResponse)) !== null) {
    tags.push({
      from: normalizePath(match[1]),
      to: normalizePath(match[2]),
    });
  }
  return tags;
}

export function getDyadDeleteTags(fullResponse: string): string[] {
  const dyadDeleteRegex =
    /<mitsu-delete path="([^"]+)"[^>]*>([\s\S]*?)<\/mitsu-delete>/g;
  let match;
  const paths: string[] = [];
  while ((match = dyadDeleteRegex.exec(fullResponse)) !== null) {
    paths.push(normalizePath(match[1]));
  }
  return paths;
}

export function getDyadAddDependencyTags(fullResponse: string): string[] {
  const dyadAddDependencyRegex =
    /<mitsu-add-dependency packages="([^"]+)">[^<]*<\/mitsu-add-dependency>/g;
  let match;
  const packages: string[] = [];
  while ((match = dyadAddDependencyRegex.exec(fullResponse)) !== null) {
    packages.push(...match[1].split(" "));
  }
  return packages;
}

export function getDyadChatSummaryTag(fullResponse: string): string | null {
  const dyadChatSummaryRegex =
    /<mitsu-chat-summary>([\s\S]*?)<\/mitsu-chat-summary>/g;
  const match = dyadChatSummaryRegex.exec(fullResponse);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

export function getDyadExecuteSqlTags(fullResponse: string): SqlQuery[] {
  const dyadExecuteSqlRegex =
    /<mitsu-execute-sql([^>]*)>([\s\S]*?)<\/mitsu-execute-sql>/g;
  const descriptionRegex = /description="([^"]+)"/;
  let match;
  const queries: { content: string; description?: string }[] = [];

  while ((match = dyadExecuteSqlRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1] || "";
    let content = match[2].trim();
    const descriptionMatch = descriptionRegex.exec(attributesString);
    const description = descriptionMatch?.[1];

    // Handle markdown code blocks if present
    const contentLines = content.split("\n");
    if (contentLines[0]?.startsWith("```")) {
      contentLines.shift();
    }
    if (contentLines[contentLines.length - 1]?.startsWith("```")) {
      contentLines.pop();
    }
    content = contentLines.join("\n");

    queries.push({ content, description });
  }

  return queries;
}

export function getDyadCommandTags(fullResponse: string): string[] {
  const dyadCommandRegex =
    /<mitsu-command type="([^"]+)"[^>]*><\/mitsu-command>/g;
  let match;
  const commands: string[] = [];

  while ((match = dyadCommandRegex.exec(fullResponse)) !== null) {
    commands.push(match[1]);
  }

  return commands;
}
