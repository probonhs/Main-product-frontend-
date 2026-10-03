import type { RunStatus } from "./conversations";

// Each status check needs two upstream reads (message ownership + run). Three
// checks plus one final thread refresh stay below eight upstream reads total.
export const RUN_UPDATE_LIMIT = 3;
export const RUN_UPDATE_INTERVAL_MS = 5_000;
export const RUN_UPDATE_WINDOW_MS = 60_000;

export function runNeedsUpdates(run: RunStatus) {
  return run.status === "PLANNED" || run.status === "RUNNING";
}

export function runDescription(run: RunStatus | undefined) {
  if (!run) return { title: "Reply pending", note: "A run reference is recorded, but its current status has not been checked. No answer is available yet." };
  switch (run.status) {
    case "PLANNED": return { title: "Queued", note: "The gateway recorded this work in its queue. No answer has been stored yet." };
    case "RUNNING": return { title: "Processing", note: "The gateway reports that work is running. No answer has been stored yet." };
    case "AWAITING_HUMAN": return { title: "Review needed", note: "The run is waiting for a professional. Automatic updates have stopped; the approval action is not connected here yet." };
    case "ANSWERED": return { title: "Processing finished", note: "The run finished, but no stored reply is displayed here yet. Completion alone is not a legal finding. Refresh the reply to check its answer record." };
    case "PARTIAL": return { title: "Processing partly finished", note: "The run recorded partial completion. Refresh the reply to inspect its answer and limitations; this status is not a legal conclusion." };
    case "FAILED": return { title: "Processing failed", note: "The processing attempt failed. This is not an abstention or a finding about the law. Refresh saved work before considering another submission." };
    case "REFUSED": return run.refusal_code === "CANCELLED"
      ? { title: "Run cancelled", note: "The gateway recorded cancellation. Previously recorded work remains available; stopping updates here does not cancel a run." }
      : { title: "Run declined", note: "The gateway declined this run. This is not a connection error. Refresh the reply and inspect its record before taking further action." };
  }
}

function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();
    const abort = () => { clearTimeout(timer); signal.removeEventListener("abort", abort); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}

// User-started, sequential, read-only updates. Never retries a submission, never infers
// an envelope from result/status, and never resumes itself after an error or hidden tab.
export async function followRunUpdates({ read, signal, onRecord, visible, wait = pause }: {
  read: (signal: AbortSignal) => Promise<RunStatus>;
  signal: AbortSignal;
  onRecord: (run: RunStatus) => void;
  visible: () => boolean;
  wait?: (ms: number, signal: AbortSignal) => Promise<void>;
}): Promise<"finished" | "limit" | "hidden"> {
  for (let count = 0; count < RUN_UPDATE_LIMIT; count++) {
    signal.throwIfAborted();
    if (!visible()) return "hidden";
    const run = await read(signal);
    signal.throwIfAborted();
    if (!visible()) return "hidden";
    onRecord(run);
    if (!runNeedsUpdates(run)) return "finished";
    if (count < RUN_UPDATE_LIMIT - 1) await wait(RUN_UPDATE_INTERVAL_MS, signal);
  }
  return "limit";
}
