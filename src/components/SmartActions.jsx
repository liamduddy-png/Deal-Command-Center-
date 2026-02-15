import useStore from "../store/useStore";

export default function SmartActions() {
  const actions = useStore((s) => s.getActions());
  const activeAction = useStore((s) => s.activeAction);
  const runAction = useStore((s) => s.runAction);
  const loading = useStore((s) => s.loading);

  return (
    <div className="mb-6">
      <div className="label mb-3">Smart Actions</div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => {
          const isActive = activeAction === a.id;
          return (
            <button
              key={a.id}
              onClick={() => runAction(a)}
              disabled={loading}
              className={`group relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                isActive
                  ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800/50"
              } ${loading ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
              title={a.desc}
            >
              <span className="mr-1.5">{a.icon}</span>
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
