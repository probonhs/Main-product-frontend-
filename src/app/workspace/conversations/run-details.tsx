import type { Trace } from "@/lib/engine/conversations";

export function RunDetails({ trace }: { trace: Trace }) {
  const criticState = trace.critic_enabled === true ? "On" : trace.critic_enabled === false ? "Off" : "Not recorded";
  return <>
    <section className="ws-section" aria-label="Automated answer check">
      <h3>Automated answer check</h3>
      <p>{criticState}</p>
      <p>{trace.critic_note || "This run does not report whether the narrowing critic was active. Not recorded is not the same as off."}</p>
    </section>
    {trace.steps.map((step, index) => <section className="ws-section" key={index}>
      <h3>{step.capability}</h3><p>{step.status}</p>
      <dl className="ws-fact-list">
        <div><dt>Model</dt><dd>{step.model || "Not reported"}</dd></div>
        <div><dt>Provider</dt><dd>{step.provider || "Not reported"}</dd></div>
        <div><dt>Region</dt><dd>{step.region || "Not reported"}</dd></div>
        <div><dt>Cost (INR)</dt><dd>{step.cost_inr === null ? step.cost_note || "Not priced" : step.cost_inr}</dd></div>
      </dl>
    </section>)}
  </>;
}
