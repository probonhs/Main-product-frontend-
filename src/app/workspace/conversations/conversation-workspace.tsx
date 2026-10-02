"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, BookOpen, Building2, Copy, History, Paperclip, SquarePen, X } from "lucide-react";
import { LegalText } from "@/components/brand";
import type { Citation, Conversation, Envelope, Thread, Trace } from "@/lib/engine/conversations";
import { RunDetails } from "./run-details";

const labels: Record<Envelope["status"], string> = { ANSWERED: "Answered", PARTIAL: "Abstained in part", ABSTAINED: "Abstained", NEEDS_LAWYER: "Professional review needed", NEEDS_CLARIFICATION: "More detail needed", FAILED: "Request not completed" };
type Action = { action: "list" } | { action: "get"; conversationId: string } | { action: "send"; conversationId?: string; text: string } | { action: "citation"; conversationId: string; messageId: string; citationId: string } | { action: "trace"; runId: string };

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
  const controller = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const input = useRef<HTMLTextAreaElement>(null);
  const sourceInvoker = useRef<HTMLButtonElement | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const call = useCallback(async <T,>(action: Action): Promise<T> => {
    const request = new AbortController(); controller.current?.abort(); controller.current = request;
    const response = await fetch("/api/workspace/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action), signal: request.signal });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error?.message || "The service could not complete this request.");
    return payload.data as T;
  }, []);
  const load = useCallback(async (id?: string) => {
    const current = ++sequence.current; setBusy(true); setError(""); setSource(null); setTrace(null); setSourceError("");
    try {
      if (id) {
        const data = await call<Thread>({ action: "get", conversationId: id });
        if (sequence.current !== current) return;
        setThread(data);
      }
      const data = await call<{ conversations: Conversation[] }>({ action: "list" });
      if (sequence.current === current) { setConversations(data.conversations); setStatus(id ? "Conversation loaded." : "Conversation list loaded."); }
    } catch (cause) { if (sequence.current === current) setError(cause instanceof Error ? cause.message : "Conversation unavailable."); }
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
        }
        const data = await call<{ conversations: Conversation[] }>({ action: "list" });
        if (active) { setConversations(data.conversations); setStatus("Saved work loaded."); }
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Conversation unavailable."); }
      finally { if (active) setBusy(false); }
    }
    if (enabled) void initialise();
    return () => { active = false; sequence.current++; controller.current?.abort(); };
  }, [enabled, initialId, call]);
  useEffect(() => { if (source || sourceError || trace) document.getElementById("conversation-evidence-heading")?.focus(); }, [source, sourceError, trace]);
  function reopen(id: string) {
    if (question.trim() && !window.confirm("Discard the unsent question and open this conversation?")) return;
    setQuestion(""); setThread(null);
    window.history.replaceState(null, "", `/workspace/conversations?conversation=${encodeURIComponent(id)}`);
    void load(id);
  }
  function newQuestion() {
    if (question.trim() && !window.confirm("Discard the unsent question and start a new conversation?")) return;
    sequence.current++; controller.current?.abort(); setBusy(false); setThread(null); setQuestion(""); setSource(null); setTrace(null); setSourceError(""); setError(""); setStatus("");
    window.history.replaceState(null, "", "/workspace/conversations"); input.current?.focus();
  }
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!question.trim() || busy) return;
    const current = ++sequence.current; setBusy(true); setError(""); setSource(null); setTrace(null); setStatus("Sending your question…");
    try {
      const data = await call<{ conversation_id: string }>({ action: "send", text: question.trim(), ...(thread ? { conversationId: thread.conversation.conversation_id } : {}) });
      if (sequence.current !== current) return;
      setQuestion(""); window.history.replaceState(null, "", `/workspace/conversations?conversation=${encodeURIComponent(data.conversation_id)}`);
      await load(data.conversation_id);
    } catch (cause) {
      if (sequence.current === current) { setError(cause instanceof Error ? cause.message : "Request not completed."); setStatus(""); }
    } finally { if (sequence.current === current) setBusy(false); }
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
  return <div className="ws-primary ws-conversation">
    <div className="ws-conversation-head"><div><h1 className="ws-heading">{thread?.conversation.title || "What are you working on?"}</h1><p className="ws-intro">Ask a legal question. Inspect the answer and its supporting passages together.</p></div><button className="ws-secondary" disabled={busy} onClick={newQuestion}><SquarePen size={16} aria-hidden="true" />New question</button></div>
    {!enabled ? <section className="ws-empty"><h2>Saved conversations are not connected</h2><p>This workflow requires the authenticated local gateway and its conversation store. Captured examples remain available for inspecting the answer design.</p><a className="ws-secondary" href="/workspace/ask">Open captured examples</a></section> : <>
    <details className="ws-details ws-recent"><summary><History size={16} aria-hidden="true" />Previous conversations</summary><button className="ws-link" disabled={busy} onClick={() => void load()}>Refresh list</button>{!conversations.length && !busy && <p className="ws-muted">No saved conversations were returned.</p>}{conversations.map(item => <button className="ws-history-entry" key={item.conversation_id} disabled={busy} onClick={() => reopen(item.conversation_id)} aria-current={thread?.conversation.conversation_id === item.conversation_id ? "true" : undefined}><span>{item.title || "Untitled conversation"}</span>{item.updated_at && <time className="ws-mono">{item.updated_at.slice(0, 10)}</time>}</button>)}</details>
    {thread && <div className="ws-conversation-grid"><div>{thread.messages.map(message => message.role === "user" ? <div key={message.message_id} className="ws-question-bubble"><span className="ws-kicker">You</span><p><LegalText>{message.text}</LegalText></p></div> : <article className="ws-conversation-answer" key={message.message_id}>
      {message.envelope ? <><p className="ws-kicker">Placedon · <time className="ws-mono">{message.envelope.as_of}</time></p><h2>{labels[message.envelope.status]}</h2>{message.envelope.status === "FAILED" ? <div className="ws-error"><p>The processing attempt failed. This is not a finding about the law.</p>{message.envelope.text_blocks.map((block, index) => <p key={index}>{block.text}</p>)}</div> : <>{message.envelope.text_blocks.map((block, index) => <section className="ws-served-block" key={index}><p><LegalText>{block.text}</LegalText></p><div>{block.citation_ids.map(ref => { const citation = message.envelope!.citations.find(item => item.id === ref)!; return <button className="ws-link" disabled={busy} key={ref} onClick={event => void inspect(ref, message.message_id, event.currentTarget)}><BookOpen size={15} aria-hidden="true" /><LegalText>{citation.provision}</LegalText></button>; })}</div></section>)}{message.envelope.bodies.map(body => <section key={body.body_id} className="ws-section"><h3>{body.name}</h3><p className="ws-status">{body.status.replaceAll("_", " ")}</p><p><LegalText>{body.note}</LegalText></p></section>)}</>}
      <div className="ws-answer-actions"><button className="ws-link" onClick={() => void copy(message.envelope!)}><Copy size={15} aria-hidden="true" />Copy with citations</button>{message.envelope.run_id && <button className="ws-link" disabled={busy} onClick={event => void inspectTrace(message.envelope!.run_id!, event.currentTarget)}>Run details</button>}</div>
      </> : <div className="ws-empty"><h2>{message.run_id ? "Reply is being prepared" : "Reply not yet available"}</h2><p>{message.run_id ? "The gateway returned a run reference but has not stored the reply yet. Refresh to check its result." : "No reply or run reference was returned. This is not an answer about the law; refresh saved work before sending again."}</p></div>}
    </article>)}</div>{(source || sourceError || trace) && <section className="ws-evidence-panel" aria-labelledby="conversation-evidence-heading"><div className="ws-panel-head"><h2 id="conversation-evidence-heading" tabIndex={-1}>{trace ? "Run details" : "Source passage"}</h2><button className="ws-secondary" aria-label="Close evidence and return to answer" onClick={() => { setSource(null); setTrace(null); setSourceError(""); sourceInvoker.current?.focus(); }}><X size={16} aria-hidden="true" /></button></div>{sourceError && <p role="alert">{sourceError}</p>}{source && <><h3><LegalText>{source.citation.provision}</LegalText></h3><p>{source.citation.instrument}</p><p className="ws-status">{source.reverified ? "Re-checked against the held source" : "Source check failed — do not rely on this passage"}</p><p>{source.reverified_note}</p>{source.reverified && <blockquote className="ws-verbatim">{source.citation.quote}</blockquote>}<details className="ws-details"><summary>Source record</summary><p>{source.citation.source}</p><p>Retrieved: <time className="ws-mono">{source.citation.fetched_at}</time></p>{source.citation.in_force_from && <p>In force from: <time className="ws-mono">{source.citation.in_force_from}</time></p>}<p className="ws-mono">{source.citation.sha256}</p></details></>}{trace && <RunDetails trace={trace} /> }</section>}</div>}
    {pending && <button className="ws-secondary" disabled={busy} onClick={() => void load(thread!.conversation.conversation_id)}>Refresh pending reply</button>}
    <form ref={form} className="ws-form" onSubmit={send}><label htmlFor="conversation-question">{thread ? "Follow-up question" : "Your question"}</label><textarea ref={input} className="ws-textarea" id="conversation-question" value={question} onChange={event => setQuestion(event.target.value)} required maxLength={2000} rows={3} placeholder={thread ? "Write the full follow-up question…" : "What is the time limit for holding an annual general meeting?"} onKeyDown={event => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && question.trim() && !busy) { event.preventDefault(); form.current?.requestSubmit(); } }} /><div className="ws-conversation-tools"><button className="ws-link" type="button" disabled aria-describedby="conversation-attachment-note"><Paperclip size={16} aria-hidden="true" />Attach</button><button className="ws-link" type="button" aria-expanded={contextOpen} aria-controls="conversation-context" onClick={() => setContextOpen(!contextOpen)}><Building2 size={16} aria-hidden="true" />Company context</button><button className="ws-link" type="button" disabled={!thread || busy} onClick={() => { const message = [...(thread?.messages || [])].reverse().find(message => message.envelope?.citations.length); const citation = message?.envelope?.citations[0]; if (citation && message) { const invoker = document.getElementById("conversation-sources") as HTMLButtonElement; void inspect(citation.id, message.message_id, invoker); } else setStatus("No source passage was returned for this conversation."); }} id="conversation-sources"><BookOpen size={16} aria-hidden="true" />Sources</button><button className="ws-button" disabled={busy || !question.trim()}>Ask<ArrowUp size={18} aria-hidden="true" /></button></div><p className="ws-muted" id="conversation-attachment-note">Attachments are not connected to this research workflow yet.</p><div id="conversation-context" hidden={!contextOpen} className="ws-section"><p>The research route records company facts but does not use them to decide compliance. Use the independent Ask check to apply supported company facts to named provisions.</p><a className="ws-link" href="/workspace/ask">Open company-fact check</a></div></form>
    <p className="ws-muted">Questions and replies are stored by the configured gateway. Follow-ups share a thread; write the relevant facts explicitly, as the research route does not infer them from earlier messages.</p><p className="ws-muted">⌘ / Ctrl + Enter to send</p>
    {!thread && <div className="ws-samples"><button disabled={busy} onClick={() => { setQuestion("What is the time limit for holding an annual general meeting?"); input.current?.focus(); }}>When must a company hold its AGM?</button><button disabled={busy} onClick={() => { setQuestion("What notice is required for a board meeting?"); input.current?.focus(); }}>Board meeting notice</button></div>}
    {busy && <button className="ws-secondary" onClick={() => { sequence.current++; controller.current?.abort(); setBusy(false); setStatus("Stopped waiting. Work may continue on the server. Refresh the conversation list before sending again."); }}>Stop waiting</button>}
    {error && <div className="ws-error" role="alert"><h2>Request not completed</h2><p>{error}</p><button className="ws-link" disabled={busy} onClick={() => void load(thread?.conversation.conversation_id)}>Refresh saved work</button></div>}
    <p role="status" aria-live="polite" className="ws-muted">{busy ? "Waiting for the conversation service…" : status}</p>
    </>}
  </div>;
}
