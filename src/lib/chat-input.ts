// Suggestions are unsent drafts, never canned legal answers.
export const CHAT_STARTERS = [
  { label: "Annual general meetings", question: "What is the time limit for holding an annual general meeting?" },
  { label: "Board meeting notice", question: "What notice is required for a board meeting?" },
] as const;

export function chatEnterAction(event: { key: string; keyCode: number; shiftKey: boolean; altKey: boolean; isComposing: boolean; repeat: boolean }) {
  // Leave composition/candidate selection to the input method. Consume held Enter
  // so it cannot edit the draft and abort an independent check after sending.
  if (event.isComposing || event.keyCode === 229 || event.key !== "Enter" || event.shiftKey || event.altKey) return "edit";
  return event.repeat ? "consume" : "send";
}
