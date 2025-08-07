import { readSettings } from "../../main/settings";

/**
 * Formats a commit message with the configured prefix
 * @param message - The base commit message
 * @returns The formatted commit message with prefix if enabled
 */
export function formatCommitMessage(message: string): string {
  const settings = readSettings();
  const commitPrefix = settings.commitPrefix;

  if (!commitPrefix?.enabled || !commitPrefix.prefix) {
    return message;
  }

  // Check if the message already starts with the prefix to avoid duplication
  const prefix = commitPrefix.prefix;
  if (message.startsWith(prefix)) {
    return message;
  }

  return `${prefix} ${message}`;
}
