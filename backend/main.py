import os
import json
import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Coval Agent Bench API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

FAILURE_MODES = [
    {
        "id": "audio_degradation",
        "name": "Audio Degradation Resilience",
        "description": "How the agent handles noisy, compressed, or low-quality audio input",
        "source_url": "https://www.coval.ai/blog/voice-ai-platform-comparison-2026-benchmarks-performance-data-and-how-to-choose",
        "source_label": "Coval: Voice AI Platform Comparison 2026",
        "coval_quote": "Production environments have background noise, accent diversity, unexpected requests, and thousands of concurrent conversations. The platform that shines in demos may struggle in production."
    },
    {
        "id": "multi_agent_handoff",
        "name": "Multi-Agent Handoff Integrity",
        "description": "Context preservation, hallucination cascades, and coordination breakdown between agents",
        "source_url": "https://www.coval.ai/blog/why-multi-agent-voice-ai-systems-fail-7-common-pitfalls-and-how-to-avoid-them",
        "source_label": "Coval: Why Multi-Agent Voice AI Systems Fail",
        "coval_quote": "Many production voice AI deployments have zero evaluation infrastructure. Not minimal. Not inadequate. Zero."
    },
    {
        "id": "conversation_complexity",
        "name": "Conversation Complexity Handling",
        "description": "Multi-intent requests, mid-conversation pivots, and unexpected user behaviors",
        "source_url": "https://www.coval.ai/blog/voice-ai-testing-framework-why-95-of-demos-work-but-only-62-survive-production",
        "source_label": "Coval: Why 95% of Demos Work But Only 62% Survive Production",
        "coval_quote": "Demo success does not predict production success. There is a 33% collapse rate between demo and production environments."
    },
    {
        "id": "instruction_following",
        "name": "Instruction Following Under Drift",
        "description": "Whether the agent maintains its core instructions across long or adversarial conversations",
        "source_url": "https://www.coval.ai/blog/the-three-layer-testing-framework-for-voice-ai-regression-adversarial-and-production-derived",
        "source_label": "Coval: The Three-Layer Testing Framework",
        "coval_quote": "Regression, adversarial, and production-derived testing form the ideal framework that teams must implement before shipping."
    },
    {
        "id": "turn_detection",
        "name": "Turn Detection and Interruption",
        "description": "Agent ability to detect when a user is speaking, handle interruptions, and avoid talking over users",
        "source_url": "https://www.coval.ai/blog/test-turn-detection-voice-ai",
        "source_label": "Coval: Test Turn Detection in Voice AI",
        "coval_quote": "Turn detection failures are among the most disruptive experiences in voice AI and among the least tested before production."
    }
]

class AnalyzeRequest(BaseModel):
    input_text: str
    input_type: str
    agent_name: str = "Voice Agent"

class FailureModeScore(BaseModel):
    id: str
    name: str
    score: int
    severity: str
    description: str
    source_url: str
    source_label: str
    coval_quote: str
    test_scenarios: list[str]
    failure_examples: list[str]
    recommendations: list[str]

class AnalysisReport(BaseModel):
    agent_name: str
    overall_score: int
    overall_verdict: str
    production_ready: bool
    executive_summary: str
    failure_modes: list[FailureModeScore]
    top_risks: list[str]
    immediate_actions: list[str]

def get_severity(score: int) -> str:
    if score >= 80:
        return "PASS"
    elif score >= 60:
        return "WARNING"
    else:
        return "CRITICAL"

@app.get("/health")
def health():
    return {"status": "ok", "service": "coval-agent-bench"}

@app.post("/api/analyze", response_model=AnalysisReport)
async def analyze_agent(request: AnalyzeRequest):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="API key not configured")

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    input_label = "system prompt" if request.input_type == "system_prompt" else "conversation transcript"

    prompt = f"""You are an expert voice AI evaluation engine. A company has submitted their voice agent's {input_label} for evaluation against 5 critical failure modes documented by Coval, the leading voice AI testing platform.

INPUT ({input_label}):
{request.input_text}

AGENT NAME: {request.agent_name}

You must evaluate this voice agent across these 5 failure modes and return a precise JSON report. Be realistic and critical. Do not inflate scores. A score of 100 means the agent explicitly and thoroughly handles this failure mode. A score of 0 means it has no handling at all.

For each failure mode, generate:
- A score from 0 to 100 (be honest and critical)
- 3 specific test scenarios that would expose this failure mode in THIS specific agent
- 2 to 3 specific failure examples (what would actually go wrong in production for THIS agent)
- 2 to 3 specific, actionable recommendations to fix the issues

FAILURE MODES TO EVALUATE:
1. audio_degradation: How well does this agent handle noisy, compressed, accented, or low-quality audio?
2. multi_agent_handoff: If this agent hands off to another agent or escalates, is context preserved?
3. conversation_complexity: Can this agent handle multi-intent requests, mid-conversation topic changes?
4. instruction_following: Does this agent have clear instruction anchors that prevent drift?
5. turn_detection: Does this agent have explicit handling for interruptions and overlapping speech?

Return ONLY valid JSON in this exact format, no other text:
{{
  "overall_score": <integer 0-100>,
  "overall_verdict": "<one sentence honest verdict>",
  "production_ready": <true or false>,
  "executive_summary": "<3 sentence summary, brutally honest>",
  "scores": {{
    "audio_degradation": <integer>,
    "multi_agent_handoff": <integer>,
    "conversation_complexity": <integer>,
    "instruction_following": <integer>,
    "turn_detection": <integer>
  }},
  "test_scenarios": {{
    "audio_degradation": ["<scenario 1>", "<scenario 2>", "<scenario 3>"],
    "multi_agent_handoff": ["<scenario 1>", "<scenario 2>", "<scenario 3>"],
    "conversation_complexity": ["<scenario 1>", "<scenario 2>", "<scenario 3>"],
    "instruction_following": ["<scenario 1>", "<scenario 2>", "<scenario 3>"],
    "turn_detection": ["<scenario 1>", "<scenario 2>", "<scenario 3>"]
  }},
  "failure_examples": {{
    "audio_degradation": ["<example 1>", "<example 2>"],
    "multi_agent_handoff": ["<example 1>", "<example 2>"],
    "conversation_complexity": ["<example 1>", "<example 2>"],
    "instruction_following": ["<example 1>", "<example 2>"],
    "turn_detection": ["<example 1>", "<example 2>"]
  }},
  "recommendations": {{
    "audio_degradation": ["<rec 1>", "<rec 2>"],
    "multi_agent_handoff": ["<rec 1>", "<rec 2>"],
    "conversation_complexity": ["<rec 1>", "<rec 2>"],
    "instruction_following": ["<rec 1>", "<rec 2>"],
    "turn_detection": ["<rec 1>", "<rec 2>"]
  }},
  "top_risks": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "immediate_actions": ["<action 1>", "<action 2>", "<action 3>"]
}}"""

    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        import re
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            data = json.loads(match.group())
        else:
            raise HTTPException(status_code=500, detail="Failed to parse evaluation response")

    failure_mode_scores = []
    for fm in FAILURE_MODES:
        fid = fm["id"]
        score = data["scores"].get(fid, 50)
        failure_mode_scores.append(FailureModeScore(
            id=fid,
            name=fm["name"],
            score=score,
            severity=get_severity(score),
            description=fm["description"],
            source_url=fm["source_url"],
            source_label=fm["source_label"],
            coval_quote=fm["coval_quote"],
            test_scenarios=data["test_scenarios"].get(fid, []),
            failure_examples=data["failure_examples"].get(fid, []),
            recommendations=data["recommendations"].get(fid, [])
        ))

    return AnalysisReport(
        agent_name=request.agent_name,
        overall_score=data["overall_score"],
        overall_verdict=data["overall_verdict"],
        production_ready=data["production_ready"],
        executive_summary=data["executive_summary"],
        failure_modes=failure_mode_scores,
        top_risks=data.get("top_risks", []),
        immediate_actions=data.get("immediate_actions", [])
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)