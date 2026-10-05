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
