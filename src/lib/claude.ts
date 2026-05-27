// Claude model ID — claude-sonnet-4-20250514 is no longer available on the API;
// override via ANTHROPIC_MODEL in .env.local if needed.
export const CLAUDE_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
