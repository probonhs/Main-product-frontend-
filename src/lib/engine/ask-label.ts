import type { AskResponse } from "./ask";

/** Presentation only. An answered turn is not a compliance certificate. */
export function askLabel(value: AskResponse): string {
  switch (value.state) {
    case "answered": return "Answered";
    case "out_of_scope": return "Not held — law/source not held";
    case "partial": return value.confirmed?.length || value.figures?.length || value.rows?.length ? "Abstained in part" : "Abstained";
    default: throw new Error("Unknown Ask state");
  }
}
