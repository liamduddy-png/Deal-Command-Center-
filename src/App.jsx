import useStore from "./store/useStore";
import Header from "./components/Header";
import PipelineRail from "./components/PipelineRail";
import DealLayout from "./components/DealLayout";
import AttackPlan from "./components/AttackPlan";
import ForecastingDashboard from "./components/ForecastingDashboard";

export default function App() {
  const selected = useStore((s) => s.selected);
  const mode = useStore((s) => s.mode);
  const showAttack = useStore((s) => s.showAttack);
  const showForecasting = useStore((s) => s.showForecasting);

  return (
    <div className="h-screen flex flex-col bg-[#0E0E0E] font-sans text-slate-50">
      {/* Top bar */}
      <Header />

      {/* Attack Plan overlay */}
      {showAttack && mode === "pipeline" && !selected && (
        <div className="px-6 pb-2">
          <AttackPlan />
        </div>
      )}

      {/* Forecasting Dashboard overlay */}
      {showForecasting && !selected && (
        <div className="pb-2">
          <ForecastingDashboard />
        </div>
      )}

      {/* Main layout: PipelineRail + DealLayout */}
      <div className="flex-1 flex overflow-hidden">
        <PipelineRail />
        <DealLayout />
      </div>
    </div>
  );
}
