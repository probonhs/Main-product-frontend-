// Frontend-only preparation policy, not a gateway upload/retention guarantee.
export const MAX_LOCAL_TEXT_BYTES = 256 * 1024;
export const MAX_LOCAL_TEXT_CHARACTERS = 200_000;
export type ReviewKind = "corporate_document" | "contract";
export type DocumentDraft = { name: string; text: string; review: ReviewKind; source: "entered" | "text_file" };
export type PreparationState = {
  draft: DocumentDraft;
  prepared: DocumentDraft | null;
  changed: boolean;
  requestId: number | null;
  error: string;
  errorField: "name" | "text" | "file" | null;
};
export const initialPreparation: PreparationState = {
  draft: { name: "", text: "", review: "corporate_document", source: "entered" },
  prepared: null, changed: false, requestId: null, error: "", errorField: null,
};
export type PreparationEvent =
  | { type: "edit"; patch: Partial<Pick<DocumentDraft, "name" | "text" | "review">> }
  | { type: "read"; requestId: number }
  | { type: "read_done"; requestId: number; name: string; text: string }
  | { type: "read_failed"; requestId: number; error: string }
  | { type: "reject_input"; field: "name" | "text"; error: string }
  | { type: "prepare" } | { type: "stop" } | { type: "clear" };

export function localTextLimitError(text: string) {
  return text.length > MAX_LOCAL_TEXT_CHARACTERS || new TextEncoder().encode(text).byteLength > MAX_LOCAL_TEXT_BYTES
    ? "The local text limit is 256 KiB and 200,000 characters. Use a smaller excerpt; the existing text was not replaced."
    : "";
}

export function preparationError(draft: DocumentDraft) {
  if (draft.name.length > 160) return "Use a document name of 160 characters or fewer.";
  if (!draft.text.trim()) return "Add readable document text before preparing it.";
  if (localTextLimitError(draft.text)) return localTextLimitError(draft.text);
  if (/[\x00-\x08\x0B\x0E-\x1F\x7F]/.test(draft.text) || /^(%PDF-|\{\\rtf)/.test(draft.text.trimStart())) return "This does not appear to be plain text. Export readable text or paste it from the original document.";
  return "";
}

export function preparationReducer(state: PreparationState, event: PreparationEvent): PreparationState {
  switch (event.type) {
    case "edit": {
      const error = event.patch.text === undefined ? "" : localTextLimitError(event.patch.text);
      if (error) return { ...state, requestId: null, error, errorField: "text" };
      if (event.patch.name !== undefined && event.patch.name.length > 160) return { ...state, requestId: null, error: "Use a document name of 160 characters or fewer. The existing name was not replaced.", errorField: "name" };
      return { ...state, draft: { ...state.draft, ...event.patch, ...(event.patch.text !== undefined ? { source: "entered" as const } : {}) }, changed: !!state.prepared, requestId: null, error: "", errorField: null };
    }
    case "reject_input": return { ...state, requestId: null, error: event.error, errorField: event.field };
    case "read": return { ...state, requestId: event.requestId, error: "", errorField: null };
    case "read_done": {
      if (state.requestId !== event.requestId) return state;
      const draft = { ...state.draft, name: event.name, text: event.text, source: "text_file" as const };
      const error = preparationError(draft);
      return error ? { ...state, requestId: null, error, errorField: "file" } : { ...state, draft, changed: !!state.prepared, requestId: null, error: "", errorField: null };
    }
    case "read_failed": return state.requestId === event.requestId ? { ...state, requestId: null, error: event.error, errorField: "file" } : state;
    case "prepare": {
      if (state.requestId !== null) return state;
      const error = preparationError(state.draft);
      return error ? { ...state, error, errorField: state.draft.name.length > 160 ? "name" : "text" } : { ...state, prepared: { ...state.draft }, changed: false, error: "", errorField: null };
    }
    case "stop": return { ...state, requestId: null };
    case "clear": return initialPreparation;
  }
}

export async function readLocalText(file: Pick<File, "name" | "size" | "arrayBuffer">): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  if (!file.name.toLowerCase().endsWith(".txt")) return { ok: false, error: "Only UTF-8 .txt files can be read here. PDF, Word and scanned documents are not connected yet. Paste an excerpt instead." };
  if (file.size <= 0 || file.size > MAX_LOCAL_TEXT_BYTES) return { ok: false, error: "Choose a non-empty text file no larger than 256 KiB." };
  try {
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength !== file.size || bytes.byteLength > MAX_LOCAL_TEXT_BYTES) return { ok: false, error: "The file could not be read within the local text limit. No text was replaced." };
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const error = preparationError({ name: file.name, text, review: "corporate_document", source: "text_file" });
    return error ? { ok: false, error } : { ok: true, text };
  } catch {
    return { ok: false, error: "The file could not be read as UTF-8 text. Export a text copy or paste an excerpt; the existing draft is unchanged." };
  }
}
