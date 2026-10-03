"use client";

import { useCallback, useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import { LegalText } from "@/components/brand";
import { askLabel } from "@/lib/engine/ask-label";
import { askRecordReducer, initialAskRecordState, retainedAskNotice, type LoadedAskRecord } from "@/lib/engine/ask-record-state";
import { WORKSPACE_SAMPLES } from "@/lib/workspace-samples";
import { ArrowUp, BookOpen, SlidersHorizontal } from "lucide-react";

type RecordValue = Record<string, unknown>;
const object = (value: unknown): RecordValue => value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
const text = (value: unknown): string => typeof value === "string" ? value : "";
const records = (value: unknown): RecordValue[] => Array.isArray(value) ? value.map(object) : [];
const texts = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : typeof value === "string" ? [value] : [];
const ROW_LABELS: Record<string, string> = { APPLIES_SATISFIED: "Satisfied", APPLIES_NOT_SATISFIED: "Not satisfied", APPLIES_UNDETERMINED: "Applies; information needed", DOES_NOT_APPLY: "Does not apply", CANNOT_DETERMINE: "Cannot determine" };
const FACT_LABELS: Record<string, string> = { company_class: "Company type", paid_up_capital_rupees: "Paid-up capital (rupees)", turnover_rupees: "Turnover (rupees)", director_count: "Number of directors", resident_director_days: "Resident director days", financial_year: "Financial year", is_holding_company: "Holding company", is_subsidiary_company: "Subsidiary company", is_section_8: "Section 8 company", governed_by_special_act: "Governed by a special Act", incorporation_date: "Incorporation date" };
function sourceUrl(value: unknown): string | undefined {
  try { const url = new URL(text(value)); return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined; } catch { return undefined; }
}
type LoadedRecord = LoadedAskRecord;
const EVIDENCE_DATES = { financial_year_end: "Financial year end", first_financial_year_end: "First financial year end", aoc4_filed_on: "AOC-4 filing date", annual_return_filed_on: "Annual return filing date" };
function factValue(value: unknown): string {
  if (value === null || value === undefined) return "Not supplied";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.map(factValue).join(", ") : "No dates supplied";
  if (typeof value === "object") return Object.entries(value).map(([key, nested]) => `${FACT_LABELS[key] || key.replaceAll("_", " ")}: ${factValue(nested)}`).join("; ");
  return String(value);
}

function UnresolvedDetail({ value }: { value: string }) {
  const suspended = /^ACT:COMPANIES_ACT_2013:S(\d+(?:\([a-z0-9]+\))*) exists in state SUSPENDED but is not admitted for model use$/.exec(value);
  if (!suspended) return <p><LegalText>{value}</LegalText></p>;
  return <><p><LegalText>{`Section ${suspended[1]}`}</LegalText>: Placedon’s source record is suspended from use in answers. This is a source-record restriction, not a statement that the provision is suspended in law.</p><details className="ws-details"><summary>Source-record detail</summary><p className="ws-mono">{value}</p></details></>;
}

export function ResultRecord({ record, revise, previous }: { record: LoadedRecord; revise: () => void; previous: boolean }) {
  const response = object(record.data);
  const confirmed = records(response.confirmed);
  const rows = [...records(response.rows), ...confirmed.filter((item) => item.obligation_id)];
  const figures = records(response.figures);
  const sourceMap = new Map<string, RecordValue>();
  for (const item of [...records(response.citations), ...confirmed.filter((item) => item.ref)]) sourceMap.set(text(item.ref), { ...sourceMap.get(text(item.ref)), ...item });
  const sources = Array.from(sourceMap.values());
  const missing = records(response.not_confirmed);
  const law = object(response.law_version);
  const scope = object(response.scope);
  const sourceInvoker = useRef<HTMLElement | null>(null);
  const sourceDrawer = useRef<HTMLDetailsElement>(null);
  function focusSources() {
    sourceInvoker.current = document.getElementById("ws-result-heading");
    if (sourceDrawer.current) sourceDrawer.current.open = true;
    document.getElementById("ws-source-heading")?.focus();
  }
  function focusSource(ref: string, invoker: HTMLElement) {
    sourceInvoker.current = invoker;
    if (sourceDrawer.current) sourceDrawer.current.open = true;
    const source = document.getElementById(`source-${ref}`);
    const disclosure = source?.querySelector("details");
    if (disclosure) disclosure.open = true;
    source?.focus();
  }
  return <div className="ws-chat-answer">
    <div className="ws-question-bubble"><span className="ws-kicker">{record.mode === "sample" ? "Example question" : "Your question"}</span><p><LegalText>{text(response.question)}</LegalText></p></div>
    <div className="ws-grid">
    <article className="ws-result" aria-labelledby="ws-result-heading">
      <p className="ws-kicker">{record.mode === "sample" ? "Captured example" : "Local engine result"} · <span className="ws-mono">{text(response.as_of)}</span></p>
      <h2 className="ws-result-heading" id="ws-result-heading" tabIndex={-1}>{askLabel(record.data)}</h2>
      <p className="ws-muted">{text(scope.sentence)}. {response.state === "answered" ? "Read the finding below; an answered question is not a certificate of compliance." : "Read what is established and what remains open before acting."}</p>
      <button className="ws-secondary" onClick={focusSources}><BookOpen size={16} aria-hidden="true" />Inspect sources ({sources.length + figures.length})</button>
      {text(response.reason) && <section className="ws-section"><h3>Law/source not held</h3><p><LegalText>{text(response.reason)}</LegalText></p><a href="/workspace/limitations">Review held scope</a></section>}
      {rows.length > 0 && <section className="ws-section"><h3>Findings from the supplied facts</h3>{rows.map((row, index) => <div className="ws-row" key={text(row.obligation_id) || index}><h4><LegalText>{text(row.duty)}</LegalText></h4><p><LegalText>{text(row.provision)}</LegalText></p><p className="ws-status">{ROW_LABELS[text(row.state)] || "Unrecognised result — do not rely on this record"}</p><p><LegalText>{text(row.basis)}</LegalText></p>{texts(row.missing_facts).length > 0 && <p>We need this from you: {texts(row.missing_facts).map((name) => FACT_LABELS[name] || name.replaceAll("_", " ")).join(", ")}.</p>}{text(row.blocked_by) && <p>Depends on: {text(row.blocked_by)}</p>}</div>)}</section>}
      {figures.length > 0 && <section className="ws-section"><h3>Prescribed figures</h3>{figures.map((figure) => <div className="ws-figure" key={text(figure.key)}><span className="ws-label">{text(figure.key).includes("paid_up") ? "Paid-up capital limit" : text(figure.key).includes("turnover") ? "Turnover limit" : text(figure.key)}</span><strong className="ws-heading ws-mono">{text(figure.amount)}</strong><p>In force from <time className="ws-mono">{text(figure.effective_from)}</time>{text(figure.effective_to) ? ` · Until ${text(figure.effective_to)}` : ""}</p><p className="ws-mono">{text(figure.instrument)}</p></div>)}</section>}
      {confirmed.some((item) => item.ref) && <section className="ws-section"><h3>Source text held</h3>{confirmed.filter((item) => item.ref).map((item) => <p key={text(item.ref)}><LegalText>{text(item.cite)}</LegalText> — {text(item.title)}. <button className="ws-link" onClick={(event) => focusSource(text(item.ref), event.currentTarget)}>Read the held text</button></p>)}<p className="ws-muted">Retrieving a provision does not establish how it applies to your company.</p></section>}
      {missing.length > 0 && <section className="ws-section"><h3>What remains unresolved</h3>{missing.map((item, index) => <div className="ws-row" key={index}>{text(item.provision) && <p><LegalText>{text(item.provision)}</LegalText></p>}<UnresolvedDetail value={text(item.detail) || text(item.reason) || text(item.duty) || "The engine did not establish this item."} />{texts(item.missing_facts).length > 0 && <p><strong>We need this from you:</strong> <LegalText>{texts(item.missing_facts).map((name) => FACT_LABELS[name] || name.replaceAll("_", " ")).join("; ")}</LegalText></p>}{text(item.blocked_by) && <p><strong>Placedon is still verifying:</strong> <LegalText>{text(item.blocked_by)}</LegalText></p>}{!texts(item.missing_facts).length && !text(item.blocked_by) && <p className="ws-muted">Placedon must establish this source or scope before relying on it. Company facts cannot resolve a missing legal source.</p>}</div>)}<button className="ws-secondary" onClick={revise}>{record.mode === "local" ? "Review facts and check again" : "Return to the examples"}</button></section>}
      {records(response.superseded).length > 0 && <section className="ws-section"><h3>Changed since the document date</h3>{records(response.superseded).map((item, index) => <div className="ws-row" key={index}><h4><LegalText>{text(item.provision)}</LegalText></h4><p>{text(item.detail)}</p><p>Then: {text(item.governed_then)}</p><p>Now: {text(item.governs_now)}</p></div>)}</section>}
      {Object.keys(object(response.facts)).length > 0 && <details className="ws-details"><summary>Facts used for this result</summary><p>Supplied by the user; not independently verified.</p><dl className="ws-fact-list">{Object.entries(object(response.facts)).map(([key, raw]) => <div key={key}><dt><LegalText>{FACT_LABELS[key] || key.replaceAll("_", " ")}</LegalText></dt><dd>{factValue(object(raw).value)}</dd></div>)}</dl></details>}
      {text(law.statement) && <section className="ws-section"><h3>Text basis</h3><p><LegalText>{text(law.statement)}</LegalText></p></section>}
      {texts(response.what_it_is_not).length > 0 && <section className="ws-section"><h3>Boundary of this result</h3>{texts(response.what_it_is_not).map((item, index) => <p key={index}><LegalText>{item}</LegalText></p>)}</section>}
      <details className="ws-details"><summary>How this record was obtained</summary><dl className="ws-fact-list"><div><dt>Generated</dt><dd className="ws-mono">{text(response.generated_at)}</dd></div><div><dt>Record reference</dt><dd className="ws-mono">{text(response.turn_id)}</dd></div><div><dt>Retrieval</dt><dd>{text(object(response.evidence_pack).retrieval_query) || "Named figures or held-scope check"}</dd></div>{record.sample && <><div><dt>Captured</dt><dd className="ws-mono">{record.sample.capturedAt}</dd></div><div><dt>Engine version</dt><dd className="ws-mono">{record.sample.backendCommit}</dd></div></>}</dl></details>
    </article>
    <details className="ws-source-drawer" ref={sourceDrawer}><summary>Sources ({sources.length + figures.length})</summary><aside className="ws-aside" aria-labelledby="ws-source-heading"><h2 id="ws-source-heading" tabIndex={-1}>Sources</h2><p className="ws-muted">{previous ? "Sources for the retained record only. Your draft has not been checked against these sources." : "The evidence returned for this check."}</p>
      {sources.length === 0 && figures.length === 0 && <div className="ws-empty">No usable source was returned. This is an evidence gap, not a finding that no duty applies.</div>}
      {sources.map((source) => <section className="ws-source" id={`source-${text(source.ref)}`} tabIndex={-1} key={text(source.ref)}><h3><LegalText>{text(source.cite)}</LegalText></h3><p>{text(source.title)}</p><p className="ws-status">Evidence: {text(source.evidence_state).replaceAll("_", " ").toLowerCase()}</p>{law.point_in_time_verified === false && <p className="ws-muted">Held text only. This response does not verify commencement or amendment dates, or the law on a past date.</p>}{text(source.unusable_reason) && <p>{text(source.unusable_reason)}</p>}{Array.isArray(source.defects) && source.defects.map((defect, index) => <p key={index}>{factValue(defect)}</p>)}{text(source.verbatim) ? <details className="ws-details"><summary>Read verbatim text</summary><blockquote className="ws-verbatim">{text(source.verbatim)}</blockquote></details> : <p className="ws-muted">This response cites the provision but does not return its full text.</p>}{sourceUrl(source.source_url) && <a className="ws-link" href={sourceUrl(source.source_url)} target="_blank" rel="noopener noreferrer">Open publisher source ↗</a>}<p className="ws-muted">Retrieved: {texts(source.retrieved_on).join(", ") || "Not returned"}</p></section>)}
      {figures.map((figure) => <section className="ws-source" key={text(figure.key)}><h3 className="ws-mono">{text(figure.amount)}</h3><p className="ws-mono">{text(figure.instrument)}</p><p>In force from {text(figure.effective_from)}</p><p>Evidence: {text(figure.evidence_state).toLowerCase()}</p>{sourceUrl(figure.source_url) && <a className="ws-link" href={sourceUrl(figure.source_url)} target="_blank" rel="noopener noreferrer">Read governing instrument ↗</a>}</section>)}
      <button className="ws-secondary" onClick={() => { if (sourceDrawer.current) sourceDrawer.current.open = false; (sourceInvoker.current || document.getElementById("ws-result-heading"))?.focus(); }}>Back to result</button>
    </aside></details>
  </div></div>;
}

export function AskWorkspace({ liveEnabled, initialRecord }: { liveEnabled: boolean; initialRecord?: LoadedRecord | null }) {
  const [state, dispatch] = useReducer(askRecordReducer, initialRecord ?? null, initialAskRecordState);
  const { record, error } = state;
  const busy = state.pendingId !== null;
  const notice = retainedAskNotice(state);
  const [question, setQuestion] = useState("");
  const [contextCount, setContextCount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const form = useRef<HTMLFormElement>(null);
  const controller = useRef<AbortController | null>(null);
  const requestId = useRef(0);
  const submit = useCallback(async (body: unknown) => {
    controller.current?.abort();
    const request = new AbortController(); controller.current = request;
    const id = ++requestId.current;
    dispatch({ type: "start", id });
    try {
      const response = await fetch("/api/workspace/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: request.signal });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error?.message || "The check could not be completed.");
      // The same-origin gateway validates the full engine contract before returning it.
      if (!["answered", "partial", "out_of_scope"].includes(payload.data?.state) || !["sample", "local"].includes(payload.mode)) throw new Error("The response could not be verified. No new legal result is displayed.");
      if (!request.signal.aborted) dispatch({ type: "received", id, record: { data: payload.data, mode: payload.mode, sample: payload.sample } });
    } catch (cause) { if (!request.signal.aborted) dispatch({ type: "failed", id, message: cause instanceof Error ? cause.message : "The service is unavailable. Your inputs are preserved." }); }
  }, []);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (record) document.getElementById("ws-result-heading")?.focus(); }, [record]);
  function fieldError(key: string) { return fieldErrors[key] ? <p id={`error-${key}`} className="ws-field-error">{fieldErrors[key]}</p> : null; }
  function fieldA11y(key: string) { return { "aria-invalid": !!fieldErrors[key], "aria-describedby": fieldErrors[key] ? `error-${key}` : undefined }; }
  function editDraft() {
    controller.current?.abort(); dispatch({ type: "edit" }); setFieldErrors({});
  }
  function clearContext() {
    if (!form.current) return;
    for (const control of Array.from(form.current.elements)) {
      if (control instanceof HTMLInputElement) {
        if (control.type === "checkbox") control.checked = false;
        else control.value = "";
      } else if (control instanceof HTMLSelectElement) control.value = "";
    }
    setContextCount(0); editDraft();
  }
  function runLive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const provisions = String(data.get("provisions") || "").split(",").map((part) => part.trim()).filter(Boolean);
    const facts: RecordValue = {};
    {
      for (const key of ["company_class", "incorporation_date", "financial_year"]) if (data.get(key)) facts[key] = String(data.get(key));
      for (const key of ["paid_up_capital_rupees", "turnover_rupees", "net_worth_rupees", "net_profit_rupees", "director_count"]) if (data.get(key)) facts[key] = Number(data.get(key));
      for (const key of ["is_holding_company", "is_subsidiary_company", "is_section_8", "governed_by_special_act", "is_listed"]) if (data.get(key) === "true" || data.get(key) === "false") facts[key] = data.get(key) === "true";
      const evidence: RecordValue = {};
      for (const key of ["resident_director_days", "calendar_year"]) if (data.get(key)) evidence[key] = Number(data.get(key));
      for (const key of Object.keys(EVIDENCE_DATES)) if (data.get(key)) evidence[key] = String(data.get(key));
      for (const key of ["agm_dates", "board_meetings"]) if (data.get(key)) evidence[key] = String(data.get(key)).split(",").map((part) => part.trim()).filter(Boolean);
      if (Object.keys(evidence).length) facts.evidence = evidence;
    }
    const figures = data.get("figures") === "on" ? ["small_company.paid_up_capital.prescribed", "small_company.turnover.prescribed"] : undefined;
    const body = { question, ...(provisions.length ? { provisions } : {}), ...(Object.keys(facts).length ? { facts } : {}), ...(figures ? { figures } : {}) };
    const errors: Record<string, string> = {};
    if (Object.keys(facts).length) {
      if (!facts.company_class) errors.company_class = "Select the company type to apply these facts.";
      if (!facts.incorporation_date) errors.incorporation_date = "Enter the incorporation date to apply these facts.";
      if (!provisions.length) errors.provisions = "Name a provision so the engine can apply these facts to it.";
    }
    if (!question.trim()) errors.question = "Enter a question.";
    if (["paid_up_capital_rupees", "turnover_rupees", "net_worth_rupees", "net_profit_rupees"].some((key) => facts[key] !== undefined) && !facts.financial_year) errors.financial_year = "Enter the financial year to which these money figures relate.";
    for (const key of ["agm_dates", "board_meetings"]) {
      const dates = object(facts.evidence)[key];
      if (Array.isArray(dates) && dates.some((date) => {
        const value = String(date);
        const timestamp = Date.parse(value);
        return !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value;
      })) errors[key] = "Use valid YYYY-MM-DD dates separated by commas.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      controller.current?.abort();
      dispatch({ type: "invalid", message: "Check the highlighted fields. No request was sent." });
      const details = document.getElementById("ws-company-facts") as HTMLDetailsElement | null;
      if (details) details.open = true;
      (event.currentTarget.elements.namedItem(Object.keys(errors)[0]) as HTMLElement | null)?.focus();
      return;
    }
    void submit(body);
  }
  function revise() {
    if (record?.mode === "sample" || !liveEnabled) { document.getElementById("ws-examples")?.focus(); return; }
    const details = document.getElementById("ws-company-facts") as HTMLDetailsElement | null;
    if (details) { details.open = true; details.querySelector("summary")?.focus(); }
  }
  return <div className={`ws-primary ws-chat${record ? " ws-chat-has-answer" : ""}`}>
    <div className="ws-welcome"><h1 className="ws-heading">{record ? "Ask Placedon" : "What are you working on?"}</h1><p className="ws-intro">Ask about the <em>Companies Act, 2013</em>. See the legal basis and what still needs checking.</p></div>
    {notice && <div className="ws-record-notice" role="status"><strong>{notice.title}</strong><p>{notice.detail}</p></div>}
    {record && <ResultRecord key={text(object(record.data).turn_id)} record={record} revise={revise} previous={!!notice} />}
    <p className="ws-mode-note">{liveEnabled ? "Local checks configured. Sending a new question submits your question and facts to the local engine, not a saved chat." : "Sample mode. These captured examples show how Placedon checks a question. They do not analyse your company."}{liveEnabled && record?.mode === "sample" && " The answer above is a captured example, not a new local check."}</p>
    {liveEnabled && <form ref={form} className="ws-form" onSubmit={runLive} onChange={(event) => {
      editDraft();
      setContextCount(Array.from(new FormData(event.currentTarget)).filter(([name, value]) => name !== "question" && String(value).trim()).length);
    }} onInvalidCapture={(event) => {
      const control = event.target as HTMLInputElement | HTMLTextAreaElement;
      const disclosure = control.closest("details");
      if (disclosure) disclosure.open = true;
      controller.current?.abort();
      dispatch({ type: "invalid", message: "Check the highlighted fields. No request was sent." });
      setFieldErrors((previous) => ({ ...previous, [control.name]: control.validationMessage }));
    }}>
      <div className="ws-field"><label htmlFor="ws-question">Your question</label><textarea className="ws-textarea" id="ws-question" name="question" value={question} onChange={(event) => setQuestion(event.target.value)} required maxLength={2000} rows={3} placeholder="Ask a corporate-law question…" {...fieldA11y("question")} />{fieldError("question")}</div>
      {notice && <p className="ws-mode-note">Draft only. The answer above does not include these changes.</p>}
      <div className="ws-composer-context"><details className="ws-details" id="ws-company-facts"><summary><SlidersHorizontal size={16} aria-hidden="true" />Add provisions & company facts{contextCount > 0 ? ` (${contextCount} included)` : ""}</summary><p className="ws-muted">Name a provision for a more precise check. Add company facts only when you want to check how it applies.</p><button className="ws-secondary" type="button" onClick={clearContext}>Clear details</button>
      <div className="ws-field"><label htmlFor="ws-provisions">Provisions to check <span className="ws-muted">(required with company facts)</span></label><input className="ws-input" id="ws-provisions" name="provisions" placeholder="Section 2(85), Section 173" {...fieldA11y("provisions")} /><p className="ws-muted">Separate provisions with commas. Without a named provision, a text match may leave the question unresolved.</p>{fieldError("provisions")}</div>
      <label className="ws-label"><input type="checkbox" name="figures" /> Include the prescribed small-company capital and turnover limits</label>
      <h2>Company facts for this check</h2><p className="ws-muted">All entered facts are submitted, even when this panel is closed. Leave unknown facts blank; blank never means zero or no. Company type and incorporation date are required with facts. A missing legal source cannot be resolved by supplying facts.</p><div className="ws-fields">
        <div className="ws-field"><label htmlFor="ws-class">Company type</label><select className="ws-select" id="ws-class" name="company_class" {...fieldA11y("company_class")}><option value="">Not supplied</option><option value="private">Private company</option><option value="public">Public company</option><option value="opc">One Person Company</option></select>{fieldError("company_class")}</div>
        <div className="ws-field"><label htmlFor="ws-incorporation">Incorporation date</label><input className="ws-input" type="date" id="ws-incorporation" name="incorporation_date" {...fieldA11y("incorporation_date")} />{fieldError("incorporation_date")}</div>
        <div className="ws-field"><label htmlFor="ws-financial-year">Financial year (required with money figures)</label><input className="ws-input" id="ws-financial-year" name="financial_year" placeholder="2025-26" {...fieldA11y("financial_year")} />{fieldError("financial_year")}</div>
        {["paid_up_capital_rupees", "turnover_rupees", "net_worth_rupees", "net_profit_rupees", "director_count", "resident_director_days", "calendar_year"].map((key) => <div className="ws-field" key={key}><label htmlFor={`ws-${key}`}>{FACT_LABELS[key] || key.replaceAll("_", " ")}</label><input className="ws-input" id={`ws-${key}`} name={key} type="number" min={key === "calendar_year" ? 2015 : 0} max={key === "resident_director_days" ? 366 : undefined} step={1} {...fieldA11y(key)} />{fieldError(key)}</div>)}
        {["is_holding_company", "is_subsidiary_company", "is_section_8", "governed_by_special_act", "is_listed"].map((key) => <div className="ws-field" key={key}><label htmlFor={`ws-${key}`}><LegalText>{FACT_LABELS[key] || "Listed company"}</LegalText></label><select className="ws-select" name={key} id={`ws-${key}`}><option value="">Unknown</option><option value="true">Yes</option><option value="false">No</option></select></div>)}
        {Object.entries(EVIDENCE_DATES).map(([key, label]) => <div className="ws-field" key={key}><label htmlFor={`ws-${key}`}>{label}</label><input className="ws-input" type="date" id={`ws-${key}`} name={key} {...fieldA11y(key)} />{fieldError(key)}</div>)}
        {[["agm_dates", "AGM dates"], ["board_meetings", "Board meeting dates"]].map(([key, label]) => <div className="ws-field" key={key}><label htmlFor={`ws-${key}`}>{label}</label><input className="ws-input" id={`ws-${key}`} name={key} placeholder="YYYY-MM-DD, YYYY-MM-DD" {...fieldA11y(key)} /><p className="ws-muted">Use ISO dates separated by commas. Leave blank if unknown.</p>{fieldError(key)}</div>)}
      </div></details></div>
      <div className="ws-actions"><span className="ws-muted">Today’s check · No conversation memory</span><button className="ws-button" disabled={busy}>{busy ? "Checking…" : "Ask Placedon"}<ArrowUp size={18} aria-hidden="true" /></button></div>
    </form>}
    <section className="ws-example-section" aria-labelledby="ws-examples"><div className="ws-example-heading"><h2 id="ws-examples" tabIndex={-1}>Try an example</h2><span className="ws-muted">Captured engine results</span></div><div className="ws-samples">{WORKSPACE_SAMPLES.map((sample) => <button key={sample.id} className="ws-secondary" disabled={busy} onClick={() => void submit({ sampleId: sample.id })}>{sample.title}</button>)}</div></section>
    <p className="ws-muted" role="status" aria-live="polite">{busy ? "Checking the record…" : notice ? "No new result for your draft. The earlier record remains available." : record ? `Record ready: ${askLabel(record.data)}.` : ""}</p>
    {error && <div role="alert" className="ws-error"><h2>Check not completed</h2><p>{error}</p><p>No new legal conclusion was returned. Your question and facts are preserved.{record && " The record above belongs to an earlier check or captured example."}</p></div>}
  </div>;
}
