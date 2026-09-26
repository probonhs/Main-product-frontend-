# Decision: bounded earlier-date checks and lawyer-facing legal language

Decided 27 September 2026. This decision amends the product direction in
`PLAN_13_ASSISTANT_UX.md` §9. It does not claim that the backend already exposes
the coverage metadata needed to implement the control.

## 1. Earlier-date checks

The default answer is the law as it stands today. The main Ask composer has no
global date picker.

An action labelled **Check an earlier date** may appear only when an earlier
legal position is relevant to the task, such as reviewing a dated document,
transaction or board action. It belongs to that question or document, not to
the application as a whole.

The action is enabled only when the server returns all of the following:

- the earliest date for which the relevant provision can be reconstructed;
- the latest date, or confirmation that coverage continues to today;
- the provisions, rules and figures covered;
- every dependency not covered; and
- the text basis used for the requested date.

The interface must not infer those fields. It must not apply one selected date
to Duties, Watch, Drafts or any other view that does not consume it.

When coverage is complete, the result says:

> Position under **Section 2(85)** on **14 August 2025**

When coverage is incomplete, no historical conclusion is shown. The result says:

> **Earlier-date position not established**  
> Placedon does not yet hold every instrument needed to establish the position
> under **Section 173** on **14 August 2025**.

The missing instrument or dependency follows on the next line. Today remains
available without starting another request.

### Load and misuse controls

- No calendar is loaded until the user chooses **Check an earlier date**.
- The control accepts one date, not a range.
- The UI shows the coverage interval before a request is submitted.
- Dates outside that interval are disabled and explained.
- A repeated historical query may use a cached, versioned evidence record; the
  frontend never silently widens the legal scope.
- No result may pair current consolidated section text with a past answer date.
- No dated figure may be shown when its `effective_from` is later than the
  requested date.

## 2. Language lawyers recognise

Reader-facing copy uses the full professional form:

| Use | Avoid in display copy |
|---|---|
| **Section 173** | `s.173` |
| **Section 2(85)** | `s.2(85)` |
| **sub-section (1)** | `sub-s. (1)` |
| **clause (a)** | `(a)` without context |
| **Rule 8** | `r.8` |
| *Companies Act, 2013* | `CA13` |
| **G.S.R. 880(E)** | shortened notification names |

The engine may retain compact identifiers and accept familiar shorthand such as
`s.173`, `u/s 173` and `Section 173` as input. Normalisation happens only at the
display boundary; legal data is not rewritten.

### Typography

- Statutory references are **bold** in a Georgia/Times-style legal serif.
- Act and case names are *italicised* in explanatory prose.
- Instruments, dates, CINs and monetary figures remain monospaced because they
  are record identifiers.
- Underlining is reserved for links and a passage the user deliberately marks;
  it is not decorative emphasis.
- A citation may be bold, italic or underlined only for the semantic reasons
  above. Never combine all three styles on one phrase.

## 3. Required API work before the date control ships

The Ask response needs a server-owned historical coverage object. A provisional
shape is:

```json
{
  "historical_coverage": {
    "status": "complete | partial | unavailable",
    "from": "2022-09-15",
    "to": "2026-09-27",
    "covered_provisions": ["s.2(85)"],
    "missing_dependencies": [],
    "text_basis": "point_in_time | current_consolidation"
  }
}
```

The final field names belong to the backend contract. Until that contract and
its tests exist, the production frontend remains today-only.

