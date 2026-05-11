# coval-agent-bench

**The agentic voice AI evaluator Coval has been building toward.**

Live demo: [coval-agent-bench.vercel.app](https://coval-agent-bench.vercel.app)

---

## What This Is

Coval's platform is powerful but entirely manual. Customers set up every test scenario by hand, configure metrics themselves, and spend hours reading dashboards to figure out what broke. Brooke described the next product publicly in Coval's own job posting: a headless, agentic version of Coval that works without a human in the loop.

This is that product.

Paste your voice agent's system prompt. An AI agent reads it, auto-generates adversarial test scenarios tailored to your agent's domain, evaluates it across 5 failure modes Coval documented in their engineering blog, and returns a full scored diagnostic report. No dashboard setup. No manual test scripting. Zero human in the loop.

---

## The 5 Problems This Addresses

Every problem below is sourced directly from Coval's public engineering blog.

**Problem 1: Zero evaluation infrastructure in production**
Coval documented that many production voice AI deployments have zero evaluation infrastructure. Not minimal. Not inadequate. Zero. Teams find out their agent is broken from customer complaints, not from tests.
Source: [Voice AI Evaluation Infrastructure](https://www.coval.ai/blog/voice-ai-evaluation-infrastructure-why-most-teams-skip-it-and-how-to-build-it)

**Problem 2: The demo to production collapse**
95% of voice agent demos succeed. Only 62% survive production. That 33-point gap happens because nobody is systematically testing for real-world conditions before shipping.
Source: [Why 95% of Demos Work But Only 62% Survive Production](https://www.coval.ai/blog/voice-ai-testing-framework-why-95-of-demos-work-but-only-62-survive-production)

**Problem 3: Multi-agent handoff failures are untested**
Coval documented exactly 7 ways multi-agent voice systems fail in production but there is no runnable benchmark that automatically tests for all of them.
Source: [Why Multi-Agent Voice AI Systems Fail](https://www.coval.ai/blog/why-multi-agent-voice-ai-systems-fail-7-common-pitfalls-and-how-to-avoid-them)

**Problem 4: Manual test setup blocks iteration speed**
Engineers spend hours manually scripting scenarios just to discover that fixing one issue introduces another. The setup overhead kills iteration speed.

**Problem 5: No agentic headless interface exists yet**
From Coval's own job posting: "What does our product look like when it's headless?" This project answers that question with working code.
Source: [Coval Careers](https://www.coval.ai/careers)

---

## How It Works

1. User pastes a voice agent system prompt or conversation transcript
2. Claude reads the input and identifies the agent's domain and intent scope
3. Adversarial test scenarios are auto-generated for each failure mode
4. LLM-as-judge scoring evaluates the agent across all 5 categories
5. A full diagnostic report is returned: scores, severity levels, failure examples, and fix recommendations

No manual configuration. No test scripting. The agent does it all.

---

## Failure Modes Evaluated

| Failure Mode | What It Tests |
|---|---|
| Audio Degradation Resilience | Noisy input, compression artifacts, low quality audio |
| Multi-Agent Handoff Integrity | Context preservation, hallucination cascades, coordination breakdown |
| Conversation Complexity Handling | Multi-intent requests, mid-conversation pivots, incomplete information |
| Instruction Following Under Drift | Instruction anchor stability across long or adversarial conversations |
| Turn Detection and Interruption | Overlap handling, knowing when to stop talking, interruption recovery |

---

## Stack

**Backend**
- Python 3.11
- FastAPI
- Anthropic Claude API (claude-sonnet-4-5)
- LLM-as-Judge evaluation pipeline
- Pydantic for structured outputs
- Uvicorn
- Deployed on Render

**Frontend**
- React 18
- Vite
- Framer Motion for animations
- Syne + DM Mono + Inter (Google Fonts)
- Deployed on Vercel

**AI / ML**
- Claude Sonnet as the orchestrator brain
- Prompt engineering for structured JSON outputs
- LLM-as-judge scoring methodology
- Adversarial scenario generation
- Domain-aware evaluation pipeline

---

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
echo "ANTHROPIC_API_KEY=your_key_here" > .env
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

---

## Deployment

**Backend on Render**
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment variable: `ANTHROPIC_API_KEY`

**Frontend on Vercel**
- Root directory: `frontend`
- Environment variable: `VITE_API_URL=https://your-render-url.onrender.com`

---

## About

Built by Jafar as a targeted pitch for Coval's AI Engineer role.

- GitHub: [Jafar-97](https://github.com/Jafar-97)
- Email: jafarshariffai@gmail.com
