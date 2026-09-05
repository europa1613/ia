# Spec-Driven Development + Agentic Upskilling Plan

---

## 1. Spec-Driven Development (SDD) — Quick Reference

**Core idea:** write a structured spec first (what the system does, interfaces, data models, acceptance criteria), then generate/regenerate code against it. The spec is the source of truth, not the code.

### The GitHub Spec Kit workflow (in order)

| Step | Command | Produces |
|---|---|---|
| 1 | `/speckit.constitution` | `constitution.md` — project-wide non-negotiable rules |
| 2 | `/speckit.specify` | `spec.md` — what the app does, no tech details |
| 3 | `/speckit.clarify` *(optional)* | resolves ambiguities in the spec |
| 4 | `/speckit.plan` | `plan.md` — technical approach, stack, architecture |
| 5 | `/speckit.tasks` | `tasks.md` — small, testable task breakdown |
| 6 | `/speckit.analyze` *(optional)* | checks spec/plan/tasks consistency |
| 7 | `/speckit.implement` | actual code |

For a solo prototype: skip clarify/analyze, go **constitution → specify → plan → tasks → implement**.

### What a "constitution" is
Project-level rules that govern every spec — stack, response shapes, folder structure, testing/security bars, style conventions. Written once, inherited by every subsequent spec.

### Setup command
```
uvx --from git+https://github.com/github/spec-kit.git specify init <project-name> --ai claude
```

### Recommendation for prototypes
Do lightweight SDD, not brute-force-then-backfill. Backfilling a spec after brute-force coding is archaeology, not spec-writing. Full SDD ceremony (clarify + analyze) is overkill for a solo prototype — use the minimal loop above. Exception: brief brute-force chat exploration is fine *only* while still discovering the idea itself — then capture findings into a real spec.

### Stack recommendation
React frontend + **Node/Express** backend (not Java) for prototype speed — same language as frontend, less boilerplate, faster to regenerate from spec changes.

---

## 2. Six-Week Aggressive Build Plan

**Assumption:** ~2 hrs/day weekday + more on weekends. Rescale if this doesn't fit.

### Week 1-2: Ship the prototype + fundamentals in parallel
- Day 1-2: Constitution + spec + plan for the prototype. Reach `/speckit.implement` by day 2.
- Day 3-7: Build it. Rule: something runs end-to-end by end of each day, even if ugly.
- Parallel, 45 min/day: Ed Donner Core Track Weeks 1-2 (see Section 3).
- **Deliverable:** working prototype, deployed (free tier is fine), pushed to GitHub with a real README.

### Week 3-4: Agentic layer
- Extend the prototype with ONE real agent capability — takes actions (calls a tool, hits an API, modifies data) in a defined loop, not just a chatbot wrapper.
- Wire in MCP for at least one tool connection.
- Start CrewAI (or equivalent) on a second, smaller side-project — orchestrate 2+ agents on one task.
- **Deliverable:** second repo demonstrating multi-agent orchestration.

### Week 5: Evals
- Write actual evals for the Week 3-4 agent: test inputs, expected behaviors, pass/fail criteria. Run before/after any prompt or spec change.
- Most people skip this — it's the fastest way to look senior in agent-skills conversations.

### Week 6: Compound it
- Write up what was built (short post, internal or public). Public artifacts compound faster than private skill.
- Queue Week 7+ based on what broke (likely: production deployment, cost/latency tradeoffs, agent reliability).

### Non-negotiables
- Ship over study — always choose the commit over another course video.
- One eval beats ten prompt tweaks.
- Weekly checkpoint (even just to yourself) — aggressive plans die from silent drift, not lack of ambition.

---

## 3. Ed Donner Course — What to Do Before Week 1

Course: **AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents** (8 weeks total)

### Do now (~4-6 hrs)
- **Week 1** — "Build Your First LLM Product": API calls, prompt structure, basic patterns.
- **Week 2** — "Multi-Modal Chatbot: LLMs, Gradio UI, and Agents": function-calling/tool-use — the core mechanic behind agents (an LLM calling tools in a loop).

### Defer until needed
- Week 3 (HuggingFace/open-source) — skip, building on frontier APIs (Claude), not local models
- Weeks 4-7 (RAG, fine-tuning, QLoRA) — pull in only if the actual project needs retrieval or fine-tuning
- Week 8 (agentic capstone) + the separate **6-week Agentic Track** (OpenAI Agents SDK, MCP) — do this during Week 3-4 of the build plan above, not before, so it lands on something already being built.

### Course links
- Core Track: https://www.udemy.com/course/llm-engineering-master-ai-and-large-language-models/
- Agentic Track (6 wks, MCP): https://www.udemy.com/course/the-complete-agentic-ai-engineering-course/
- Production Track (4 wks, deployment): https://www.udemy.com/course/generative-and-agentic-ai-in-production/
- Resources / coupons: https://edwarddonner.com/2024/11/13/llm-engineering-resources/
- Free code repo (all weeks): https://github.com/ed-donner/llm_engineering

---

## 4. Setup Checklist (do today)

- [ ] Claude Code (or Cursor/Copilot) installed and working
- [ ] GitHub Spec Kit installed (`specify init` command above)
- [ ] Node.js + npm installed
- [ ] Deploy targets picked: frontend (Vercel/Netlify), backend (Railway/Render)
- [ ] GitHub repo created for the prototype
- [ ] API key ready for the model powering agents
- [ ] CrewAI installed (`pip install crewai`) — needed by Week 3
- [ ] **Prototype idea decided** — the actual bottleneck; everything above is inert without it
