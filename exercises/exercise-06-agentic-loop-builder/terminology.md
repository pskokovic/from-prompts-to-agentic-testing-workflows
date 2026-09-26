# Exercise 6 terminology and provenance

Reviewed against the tutorial glossary and official OpenAI and Anthropic guidance on **25 September 2026**. This is a custom teaching simulation, not an official provider architecture or SDK implementation.

## Mapping the blocks to shared concepts

| Block | Concept used in the tutorial | Meaning here |
| --- | --- | --- |
| Define goal and instructions | Goal; instructions | Bound the three-run triage queue, shared budget and per-run report. |
| Select context and sources | Context; grounding | Select relevant sources and distinguish authority from observations. |
| Initialize workflow state | State | Create per-run records of evidence, hypotheses, identities, gaps and owners, plus the shared queue, approvals and attempt count. The former “evidence ledger” is this exercise's representation of state, not a named provider feature or persistent memory service. |
| Assess observations | Observation; reasoning | Interpret current evidence and uncertainty, reassess provisional groups, and prioritize the next case. The visible rationale is a reviewable explanation, not access to a model's hidden reasoning. |
| Choose the next action | Model-guided action selection | Students stand in for the model; the page itself uses deterministic rules. |
| Check permissions and limits | Permissions; approvals; guardrails | The harness enforces scoped authority and the action budget before execution. An instruction alone is not an enforced security boundary. |
| Execute tool call | Tool calling; tool execution | A proposed tool call is distinct from its execution. Here execution is simulated with a prepared result. |
| Validate tool output | Tool result; observation; evidence check | A returned result is an observation to check, not automatically evidence supporting the claim. |
| Update workflow state | State management | Retain checked evidence and unresolved gaps for the next decision. |
| Check stopping conditions | Completion; escalation; limits | Continue, report, or ask for human intervention according to the task's rules. |
| Request human review | Human-in-the-loop / expert-in-the-loop | Give a person the conclusion and limitations. This is not an agent-to-agent SDK handoff. |

Section 03 configures the loop's action policy, tool-output checks, completion condition, permissions, limits, and continuation. These are explanatory UI labels, not provider API parameter names. The action budget counts dispatched tool attempts, not model tokens, model turns, or every pass through the diagram.

## What is shared, and what is exercise-specific?

An agentic loop uses observations to inform subsequent model decisions and tool use. A predefined workflow can also contain branches and loops; a return arrow alone does not establish agency. Our glossary's observe → decide → act → evaluate cycle is a teaching summary, not a universal four-stage protocol.

The eleven blocks, their individual boundaries, the 1–5 attempt cap, required comparison approval, and the return specifically to assessment are authored constraints. Real implementations can combine assessment, action selection, and stopping decisions in one model call. “Workflow validation failed” reports a violation of this activity's rules; it is not a provider error category. Passing the simulation is not certification of an agent design.

## Official references

- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents): distinguishes predefined orchestration from model-directed processes and tool use. It supports the workflow/agent distinction, not this exact block ordering.
- [Claude Code — How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works): describes context gathering, action, and result verification as interacting phases, and the harness as the surrounding tools/context layer. Our separate blocks expand those ideas for review.
- [OpenAI — Function calling](https://developers.openai.com/api/docs/guides/function-calling): distinguishes a model's tool request, application-side execution, and returning the result for a subsequent response or tool request.
- [OpenAI — Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals): distinguishes automatic checks from approval decisions. We make those responsibilities explicit rather than treating every instruction as an enforced guardrail.
- [OpenAI/Codex — Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security): separates technical sandbox boundaries from approval policy. The local exercise simulates a permission policy; it does not implement an OS sandbox.
- [OpenAI — Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration): discusses agent ownership and delegation. Our final human-review block does not transfer control to another AI agent.

The private trainer guide supplies a compact valid sequence, variations, endings, and discussion mistakes. No exhaustive solution catalogue is needed.

## Batch triage extension — 25 September 2026

Runs 204, 208 and 209 illustrate different evidence needs. Risk-first and queue-coverage policies are authored examples, not provider algorithms. Each preserves unresolved cases and changes follow-up actions in response to results. A shared 1–5 execution limit makes prioritization visible. A per-run report distinguishes triaged, escalated and uninvestigated cases; passing the design checks is not the same as resolving every failure. The optional comparison concerns only run 204.
