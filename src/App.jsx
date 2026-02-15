import useStore from "./store/useStore";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import AttackPlan from "./components/AttackPlan";
import DealGrid from "./components/DealGrid";
import DealDetail from "./components/DealDetail";

export default function App() {
  const selected = useStore((s) => s.selected);
  const mode = useStore((s) => s.mode);
  const showAttack = useStore((s) => s.showAttack);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-50 px-4 sm:px-8 py-8 max-w-7xl mx-auto">
      {selected ? (
        <DealDetail />
      ) : (
        <>
          <Header />
          <SearchBar />
          {showAttack && mode === "pipeline" && <AttackPlan />}
          <DealGrid />
        </>
      )}
    </div>
  );
}
