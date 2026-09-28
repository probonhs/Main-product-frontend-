#!/usr/bin/env python3
"""Capture real deterministic route responses; --check reproduces without writes."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

# Even importing backend modules must not write __pycache__ into that checkout.
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
BACKEND = Path("/Users/abdulazeez/Desktop/Placedon-workspace/backend")
PYTHON = "/Users/abdulazeez/.local/share/uv/python/cpython-3.12-macos-aarch64-none/bin/python3.12"
COMMIT = "948660041b73e610e017b2036ab97848efe7a26e"
STAMP = "2026-09-27T00:00:00Z"
AS_OF = STAMP[:10]
DESTINATION = ROOT / "fixtures" / "engine"


def git(backend: Path, *args: str) -> str:
    return subprocess.check_output(
        ["git", "-C", str(backend), *args], text=True
    ).strip()


def require_clean(backend: Path) -> None:
    if git(backend, "rev-parse", "HEAD") != COMMIT:
        raise RuntimeError(f"backend must be pinned to {COMMIT}")
    if git(backend, "status", "--porcelain", "--untracked-files=all"):
        raise RuntimeError("refusing capture from a dirty backend")


def canonical(value: object) -> bytes:
    # ASCII escapes, sorted keys, no whitespace; mirrored by the offline JS verifier.
    return json.dumps(value, sort_keys=True, ensure_ascii=True, allow_nan=False,
                      separators=(",", ":")).encode("ascii")


def digest(value: object) -> str:
    return hashlib.sha256(canonical(value)).hexdigest()


def adapt(value: object) -> object:
    if isinstance(value, dict):
        return {key: AS_OF if key == "as_of" else adapt(item)
                for key, item in value.items()}
    if isinstance(value, list):
        return [adapt(item) for item in value]
    return value


def capture(backend: Path) -> dict[str, dict]:
    require_clean(backend)
    sys.path.insert(0, str(backend))
    from checker.api import handle
    from checker.ask_contract import validate
    from scripts.assistant_contract import REQUESTS

    asks = {
        "ask-answered": "answered_small_company",
        "ask-partial": "partial_s173_s16",
        "ask-abstained": "partial_nothing_confirmed",
        "ask-not-held": "out_of_scope_fema",
        "ask-document": "document_context_2024",
    }
    scenarios = {name: ("POST", "/v1/ask", adapt(copy.deepcopy(REQUESTS[basis])),
                        200, {"ask-answered": "answered", "ask-not-held": "out_of_scope"}
                        .get(name, "partial")) for name, basis in asks.items()}
    facts = adapt(copy.deepcopy(REQUESTS["answered_small_company"]["facts"]))
    document = adapt(copy.deepcopy(REQUESTS["document_context_2024"]["facts"]))
    scenarios.update({
        "ask-resident-evidence": ("POST", "/v1/ask", {
            "question": "Does this company satisfy Section 149(3)?",
            "as_of": AS_OF,
            "provisions": ["s.149(3)"],
            "facts": {
                "company_class": "private", "incorporation_date": "2021-04-01",
                "financial_year": "2025-26",
                "evidence": {
                    "resident_director_days": 182,
                    "agm_dates": ["2025-09-15"],
                    "board_meetings": ["2025-01-10", "2025-04-10",
                                       "2025-07-10", "2025-10-10"],
                    "calendar_year": 2025,
                },
            },
        }, 200, "answered"),
        "ask-invalid": ("POST", "/v1/ask", {"question": "", "as_of": AS_OF}, 400, None),
        "compliance-pack": ("POST", "/v1/compliance-pack", facts, 200, None),
        "document-check": ("POST", "/v1/document-check", document, 200, None),
        "events": ("GET", f"/v1/company/U74999KA2021PTC145321/events?as_of={AS_OF}",
                   None, 200, None),
        "instrument-impact": ("GET", "/v1/instruments/880/affected", None, 200, None),
        "health": ("GET", "/v1/health", None, 200, None),
        "mca-strip": ("POST", "/v1/mca-strip", {"as_of": AS_OF}, 200, None),
    })
    result = {}
    for name, (method, path, body, expected_status, expected_state) in scenarios.items():
        # Exceptions propagate. No synthetic abstention/error body replaces a failure.
        status, response = handle(method, path, body, generated_at=STAMP)
        if status != expected_status:
            raise RuntimeError(f"{name}: expected HTTP {expected_status}, got {status}")
        if expected_state is not None:
            violations = validate(response)
            if response.get("state") != expected_state or violations:
                raise RuntimeError(f"{name}: expected {expected_state}, got {response.get('state')}; {violations}")
        request = {"method": method, "path": path, "body": body}
        result[name] = {
            "schema_version": 1, "fixture_id": name, "captured_at": STAMP,
            "backend_commit": COMMIT, "route": f"{method} {path.split('?')[0]}",
            "request": request, "response_status": status, "response": response,
            "request_sha256": digest(request), "response_sha256": digest(response),
            "contains_personal_data": False, "sanitisation": [],
            "capture_command": f"{PYTHON} scripts/capture-engine-fixtures.py --backend {backend}",
            "verified_by": "checker.ask_contract.validate (successful Ask); node tests/engine-fixtures.mjs",
        }
    require_clean(backend)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--backend", type=Path, default=BACKEND)
    parser.add_argument("--check", action="store_true", help="compare fresh captures; write nothing")
    args = parser.parse_args()
    if sys.version_info[:2] != (3, 12):
        parser.error("capture requires Python 3.12")
    backend = args.backend.resolve()
    previous_directory = Path.cwd()
    try:
        # Backend evidence/provenance readers resolve some paths against cwd.
        os.chdir(backend)
        fixtures = capture(backend)
    finally:
        os.chdir(previous_directory)
    encoded = {f"{name}.json": json.dumps(value, sort_keys=True, ensure_ascii=True,
               allow_nan=False, indent=2) + "\n" for name, value in fixtures.items()}
    if args.check:
        existing = {path.name for path in DESTINATION.glob("*.json")}
        if existing != set(encoded):
            raise RuntimeError("fixture inventory differs from the capture scenarios")
        for name, content in encoded.items():
            if (DESTINATION / name).read_text(encoding="ascii") != content:
                raise RuntimeError(f"{name}: fixture differs from real route reproduction")
        print(f"PASS: {len(encoded)} fixtures reproduced byte-for-byte; no writes")
    else:
        existing = {path.name for path in DESTINATION.glob("*.json")}
        if existing - set(encoded):
            raise RuntimeError("unexpected fixture files; refusing to leave a mixed inventory")
        DESTINATION.mkdir(parents=True, exist_ok=True)
        for name, content in encoded.items():
            (DESTINATION / name).write_text(content, encoding="ascii")
        print(f"Captured {len(encoded)} fixtures from clean backend {COMMIT}")


if __name__ == "__main__":
    main()
