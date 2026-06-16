import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client ────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ermdfruqryohphtqqpek.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybWRmcnVxcnlvaHBodHFxcGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Njg4MDYsImV4cCI6MjA5NzE0NDgwNn0.71XF0T_niHbysNVhP-OpmiyuMj_jqTaTjGCO0MMtpKk";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Model definitions ───────────────────────────────────────────────────────
const MODELS = [
  { id: "claude-sonnet-4-6",       name: "Claude Sonnet 4.6",  provider: "Anthropic", cost: "$$",   free: false, badge: "Best"    },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", provider: "Anthropic", cost: "$",    free: false, badge: "Fast"    },
  { id: "gemini-1.5-flash",        name: "Gemini 1.5 Flash",   provider: "Google",    cost: "Free", free: true,  badge: "Free"    },
  { id: "gemini-1.5-pro",          name: "Gemini 1.5 Pro",     provider: "Google",    cost: "$$",   free: false, badge: "Smart"   },
  { id: "gpt-4o-mini",             name: "GPT-4o Mini",        provider: "OpenAI",    cost: "$",    free: false, badge: "Fast"    },
  { id: "gpt-4o",                  name: "GPT-4o",             provider: "OpenAI",    cost: "$$$",  free: false, badge: "Premium" },
  { id: "groq-llama3-70b",         name: "Llama 3 70B",        provider: "Groq",      cost: "Free", free: true,  badge: "Free"    },
  { id: "groq-mixtral",            name: "Mixtral 8x7B",       provider: "Groq",      cost: "Free", free: true,  badge: "Free"    },
  { id: "mistral-small",           name: "Mistral Small",      provider: "Mistral",   cost: "$",    free: false, badge: "Lean"    },
  { id: "cohere-command",          name: "Command R+",         provider: "Cohere",    cost: "$$",   free: false, badge: "RAG"     },
];

const STATUS_COLOR = { active:"#10b981", idle:"#64748b", waiting:"#f59e0b", offline:"#ef4444", planning:"#3b82f6", blocked:"#ef4444", completed:"#10b981", cancelled:"#64748b" };
const DEPT_COLOR   = { executive:"#3b82f6", dev:"#06b6d4", marketing:"#f59e0b", ops:"#10b981" };

// ─── AI caller — proxied through Supabase Edge Functions ─────────────────────
const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;

async function callAI(prompt, modelId, _apiKeys = {}, agentId = null, projectId = null) {
  try {
    const r = await fetch(`${EDGE_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ prompt, modelId, agentId, projectId }),
    });
    const d = await r.json();
    return d.response || simulateAI(prompt, modelId);
  } catch { return simulateAI(prompt, modelId); }
}

function simulateAI(prompt, model) {
  const p = prompt.toLowerCase();
  if (p.includes("decompose") || p.includes("tasks") || p.includes("project")) {
    const name = (prompt.match(/Project: "([^"]+)"/) || [])[1] || "New Project";
    return `✅ Tasks created for "${name}"\n\n• Define scope & requirements → Project Manager → 2h\n• Architecture design → Solution Architect → 4h\n• UI wireframes & prototypes → UI/UX Designer → 6h\n• Frontend implementation → Frontend Developer → 10h\n• Backend API development → Backend Developer → 10h\n• Database schema setup → Database Engineer → 3h\n• QA test suite → QA Engineer → 4h\n• CI/CD pipeline → DevOps Engineer → 2h\n\n8 tasks queued. Agents starting now. [simulated — add API key in Models tab]`;
  }
  if (p.includes("status")) return `📊 Platform Status\n\n• 4 active projects, 43 tasks in progress\n• E-commerce Rebrand: 72% — on track\n• API Platform v2: 44% — BLOCKED on deploy approval\n• Q3 SEO Campaign: 18% — content phase\n• Customer Portal: 91% — UAT starting\n\n⚠️ 3 approvals need your decision. [simulated — add API key for live AI]`;
  if (p.includes("block")) return `🚧 Blockers\n\n1. API v2 deploy approval — 4 tasks stalled (18h)\n2. SEMrush access — SEO campaign paused\n3. Brand palette approval — marketing assets blocked\n\nRecommend: approve API deploy first. [simulated]`;
  if (p.includes("idle")) return `💤 3 agents available now\n\n• Database Engineer — waiting for schema approval\n• Email Marketing Spec — waiting for content drafts\n• Documentation Spec — waiting for API specs\n\nAssign them to a new project? [simulated]`;
  return `I've received your request and am coordinating the relevant agents. Dashboard will update shortly. [Simulated response — add your API key in the Models tab for live AI]`;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0e1a;--bg2:#111827;--bg3:#1a2235;--bg4:#1e2d42;
  --border:rgba(99,179,237,0.1);--border2:rgba(99,179,237,0.2);
  --text:#e2e8f0;--text2:#94a3b8;--text3:#64748b;
  --accent:#3b82f6;--accent2:#60a5fa;
  --green:#10b981;--amber:#f59e0b;--red:#ef4444;--purple:#8b5cf6;--teal:#06b6d4;
  --r:10px;--rs:6px;
}
body{background:var(--bg);color:var(--text);font-family:-apple-system,sans-serif;font-size:13px;line-height:1.5;overflow:hidden}
.app{display:flex;height:100vh}
/* Sidebar */
.sidebar{width:216px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.logo{padding:14px 16px;border-bottom:1px solid var(--border)}
.logo-name{font-size:17px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.logo-sub{font-size:10px;color:var(--text3);letter-spacing:.08em;text-transform:uppercase}
.nav{padding:8px 6px;flex:1;overflow-y:auto}
.nav-section{margin-bottom:8px}
.nav-label{font-size:10px;color:var(--text3);letter-spacing:.08em;text-transform:uppercase;padding:4px 10px 2px}
.nav-btn{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:var(--rs);cursor:pointer;color:var(--text2);font-size:12px;border:none;background:none;width:100%;text-align:left;transition:all .15s}
.nav-btn:hover{background:var(--bg3);color:var(--text)}
.nav-btn.active{background:rgba(59,130,246,.15);color:var(--accent2)}
.nav-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.badge-count{background:var(--red);color:#fff;border-radius:10px;padding:1px 5px;font-size:9px;font-weight:700;margin-left:auto}
.sidebar-footer{padding:12px;border-top:1px solid var(--border);font-size:11px}
.sf-row{display:flex;justify-content:space-between;align-items:center;color:var(--text3);margin-bottom:3px}
.sf-val{color:var(--green);font-size:10px}
/* Main */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{display:flex;align-items:center;gap:10px;padding:8px 18px;border-bottom:1px solid var(--border);background:var(--bg2);flex-shrink:0}
.topbar-title{font-size:14px;font-weight:600;flex:1}
select.model-sel{background:var(--bg3);border:1px solid var(--border2);color:var(--text2);font-size:11px;padding:5px 8px;border-radius:var(--rs);cursor:pointer}
.content{flex:1;overflow-y:auto;padding:18px}
/* Buttons */
.btn{padding:6px 14px;border-radius:var(--rs);border:none;cursor:pointer;font-size:12px;font-weight:500;transition:all .15s}
.btn-primary{background:var(--accent);color:#fff}.btn-primary:hover{background:#2563eb}
.btn-ghost{background:var(--bg3);border:1px solid var(--border2);color:var(--text2)}.btn-ghost:hover{color:var(--text)}
.btn-sm{padding:4px 10px;font-size:11px}
.btn-approve{background:rgba(16,185,129,.15);color:var(--green);border:1px solid rgba(16,185,129,.3);padding:4px 10px;border-radius:var(--rs);cursor:pointer;font-size:11px;font-weight:500}
.btn-reject{background:rgba(239,68,68,.1);color:var(--red);border:1px solid rgba(239,68,68,.2);padding:4px 10px;border-radius:var(--rs);cursor:pointer;font-size:11px;font-weight:500}
/* Cards */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:16px}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.card-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text)}
/* Grid */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
/* Metric */
.metric{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:14px}
.metric-label{font-size:11px;color:var(--text3);margin-bottom:6px}
.metric-val{font-size:26px;font-weight:700;line-height:1;margin-bottom:4px}
.metric-sub{font-size:11px;color:var(--text3)}
/* Badge */
.badge{display:inline-flex;align-items:center;font-size:10px;font-weight:500;padding:2px 7px;border-radius:10px}
.bg-green{background:rgba(16,185,129,.15);color:var(--green)}
.bg-amber{background:rgba(245,158,11,.15);color:var(--amber)}
.bg-red{background:rgba(239,68,68,.15);color:var(--red)}
.bg-blue{background:rgba(59,130,246,.15);color:var(--accent2)}
.bg-purple{background:rgba(139,92,246,.15);color:var(--purple)}
.bg-teal{background:rgba(6,182,212,.15);color:var(--teal)}
.bg-gray{background:rgba(100,116,139,.15);color:var(--text3)}
/* Progress */
.prog{height:3px;background:var(--bg4);border-radius:2px;overflow:hidden}
.prog-fill{height:100%;border-radius:2px;transition:width .8s}
/* Pulse */
.pulse{display:inline-block;width:6px;height:6px;border-radius:50%;flex-shrink:0}
.pulse-on{background:var(--green);animation:blink 1.5s infinite}
.pulse-wait{background:var(--amber);animation:blink 1.5s infinite}
.pulse-off{background:var(--text3)}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
/* Rows */
.row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)}
.row:last-child{border-bottom:none}
/* Agent card */
.agent-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);padding:11px;display:flex;gap:10px}
.agent-avatar{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
.agent-name{font-size:12px;font-weight:600;margin-bottom:1px}
.agent-dept{font-size:10px;color:var(--text3);margin-bottom:5px}
.agent-task{font-size:11px;color:var(--text2);line-height:1.4}
/* Chat */
.chat-wrap{max-width:800px}
.log-area{background:var(--bg);border-radius:var(--rs);padding:12px;height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:10px}
.log-msg{display:flex;gap:8px;animation:fadein .3s}
@keyframes fadein{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.log-avatar{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.log-bubble{background:var(--bg3);border-radius:0 8px 8px 8px;padding:8px 11px;max-width:85%}
.log-bubble.ceo-bubble{background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);border-radius:8px 0 8px 8px;margin-left:auto}
.log-sender{font-size:10px;color:var(--text3);margin-bottom:3px}
.log-text{font-size:12px;color:var(--text2);line-height:1.6;white-space:pre-wrap}
.chat-input{flex:1;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--rs);padding:8px 12px;font-size:12px;outline:none}
.chat-input:focus{border-color:var(--accent)}
.chat-input::placeholder{color:var(--text3)}
.typing span{display:inline-block;width:5px;height:5px;background:var(--text3);border-radius:50%;animation:bounce 1.2s infinite;margin-right:2px}
.typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}
@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
/* Form */
.form-group{margin-bottom:12px}
.form-label{font-size:11px;color:var(--text2);margin-bottom:5px;display:block}
.form-input{width:100%;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--rs);padding:7px 10px;font-size:12px;font-family:inherit;outline:none}
.form-input:focus{border-color:var(--accent)}
textarea.form-input{resize:vertical;min-height:72px}
/* Tabs */
.tab-row{display:flex;gap:2px;border-bottom:1px solid var(--border);margin-bottom:16px}
.tab{padding:7px 14px;border:none;background:none;color:var(--text3);cursor:pointer;font-size:12px;border-bottom:2px solid transparent;margin-bottom:-1px}
.tab.active{color:var(--accent2);border-bottom-color:var(--accent)}
/* Activity */
.act-line{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;color:var(--text2)}
.act-line:last-child{border-bottom:none}
.act-time{font-size:10px;color:var(--text3);min-width:38px}
/* Model card */
.model-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--rs);padding:11px;cursor:pointer;transition:all .15s}
.model-card.sel{border-color:var(--accent);background:rgba(59,130,246,.08)}
.model-card:hover{border-color:var(--border2)}
/* Scrollbar */
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:4px}
/* Toast */
.toast{position:fixed;bottom:20px;right:20px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--r);padding:12px 16px;font-size:12px;color:var(--text);z-index:999;animation:fadein .3s}
/* Modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:100;display:flex;align-items:center;justify-content:center}
.modal{background:var(--bg2);border:1px solid var(--border2);border-radius:14px;padding:22px;width:460px;max-width:95vw;max-height:90vh;overflow-y:auto}
.modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.modal-title{font-size:15px;font-weight:600}
.gap{margin-bottom:14px}
`;

// ─── Main component ───────────────────────────────────────────────────────────
export default function AIEmployee() {
  const [page, setPage] = useState("dashboard");
  const [agents, setAgents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [activity, setActivity] = useState([]);
  const [agentRuns, setAgentRuns] = useState([]);
  const [modelConfigs, setModelConfigs] = useState({});
  const [globalModel, setGlobalModel] = useState("claude-sonnet-4-6");
  const [apiKeys, setApiKeys] = useState({ anthropic: "", google: "", groq: "", openai: "", mistral: "", cohere: "" });
  const [chatMessages, setChatMessages] = useState([{ role: "coo", text: "Good morning, CEO. All agents are online. 4 active projects, 3 approvals pending. What would you like to focus on?" }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [agentFilter, setAgentFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  // ── Load data ──
  useEffect(() => {
    loadAll();
    // Realtime subscriptions
    const ch = supabase.channel("aiemployee-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_feed" }, p => {
        setActivity(prev => [p.new, ...prev].slice(0, 50));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => loadProjects())
      .on("postgres_changes", { event: "*", schema: "public", table: "approvals" }, () => loadApprovals())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadAgents(), loadProjects(), loadApprovals(), loadActivity(), loadAgentRuns(), loadModelConfigs()]);
    setLoading(false);
  }

  async function loadAgents() {
    const { data } = await supabase.from("agents").select("*").order("department").order("name");
    if (data) setAgents(data);
  }
  async function loadProjects() {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (data) setProjects(data);
  }
  async function loadApprovals() {
    const { data } = await supabase.from("approvals").select("*").eq("status", "pending").order("requested_at", { ascending: false });
    if (data) setApprovals(data);
  }
  async function loadActivity() {
    const { data } = await supabase.from("activity_feed").select("*").order("created_at", { ascending: false }).limit(30);
    if (data) setActivity(data);
  }
  async function loadAgentRuns() {
    const { data } = await supabase.from("agent_runs").select("*").order("started_at", { ascending: false }).limit(40);
    if (data) setAgentRuns(data);
  }
  async function loadModelConfigs() {
    const { data } = await supabase.from("model_configs").select("*");
    if (data) {
      const map = {};
      data.forEach(r => { map[r.department] = r.model_id; });
      setModelConfigs(map);
    }
  }

  // ── Chat ──
  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages(p => [...p, { role: "ceo", text: msg }]);
    setChatLoading(true);

    const projectSummary = projects.map(p => `${p.name} (${p.progress}%, ${p.status})`).join(", ");
    const pendingCount = approvals.length;
    const activeAgents = agents.filter(a => a.status === "active").length;

    const prompt = `You are the COO Agent in AI Employee, an AI workforce platform with ${agents.length} specialist agents.\n\nCurrent state:\n- Projects: ${projectSummary}\n- Pending approvals: ${pendingCount}\n- Active agents: ${activeAgents}/${agents.length}\n\nCEO says: "${msg}"\n\nRespond concisely and professionally. Use bullet points for lists.`;

    const model = modelConfigs.executive || globalModel;
    const response = await callAI(prompt, model, apiKeys);

    // Log to Supabase
    const cooAgent = agents.find(a => a.role === "Chief Operating Officer");
    if (cooAgent) {
      await supabase.from("agent_runs").insert({ agent_id: cooAgent.id, model_used: model, prompt_sent: prompt, response_received: response, status: "completed" });
      await supabase.from("activity_feed").insert({ agent_id: cooAgent.id, event_type: "coo_chat", message: `COO responded to CEO: "${msg.slice(0, 60)}..."` });
    }

    setChatMessages(p => [...p, { role: "coo", text: response }]);
    setChatLoading(false);
  }

  // ── New project — delegates to edge function ──
  async function createProject(form) {
    const { name, goal, teams, priority, model } = form;
    if (!name.trim() || !goal.trim()) return null;
    try {
      const r = await fetch(`${EDGE_BASE}/create-project`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
        body: JSON.stringify({ name, goal, teams, priority, model: model || globalModel }),
      });
      const d = await r.json();
      if (d.error) { showToast("❌ " + d.error); return null; }
      await loadProjects();
      showToast("✅ Project launched! COO is decomposing tasks.");
      return d.plan;
    } catch (e) { showToast("❌ " + e.message); return null; }
  }

  // ── Approval — delegates to edge function ──
  async function handleApproval(id, approved) {
    await fetch(`${EDGE_BASE}/handle-approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ id, approved }),
    });
    loadApprovals();
    showToast(approved ? "✅ Approved — agents notified" : "✗ Rejected — agents notified");
  }

  // ── Model config update ──
  async function updateModelConfig(dept, modelId) {
    await supabase.from("model_configs").upsert({ department: dept, model_id: modelId, provider: MODELS.find(m => m.id === modelId)?.provider || "unknown", updated_at: new Date().toISOString() });
    setModelConfigs(p => ({ ...p, [dept]: modelId }));
    showToast("✅ Model updated for " + dept);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function nav(id) { setPage(id); }

  const filteredAgents = agentFilter === "all" ? agents : agents.filter(a => a.department === agentFilter);
  const activeCount = agents.filter(a => a.status === "active").length;
  const pendingApprovals = approvals.length;
  const activeProjects = projects.filter(p => p.status === "active" || p.status === "blocked").length;
  const totalTasks = 43; // from seed

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0e1a", color: "#60a5fa", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 32 }}>⚡</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>Connecting to AI Employee...</div>
      <div style={{ fontSize: 11, color: "#64748b" }}>Loading agents & projects from Supabase</div>
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* ── Sidebar ── */}
        <div className="sidebar">
          <div className="logo">
            <div className="logo-name">AI Employee</div>
            <div className="logo-sub">AI Workforce · Supabase</div>
          </div>
          <div className="nav">
            <div className="nav-section">
              <div className="nav-label">Command</div>
              {[["dashboard","🏠","Dashboard"],["agents","🤖","Agents"],["projects","📁","Projects"],["chat","💬","Ask AI Employee"]].map(([id,icon,label]) => (
                <button key={id} className={`nav-btn ${page===id?"active":""}`} onClick={() => nav(id)}>
                  <span className="nav-dot" style={{ background: page===id?"var(--accent)":"var(--text3)" }}/>
                  {icon} {label}
                  {id==="agents" && <span className="badge-count" style={{ background: "var(--purple)" }}>{agents.length}</span>}
                </button>
              ))}
            </div>
            <div className="nav-section">
              <div className="nav-label">Manage</div>
              {[["models","⚡","AI Models"],["approvals","✅","Approvals"],["audit","📋","Audit Log"]].map(([id,icon,label]) => (
                <button key={id} className={`nav-btn ${page===id?"active":""}`} onClick={() => nav(id)}>
                  <span className="nav-dot" style={{ background: page===id?"var(--accent)":"var(--text3)" }}/>
                  {icon} {label}
                  {id==="approvals" && pendingApprovals > 0 && <span className="badge-count">{pendingApprovals}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="sidebar-footer">
            <div className="sf-row"><span>Platform</span><span className="sf-val">● Live</span></div>
            <div className="sf-row"><span>Agents</span><span style={{ color: "var(--green)", fontSize: 10 }}>{activeCount}/{agents.length} active</span></div>
            <div className="sf-row"><span>Database</span><span style={{ color: "var(--teal)", fontSize: 10 }}>Supabase ✓</span></div>
            <div className="sf-row"><span>Model</span><span style={{ color: "var(--accent2)", fontSize: 10 }}>{globalModel.replace("claude-","cl-").replace("-4-6","").replace("groq-","")}</span></div>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">
              {{ dashboard:"CEO Dashboard", agents:"Agent Team", projects:"All Projects", chat:"Ask AI Employee", models:"AI Model Router", approvals:"Pending Approvals", audit:"Audit Log" }[page]}
            </div>
            <select className="model-sel" value={globalModel} onChange={e => setGlobalModel(e.target.value)}>
              {MODELS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.provider}) {m.free?"· Free":""}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
          </div>

          <div className="content">

            {/* ── DASHBOARD ── */}
            {page === "dashboard" && <Dashboard projects={projects} agents={agents} approvals={approvals} activity={activity} activeCount={activeCount} totalTasks={totalTasks} globalModel={globalModel} apiKeys={apiKeys} modelConfigs={modelConfigs} onApprove={handleApproval} onNewProject={() => setShowModal(true)} showToast={showToast} supabase={supabase} />}

            {/* ── AGENTS ── */}
            {page === "agents" && (
              <div>
                <div className="tab-row">
                  {[["all","All"],["executive","Executive"],["dev","Dev Team"],["marketing","Marketing"],["ops","Ops"]].map(([f,l]) => (
                    <button key={f} className={`tab ${agentFilter===f?"active":""}`} onClick={() => setAgentFilter(f)}>{l} {f==="all"?`(${agents.length})`:""}</button>
                  ))}
                </div>
                <div className="g3">
                  {filteredAgents.map(a => (
                    <div key={a.id} className="agent-card">
                      <div className="agent-avatar" style={{ background: (a.color||"#3b82f6")+"22" }}>{a.emoji}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="agent-name">{a.name}</div>
                        <div className="agent-dept">{a.department.toUpperCase()} · {MODELS.find(m=>m.id===a.preferred_model)?.name||a.preferred_model}</div>
                        <div className="agent-task">
                          <span className={`pulse pulse-${a.status==="active"?"on":a.status==="waiting"?"wait":"off"}`} style={{ marginRight:5 }}/>
                          {a.current_task || <span style={{ color:"var(--text3)" }}>Idle — ready for tasks</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PROJECTS ── */}
            {page === "projects" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                  <span style={{ color:"var(--text2)", fontSize:12 }}>{projects.length} projects total · {activeProjects} active</span>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ New Project</button>
                </div>
                {projects.map(p => <ProjectRow key={p.id} project={p} agents={agents} supabase={supabase} onUpdate={loadProjects} showToast={showToast}/>)}
              </div>
            )}

            {/* ── CHAT ── */}
            {page === "chat" && (
              <div className="chat-wrap">
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">Talk to COO Agent</div>
                    <span className="badge bg-green"><span className="pulse pulse-on" style={{ marginRight:5 }}/>Live · {globalModel}</span>
                  </div>
                  <div className="log-area">
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`log-msg ${m.role==="ceo"?"":"" }`} style={{ flexDirection: m.role==="ceo"?"row-reverse":"row" }}>
                        <div className="log-avatar" style={{ background: m.role==="ceo"?"rgba(59,130,246,.2)":"rgba(139,92,246,.2)", color: m.role==="ceo"?"var(--accent2)":"var(--purple)" }}>{m.role==="ceo"?"👤":"🤖"}</div>
                        <div className={`log-bubble ${m.role==="ceo"?"ceo-bubble":""}`}>
                          <div className="log-sender">{m.role==="ceo"?"CEO · You":"COO Agent · AI Employee"}</div>
                          <div className="log-text">{m.text}</div>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="log-msg">
                        <div className="log-avatar" style={{ background:"rgba(139,92,246,.2)", color:"var(--purple)" }}>🤖</div>
                        <div className="log-bubble"><div className="log-sender">COO Agent</div><div className="log-text typing"><span/><span/><span/></div></div>
                      </div>
                    )}
                    <div ref={chatEndRef}/>
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:10 }}>
                    <input className="chat-input" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&sendChat()} placeholder="Give a goal, ask for status, request a report..."/>
                    <button className="btn btn-primary" onClick={sendChat}>Send</button>
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
                    {["Status report on all projects","What's blocked and why?","Which agents are idle?","Weekly output summary"].map(q => (
                      <button key={q} className="btn btn-ghost btn-sm" onClick={() => { setChatInput(q); }}>{q}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── MODELS ── */}
            {page === "models" && <ModelsPage modelConfigs={modelConfigs} apiKeys={apiKeys} setApiKeys={setApiKeys} onUpdateModel={updateModelConfig} showToast={showToast}/>}

            {/* ── APPROVALS ── */}
            {page === "approvals" && <ApprovalsPage approvals={approvals} onApprove={handleApproval} supabase={supabase} onUpdate={loadApprovals}/>}

            {/* ── AUDIT ── */}
            {page === "audit" && <AuditPage agentRuns={agentRuns} activity={activity} agents={agents}/>}

          </div>
        </div>
      </div>

      {/* ── New Project Modal ── */}
      {showModal && <NewProjectModal agents={agents} globalModel={globalModel} onClose={() => setShowModal(false)} onCreate={createProject} supabase={supabase}/>}

      {/* ── Toast ── */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ projects, agents, approvals, activity, activeCount, totalTasks, globalModel, apiKeys, modelConfigs, onApprove, onNewProject, showToast, supabase }) {
  const [brief, setBrief] = useState("");
  const [briefResult, setBriefResult] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);

  async function quickLaunch() {
    if (!brief.trim()) return;
    setBriefLoading(true);
    const model = modelConfigs.executive || globalModel;
    const response = await callAI(`You are the COO of AI Employee. The CEO gave this goal: "${brief}". Create a concise 6-task breakdown with agent assignments. Be specific.`, model, apiKeys);
    setBriefResult(response);
    await supabase.from("projects").insert({ name: brief.slice(0, 60), goal: brief, teams: ["all"], status: "active", priority: "medium", progress: 0, preferred_model: model });
    await supabase.from("activity_feed").insert({ event_type: "project_created", message: `Quick project launched: "${brief.slice(0,50)}"` });
    setBriefLoading(false);
    showToast("✅ Project launched!");
  }

  return (
    <div>
      <div className="g4 gap">
        <div className="metric"><div className="metric-label">Active Projects</div><div className="metric-val" style={{color:"var(--accent2)"}}>{projects.filter(p=>p.status!=="completed"&&p.status!=="cancelled").length}</div><div className="metric-sub">across all teams</div></div>
        <div className="metric"><div className="metric-label">Tasks in Progress</div><div className="metric-val" style={{color:"var(--green)"}}>{totalTasks}</div><div className="metric-sub">12 completing today</div></div>
        <div className="metric"><div className="metric-label">Pending Approvals</div><div className="metric-val" style={{color:approvals.length?"var(--amber)":"var(--green)"}}>{approvals.length}</div><div className="metric-sub">{approvals.length?"action needed":"all clear"}</div></div>
        <div className="metric"><div className="metric-label">Agents Active</div><div className="metric-val" style={{color:"var(--purple)"}}>{activeCount}<span style={{fontSize:14,color:"var(--text3)"}}>/{agents.length}</span></div><div className="metric-sub">{agents.length-activeCount} idle, ready</div></div>
      </div>
      <div className="g2 gap">
        <div className="card">
          <div className="card-head"><div className="card-title">Active Projects</div></div>
          {projects.slice(0,5).map(p => (
            <div key={p.id} className="row">
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{fontSize:10,color:"var(--text3)"}}>{(p.teams||[]).join(", ")} · {p.preferred_model}</div>
              </div>
              <span className="badge" style={{background:STATUS_COLOR[p.status]+"22",color:STATUS_COLOR[p.status],minWidth:62,justifyContent:"center"}}>{p.status}</span>
              <div style={{display:"flex",alignItems:"center",gap:5,minWidth:72}}>
                <div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:p.progress+"%",background:p.status==="blocked"?"var(--amber)":"var(--green)"}}/></div>
                <span style={{fontSize:10,color:"var(--text3)"}}>{p.progress}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">Live Agent Activity</div></div>
          {activity.slice(0,8).map((a,i) => (
            <div key={i} className="act-line">
              <span className="pulse pulse-on"/>
              <span style={{color:"var(--accent2)",fontWeight:500,minWidth:80,fontSize:10}}>{a.event_type}</span>
              <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.message}</span>
              <span className="act-time">{new Date(a.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-head"><div className="card-title">Pending Approvals</div></div>
          {approvals.length === 0 && <div style={{color:"var(--text3)",fontSize:12,padding:"8px 0"}}>No pending approvals — all clear!</div>}
          {approvals.slice(0,3).map(a => (
            <div key={a.id} className="row" style={{flexWrap:"wrap",gap:8}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500}}>{a.title}</div>
                <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>{a.decision_type}{a.amount_usd?` · $${a.amount_usd}`:""}</div>
              </div>
              <div style={{display:"flex",gap:5}}>
                <button className="btn-approve" onClick={() => onApprove(a.id, true)}>✓ Approve</button>
                <button className="btn-reject" onClick={() => onApprove(a.id, false)}>✗ Reject</button>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">Quick Project Launch</div></div>
          <div className="form-group">
            <label className="form-label">Tell AI Employee what to build or achieve</label>
            <textarea className="form-input" value={brief} onChange={e => setBrief(e.target.value)} placeholder="e.g. Build a landing page for our new product with email capture and analytics..."/>
          </div>
          <button className="btn btn-primary" onClick={quickLaunch} disabled={briefLoading} style={{width:"100%"}}>
            {briefLoading ? "COO is planning..." : "Launch with all teams →"}
          </button>
          {briefResult && <div style={{marginTop:10,padding:10,background:"var(--bg3)",borderRadius:"var(--rs)",fontSize:11,color:"var(--text2)",whiteSpace:"pre-wrap",maxHeight:160,overflowY:"auto"}}>{briefResult}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Project Row ──────────────────────────────────────────────────────────────
function ProjectRow({ project: p, agents, supabase, onUpdate, showToast }) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  async function loadTasks() {
    if (!open) {
      const { data } = await supabase.from("tasks").select("*").eq("project_id", p.id).order("priority");
      if (data) setTasks(data);
    }
    setOpen(!open);
  }

  return (
    <div className="card gap">
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <div style={{fontSize:13,fontWeight:600}}>{p.name}</div>
            <span className="badge" style={{background:STATUS_COLOR[p.status]+"22",color:STATUS_COLOR[p.status]}}>{p.status}</span>
            <span className="badge" style={{background:p.priority==="high"?"rgba(245,158,11,.15)":"var(--bg4)",color:p.priority==="high"?"var(--amber)":"var(--text3)"}}>{p.priority}</span>
          </div>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:8}}>{p.goal}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div className="prog" style={{flex:1}}><div className="prog-fill" style={{width:p.progress+"%",background:p.status==="blocked"?"var(--amber)":"var(--green)"}}/></div>
            <span style={{fontSize:11,color:"var(--text3)"}}>{p.progress}%</span>
            <span style={{fontSize:10,color:"var(--text3)"}}>{MODELS.find(m=>m.id===p.preferred_model)?.name||p.preferred_model}</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadTasks}>{open?"Hide":"Tasks"}</button>
      </div>
      {open && (
        <div style={{marginTop:12,borderTop:"1px solid var(--border)",paddingTop:12}}>
          {tasks.length === 0 ? <div style={{fontSize:11,color:"var(--text3)"}}>No tasks yet — COO will generate them automatically.</div>
            : tasks.map(t => (
              <div key={t.id} className="row">
                <div style={{width:8,height:8,borderRadius:2,background:STATUS_COLOR[t.status]||"var(--text3)",flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:12}}>{t.title}</div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>{t.status}</div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Models Page ──────────────────────────────────────────────────────────────
function ModelsPage({ modelConfigs, apiKeys, setApiKeys, onUpdateModel, showToast }) {
  const depts = [
    { id:"executive", label:"Executive Team (COO · PM · PdM)" },
    { id:"dev",       label:"Dev Team (8 agents)" },
    { id:"marketing", label:"Marketing Team (5 agents)" },
    { id:"ops",       label:"Ops Team (3 agents)" },
  ];
  return (
    <div>
      <div className="g2 gap">
        {depts.map(d => (
          <div key={d.id} className="card">
            <div className="card-head"><div className="card-title">{d.label}</div></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {MODELS.map(m => (
                <div key={m.id} className={`model-card ${(modelConfigs[d.id]||"claude-sonnet-4-6")===m.id?"sel":""}`} onClick={() => onUpdateModel(d.id, m.id)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--text)"}}>{m.name}</div>
                    <span className="badge" style={{background:m.free?"rgba(16,185,129,.15)":"rgba(59,130,246,.15)",color:m.free?"var(--green)":"var(--accent2)"}}>{m.badge}</span>
                  </div>
                  <div style={{fontSize:10,color:"var(--text3)"}}>{m.provider} · {m.cost}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">API Keys</div><span className="badge bg-gray">Stored in session only</span></div>
        <div className="g2">
          {[["anthropic","Anthropic (Claude)","sk-ant-..."],["google","Google (Gemini) — Free tier available","AIza..."],["groq","Groq (Llama, Mixtral) — Free","gsk_..."],["openai","OpenAI (GPT-4o)","sk-..."],["mistral","Mistral","..."],["cohere","Cohere","..."]].map(([k,label,ph]) => (
            <div key={k} className="form-group" style={{margin:0}}>
              <label className="form-label">{label}</label>
              <input type="password" className="form-input" placeholder={ph} value={apiKeys[k]||""} onChange={e => setApiKeys(p => ({...p,[k]:e.target.value}))}/>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{marginTop:12}} onClick={() => showToast("✅ Keys saved for this session")}>Save Keys</button>
      </div>
    </div>
  );
}

// ─── Approvals Page ───────────────────────────────────────────────────────────
function ApprovalsPage({ approvals, onApprove, supabase, onUpdate }) {
  const [autoRules, setAutoRules] = useState({ staging:"auto", spend:500, production:"always" });

  return (
    <div>
      <div className="card gap">
        <div className="card-head"><div className="card-title">Pending Approvals</div><span className="badge bg-red">{approvals.length} pending</span></div>
        {approvals.length === 0 && <div style={{color:"var(--text3)",fontSize:12,padding:"12px 0"}}>✅ No pending approvals — all clear!</div>}
        {approvals.map(a => (
          <div key={a.id} className="row" style={{flexWrap:"wrap",gap:10}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:500}}>{a.title}</div>
              <div style={{fontSize:11,color:"var(--text3)",marginTop:2}}>{a.decision_type}{a.amount_usd?` · $${Number(a.amount_usd).toLocaleString()}`:""} · {new Date(a.requested_at).toLocaleDateString()}</div>
              {a.description && <div style={{fontSize:11,color:"var(--text2)",marginTop:4}}>{a.description}</div>}
            </div>
            <div style={{display:"flex",gap:6}}>
              <button className="btn-approve" onClick={() => onApprove(a.id, true)}>✓ Approve</button>
              <button className="btn-reject" onClick={() => onApprove(a.id, false)}>✗ Reject</button>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">Auto-Approval Rules</div></div>
        <div className="g2">
          <div className="form-group">
            <label className="form-label">Staging deployments</label>
            <select className="form-input" value={autoRules.staging} onChange={e => setAutoRules(p=>({...p,staging:e.target.value}))}>
              <option value="auto">Always auto-approve</option>
              <option value="tests">Auto-approve if tests pass</option>
              <option value="never">Always ask me</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Auto-approve spend under</label>
            <select className="form-input" value={autoRules.spend} onChange={e => setAutoRules(p=>({...p,spend:Number(e.target.value)}))}>
              <option value={0}>$0 — always ask</option>
              <option value={500}>$500</option>
              <option value={1000}>$1,000</option>
              <option value={5000}>$5,000</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Production deployments</label>
            <select className="form-input" value={autoRules.production} onChange={e => setAutoRules(p=>({...p,production:e.target.value}))}>
              <option value="always">Always require my approval</option>
              <option value="qa">Auto-approve if QA passed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Audit Page ───────────────────────────────────────────────────────────────
function AuditPage({ agentRuns, activity, agents }) {
  const [view, setView] = useState("activity");
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Audit Log</div>
        <div style={{display:"flex",gap:6}}>
          <button className={`btn btn-sm ${view==="activity"?"btn-primary":"btn-ghost"}`} onClick={()=>setView("activity")}>Activity</button>
          <button className={`btn btn-sm ${view==="runs"?"btn-primary":"btn-ghost"}`} onClick={()=>setView("runs")}>Agent Runs</button>
        </div>
      </div>
      {view === "activity" && activity.map((a,i) => (
        <div key={i} className="act-line">
          <span className="act-time">{new Date(a.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
          <span className="badge bg-purple" style={{minWidth:100,justifyContent:"center"}}>{a.event_type}</span>
          <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.message}</span>
        </div>
      ))}
      {view === "runs" && agentRuns.map((r,i) => (
        <div key={i} className="act-line" style={{flexWrap:"wrap",gap:6}}>
          <span className="act-time">{new Date(r.started_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
          <span className="badge bg-blue">{r.model_used?.replace("claude-","cl-").replace("-4-6","")}</span>
          <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--text2)"}}>{r.response_received?.slice(0,120)||"..."}</span>
          <span style={{fontSize:10,color:"var(--text3)"}}>{r.tokens_used||0}t</span>
        </div>
      ))}
    </div>
  );
}

// ─── New Project Modal ────────────────────────────────────────────────────────
function NewProjectModal({ agents, globalModel, onClose, onCreate }) {
  const [form, setForm] = useState({ name:"", goal:"", teams:"all", priority:"medium", model: globalModel });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.name.trim() || !form.goal.trim()) return;
    setLoading(true);
    const res = await onCreate(form);
    setResult(res);
    setLoading(false);
    if (res) setTimeout(onClose, 4000);
  }

  return (
    <div className="modal-bg" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">New Project</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:20}}>×</button>
        </div>
        <div className="form-group"><label className="form-label">Project Name</label><input className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Product Launch Website"/></div>
        <div className="form-group"><label className="form-label">Goal / Brief</label><textarea className="form-input" value={form.goal} onChange={e=>setForm(p=>({...p,goal:e.target.value}))} placeholder="Describe what the AI team should achieve..."/></div>
        <div className="g2" style={{gap:10,marginBottom:12}}>
          <div className="form-group" style={{margin:0}}><label className="form-label">Teams</label>
            <select className="form-input" value={form.teams} onChange={e=>setForm(p=>({...p,teams:e.target.value}))}>
              <option value="all">All teams</option><option value="dev">Dev team</option><option value="marketing">Marketing</option><option value="ops">Ops</option><option value="executive">Executive only</option>
            </select>
          </div>
          <div className="form-group" style={{margin:0}}><label className="form-label">Priority</label>
            <select className="form-input" value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
              <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">AI Model</label>
          <select className="form-input" value={form.model} onChange={e=>setForm(p=>({...p,model:e.target.value}))}>
            {MODELS.map(m=><option key={m.id} value={m.id}>{m.name} ({m.provider}) {m.free?"— Free":""}</option>)}
          </select>
        </div>
        {result && <div style={{padding:10,background:"var(--bg3)",borderRadius:"var(--rs)",fontSize:11,color:"var(--text2)",whiteSpace:"pre-wrap",maxHeight:180,overflowY:"auto",marginBottom:12}}><div style={{color:"var(--green)",marginBottom:6,fontWeight:600}}>✅ Project created! COO's plan:</div>{result}</div>}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading?"COO planning...":"Launch Project →"}</button>
        </div>
      </div>
    </div>
  );
}
