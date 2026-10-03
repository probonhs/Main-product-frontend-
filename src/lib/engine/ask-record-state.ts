import type { AskResponse } from "./ask";

export type LoadedAskRecord = {
  data: AskResponse;
  mode: "sample" | "local";
  sample?: { capturedAt: string; backendCommit: string; id: string };
};

export type AskRecordState = {
  record: LoadedAskRecord | null;
  draftChanged: boolean;
  pendingId: number | null;
  error: string;
};

export type AskRecordEvent =
  | { type: "edit" }
  | { type: "start"; id: number }
  | { type: "received"; id: number; record: LoadedAskRecord }
  | { type: "failed"; id: number; message: string }
  | { type: "invalid"; message: string };

export function initialAskRecordState(record: LoadedAskRecord | null): AskRecordState {
  return { record, draftChanged: false, pendingId: null, error: "" };
}

/** Draft/request state only. Legal findings and evidence remain the unchanged returned record. */
export function askRecordReducer(state: AskRecordState, event: AskRecordEvent): AskRecordState {
  switch (event.type) {
    case "edit": return { ...state, draftChanged: true, pendingId: null, error: "" };
    case "start": return { ...state, pendingId: event.id, error: "" };
    case "received":
      if (state.pendingId !== event.id) return state;
      return { record: event.record, draftChanged: event.record.mode === "sample" && state.draftChanged, pendingId: null, error: "" };
    case "failed":
      if (state.pendingId !== event.id) return state;
      return { ...state, pendingId: null, error: event.message };
    case "invalid": return { ...state, pendingId: null, error: event.message };
  }
}

export function retainedAskNotice(state: AskRecordState): { title: string; detail: string } | null {
  if (!state.record || (!state.draftChanged && state.pendingId === null && !state.error)) return null;
  const title = state.pendingId !== null ? "New check pending" : state.error ? "No new result" : "Draft changes not checked";
  const detail = state.record.mode === "sample"
    ? "The answer and Sources below belong to the captured example, not your draft. No result for your draft is shown."
    : "The answer and Sources below belong to the previous check and its original facts, not your current draft. Check again to obtain a new result.";
  return { title, detail };
}
