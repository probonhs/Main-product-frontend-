"""Capture synthetic deterministic handler evidence. No model, network or file writes."""
import hashlib
import json
import shlex
import socket
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

SHA = "889ba548083ea67c8bd72b552a2bcf6d68cdf70b"
COMMAND = shlex.join([sys.executable, *sys.argv])
source = Path(sys.argv[1]).resolve()
repository = Path(sys.argv[2]).resolve()
if subprocess.check_output(["git", "cat-file", "-t", SHA], cwd=repository, text=True).strip() != "commit":
    raise SystemExit("Pinned backend commit unavailable")
# Check every Python module before using an archive; no patched backend captures.
for path in source.rglob("*.py"):
    expected = subprocess.check_output(["git", "show", f"{SHA}:{path.relative_to(source)}"], cwd=repository)
    if path.read_bytes() != expected:
        raise SystemExit("Archive differs from pinned code")

def refuse_network(*args, **kwargs):
    raise RuntimeError("Network forbidden in deterministic document capture")

socket.create_connection = refuse_network
socket.socket.connect = refuse_network
sys.dont_write_bytecode = True
sys.path.insert(0, str(source))
from gateway.verbs import Context, VERBS, rest_path
from checker.ss.defects import CLEAN

verb = next(verb for verb in VERBS if verb.name == "review_document")
def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()

cases = {
    "minutes-book-needed": {"text": CLEAN},
    "notice": {"text": "NOTICE OF THE ANNUAL GENERAL MEETING\nNotice is hereby given that the Annual General Meeting of the members of Synthetic Specimen Private Limited will be held on 30 September 2026.\nAn explanatory statement is annexed. A proxy form is enclosed. E-voting will be available."},
    "unclassified": {"text": "Dear colleague, please acknowledge receipt of this synthetic specimen letter."},
    "negative-quorum": {"text": CLEAN.replace("The requisite quorum being present", "The requisite quorum being absent")},
}
captured = datetime.now(timezone.utc).isoformat()
result = []
if len(sys.argv) > 3 and sys.argv[3] == "tables":
    from gateway.store import MemoryBackend
    from gateway.jobs import MemoryQueue
    from gateway.verbs import _review_grid_cell
    verbs = {item.name: item for item in VERBS}
    columns = [{"name": "Governing law", "kind": "text", "question": "Which law governs?"},
               {"name": "Term end", "kind": "date", "question": "When does confidentiality expire?"}]
    specimens = [{"name": "Synthetic NDA.txt", "text": "MUTUAL NDA\nGoverned by the laws of India.\nConfidentiality expires on 2029-03-31."},
                 {"name": "Synthetic supply.txt", "text": "SUPPLY AGREEMENT\nThis specimen describes delivery only."},
                 {"name": "Synthetic scan.txt", "cannot_read": "Synthetic scan specimen has no readable text layer."}]
    def answer(question, kind, text):
        if text.startswith("SUPPLY"):
            if kind == "date":
                raise TimeoutError("synthetic offline failure; no provider called")
            return None
        if kind == "date":
            return ("sometime in 2029", "expires on 2029-03-31")
        return ("India", "Governed by the laws of India")
    for scenario in ("pending", "mixed", "finished", "cancelled", "csv-adversary"):
        ctx = Context(store=MemoryBackend(), queue=MemoryQueue(), model_for=lambda origins: answer)
        specimen_set, column_set = specimens, columns
        if scenario == "csv-adversary":
            # Harmless arithmetic/no URL. Leading spaces in names and a BOM in
            # the value evade the pinned guard; never deliver this as a download.
            specimen_set = [{"name": " =1+1", "text": "Synthetic clause: \ufeff=1+1 governs this agreement."}]
            column_set = [{"name": " =1+1", "kind": "text", "question": "Which law governs?"}]
            ctx.model_for = lambda origins: lambda question, kind, text: ("\ufeff=1+1", "\ufeff=1+1 governs this agreement")
        documents = []
        for specimen in specimen_set:
            uploaded = verbs["documents.upload"].run(specimen, ctx)
            # Upload at this SHA does not retain text. Deliberately seed only synthetic
            # test text; this is not upload/persistence acceptance (Q-010).
            if "text" in specimen:
                ctx.documents[uploaded["document_id"]]["text"] = specimen["text"]
            documents.append(dict(specimen, document_id=uploaded["document_id"]))
        create_request = {"grid_id": "00000000-0000-4000-8000-000000000004", "name": "Synthetic agreement comparison", "document_ids": [doc["document_id"] for doc in documents], "columns": column_set}
        created = verbs["review_table.create"].run(create_request, ctx)
        if "grid_id" not in created:
            raise SystemExit("Synthetic table creation refused")
        operations = []
        jobs = [{"grid_id": created["grid_id"], "document_id": doc["document_id"], "column": col["name"], "kind": col["kind"], "question": col["question"]} for doc in documents for col in column_set]
        count = 0 if scenario == "pending" else 6 if scenario == "finished" else 5
        for job in jobs[:count]:
            operations.append(_review_grid_cell(job, ctx))
        # Seed the same synthetic debit used in pinned gateway/verbs.py's cost tests.
        # This exercises the reported lower bound, never a provider bill.
        if scenario == "mixed":
            priced = ctx.store.read_grid_cells(created["grid_id"])[0]
            priced.update(provider="azure", cost_inr=0.0412, cost_note="Synthetic test debit only; no billed provider call")
            ctx.store.write_grid_cell(priced, if_pending=False)
        cancellation = verbs["review_table.cancel"].run({"grid_id": created["grid_id"]}, ctx) if scenario == "cancelled" else None
        setup = {"documents": documents, "create_request": create_request, "create_response": created,
                 "cell_operations": operations, "cancel_response": cancellation,
                 "synthetic_debit_only": scenario == "mixed", "synthetic_text_seeded": True}
        for action in ("status", "export"):
            verb = verbs[f"review_table.{action}"]
            request = {"grid_id": created["grid_id"]}
            response = verb.run(request, ctx)
            result.append({"schema_version": 1, "fixture_id": f"{scenario}-{action}", "captured_at": captured,
                "backend_commit": SHA, "route": verb.method + " " + rest_path(verb), "request": request,
                "response_status": 200, "response": response, "setup": setup,
                "request_sha256": hashlib.sha256(canonical(request)).hexdigest(),
                "response_sha256": hashlib.sha256(canonical(response)).hexdigest(),
                "setup_sha256": hashlib.sha256(canonical(setup)).hexdigest(),
                "contains_personal_data": False, "sanitisation": [], "capture_command": COMMAND,
                "execution": "Isolated memory store; deterministic answerer; no provider model or billed call",
                "verified_by": "tests/document-review.mjs"})
    print(json.dumps(result, ensure_ascii=False))
    raise SystemExit(0)
if len(sys.argv) > 3 and sys.argv[3] == "contracts":
    from agents import review_contract as rc
    book_path = "playbooks/nda_v1.json"
    book_bytes = (source / book_path).read_bytes()
    if book_bytes != subprocess.check_output(["git", "show", f"{SHA}:{book_path}"], cwd=repository):
        raise SystemExit("Playbook differs from pinned code")
    verb = next(verb for verb in VERBS if verb.name == "review_contract")
    for fixture in rc.fixtures():
        if fixture.id not in ("N02", "N06", "N09"):
            continue
        request = {"text": fixture.text, "name": fixture.id, "playbook": book_path, "test_data": True}
        response = verb.run(request, Context(model_for=lambda origins, fx=fixture: rc.fixture_model(fx)))
        result.append({
            "schema_version": 1, "fixture_id": fixture.id, "captured_at": captured,
            "backend_commit": SHA, "route": "POST " + rest_path(verb),
            "request": request, "response_status": 200, "response": response,
            "request_sha256": hashlib.sha256(canonical(request)).hexdigest(),
            "response_sha256": hashlib.sha256(canonical(response)).hexdigest(),
            "contains_personal_data": False, "sanitisation": [],
            "capture_command": COMMAND,
            "execution": "Injected deterministic fixture extraction; no provider model called",
            "playbook_sha256": hashlib.sha256(book_bytes).hexdigest(),
            "verified_by": "tests/document-review.mjs",
        })
    print(json.dumps(result, ensure_ascii=False))
    raise SystemExit(0)
for name, request in cases.items():
    response = verb.run(request, Context())
    result.append({
        "schema_version": 1, "fixture_id": name, "captured_at": captured,
        "backend_commit": SHA, "route": "POST " + rest_path(verb),
        "request": request, "response_status": 200, "response": response,
        "request_sha256": hashlib.sha256(canonical(request)).hexdigest(),
        "response_sha256": hashlib.sha256(canonical(response)).hexdigest(),
        "contains_personal_data": False, "sanitisation": [],
        "capture_command": COMMAND,
        "verified_by": "tests/document-review.mjs",
    })
print(json.dumps(result, ensure_ascii=False))
