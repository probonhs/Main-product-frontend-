/** Names and navigation only. Legal results come from captured engine responses. */
export const WORKSPACE_SAMPLES = [
  { id: "ask-answered", title: "Small-company limits", description: "A dated figure with its governing instrument." },
  { id: "ask-partial", title: "Board requirements", description: "Established text alongside what remains unresolved." },
  { id: "ask-abstained", title: "A rule not established", description: "An unresolved source, with the reason visible." },
  { id: "ask-not-held", title: "A question outside coverage", description: "What happens when the relevant law is not held." },
] as const;
export type WorkspaceSampleId = (typeof WORKSPACE_SAMPLES)[number]["id"];
