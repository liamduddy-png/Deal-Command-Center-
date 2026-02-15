import useStore from "../store/useStore";

export default function Header() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const showAttack = useStore((s) => s.showAttack);
  const toggleAttack = useStore((s) => s.toggleAttack);
  const selected = useStore((s) => s.selected);
  const goBack = useStore((s) => s.goBack);
  const isPipeline = mode === "pipeline";

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "#262626", background: "#0E0E0E" }}>
      <div className="flex items-center gap-4">
        {/* Back button when deal selected */}
        {selected && (
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm transition-colors group"
            style={{ color: "#666" }}
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        )}
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "#E2E2E2" }}>
            Trunk Tools
          </h1>
          <p className="text-xs" style={{ color: "#555" }}>
            Deal Command Center &middot; Liam Duddy
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Mode toggle */}
        <div className="flex rounded-lg p-0.5" style={{ background: "#161616", border: "1px solid #262626" }}>
          <button
            onClick={() => setMode("pipeline")}
            className="px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
            style={{
              background: isPipeline ? "#262626" : "transparent",
              color: isPipeline ? "#E2E2E2" : "#666",
            }}
          >
            Pipeline
          </button>
          <button
            onClick={() => setMode("expansion")}
            className="px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
            style={{
              background: !isPipeline ? "#262626" : "transparent",
              color: !isPipeline ? "#E2E2E2" : "#666",
            }}
          >
            Expansion
          </button>
        </div>

        {/* Attack Plan toggle */}
        {isPipeline && !selected && (
          <button
            onClick={toggleAttack}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: showAttack ? "rgba(214,168,79,0.1)" : "#161616",
              border: `1px solid ${showAttack ? "rgba(214,168,79,0.3)" : "#262626"}`,
              color: showAttack ? "#D6A84F" : "#666",
            }}
          >
            Attack Plan
          </button>
        )}
      </div>
    </header>
  );
}
