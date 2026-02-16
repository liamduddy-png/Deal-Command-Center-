import { PIPELINE_DEALS } from "../data/deals";
import useStore from "../store/useStore";

export default function AttackPlan() {
  const selectDeal = useStore((s) => s.selectDeal);

  const slipping = PIPELINE_DEALS.filter((d) => d.health === "cold");
  const hot = PIPELINE_DEALS.filter((d) => d.health === "hot");
  const closingSoon = PIPELINE_DEALS.filter((d) => {
    const days = Math.ceil((new Date(d.closeDate) - new Date()) / 86400000);
    return days <= 14 && days > 0;
  });

  const sections = [
    {
      title: "Slipping",
      deals: slipping,
      color: "text-red-400",
      bg: "bg-red-500/5",
      border: "border-red-500/20",
      sub: (d) => d.lastActivity,
    },
    {
      title: "Hot",
      deals: hot,
      color: "text-green-400",
      bg: "bg-green-500/5",
      border: "border-green-500/20",
      sub: (d) => "$" + d.amount.toLocaleString(),
    },
    {
      title: "Closing Soon",
      deals: closingSoon,
      color: "text-amber-400",
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
      sub: (d) => d.closeDate,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7 animate-fade-in">
      {sections.map((sec) => (
        <div
          key={sec.title}
          className={`${sec.bg} border ${sec.border} rounded-xl p-5`}
        >
          <div
            className={`text-xs uppercase tracking-wider ${sec.color} font-semibold mb-3`}
          >
            {sec.title}
          </div>
          {sec.deals.length === 0 ? (
            <div className="text-slate-600 text-sm">None</div>
          ) : (
            <div className="space-y-1">
              {sec.deals.map((d) => (
                <div
                  key={d.id}
                  onClick={() => selectDeal(d)}
                  className="flex items-center justify-between py-1.5 border-b border-slate-800/50 cursor-pointer hover:text-blue-400 transition-colors text-sm"
                >
                  <span>{d.company}</span>
                  <span className="text-slate-500 text-xs">{sec.sub(d)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
