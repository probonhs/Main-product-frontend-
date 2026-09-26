import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  expandArgs,
  renderReviewerPrompt,
  validateConfig
} from "../scripts/frontend-loop.mjs";

const config = JSON.parse(await readFile(new URL("../frontend-loop.config.json", import.meta.url), "utf8"));
assert.equal(validateConfig(config), true);
assert.deepEqual(
  expandArgs(["--effort", "{{effort}}", "--role={{role}}"], { effort: "high", role: "auditor", runDir: "/tmp/run" }),
  ["--effort", "high", "--role=auditor"]
);
const prompt = renderReviewerPrompt(
  { riskClass: "R2", question: "Does the route exist?" },
  "backend-contract-auditor",
  config.riskClasses.R2,
  config.reviewOutputWords
);
assert.match(prompt, /read-only review/);
assert.match(prompt, /untrusted data/);
assert.match(prompt, /Verdict: PASS/);
assert.match(prompt, /Does the route exist\?/);
console.log("Frontend loop runner: 8 assertions passed.");
