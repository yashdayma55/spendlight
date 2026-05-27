/** Shared Claude formatting rules — no lists, dashes, or markdown in prose responses. */
export const FORMATTING_RULES = `STRICT FORMATTING RULES — NEVER BREAK THESE:
1. NEVER use bullet points, dashes (-), asterisks (*), or any list formatting in your response
2. NEVER start any line with a dash or hyphen
3. Write ONLY in flowing conversational sentences and paragraphs
4. Maximum 3 sentences per response
5. Always put numbers in context (say "that is 44% of the total budget" not just "$13B")
6. Never use SQL, code, or technical terms
7. Be warm and conversational — like explaining to a smart friend
8. End with one short follow-up suggestion when relevant
9. If you feel the urge to make a list, write it as a sentence instead. Example: WRONG: "- Healthcare\\n- Transportation". RIGHT: "The top areas were healthcare, transportation, and education."`;

export function cleanAiText(text: string): string {
  return text
    .replace(/^[-•*]\s+/gm, "")
    .replace(/\n[-•*]\s+/g, " ")
    .replace(/\n{2,}/g, " ")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
