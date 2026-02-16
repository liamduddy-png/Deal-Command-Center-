import { useEffect, useState } from "react";

const FIELDS = [
  { key: "identifyPain", label: "Identify Pain" },
  { key: "metrics", label: "Metrics" },
  { key: "economicBuyer", label: "Economic Buyer" },
  { key: "champion", label: "Champion" },
  { key: "decisionCriteria", label: "Decision Criteria" },
  { key: "decisionProcess", label: "Decision Process" },
  { key: "paperProcess", label: "Paper Process" },
  { key: "competition", label: "Competition" },
  { key: "compellingEvent", label: "Compelling Event" },
  { key: "change", label: "Milestone \u2013 Change" },
  { key: "technical", label: "Milestone \u2013 Technical" },
  { key: "pricing", label: "Milestone \u2013 Pricing" },
  { key: "power", label: "Milestone \u2013 Power" },
  { key: "paperwork", label: "Milestone \u2013 Paperwork" },
  { key: "nextStep", label: "Next Step (optional)" },
  { key: "risk", label: "Risk (optional)" },
];

export default function MappingScreen({ onComplete }) {
  const [properties, setProperties] = useState([]);
  const [mapping, setMapping] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then(setProperties)
      .catch(() => setError("Failed to load HubSpot properties"));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapping),
      });
      onComplete();
    } catch {
      setError("Failed to save mapping");
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-10"
      style={{ backgroundColor: "#0E0E0E" }}
    >
      <div
        className="w-full max-w-[1100px] rounded-2xl p-10"
        style={{ backgroundColor: "#161616" }}
      >
        <h2
          className="text-2xl font-semibold mb-2"
          style={{ color: "#D6A84F" }}
        >
          HubSpot Property Mapping
        </h2>
        <p className="text-sm mb-8" style={{ color: "#888" }}>
          One-time setup. Select the matching deal properties from your portal.
        </p>

        {error && (
          <div
            className="mb-6 p-3 rounded-lg text-sm"
            style={{
              background: "rgba(255,77,79,0.1)",
              border: "1px solid rgba(255,77,79,0.2)",
              color: "#FF4D4F",
            }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col">
              <label
                className="text-sm mb-1.5"
                style={{ color: "#ccc" }}
              >
                {field.label}
              </label>
              <select
                className="px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "#1e1e1e",
                  color: "#fff",
                  border: "1px solid #333",
                }}
                onChange={(e) =>
                  setMapping({ ...mapping, [field.key]: e.target.value })
                }
                value={mapping[field.key] || ""}
              >
                <option value="">Select property</option>
                {properties.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          className="mt-8 px-6 py-3 rounded-lg font-semibold text-sm transition-all"
          style={{
            backgroundColor: "#D6A84F",
            color: "#000",
            opacity: saving ? 0.6 : 1,
          }}
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Mapping"}
        </button>
      </div>
    </div>
  );
}
