import { useState } from "react";

const PIPELINE_DEALS = [
  { id: 1, company: "Bell Construction", contact: "Ben Lambert", amount: 39525, stage: "Gut", closeDate: "2026-02-10", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: "nda", security: "started" } },
  { id: 2, company: "ERMCO", contact: "Tech Team", amount: 100000, stage: "Best Case", closeDate: "2026-01-30", health: "hot", lastActivity: "1 day ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: "not_started" } },
  { id: 3, company: "LIV Development", contact: "Exec Team", amount: 35000, stage: "Best Case", closeDate: "2026-02-20", health: "warm", lastActivity: "3 days ago", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: null, security: "not_started" } },
  { id: 4, company: "AVB", contact: "Ops Lead", amount: 55000, stage: "Best Case", closeDate: "2026-03-13", health: "warm", lastActivity: "1 day ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: "not_started" } },
  { id: 5, company: "Carter Group, LLC", contact: "Seth Corley", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-04-30", health: "cold", lastActivity: "8 days ago", ms: { change: "not_validated", technical: null, pricing: null, commercial: null, security: null } },
  { id: 6, company: "Ferguson Construction", contact: "Team", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-04-27", health: "warm", lastActivity: "3 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 7, company: "Jostin Construction", contact: "PM Team", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-02-20", health: "hot", lastActivity: "Today", ms: { change: "committed", technical: "fit", pricing: "aware", commercial: null, security: null } },
  { id: 8, company: "Leapley Construction", contact: "Ops", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-04-27", health: "warm", lastActivity: "2 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 9, company: "Tonn and Blank", contact: "Leadership", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-03-20", health: "cold", lastActivity: "12 days ago", ms: { change: "not_validated", technical: null, pricing: null, commercial: null, security: null } },
  { id: 10, company: "Performance Services", contact: "Ops Team", amount: 20000, stage: "Meeting Qualified", closeDate: "2026-03-03", health: "warm", lastActivity: "4 days ago", ms: { change: "committed", technical: "eval", pricing: "not_given", commercial: null, security: null } },
  { id: 11, company: "Clayco", contact: "VP Technology", amount: 45000, stage: "Meeting Set", closeDate: "2026-05-15", health: "warm", lastActivity: "1 day ago", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 12, company: "Holder Construction", contact: "Director of Ops", amount: 30000, stage: "Meeting Set", closeDate: "2026-05-01", health: "warm", lastActivity: "Today", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
  { id: 13, company: "Barton Malow", contact: "Innovation Team", amount: 40000, stage: "Meeting Set", closeDate: "2026-05-20", health: "hot", lastActivity: "Today", ms: { change: null, technical: null, pricing: null, commercial: null, security: null } },
];

const EXPANSION_DEALS = [
  { id: 101, company: "F&R Construction Group", contact: "Site Team", arr: 59742, renewalDate: "2026-11-10", health: "healthy", usage: "High", risk: "None identified", projects: 4 },
  { id: 102, company: "MCM", contact: "PM Team", arr: 10500, renewalDate: "2026-11-19", health: "at_risk", usage: "Medium", risk: "Low adoption on Project B", projects: 2 },
  { id: 103, company: "Linkous Construction", contact: "Ops Lead", arr: 24252, renewalDate: "2026-12-18", health: "healthy", usage: "High", risk: "Budget cycle timing", projects: 3 },
  { id: 104, company: "AVB", contact: "VP Ops", arr: 15000, renewalDate: "2026-10-31", health: "healthy", usage: "High", risk: "None", projects: 5 },
  { id: 105, company: "ERMCO", contact: "Director", arr: 13350, renewalDate: "2026-11-10", health: "monitor", usage: "Low", risk: "Champion left company", projects: 2 },
  { id: 106, company: "Del Valle Group", contact: "Owner", arr: 25000, renewalDate: "2027-01-06", health: "healthy", usage: "High", risk: "None", projects: 6 },
];

const P_ACTIONS = [
  { id: "follow_up", label: "Follow-Up", icon: "\u2709\uFE0F" },
  { id: "ghost", label: "Ghost Sequence", icon: "\uD83D\uDC7B" },
  { id: "gut_forecast", label: "GUT Forecast", icon: "\uD83D\uDCCA" },
  { id: "meeting_prep", label: "Meeting Prep", icon: "\uD83C\uDFAF" },
  { id: "deck_outline", label: "Deck Outline", icon: "\uD83D\uDCCB" },
  { id: "call_track", label: "Call Track", icon: "\uD83C\uDFA4" },
  { id: "research", label: "Research", icon: "\uD83D\uDD0D" },
  { id: "deal_story", label: "Deal Story", icon: "\uD83D\uDCD6" },
  { id: "next_steps", label: "Next Steps", icon: "\u27A1\uFE0F" },
  { id: "slack_update", label: "Slack Update", icon: "\uD83D\uDCAC" },
];

const E_ACTIONS = [
  { id: "expansion_path", label: "Expansion Path", icon: "\uD83D\uDE80" },
  { id: "risk_blockers", label: "Risks", icon: "\u26A0\uFE0F" },
  { id: "research_projects", label: "Projects", icon: "\uD83C\uDFD7\uFE0F" },
  { id: "slack_update", label: "Slack Update", icon: "\uD83D\uDCAC" },
  { id: "renewal_prep", label: "Renewal Prep", icon: "\uD83D\uDD04" },
  { id: "health_check", label: "Health Check", icon: "\uD83D\uDC8A" },
  { id: "champion_map", label: "Relationships", icon: "\uD83D\uDDFA\uFE0F" },
  { id: "usage_report", label: "Usage", icon: "\uD83D\uDCC8" },
];

const HC = { hot: "#22C55E", warm: "#F59E0B", cold: "#EF4444", healthy: "#22C55E", at_risk: "#EF4444", monitor: "#F59E0B" };
const SC = { committed: "#22C55E", fit: "#22C55E", closure: "#22C55E", complete: "#22C55E", msa: "#22C55E", not_validated: "#EF4444", eval: "#F59E0B", aware: "#F59E0B", nda: "#F59E0B", started: "#F59E0B", not_given: "#64748B", not_started: "#64748B" };
const STAGES = ["Gut", "Best Case", "Meeting Qualified", "Meeting Set"];

function getPrompt(id, d) {
  var a = d.amount || d.arr || 0;
  var m = {
    follow_up: "Draft a concise follow-up email for " + d.company + ". Contact: " + d.contact + ". Stage: " + (d.stage || "") + ". $" + a + ". Construction. Chris Voss style. No fluff.",
    ghost: d.company + " went dark. Last activity: " + d.lastActivity + ". Draft 3-email re-engagement. Escalate each. No desperation.",
    gut_forecast: "GUT forecast block:\n\nMy forecast = $" + a.toLocaleString() + "\n\n" + d.company + " + $" + a.toLocaleString() + "\n  Milestone: [from " + (d.stage || "") + "]\n  Next Step: [based on stage]\n  Risk: [health " + d.health + "]",
    meeting_prep: "Pre-call brief: " + d.company + ". Contact: " + d.contact + ". Stage: " + (d.stage || "") + ". $" + a + ". Key questions, objections, outcomes.",
    deck_outline: "Deck outline for " + d.company + ". Stage: " + (d.stage || "") + ". Construction. Pain points, Trunk Tools solution, ROI, timeline.",
    call_track: "Call track for " + d.company + ". " + (d.stage || "") + ". Chris Voss. Goal: next milestone.",
    research: "What should I know about " + d.company + "? Construction company. Pain points, key roles, questions.",
    deal_story: "Deal story: " + d.company + ". " + (d.stage || "") + ". $" + a + ". " + d.contact + ". Close: " + (d.closeDate || "") + ". Health: " + d.health + ".",
    next_steps: "3 next steps for " + d.company + ". " + (d.stage || "") + ". Health: " + d.health + ". Last: " + (d.lastActivity || "") + ". Ranked by impact.",
    slack_update: "Slack update: " + d.company + ". " + (d.stage || "") + ". $" + a + ". " + d.health + ". 3-4 lines.",
    expansion_path: "Expansion path: " + d.company + ". ARR $" + (d.arr || 0).toLocaleString() + ". " + (d.projects || 0) + " projects. Upsell opportunities?",
    risk_blockers: "Risks for " + d.company + ". Health: " + d.health + ". Usage: " + (d.usage || "") + ". Known risk: " + (d.risk || "") + ".",
    research_projects: "Upcoming projects for " + d.company + "? " + (d.projects || 0) + " current. Expansion opportunities?",
    renewal_prep: "Renewal: " + d.company + ". ARR $" + (d.arr || 0).toLocaleString() + ". Renewal: " + (d.renewalDate || "") + ". Usage: " + (d.usage || "") + ".",
    health_check: "Health check: " + d.company + ". Usage: " + (d.usage || "") + ". Health: " + d.health + ". " + (d.projects || 0) + " projects. Risk: " + (d.risk || "") + ".",
    champion_map: "Relationship map: " + d.company + ". Contact: " + d.contact + ". Champion, buyer, blocker?",
    usage_report: "Usage: " + d.company + ". " + (d.projects || 0) + " projects. Level: " + (d.usage || "") + ". Working vs underutilized?",
  };
  return m[id] || "Help with " + d.company;
}

export default function App() {
  const [mode, setMode] = useState("pipeline");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showAttack, setShowAttack] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  var isPipeline = mode === "pipeline";
  var allDeals = isPipeline ? PIPELINE_DEALS : EXPANSION_DEALS;
  var filtered = allDeals.filter(function (d) {
    var s = search.toLowerCase();
    return d.company.toLowerCase().indexOf(s) >= 0 || (d.contact || "").toLowerCase().indexOf(s) >= 0;
  });
  var total = filtered.reduce(function (s, d) { return s + (d.amount || d.arr || 0); }, 0);
  var actions = isPipeline ? P_ACTIONS : E_ACTIONS;

  function runAction(action) {
    setActiveAction(action.id);
    setLoading(true);
    setAiText("");
    var prompt = getPrompt(action.id, selected);

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    })
      .then(function (r) {
        if (!r.ok) {
          return r.text().then(function (t) { throw new Error("HTTP " + r.status + ": " + t.substring(0, 200)); });
        }
        return r.text();
      })
      .then(function (rawText) {
        try {
          var data = JSON.parse(rawText);
          if (data && data.content) {
            var t = "";
            for (var i = 0; i < data.content.length; i++) {
              if (data.content[i].type === "text") t += data.content[i].text;
            }
            setAiText(t || "Empty response");
          } else if (data && data.error) {
            setAiText("API Error: " + (data.error.message || JSON.stringify(data.error)));
          } else {
            setAiText(rawText.substring(0, 1000));
          }
        } catch (e) {
          setAiText(rawText.substring(0, 1000));
        }
        setLoading(false);
      })
      .catch(function (err) {
        setAiText("Error: " + err.message);
        setLoading(false);
      });
  }

  function goBack() {
    setSelected(null);
    setActiveAction(null);
    setAiText("");
    setLoading(false);
  }

  // DEAL VIEW
  if (selected) {
    var d = selected;
    var amt = d.amount || d.arr || 0;
    return (
      <div style={{ minHeight: "100vh", background: "#020617", fontFamily: "-apple-system, sans-serif", color: "#F8FAFC", padding: 32 }}>
        <div onClick={goBack} style={{ color: "#94A3B8", cursor: "pointer", fontSize: 13, marginBottom: 20 }}>
          {"\u2190 Back to " + (isPipeline ? "Pipeline" : "Customers")}
        </div>
        <div style={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: HC[d.health] || "#94A3B8" }} />
                <span style={{ fontSize: 28, fontWeight: 700 }}>{d.company}</span>
              </div>
              <div style={{ color: "#94A3B8", fontSize: 14, marginTop: 4, marginLeft: 20 }}>{d.contact}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "monospace" }}>{"$" + amt.toLocaleString()}</div>
              <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: isPipeline ? "#3B82F620" : "#10B98120", color: isPipeline ? "#60A5FA" : "#34D399", fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                {isPipeline ? d.stage : "Renews: " + d.renewalDate}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 20, paddingTop: 16, borderTop: "1px solid #334155", flexWrap: "wrap" }}>
            {isPipeline ? (
              <>
                <div><div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Close</div><div style={{ marginTop: 2 }}>{d.closeDate}</div></div>
                <div><div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Last Activity</div><div style={{ marginTop: 2 }}>{d.lastActivity}</div></div>
                <div><div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Health</div><div style={{ color: HC[d.health], marginTop: 2, fontWeight: 600, textTransform: "capitalize" }}>{d.health}</div></div>
                {d.ms && <div style={{ flex: 1, minWidth: 150 }}><div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Milestones</div><div style={{ display: "flex", gap: 3 }}>{["change", "technical", "pricing", "commercial", "security"].map(function (k) { var v = d.ms[k]; return <div key={k} style={{ flex: 1, height: 5, borderRadius: 3, background: v ? (SC[v] || "#334155") : "#1E293B" }} title={k + ": " + (v || "none")} />; })}</div></div>}
              </>
            ) : (
              <>
                <div><div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Usage</div><div style={{ marginTop: 2 }}>{d.usage}</div></div>
                <div><div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Projects</div><div style={{ marginTop: 2 }}>{d.projects}</div></div>
                <div><div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Risk</div><div style={{ color: (d.risk === "None" || d.risk === "None identified") ? "#22C55E" : "#F59E0B", marginTop: 2 }}>{d.risk}</div></div>
              </>
            )}
          </div>
        </div>

        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#64748B", marginBottom: 10, fontWeight: 600 }}>Smart Actions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {actions.map(function (a) {
            var isOn = activeAction === a.id;
            return <div key={a.id} onClick={function () { runAction(a); }} style={{ background: isOn ? "#1E293B" : "#0F172A", border: "1px solid " + (isOn ? "#60A5FA" : "#334155"), borderRadius: 10, padding: "10px 16px", color: isOn ? "#60A5FA" : "#CBD5E1", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>{a.icon + " " + a.label}</div>;
          })}
        </div>

        {(loading || aiText) && (
          <div style={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#64748B", marginBottom: 12, fontWeight: 600 }}>
              {loading ? "Generating..." : ((actions.find(function (x) { return x.id === activeAction; }) || {}).label || "")}
            </div>
            {loading ? <div style={{ color: "#60A5FA" }}>Working on it...</div> : <div style={{ color: "#E2E8F0", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{aiText}</div>}
          </div>
        )}
      </div>
    );
  }

  // MAIN LIST VIEW
  var slipping = PIPELINE_DEALS.filter(function (d) { return d.health === "cold"; });
  var hotDeals = PIPELINE_DEALS.filter(function (d) { return d.health === "hot"; });
  var closingSoon = PIPELINE_DEALS.filter(function (d) { var days = Math.ceil((new Date(d.closeDate) - new Date()) / 86400000); return days <= 14 && days > 0; });

  var grouped = {};
  if (isPipeline) {
    STAGES.forEach(function (s) { grouped[s] = filtered.filter(function (d) { return d.stage === s; }); });
  } else {
    grouped["Active Customers"] = filtered;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020617", fontFamily: "-apple-system, sans-serif", color: "#F8FAFC", padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>Trunk Tools</div>
          <div style={{ color: "#475569", fontSize: 13 }}>Deal Command Center</div>
        </div>
        <div style={{ display: "flex", background: "#0F172A", borderRadius: 10, border: "1px solid #1E293B", padding: 3 }}>
          <div onClick={function () { setMode("pipeline"); setSearch(""); setShowAttack(false); }} style={{ padding: "8px 20px", borderRadius: 8, background: isPipeline ? "#1E293B" : "transparent", color: isPipeline ? "#F8FAFC" : "#64748B", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Pipeline</div>
          <div onClick={function () { setMode("expansion"); setSearch(""); setShowAttack(false); }} style={{ padding: "8px 20px", borderRadius: 8, background: !isPipeline ? "#1E293B" : "transparent", color: !isPipeline ? "#F8FAFC" : "#64748B", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Customer Expansion</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder={isPipeline ? "Search deals..." : "Search customers..."} value={search} onChange={function (e) { setSearch(e.target.value); }} style={{ flex: 1, minWidth: 200, padding: "12px 16px", background: "#0F172A", border: "1px solid #1E293B", borderRadius: 10, color: "#F8FAFC", fontSize: 14, outline: "none" }} />
        <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 10, padding: "10px 20px", display: "flex", gap: 20 }}>
          <div><div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Deals</div><div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace" }}>{filtered.length}</div></div>
          <div style={{ width: 1, background: "#1E293B" }} />
          <div><div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>{isPipeline ? "Pipeline" : "ARR"}</div><div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace" }}>{"$" + total.toLocaleString()}</div></div>
        </div>
        {isPipeline && <div onClick={function () { setShowAttack(!showAttack); }} style={{ background: showAttack ? "#F59E0B15" : "#0F172A", border: "1px solid " + (showAttack ? "#F59E0B40" : "#1E293B"), borderRadius: 10, padding: "12px 20px", color: showAttack ? "#F59E0B" : "#94A3B8", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{"⚡ Attack Plan"}</div>}
      </div>

      {showAttack && isPipeline && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
          <div style={{ background: "#7F1D1D15", border: "1px solid #7F1D1D30", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#EF4444", marginBottom: 12, fontWeight: 600 }}>Slipping</div>
            {slipping.length === 0 ? <div style={{ color: "#64748B", fontSize: 13 }}>None</div> : slipping.map(function (d) { return <div key={d.id} onClick={function () { setSelected(d); setActiveAction(null); setAiText(""); }} style={{ cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #1E293B", fontSize: 14 }}>{d.company} <span style={{ color: "#64748B", fontSize: 12 }}>{d.lastActivity}</span></div>; })}
          </div>
          <div style={{ background: "#14532D15", border: "1px solid #14532D30", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#22C55E", marginBottom: 12, fontWeight: 600 }}>Hot</div>
            {hotDeals.length === 0 ? <div style={{ color: "#64748B", fontSize: 13 }}>None</div> : hotDeals.map(function (d) { return <div key={d.id} onClick={function () { setSelected(d); setActiveAction(null); setAiText(""); }} style={{ cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #1E293B", fontSize: 14 }}>{d.company} <span style={{ color: "#64748B", fontSize: 12 }}>{"$" + d.amount.toLocaleString()}</span></div>; })}
          </div>
          <div style={{ background: "#7C2D1215", border: "1px solid #7C2D1230", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#F59E0B", marginBottom: 12, fontWeight: 600 }}>Closing Soon</div>
            {closingSoon.length === 0 ? <div style={{ color: "#64748B", fontSize: 13 }}>None</div> : closingSoon.map(function (d) { return <div key={d.id} onClick={function () { setSelected(d); setActiveAction(null); setAiText(""); }} style={{ cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #1E293B", fontSize: 14 }}>{d.company} <span style={{ color: "#64748B", fontSize: 12 }}>{d.closeDate}</span></div>; })}
          </div>
        </div>
      )}

      {Object.keys(grouped).map(function (stage) {
        var deals = grouped[stage];
        if (deals.length === 0) return null;
        var st = deals.reduce(function (s, d) { return s + (d.amount || d.arr || 0); }, 0);
        return (
          <div key={stage} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>{stage}</span>
              <div style={{ height: 1, flex: 1, background: "#1E293B" }} />
              <span style={{ fontSize: 12, color: "#475569" }}>{deals.length + " \u00B7 $" + st.toLocaleString()}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
              {deals.map(function (deal) {
                var a = deal.amount || deal.arr || 0;
                return (
                  <div key={deal.id} onClick={function () { setSelected(deal); setActiveAction(null); setAiText(""); }} style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 12, padding: 18, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: HC[deal.health] || "#94A3B8" }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{deal.company}</div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{deal.contact}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>{"$" + a.toLocaleString()}</div>
                    </div>
                    {isPipeline && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "#64748B" }}>
                          <span>{"Close: " + deal.closeDate}</span>
                          <span>{deal.lastActivity}</span>
                        </div>
                        {deal.ms && <div style={{ display: "flex", gap: 3, marginTop: 6 }}>{["change", "technical", "pricing", "commercial", "security"].map(function (k) { var v = deal.ms[k]; return <div key={k} style={{ flex: 1, height: 4, borderRadius: 2, background: v ? (SC[v] || "#334155") : "#1E293B" }} />; })}</div>}
                      </div>
                    )}
                    {!isPipeline && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "#64748B" }}>
                        <span>{"Renewal: " + deal.renewalDate}</span>
                        <span>{deal.projects + " projects \u00B7 " + deal.usage}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
