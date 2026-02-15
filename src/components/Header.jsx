import useStore from "../store/useStore";

export default function Header() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const isPipeline = mode === "pipeline";

  return (
    <header className="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50">
          Trunk Tools
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Deal Command Center &middot; Liam Duddy
        </p>
      </div>

      <div className="flex bg-slate-900 rounded-xl border border-slate-800 p-1">
        <button
          onClick={() => setMode("pipeline")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isPipeline
              ? "bg-slate-800 text-slate-50 shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Pipeline
        </button>
        <button
          onClick={() => setMode("expansion")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            !isPipeline
              ? "bg-slate-800 text-slate-50 shadow-sm"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Customer Expansion
        </button>
      </div>
    </header>
  );
}
