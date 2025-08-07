import { getGithubUser } from "../handlers/github_handlers";
import { readSettings } from "../../main/settings";

export async function getGitAuthor() {
  const user = await getGithubUser();
  const settings = readSettings();
  const commitPrefix = settings.commitPrefix;

  // Use the configured prefix if enabled, otherwise use default "dyad"
  const authorName =
    commitPrefix?.enabled && commitPrefix.prefix ? commitPrefix.prefix : "dyad";

  const author = user
    ? {
        name: authorName,
        email: user.email,
      }
    : {
        name: authorName,
        email: "git@dyad.sh",
      };
  return author;
}
