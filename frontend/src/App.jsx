import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SAMPLE_PROMPT = `You are a customer service voice agent for MediCare Insurance. Your job is to help customers with:
- Policy questions and coverage details
- Claims status and processing
- Premium payments and billing
- Finding in-network providers

Be professional, empathetic, and concise. If a customer is frustrated, acknowledge their concern before providing information. Always verify the customer's identity before discussing account details.`;

const SAMPLE_TRANSCRIPT = `Agent: Thank you for calling MediCare Insurance, how can I help you today?
User: yeah hi um I need to know about my claim
Agent: I'd be happy to help with your claim. Can I get your member ID?
User: it's uh 445-23-8821
Agent: Thank you. What's the status you're looking for?
User: I submitted a claim like three weeks ago for my surgery and I haven't heard anything and I'm getting bills
Agent: I understand your concern. Let me look that up.
User: also while you're at it can you tell me if my physical therapy is covered because I need to start that next week and I don't know if I need a referral or not
Agent: Your claim is currently under review. It should be processed within 5-7 business days.
User: wait that doesn't make sense it's been three weeks already
Agent: I apologize for the confusion. I'll escalate this to our claims department.`;

function GlowOrb({ style }) {
  return (
    <div style={{
      position: "fixed",
      borderRadius: "50%",
      filter: "blur(120px)",
      pointerEvents: "none",
      zIndex: 0,
      ...style
    }} />
  );
}

function ScoreRing({ score, size = 120, animate = false }) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;
  const color = score >= 80 ? "var(--pass)" : score >= 60 ? "var(--warn)" : "var(--critical)";

  useEffect(() => {
    if (!animate) { setDisplayScore(score); return; }
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score, animate]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s ease", filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: size * 0.22, color, lineHeight: 1 }}>
          {displayScore}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: size * 0.09, color: "var(--text-muted)", marginTop: 2 }}>
          / 100
        </span>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const config = {
    PASS: { bg: "var(--pass-glow)", color: "var(--pass)", border: "rgba(0,230,118,0.3)", label: "PASS" },
    WARNING: { bg: "var(--warn-glow)", color: "var(--warn)", border: "rgba(255,179,0,0.3)", label: "WARNING" },
    CRITICAL: { bg: "var(--critical-glow)", color: "var(--critical)", border: "rgba(255,68,68,0.3)", label: "CRITICAL" },
  };
  const c = config[severity] || config.WARNING;
  return (
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500,
      padding: "3px 8px", borderRadius: 4,
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      letterSpacing: "0.08em"
    }}>
      {c.label}
    </span>
  );
}

function FailureModeCard({ fm, index }) {
  const [expanded, setExpanded] = useState(false);
  const color = fm.score >= 80 ? "var(--pass)" : fm.score >= 60 ? "var(--warn)" : "var(--critical)";
  const glow = fm.score >= 80 ? "var(--pass-glow)" : fm.score >= 60 ? "var(--warn-glow)" : "var(--critical-glow)";

  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${expanded ? "var(--border-accent)" : "var(--border)"}`,
      borderRadius: 16,
      overflow: "hidden",
      transition: "all 0.25s ease",
      animation: `fadeUp 0.5s ease ${index * 0.08}s both`
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%", background: "none", border: "none", padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 20, textAlign: "left",
          color: "var(--text-primary)", cursor: "pointer"
        }}
      >
        <ScoreRing score={fm.score} size={72} animate={true} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
              {fm.name}
            </span>
            <SeverityBadge severity={fm.severity} />
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5 }}>
            {fm.description}
          </p>
          <a
            href={fm.source_url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, color: "var(--accent)", marginTop: 6,
              fontFamily: "var(--font-mono)", opacity: 0.8
            }}
          >
            <span>Source: {fm.source_label}</span>
            <span style={{ fontSize: 10 }}>&#8599;</span>
          </a>
        </div>
        <div style={{
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.25s ease",
          color: "var(--text-muted)", fontSize: 18, flexShrink: 0
        }}>
          &#8964;
        </div>
      </button>

      {expanded && (
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{
            background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "14px 16px",
            border: "1px solid var(--border)", marginBottom: 20,
            borderLeft: `3px solid ${color}`
          }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.6 }}>
              "{fm.coval_quote}"
            </p>
            <a href={fm.source_url} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", marginTop: 6, display: "block" }}>
              {fm.source_label} &#8599;
            </a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Section title="Test Scenarios" icon="&#9654;" color="var(--accent)" items={fm.test_scenarios} />
            <Section title="Failure Examples" icon="&#9888;" color="var(--critical)" items={fm.failure_examples} />
            <Section title="Recommendations" icon="&#10003;" color="var(--pass)" items={fm.recommendations} />
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, color, items }) {
  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
        fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12,
        color, textTransform: "uppercase", letterSpacing: "0.08em"
      }}>
        <span>{icon}</span> {title}
      </div>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <li key={i} style={{
            background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "10px 12px",
            fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5,
            border: "1px solid var(--border)"
          }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProblemCard({ number, title, stat, statLabel, description, sourceUrl, sourceLabel, accentColor }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 16, padding: "28px",
      display: "flex", flexDirection: "column", gap: 16,
      position: "relative", overflow: "hidden",
      transition: "border-color 0.2s ease, transform 0.2s ease"
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{
        position: "absolute", top: 0, right: 0,
        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 80,
        color: "rgba(255,255,255,0.02)", lineHeight: 1, padding: "10px 20px"
      }}>
        {String(number).padStart(2, "0")}
      </div>

      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11, color: accentColor,
        letterSpacing: "0.1em", textTransform: "uppercase"
      }}>
        Problem {String(number).padStart(2, "0")}
      </div>

      <div>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 42,
          color: accentColor, lineHeight: 1,
          textShadow: `0 0 40px ${accentColor}66`
        }}>
          {stat}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          {statLabel}
        </div>
      </div>

      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18,
        color: "var(--text-primary)", lineHeight: 1.3
      }}>
        {title}
      </div>

      <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.7 }}>
        {description}
      </p>

      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--font-mono)", fontSize: 11, color: accentColor,
        background: `${accentColor}11`, border: `1px solid ${accentColor}33`,
        borderRadius: 6, padding: "6px 10px", alignSelf: "flex-start", marginTop: "auto"
      }}>
        <span>{sourceLabel}</span>
        <span>&#8599;</span>
      </a>
    </div>
  );
}

export default function App() {
  const [inputText, setInputText] = useState("");
  const [inputType, setInputType] = useState("system_prompt");
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const resultsRef = useRef(null);

  const loadingSteps = [
    "Parsing agent architecture...",
    "Generating adversarial scenarios...",
    "Evaluating failure mode resilience...",
    "Scoring multi-agent handoff integrity...",
    "Compiling diagnostic report...",
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % loadingSteps.length);
    }, 1400);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (report && resultsRef.current) {
      setTimeout(() => resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [report]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setLoadingStep(0);

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_text: inputText,
          input_type: inputType,
          agent_name: agentName || "Your Voice Agent"
        })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verdictColor = report ? (report.production_ready ? "var(--pass)" : "var(--critical)") : "var(--text-primary)";

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <GlowOrb style={{ width: 600, height: 600, top: -200, left: -200, background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)" }} />
      <GlowOrb style={{ width: 500, height: 500, top: 200, right: -200, background: "radial-gradient(circle, rgba(100,60,255,0.05) 0%, transparent 70%)" }} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,8,16,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 48px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "linear-gradient(135deg, var(--accent), #7b5fff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, fontFamily: "var(--font-display)"
          }}>C</div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>
            coval-agent-bench
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
          <a href="#problems" style={{ color: "var(--text-muted)" }}>problems</a>
          <a href="#solution" style={{ color: "var(--text-muted)" }}>solution</a>
          <a href="#evaluate" style={{ color: "var(--accent)" }}>evaluate</a>
          <a href="https://coval.ai" target="_blank" rel="noopener noreferrer"
            style={{
              color: "var(--bg)", background: "var(--accent)",
              padding: "5px 12px", borderRadius: 6, fontWeight: 500
            }}>
            coval.ai &#8599;
          </a>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 80px" }}>

        {/* HERO */}
        <section style={{ padding: "80px 0 60px", textAlign: "center", position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--accent)", background: "var(--accent-dim)",
            border: "1px solid var(--border-accent)",
            borderRadius: 20, padding: "5px 14px", marginBottom: 28,
            animation: "fadeUp 0.6s ease both"
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s infinite", display: "inline-block" }} />
            Built for Coval. Built to ship.
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "clamp(38px, 6vw, 68px)", lineHeight: 1.05,
            letterSpacing: "-0.03em", marginBottom: 20,
            animation: "fadeUp 0.6s ease 0.1s both"
          }}>
            The Agentic Evaluator<br />
            <span style={{
              background: "linear-gradient(90deg, var(--accent), #7b5fff, var(--accent))",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "gradientShift 4s ease infinite"
            }}>
              Coval Has Been Building Toward
            </span>
          </h1>

          <p style={{
            fontFamily: "var(--font-body)", fontSize: 18, color: "var(--text-secondary)",
            maxWidth: 640, margin: "0 auto 40px", lineHeight: 1.7,
            animation: "fadeUp 0.6s ease 0.2s both"
          }}>
            Paste your voice agent's system prompt. Get a full diagnostic report across 5 failure modes Coval
            documented publicly. No dashboard setup. No manual test scripting. Zero human in the loop.
          </p>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
            animation: "fadeUp 0.6s ease 0.3s both"
          }}>
            <a href="#evaluate" style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
              color: "var(--bg)", background: "var(--accent)",
              padding: "12px 28px", borderRadius: 10, border: "none",
              boxShadow: "0 0 40px rgba(0,212,255,0.3)",
              transition: "all 0.2s ease"
            }}>
              Run Evaluation &#8595;
            </a>
            <a href="#problems" style={{
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15,
              color: "var(--text-secondary)",
              padding: "12px 28px", borderRadius: 10,
              border: "1px solid var(--border)"
            }}>
              See the Problems
            </a>
          </div>
        </section>

        {/* WHAT THIS IS */}
        <section style={{
          background: "var(--bg-card)", border: "1px solid var(--border-accent)",
          borderRadius: 20, padding: "36px 40px", marginBottom: 80,
          animation: "fadeUp 0.6s ease 0.4s both"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr", gap: 32, alignItems: "center" }}>
            {[
              {
                icon: "&#9888;",
                title: "The Gap",
                text: "Coval's platform is powerful but fully manual. Customers set up every test scenario by hand. The product Brooke described publicly, a headless agentic Coval, does not exist yet."
              },
              { divider: true },
              {
                icon: "&#9654;",
                title: "What This Builds",
                text: "An AI agent that reads your voice agent's system prompt, auto-generates adversarial scenarios, runs evaluations across 5 documented failure modes, and returns a scored report automatically."
              },
              { divider: true },
              {
                icon: "&#10003;",
                title: "Why It Matters",
                text: "This is the exact product Coval needs to build next. Built by someone with production voice AI experience from Vosyn, using the same architecture Coval's engineering team would use."
              }
            ].map((item, i) => item.divider ? (
              <div key={i} style={{ width: 1, alignSelf: "stretch", background: "var(--border)" }} />
            ) : (
              <div key={i}>
                <div style={{ fontSize: 24, marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: item.icon }} />
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{item.title}</div>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.7 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROBLEMS SECTION */}
        <section id="problems" style={{ marginBottom: 80 }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)",
              letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12
            }}>
              Documented in Public
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38,
              letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 16
            }}>
              Five Problems Coval<br />Identified But Has Not Solved
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 560, lineHeight: 1.7 }}>
              These are not assumptions. Every problem below is sourced directly from Coval's own engineering blog.
              Each link opens the original post where the problem is documented.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            <ProblemCard
              number={1}
              title="Zero Evaluation Infrastructure in Production"
              stat="0"
              statLabel="evaluation infrastructure at most production deployments"
              description="Coval's own blog states that many production voice AI deployments have zero evaluation infrastructure. Not minimal. Not inadequate. Zero. Companies find out their agent is broken from customer complaints, not from tests."
              sourceUrl="https://www.coval.ai/blog/voice-ai-evaluation-infrastructure-why-most-teams-skip-it-and-how-to-build-it"
              sourceLabel="Coval Engineering Blog"
              accentColor="var(--critical)"
            />
            <ProblemCard
              number={2}
              title="Demo to Production Collapse Rate"
              stat="33%"
              statLabel="drop in performance from demo to production"
              description="95% of voice agent demos succeed. Only 62% survive production. That 33-point collapse happens because demos use ideal conditions. Production has background noise, accent diversity, frustrated users, and concurrent load. Nobody is testing for this gap systematically."
              sourceUrl="https://www.coval.ai/blog/voice-ai-testing-framework-why-95-of-demos-work-but-only-62-survive-production"
              sourceLabel="Coval: Demo vs Production Gap"
              accentColor="var(--warn)"
            />
            <ProblemCard
              number={3}
              title="Multi-Agent Handoff Failures Are Untested"
              stat="7"
              statLabel="documented multi-agent failure modes with no benchmark suite"
              description="Coval documented exactly 7 ways that multi-agent voice systems fail in production including context loss on handoff, hallucination cascades, and coordination breakdown. Despite documenting all 7, there is no runnable benchmark that automatically tests for them."
              sourceUrl="https://www.coval.ai/blog/why-multi-agent-voice-ai-systems-fail-7-common-pitfalls-and-how-to-avoid-them"
              sourceLabel="Coval: Multi-Agent Failures"
              accentColor="var(--critical)"
            />
            <ProblemCard
              number={4}
              title="Manual Test Setup Blocks Scale"
              stat="Hours"
              statLabel="wasted per engineer per deploy on manual testing"
              description="Engineers spend hours manually evaluating and playing whack-a-mole just to discover that fixing one issue introduces another. Coval's platform automates simulation but still requires a human to define every scenario. The setup overhead kills iteration speed."
              sourceUrl="https://www.ycombinator.com/companies/coval"
              sourceLabel="Coval YC Profile"
              accentColor="var(--warn)"
            />
            <ProblemCard
              number={5}
              title="No Agentic Headless Interface Exists"
              stat="0"
              statLabel="agentic, headless version of Coval built yet"
              description="In their own job posting, Coval describes the product they want next: a headless, agentic version of Coval that works without a human in the loop, with full access to the platform, optimized tool calling, and a memory layer. This product does not exist yet. This project is it."
              sourceUrl="https://www.coval.ai/careers"
              sourceLabel="Coval Careers Page"
              accentColor="var(--accent)"
            />
            <div style={{
              background: "var(--accent-dim)", border: "1px solid var(--border-accent)",
              borderRadius: 16, padding: 28,
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
              gap: 12, textAlign: "center"
            }}>
              <div style={{ fontSize: 32 }}>&#9679;&#9679;&#9679;</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--accent)" }}>
                All five problems. One solution.
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
                This project addresses every gap Coval documented, using the architecture described in their own job posting.
              </p>
            </div>
          </div>
        </section>

        {/* SOLUTION SECTION */}
        <section id="solution" style={{ marginBottom: 80 }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--pass)",
              letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12
            }}>
              The Solution
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38,
              letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 16
            }}>
              What This Evaluator Does
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              {
                step: "01",
                title: "Parse Agent Architecture",
                desc: "The engine reads your system prompt or conversation transcript and identifies your agent's domain, intent scope, and instruction anchors.",
                color: "var(--accent)"
              },
              {
                step: "02",
                title: "Auto-Generate Adversarial Scenarios",
                desc: "No manual test scripting. The AI generates adversarial scenarios tailored to your specific agent across all 5 failure mode categories.",
                color: "#7b5fff"
              },
              {
                step: "03",
                title: "Score Across 5 Failure Modes",
                desc: "Each failure mode gets an honest score from 0 to 100 using LLM-as-judge evaluation. Severity levels: PASS, WARNING, or CRITICAL.",
                color: "var(--warn)"
              },
              {
                step: "04",
                title: "Return Actionable Diagnostic Report",
                desc: "Specific failure examples, test scenarios, and fix recommendations for each category. A production readiness verdict. No dashboard required.",
                color: "var(--pass)"
              }
            ].map((item, i) => (
              <div key={i} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 16, padding: 28,
                display: "flex", gap: 20, alignItems: "flex-start",
                transition: "border-color 0.2s ease"
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32,
                  color: item.color, opacity: 0.5, flexShrink: 0, lineHeight: 1
                }}>
                  {item.step}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                    {item.title}
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.7 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EVALUATOR */}
        <section id="evaluate" style={{ marginBottom: 60 }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)",
              letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12
            }}>
              Live Demo
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38,
              letterSpacing: "-0.02em", lineHeight: 1.1
            }}>
              Evaluate Your Voice Agent
            </h2>
          </div>

          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-accent)",
            borderRadius: 20, padding: "36px"
          }}>
            {/* Agent Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block", fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8
              }}>
                Agent Name (optional)
              </label>
              <input
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                placeholder="e.g. MediCare Customer Service Agent"
                style={{
                  width: "100%", background: "var(--bg-surface)",
                  border: "1px solid var(--border)", borderRadius: 10,
                  padding: "12px 16px", color: "var(--text-primary)",
                  fontSize: 14, outline: "none",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={e => e.target.style.borderColor = "var(--border-accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {/* Input type toggle */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: "block", fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8
              }}>
                Input Type
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {["system_prompt", "transcript"].map(type => (
                  <button key={type} onClick={() => setInputType(type)} style={{
                    fontFamily: "var(--font-mono)", fontSize: 12, padding: "8px 16px",
                    borderRadius: 8, border: "1px solid",
                    borderColor: inputType === type ? "var(--accent)" : "var(--border)",
                    background: inputType === type ? "var(--accent-dim)" : "transparent",
                    color: inputType === type ? "var(--accent)" : "var(--text-muted)",
                    transition: "all 0.15s ease"
                  }}>
                    {type === "system_prompt" ? "System Prompt" : "Conversation Transcript"}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase"
                }}>
                  {inputType === "system_prompt" ? "Voice Agent System Prompt" : "Conversation Transcript"}
                </label>
                <button
                  onClick={() => setInputText(inputType === "system_prompt" ? SAMPLE_PROMPT : SAMPLE_TRANSCRIPT)}
                  style={{
                    fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)",
                    background: "var(--accent-dim)", border: "1px solid var(--border-accent)",
                    borderRadius: 6, padding: "4px 10px"
                  }}
                >
                  Load Sample
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={inputType === "system_prompt"
                  ? "Paste your voice agent's system prompt here..."
                  : "Paste a conversation transcript here..."}
                rows={10}
                style={{
                  width: "100%", background: "var(--bg-surface)",
                  border: "1px solid var(--border)", borderRadius: 12,
                  padding: "16px", color: "var(--text-primary)",
                  fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={e => e.target.style.borderColor = "var(--border-accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !inputText.trim()}
              style={{
                width: "100%", padding: "16px",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
                color: loading || !inputText.trim() ? "var(--text-muted)" : "var(--bg)",
                background: loading || !inputText.trim() ? "var(--bg-surface)" : "var(--accent)",
                border: `1px solid ${loading || !inputText.trim() ? "var(--border)" : "var(--accent)"}`,
                borderRadius: 12, transition: "all 0.2s ease",
                boxShadow: loading || !inputText.trim() ? "none" : "0 0 40px rgba(0,212,255,0.25)"
              }}
            >
              {loading ? "Analyzing..." : "Run Failure Mode Evaluation"}
            </button>

            {/* Loading state */}
            {loading && (
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <div style={{
                  display: "inline-block", width: 20, height: 20,
                  border: "2px solid var(--border)", borderTop: "2px solid var(--accent)",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 12
                }} />
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>
                  {loadingSteps[loadingStep]}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                marginTop: 16, padding: "14px 16px",
                background: "var(--critical-glow)", border: "1px solid rgba(255,68,68,0.3)",
                borderRadius: 10, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--critical)"
              }}>
                Error: {error}. Make sure the API server is running.
              </div>
            )}
          </div>
        </section>

        {/* RESULTS */}
        {report && (
          <section ref={resultsRef} style={{ animation: "fadeUp 0.5s ease both" }}>
            {/* Overall score header */}
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border-accent)",
              borderRadius: 20, padding: "36px 40px", marginBottom: 24,
              display: "flex", alignItems: "center", gap: 40
            }}>
              <ScoreRing score={report.overall_score} size={140} animate={true} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)",
                  letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8
                }}>
                  Evaluation Complete: {report.agent_name}
                </div>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26,
                  color: verdictColor, marginBottom: 12, lineHeight: 1.2
                }}>
                  {report.overall_verdict}
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 16, maxWidth: 580 }}>
                  {report.executive_summary}
                </p>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                  padding: "8px 18px", borderRadius: 8,
                  background: report.production_ready ? "var(--pass-glow)" : "var(--critical-glow)",
                  color: report.production_ready ? "var(--pass)" : "var(--critical)",
                  border: `1px solid ${report.production_ready ? "rgba(0,230,118,0.3)" : "rgba(255,68,68,0.3)"}`
                }}>
                  {report.production_ready ? "PRODUCTION READY" : "NOT PRODUCTION READY"}
                </div>
              </div>
            </div>

            {/* Top risks + actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 14,
                  color: "var(--critical)", display: "flex", alignItems: "center", gap: 8
                }}>
                  <span>&#9888;</span> Top Production Risks
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {report.top_risks.map((risk, i) => (
                    <li key={i} style={{
                      fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5,
                      paddingLeft: 12, borderLeft: "2px solid var(--critical)"
                    }}>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                <div style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, marginBottom: 14,
                  color: "var(--pass)", display: "flex", alignItems: "center", gap: 8
                }}>
                  <span>&#10148;</span> Immediate Actions
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {report.immediate_actions.map((action, i) => (
                    <li key={i} style={{
                      fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5,
                      paddingLeft: 12, borderLeft: "2px solid var(--pass)"
                    }}>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Failure mode cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20,
                marginBottom: 4, letterSpacing: "-0.01em"
              }}>
                Failure Mode Breakdown
              </div>
              {report.failure_modes.map((fm, i) => (
                <FailureModeCard key={fm.id} fm={fm} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid var(--border)", padding: "28px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)"
        }}>
          Built by Jafar
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)",
          display: "flex", gap: 16
        }}>
          <a href="https://github.com/Jafar-97" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)" }}>
            github.com/Jafar-97
          </a>
          <span>|</span>
          <a href="https://coval.ai" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-muted)" }}>
            coval.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
