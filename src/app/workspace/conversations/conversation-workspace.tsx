"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, BookOpen, Building2, Copy, History, Paperclip, SquarePen, X } from "lucide-react";
import { LegalText } from "@/components/brand";
import type { Citation, Conversation, Envelope, RunStatus, Thread, Trace } from "@/lib/engine/conversations";
import { followRunUpdates, runDescription, RUN_UPDATE_WINDOW_MS } from "@/lib/engine/run-updates";
import { RunDetails } from "./run-details";
import { CHAT_STARTERS, chatEnterAction } from "@/lib/chat-input";

const labels: Record<Envelope["status"], string> = { ANSWERED: "Answered", PARTIAL: "Abstained in part", ABSTAINED: "Abstained", NEEDS_LAWYER: "Professional review needed", NEEDS_CLARIFICATION: "More detail needed", FAILED: "Request not completed" };
export function recoveryWasRead(uncertainId: string | undefined, refreshedId: string | undefined) {
  // A known submitted thread must be read, not merely listed. Without a returned
  // identity, a fresh list can only support explicit human review, never proof of rejection.
  return uncertainId === undefined || uncertainId === refreshedId;
}
export function draftAfterSubmission(draft: string, submitted: string) {
  return draft === submitted ? "" : draft;
}
export function refreshKeepsEvidence(selectedId: string | undefined, requestedId: string | undefined) {
  return requestedId === undefined || selectedId === requestedId;
}
type Action = { action: "list" } | { action: "get"; conversationId: string } | { action: "send"; conversationId?: string; text: string } | { action: "citation"; conversationId: string; messageId: string; citationId: string } | { action: "trace"; runId: string } | { action: "run"; conversationId: string; messageId: string; runId: string };

export function ConversationWorkspace({ enabled, initialId }: { enabled: boolean; initialId?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [thread, setThread] = useState<Thread | null>(null);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(enabled);
  const [status, setStatus] = useState("");
  const [source, setSource] = useState<Citation | null>(null);
  const [trace, setTrace] = useState<Trace | null>(null);
  const [sourceError, setSourceError] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const [runs, setRuns] = useState<Record<string, RunStatus>>({});
  const [sendUncertain, setSendUncertain] = useState(false);
  const [savedWorkChecked, setSavedWorkChecked] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const updateController = useRef<AbortController | null>(null);
  const sending = useRef(false);
  const uncertainConversation = useRef<string | undefined>(undefined);
  const selectedConversation = useRef<string | undefined>(undefined);
  const sequence = useRef(0);
  const input = useRef<HTMLTextAreaElement>(null);
  const sourceInvoker = useRef<HTMLButtonElement | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const composing = useRef(false);
  const invalidate = useCallback(() => { sequence.current++; controller.current?.abort(); updateController.current?.abort(); }, []);
  const call = useCallback(async <T,>(action: Action, signal?: AbortSignal): Promise<T> => {
    const request = new AbortController(); controller.current?.abort(); controller.current = request;
    const combined = signal ? AbortSignal.any([signal, request.signal]) : request.signal;
    const response = await fetch("/api/workspace/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action), signal: combined });
    const payload = await response.json();
    combined.throwIfAborted();
    if (!response.ok || !payload.ok) throw new Error(payload.error?.message || "The service could not complete this request.");
    return payload.data as T;
  }, []);
  const load = useCallback(async (id?: string) => {
    updateController.current?.abort();
    const current = ++sequence.current; setBusy(true); setError("");
    if (!refreshKeepsEvidence(selectedConversation.current, id)) { setSource(null); setTrace(null); setSourceError(""); }
    try {
      if (id) {
        const data = await call<Thread>({ action: "get", conversationId: id });
        if (sequence.current !== current) return;
        setThread(data);
        selectedConversation.current = id;
        window.history.replaceState(null, "", `/workspace/conversations?conversation=${encodeURIComponent(id)}`);
        if (recoveryWasRead(uncertainConversation.current, id)) setSavedWorkChecked(true);
      }
      const data = await call<{ conversations: Conversation[] }>({ action: "list" });
      if (sequence.current === current) { setConversations(data.conversations); if (recoveryWasRead(uncertainConversation.current, id)) setSavedWorkChecked(true); setStatus(id ? "Conversation loaded." : "Conversation list loaded."); return true; }
    } catch (cause) { if (sequence.current === current) setError(cause instanceof Error ? cause.message : "Conversation unavailable."); return false; }
    finally { if (sequence.current === current) setBusy(false); }
  }, [call]);
  useEffect(() => {
    let active = true;
    async function initialise() {
      try {
        if (initialId) {
          const data = await call<Thread>({ action: "get", conversationId: initialId });
          if (!active) return;
          setThread(data);
          selectedConversation.current = initialId;
        }
        const data = await call<{ conversations: Conversation[] }>({ action: "list" });
        if (active) { setConversations(data.conversations); setStatus("Saved work loaded."); }
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Conversation unavailable."); }
      finally { if (active) setBusy(false); }
    }
    if (enabled) void initialise();
    return () => { active = false; invalidate(); };
  }, [enabled, initialId, call, invalidate]);
  useEffect(() => { if (source || sourceError || trace) document.getElementById("conversation-evidence-heading")?.focus(); }, [source, sourceError, trace]);
  function reopen(id: string) {
    if (question.trim() && !window.confirm("Discard the unsent question and open this conversation?")) return;
    setQuestion(""); setThread(null);
    window.history.replaceState(null, "", `/workspace/conversations?conversation=${encodeURIComponent(id)}`);
    void load(id);
  }
  function newQuestion() {
    if (question.trim() && !window.confirm("Discard the unsent question and start a new conversation?")) return;
    sequence.current++; controller.current?.abort(); updateController.current?.abort(); selectedConversation.current = undefined; setBusy(false); setThread(null); setQuestion(""); setSource(null); setTrace(null); setSourceError(""); setError(""); setStatus("");
    window.history.replaceState(null, "", "/workspace/conversations"); input.current?.focus();
  }
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!question.trim() || busy || sending.current || sendUncertain || thread?.messages.some(message => message.role === "assistant" && message.envelope === null)) return;
    updateController.current?.abort(); sending.current = true;
    const submittedDraft = question;
    uncertainConversation.current = thread?.conversation.conversation_id;
    const current = ++sequence.current; setBusy(true); setError(""); setSource(null); setTrace(null); setStatus("Sending your question…");
    try {
      const data = await call<{ conversation_id: string }>({ action: "send", text: question.trim(), ...(thread ? { conversationId: thread.conversation.conversation_id } : {}) });
      if (sequence.current !== current) return;
      sending.current = false;
      uncertainConversation.current = data.conversation_id;
      setQuestion(draft => draftAfterSubmission(draft, submittedDraft)); window.history.replaceState(null, "", `/workspace/conversations?conversation=${encodeURIComponent(data.conversation_id)}`);
      const refreshed = await load(data.conversation_id);
      if (refreshed === false) { setSendUncertain(true); setSavedWorkChecked(false); }
    } catch (cause) {
      if (sequence.current === current) { setSendUncertain(true); setSavedWorkChecked(false); setError(cause instanceof Error ? cause.message : "Request not completed."); setStatus(""); }
    } finally { if (sequence.current === current) { sending.current = false; setBusy(false); } }
  }
  async function follow(messageId: string, runId: string) {
    if (!thread || busy) return;
    const conversationId = thread.conversation.conversation_id;
    const current = ++sequence.current;
    updateController.current?.abort();
    const updates = new AbortController(); updateController.current = updates;
    const signal = AbortSignal.any([updates.signal, AbortSignal.timeout(RUN_UPDATE_WINDOW_MS)]);
    const hidden = () => { if (document.hidden) updates.abort(); };
    document.addEventListener("visibilitychange", hidden);
    setBusy(true); setError(""); setStatus("Checking the recorded run status…");
    try {
      const outcome = await followRunUpdates({
        signal, visible: () => !document.hidden,
        read: activeSignal => call<RunStatus>({ action: "run", conversationId, messageId, runId }, activeSignal),
        onRecord: run => { if (sequence.current === current) setRuns(previous => ({ ...previous, [messageId]: run })); },
      });
      if (sequence.current !== current) return;
      if (outcome === "finished") {
        // Only the stored message's validated envelope can become the answer.
        const data = await call<Thread>({ action: "get", conversationId }, signal);
        if (sequence.current !== current) return;
        setThread(data); setStatus("Updates stopped at the recorded completion or review state. The saved reply was refreshed.");
      } else setStatus(outcome === "hidden" ? "Updates stopped because this tab is hidden." : "Three status checks completed. Updates stopped; refresh again when needed.");
    } catch {
      if (sequence.current === current) setStatus("Status updates stopped. The last record is retained; it may no longer be current. Refresh saved work to check again. No question was resent.");
    } finally {
      document.removeEventListener("visibilitychange", hidden);
      if (sequence.current === current) setBusy(false);
    }
  }
  async function inspect(citationId: string, messageId: string, invoker: HTMLButtonElement) {
    if (!thread) return;
    const current = ++sequence.current; sourceInvoker.current = invoker; setBusy(true); setSource(null); setTrace(null); setSourceError("");
    try { const data = await call<Citation>({ action: "citation", conversationId: thread.conversation.conversation_id, messageId, citationId }); if (sequence.current === current) setSource(data); }
    catch (cause) { if (sequence.current === current) setSourceError(cause instanceof Error ? cause.message : "This passage could not be re-checked. No verified passage is displayed for this inspection."); }
    finally { if (sequence.current === current) setBusy(false); }
  }
  async function inspectTrace(runId: string, invoker: HTMLButtonElement) {
    const current = ++sequence.current; sourceInvoker.current = invoker; setBusy(true); setTrace(null); setSource(null); setSourceError("");
    try { const data = await call<Trace>({ action: "trace", runId }); if (sequence.current === current) setTrace(data); }
    catch { if (sequence.current === current) setSourceError("The run record could not be loaded. Try again when the service is available."); }
    finally { if (sequence.current === current) setBusy(false); }
  }
  async function copy(envelope: Envelope) {
    const text = [labels[envelope.status], `Legal position: ${envelope.as_of}`, ...envelope.text_blocks.map(block => block.text), ...envelope.bodies.map(body => `${body.name}: ${body.status} — ${body.note}`), ...envelope.citations.map(c => `${c.instrument}, ${c.provision}\n${c.quote}\nSource: ${c.source}\nRetrieved: ${c.fetched_at}`)].join("\n\n");
    try { await navigator.clipboard.writeText(text); setStatus("Answer and citations copied."); } catch { setStatus("Copy was unavailable. Select the answer text to copy it manually."); }
  }
  const pending = thread?.messages.some(message => message.role === "assistant" && message.envelope === null);
  return <div className={`ws-primary ws-conversation${enabled && !thread ? " ws-conversation-start" : ""}`}>
    <div className="ws-conversation-head"><div><h1 className="ws-heading">{thread?.conversation.title || "What are you working on?"}</h1><p className="ws-intro">Ask a legal question. Inspect the answer and its supporting passages together.</p></div><button className="ws-secondary" disabled={busy} onClick={newQuestion}><SquarePen size={16} aria-hidden="true" />New question</button></div>
    {!enabled ? <section className="ws-empty"><h2>Saved conversations are not connected</h2><p>This workflow requires the authenticated local gateway and its conversation store. Captured examples remain available for inspecting the answer design.</p><a className="ws-secondary" href="/workspace/ask">Open captured examples</a></section> : <>
    <details className="ws-details ws-recent"><summary><History size={16} aria-hidden="true" />Previous conversations</summary><button className="ws-link" disabled={busy} onClick={() => void load()}>Refresh list</button>{!conversations.length && !busy && <p className="ws-muted">No saved conversations were returned.</p>}{conversations.map(item => <button className="ws-history-entry" key={item.conversation_id} disabled={busy} onClick={() => reopen(item.conversation_id)} aria-current={thread?.conversation.conversation_id === item.conversation_id ? "true" : undefined}><span>{item.title || "Untitled conversation"}</span>{item.updated_at && <time className="ws-mono">{item.updated_at.slice(0, 10)}</time>}</button>)}</details>
    {thread && <div className="ws-conversation-grid"><div>{thread.messages.map(message => message.role === "user" ? <div key={message.message_id} className="ws-question-bubble"><span className="ws-kicker">You</span><p><LegalText>{message.text}</LegalText></p></div> : <article className="ws-conversation-answer" key={message.message_id}>
      {message.envelope ? <><p className="ws-kicker">Placedon · <time className="ws-mono">{message.envelope.as_of}</time></p><h2>{labels[message.envelope.status]}</h2>{message.envelope.status === "FAILED" ? <div className="ws-error"><p>The processing attempt failed. This is not a finding about the law.</p>{message.envelope.text_blocks.map((block, index) => <p key={index}>{block.text}</p>)}</div> : <>{message.envelope.text_blocks.map((block, index) => <section className="ws-served-block" key={index}><p><LegalText>{block.text}</LegalText></p><div>{block.citation_ids.map(ref => { const citation = message.envelope!.citations.find(item => item.id === ref)!; return <button className="ws-link" disabled={busy} key={ref} onClick={event => void inspect(ref, message.message_id, event.currentTarget)}><BookOpen size={15} aria-hidden="true" /><LegalText>{citation.provision}</LegalText></button>; })}</div></section>)}{message.envelope.bodies.map(body => <section key={body.body_id} className="ws-section"><h3>{body.name}</h3><p className="ws-status">{body.status.replaceAll("_", " ")}</p><p><LegalText>{body.note}</LegalText></p></section>)}</>}
      <div className="ws-answer-actions"><button className="ws-link" onClick={() => void copy(message.envelope!)}><Copy size={15} aria-hidden="true" />Copy with citations</button>{message.envelope.run_id && <button className="ws-link" disabled={busy} onClick={event => void inspectTrace(message.envelope!.run_id!, event.currentTarget)}>Run details</button>}</div>
      </> : <PendingReply run={runs[message.message_id]} hasRun={!!message.run_id} busy={busy} onCheck={() => void follow(message.message_id, message.run_id!)} />}
    </article>)}</div>{(source || sourceError || trace) && <section className="ws-evidence-panel" aria-labelledby="conversation-evidence-heading"><div className="ws-panel-head"><h2 id="conversation-evidence-heading" tabIndex={-1}>{trace ? "Run details" : "Source passage"}</h2><button className="ws-secondary" aria-label="Close evidence and return to answer" onClick={() => { setSource(null); setTrace(null); setSourceError(""); sourceInvoker.current?.focus(); }}><X size={16} aria-hidden="true" /></button></div>{sourceError && <p role="alert">{sourceError}</p>}{source && <><h3><LegalText>{source.citation.provision}</LegalText></h3><p>{source.citation.instrument}</p><p className="ws-status">{source.reverified ? "Re-checked against the held source" : "Source check failed — do not rely on this passage"}</p><p>{source.reverified_note}</p>{source.reverified && <blockquote className="ws-verbatim">{source.citation.quote}</blockquote>}<details className="ws-details"><summary>Source record</summary><p>{source.citation.source}</p><p>Retrieved: <time className="ws-mono">{source.citation.fetched_at}</time></p>{source.citation.in_force_from && <p>In force from: <time className="ws-mono">{source.citation.in_force_from}</time></p>}<p className="ws-mono">{source.citation.sha256}</p></details></>}{trace && <RunDetails trace={trace} /> }</section>}</div>}
    {pending && <><button className="ws-secondary" disabled={busy} onClick={() => void load(thread!.conversation.conversation_id)}>Refresh pending reply</button><p className="ws-muted">A reply is unresolved. Your follow-up draft stays here; send it after the stored reply arrives, or start a separate question.</p></>}
    {sendUncertain && <section className="ws-error" aria-labelledby="conversation-send-review"><h2 id="conversation-send-review">Check saved work before sending again</h2><p>The question may already have been stored. Sending is paused to avoid a duplicate. Refresh and inspect saved work first; a missing reply does not prove the question was not accepted.</p><button className="ws-secondary" disabled={busy} onClick={() => void load(uncertainConversation.current ?? thread?.conversation.conversation_id)}>Refresh saved work</button><button className="ws-link" disabled={busy || !savedWorkChecked} onClick={() => { if (window.confirm("Have you inspected saved work? Another submission may duplicate a question already accepted by the server.")) { setSendUncertain(false); setSavedWorkChecked(false); } }}>I inspected saved work — allow another question</button></section>}
    <form ref={form} className="ws-form ws-composer" onSubmit={send}>
      <label className="ws-sr-only" htmlFor="conversation-question">{thread ? "Follow-up question" : "Your question"}</label>
      <textarea ref={input} className="ws-textarea" id="conversation-question" value={question} onChange={event => setQuestion(event.target.value)} required maxLength={2000} rows={3} placeholder={thread ? "Ask another question…" : "Ask Placedon…"} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { const action = chatEnterAction({ key: event.key, keyCode: event.nativeEvent.keyCode, shiftKey: event.shiftKey, altKey: event.altKey, repeat: event.repeat, isComposing: event.nativeEvent.isComposing || composing.current }); if (action !== "edit") { event.preventDefault(); if (action === "send" && question.trim() && !busy && !pending && !sendUncertain) form.current?.requestSubmit(); } }} />
      <div className="ws-conversation-tools">
        <button className="ws-link" type="button" disabled aria-describedby="conversation-attachment-note"><Paperclip size={16} aria-hidden="true" />Attach</button>
        <button className="ws-link" type="button" aria-expanded={contextOpen} aria-controls="conversation-context" onClick={() => setContextOpen(!contextOpen)}><Building2 size={16} aria-hidden="true" />Company context</button>
        <button className="ws-link" type="button" disabled={!thread || busy} onClick={() => { const message = [...(thread?.messages || [])].reverse().find(message => message.envelope?.citations.length); const citation = message?.envelope?.citations[0]; if (citation && message) { const invoker = document.getElementById("conversation-sources") as HTMLButtonElement; void inspect(citation.id, message.message_id, invoker); } else setStatus("No source passage was returned for this conversation."); }} id="conversation-sources"><BookOpen size={16} aria-hidden="true" />Sources</button>
        <button className="ws-button ws-send" aria-label="Send question" disabled={busy || !question.trim() || !!pending || sendUncertain}><ArrowUp size={18} aria-hidden="true" /></button>
      </div>
      <p className="ws-mode-note" id="conversation-attachment-note">Attachments unavailable · Include relevant facts in each question.</p>
      <div id="conversation-context" hidden={!contextOpen} className="ws-section"><p>The research route records company facts but does not use them to decide compliance. Use the independent Ask check to apply supported company facts to named provisions.</p><a className="ws-link" href="/workspace/ask">Open company-fact check</a></div>
    </form>
    <p className="ws-chat-hint">Enter to send · Shift + Enter for a new line</p>
    {!thread && <div className="ws-prompt-suggestions" aria-label="Suggested questions">{CHAT_STARTERS.map(starter => <button type="button" className="ws-secondary" disabled={busy} key={starter.label} onClick={() => { setQuestion(starter.question); input.current?.focus(); }}>{starter.label}</button>)}</div>}
    <details className="ws-details ws-chat-info"><summary>About this conversation</summary><p className="ws-muted">Questions and replies are stored by the configured gateway. Follow-ups share a thread; write the relevant facts explicitly, as the research route does not infer them from earlier messages.</p></details>
    {busy && <button className="ws-secondary" onClick={() => { if (sending.current) { setSendUncertain(true); setSavedWorkChecked(false); sending.current = false; } sequence.current++; controller.current?.abort(); updateController.current?.abort(); setBusy(false); setStatus("Stopped waiting. Work may continue on the server. No server cancellation was requested. Refresh saved work before sending again."); }}>Stop waiting</button>}
    {error && <div className="ws-error" role="alert"><h2>Request not completed</h2><p>{error}</p><button className="ws-link" disabled={busy} onClick={() => void load(uncertainConversation.current ?? thread?.conversation.conversation_id)}>Refresh saved work</button></div>}
    <p role="status" aria-live="polite" className="ws-muted">{busy ? "Waiting for the conversation service…" : status}</p>
    </>}
  </div>;
}

export function PendingReply({ run, hasRun, busy, onCheck }: { run?: RunStatus; hasRun: boolean; busy: boolean; onCheck: () => void }) {
  const description = runDescription(run);
  return <div className="ws-empty"><h2>{hasRun ? description.title : "Reply not yet available"}</h2><p>{hasRun ? description.note : "No reply or run reference was returned. This is not an answer about the law; refresh saved work before sending again."}</p>{hasRun && <><button className="ws-secondary" disabled={busy} onClick={onCheck}>Check reply updates</button><p className="ws-muted">Up to three read-only status checks over one minute. No question is resent. This does not cancel or restart the run.</p>{run && <p className="ws-muted">Last checked run status; refresh to confirm it is still current.</p>}</>}</div>;
}
