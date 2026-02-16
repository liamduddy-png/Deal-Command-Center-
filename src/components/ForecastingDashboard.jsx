import useStore from "../store/useStore";
import { PIPELINE_DEALS, EXPANSION_DEALS, STAGES } from "../data/deals";

export default function ForecastingDashboard() {
  const mode = useStore((s) => s.mode);
  const useHubspot = useStore((s) => s.useHubspot);
  const hubspotDeals = useStore((s) => s.hubspotDeals);
  const isPipeline = mode === "pipeline";

  const allDeals = useHubspot && hubspotDeals
    ? hubspotDeals.filter((d) => d.type === (isPipeline ? "pipeline" : "expansion"))
    : isPipeline ? PIPELINE_DEALS : EXPANSION_DEALS;

  if (!isPipeline) {
    return <ExpansionMetrics deals={allDeals} />;
  }

  // Pipeline metrics
  const totalValue = allDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const dealCount = allDeals.length;
  const avgDealSize = dealCount > 0 ? Math.round(totalValue / dealCount) : 0;

  // Health breakdown
  const hotDeals = allDeals.filter((d) => d.health === "hot");
  const warmDeals = allDeals.filter((d) => d.health === "warm");
  const coldDeals = allDeals.filter((d) => d.health === "cold");

  // Stage breakdown with values
  const stageData = STAGES.map((stage) => {
    const deals = allDeals.filter((d) => d.stage === stage);
    const value = deals.reduce((sum, d) => sum + (d.amount || 0), 0);
    return { stage, count: deals.length, value };
  });

  // Close date analysis
  const now = new Date();
  const thisMonth = allDeals.filter((d) => {
    if (!d.closeDate) return false;
    const close = new Date(d.closeDate);
    return close.getMonth() === now.getMonth() && close.getFullYear() === now.getFullYear();
  });
  const nextMonth = allDeals.filter((d) => {
    if (!d.closeDate) return false;
    const close = new Date(d.closeDate);
    const nextM = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return close.getMonth() === nextM.getMonth() && close.getFullYear() === nextM.getFullYear();
  });
  const overdue = allDeals.filter((d) => {
    if (!d.closeDate) return false;
    return new Date(d.closeDate) < now;
  });

  const thisMonthValue = thisMonth.reduce((s, d) => s + (d.amount || 0), 0);
  const nextMonthValue = nextMonth.reduce((s, d) => s + (d.amount || 0), 0);
  const overdueValue = overdue.reduce((s, d) => s + (d.amount || 0), 0);

  // Weighted pipeline (hot = 80%, warm = 50%, cold = 20%)
  const weighted = allDeals.reduce((sum, d) => {
    const w = d.health === "hot" ? 0.8 : d.health === "warm" ? 0.5 : 0.2;
    return sum + (d.amount || 0) * w;
  }, 0);

  // Average days to close (for deals with close dates in the future)
  const futureDays = allDeals
    .filter((d) => d.closeDate && new Date(d.closeDate) > now)
    .map((d) => Math.ceil((new Date(d.closeDate) - now) / 86400000));
  const avgDaysToClose = futureDays.length > 0
    ? Math.round(futureDays.reduce((a, b) => a + b, 0) / futureDays.length)
    : 0;

  const maxStageValue = Math.max(...stageData.map((s) => s.value), 1);

  return (
    <div className="px-6 pb-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Top-level KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <KPI label="Total Pipeline" value={`$${totalValue.toLocaleString()}`} />
          <KPI label="Weighted" value={`$${Math.round(weighted).toLocaleString()}`} sub="risk-adjusted" />
          <KPI label="Deals" value={dealCount} />
          <KPI label="Avg Deal" value={`$${avgDealSize.toLocaleString()}`} />
          <KPI label="Avg Days to Close" value={avgDaysToClose} />
          <KPI label="Overdue" value={overdue.length} alert={overdue.length > 0} sub={overdue.length > 0 ? `$${overdueValue.toLocaleString()}` : null} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Stage Funnel */}
          <div className="card p-5 lg:col-span-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Pipeline by Stage</div>
            <div className="space-y-3">
              {stageData.map((s) => (
                <div key={s.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{s.stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{s.count} deals</span>
                      <span className="text-sm font-mono text-slate-200">${s.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(s.value / maxStageValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health & Timing */}
          <div className="space-y-4">
            {/* Health Breakdown */}
            <div className="card p-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Deal Health</div>
              <div className="space-y-2">
                <HealthRow label="Hot" count={hotDeals.length} total={dealCount} color="bg-green-500" textColor="text-green-400" value={hotDeals.reduce((s, d) => s + (d.amount || 0), 0)} />
                <HealthRow label="Warm" count={warmDeals.length} total={dealCount} color="bg-amber-500" textColor="text-amber-400" value={warmDeals.reduce((s, d) => s + (d.amount || 0), 0)} />
                <HealthRow label="Cold" count={coldDeals.length} total={dealCount} color="bg-red-500" textColor="text-red-400" value={coldDeals.reduce((s, d) => s + (d.amount || 0), 0)} />
              </div>
            </div>

            {/* Close Date Timing */}
            <div className="card p-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Close Timing</div>
              <div className="space-y-2">
                <TimingRow label="This Month" count={thisMonth.length} value={thisMonthValue} />
                <TimingRow label="Next Month" count={nextMonth.length} value={nextMonthValue} />
                {overdue.length > 0 && (
                  <TimingRow label="Overdue" count={overdue.length} value={overdueValue} alert />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpansionMetrics({ deals }) {
  const totalARR = deals.reduce((s, d) => s + (d.arr || 0), 0);
  const atRisk = deals.filter((d) => d.health === "at_risk");
  const healthy = deals.filter((d) => d.health === "healthy");
  const monitor = deals.filter((d) => d.health === "monitor");
  const totalProjects = deals.reduce((s, d) => s + (d.projects || 0), 0);

  // Renewals in next 60 days
  const now = new Date();
  const upcomingRenewals = deals.filter((d) => {
    if (!d.renewalDate) return false;
    const days = Math.ceil((new Date(d.renewalDate) - now) / 86400000);
    return days > 0 && days <= 60;
  });

  return (
    <div className="px-6 pb-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <KPI label="Total ARR" value={`$${totalARR.toLocaleString()}`} />
          <KPI label="Accounts" value={deals.length} />
          <KPI label="Projects" value={totalProjects} />
          <KPI label="At Risk" value={atRisk.length} alert={atRisk.length > 0} />
          <KPI label="Renewing Soon" value={upcomingRenewals.length} sub="next 60 days" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Account Health</div>
            <div className="space-y-2">
              <HealthRow label="Healthy" count={healthy.length} total={deals.length} color="bg-green-500" textColor="text-green-400" value={healthy.reduce((s, d) => s + (d.arr || 0), 0)} />
              <HealthRow label="Monitor" count={monitor.length} total={deals.length} color="bg-amber-500" textColor="text-amber-400" value={monitor.reduce((s, d) => s + (d.arr || 0), 0)} />
              <HealthRow label="At Risk" count={atRisk.length} total={deals.length} color="bg-red-500" textColor="text-red-400" value={atRisk.reduce((s, d) => s + (d.arr || 0), 0)} />
            </div>
          </div>

          {upcomingRenewals.length > 0 && (
            <div className="card p-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Upcoming Renewals</div>
              <div className="space-y-2">
                {upcomingRenewals.map((d) => {
                  const days = Math.ceil((new Date(d.renewalDate) - now) / 86400000);
                  return (
                    <div key={d.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{d.company}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{days}d</span>
                        <span className="font-mono text-slate-400">${(d.arr || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, sub, alert }) {
  return (
    <div className="card p-4">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</div>
      <div className={`text-xl font-bold font-mono mt-1 ${alert ? "text-red-400" : "text-slate-100"}`}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function HealthRow({ label, count, total, color, textColor, value }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className={`text-sm ${textColor} w-16`}>{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
      <span className="text-xs font-mono text-slate-400 w-20 text-right">${value.toLocaleString()}</span>
    </div>
  );
}

function TimingRow({ label, count, value, alert }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${alert ? "text-red-400" : "text-slate-300"}`}>{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">{count} deals</span>
        <span className={`text-sm font-mono ${alert ? "text-red-400" : "text-slate-200"}`}>
          ${value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
