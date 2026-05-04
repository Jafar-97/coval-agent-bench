# coval-agent-bench

An agentic voice AI failure mode evaluator built for Coval.

Paste your voice agent's system prompt. Get a full diagnostic report across 5 failure modes
Coval documented publicly. No dashboard setup. No manual test scripting. Zero human in the loop.

## What It Evaluates

1. Audio Degradation Resilience
2. Multi-Agent Handoff Integrity
3. Conversation Complexity Handling
4. Instruction Following Under Drift
5. Turn Detection and Interruption

Each sourced directly from Coval's engineering blog.

## Stack

- Backend: FastAPI + Python + Anthropic Claude
- Frontend: React + Vite
- Deploy: Render (backend) + Vercel (frontend)

## Local Development

### Backend
cd backend
pip install -r requirements.txt
echo "ANTHROPIC_API_KEY=your_key" > .env
uvicorn main:app --reload --port 8000

### Frontend
cd frontend
npm install
npm run dev

## Deploy to Render (Backend)

1. Push to GitHub
2. New Web Service on Render
3. Build: pip install -r requirements.txt
4. Start: uvicorn main:app --host 0.0.0.0 --port $PORT
5. Add env var: ANTHROPIC_API_KEY

## Deploy to Vercel (Frontend)

1. Push frontend/ to GitHub
2. Import to Vercel
3. Add env var: VITE_API_URL=https://your-render-url.onrender.com
4. Deploy

## Built by Jafar
github.com/Jafar-97
