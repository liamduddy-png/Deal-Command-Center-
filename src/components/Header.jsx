import { useState, useEffect } from "react";
import useStore from "../store/useStore";
import { getStoredClientId } from "../lib/gmail";

export default function Header() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const showAttack = useStore((s) => s.showAttack);
  const toggleAttack = useStore((s) => s.toggleAttack);
  const showForecasting = useStore((s) => s.showForecasting);
  const toggleForecasting = useStore((s) => s.toggleForecasting);
  const selected = useStore((s) => s.selected);
  const goBack = useStore((s) => s.goBack);
  const exportToCSV = useStore((s) => s.exportToCSV);
  const dataMode = useStore((s) => s.dataMode);
  const setDataMode = useStore((s) => s.setDataMode);
  const isPipeline = mode === "pipeline";

  // Auth
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);

  // HubSpot
  const useHubspot = useStore((s) => s.useHubspot);
  const hubspotLoading = useStore((s) => s.hubspotLoading);
  const hubspotError = useStore((s) => s.hubspotError);
  const hubspotDeals = useStore((s) => s.hubspotDeals);
  const toggleHubspot = useStore((s) => s.toggleHubspot);
  const [hubspotAvailable, setHubspotAvailable] = useState(null);

  const [apiStatus, setApiStatus] = useState(null); // null = checking, true = ok, false = down

  // Check if HubSpot and Gmail are configured on mount — auto-connect if available
  useEffect(() => {
    let retries = 0;
    const checkHealth = () => {
      fetch("/api/health")
        .then((r) => r.json())
        .then((data) => {
          setApiStatus(true);
          const available = data.hasHubspotToken === true;
          setHubspotAvailable(available);
          if (available && !useStore.getState().useHubspot) {
            useStore.getState().fetchHubspotDeals();
          }
          // Auto-set Gmail Client ID from server config if not already set
          if (data.hasGmailClientId && data.gmailClientId && !getStoredClientId()) {
            setGmailClientId(data.gmailClientId);
            setClientIdInput(data.gmailClientId);
          }
        })
        .catch(() => {
          if (retries < 2) {
            retries++;
            setTimeout(checkHealth, 2000 * retries);
          } else {
            setApiStatus(false);
            setHubspotAvailable(false);
          }
        });
    };
    checkHealth();
  }, []);

  // Gmail
  const gmailConnected = useStore((s) => s.gmailConnected);
  const gmailClientId = useStore((s) => s.gmailClientId);
  const setGmailClientId = useStore((s) => s.setGmailClientId);
  const connectGmail = useStore((s) => s.connectGmail);
  const disconnectGmail = useStore((s) => s.disconnectGmail);
  const gmailError = useStore((s) => s.gmailError);
  const [showGmailSetup, setShowGmailSetup] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(gmailClientId);

  return (
    <header className="flex items-center justify-between px-3 sm:px-6 py-3 border-b gap-2" style={{ borderColor: "#262626", background: "#0E0E0E" }}>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Mode toggle */}
        <div className="flex rounded-lg p-0.5" style={{ background: "#161616", border: "1px solid #262626" }}>
          <button
            onClick={() => setMode("pipeline")}
            className="px-3 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
            style={{
              background: isPipeline ? "#262626" : "transparent",
              color: isPipeline ? "#E2E2E2" : "#666",
            }}
          >
            Pipeline
          </button>
          <button
            onClick={() => setMode("expansion")}
            className="px-3 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
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
            className="px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: showAttack ? "rgba(214,168,79,0.1)" : "#161616",
              border: `1px solid ${showAttack ? "rgba(214,168,79,0.3)" : "#262626"}`,
              color: showAttack ? "#D6A84F" : "#666",
            }}
          >
            Attack Plan
          </button>
        )}

        {/* Forecasting toggle */}
        {!selected && (
          <button
            onClick={toggleForecasting}
            className="px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: showForecasting ? "rgba(96,165,250,0.1)" : "#161616",
              border: `1px solid ${showForecasting ? "rgba(96,165,250,0.3)" : "#262626"}`,
              color: showForecasting ? "#60A5FA" : "#666",
            }}
          >
            Forecast
          </button>
        )}

        {/* CSV Export */}
        {!selected && (
          <button
            onClick={exportToCSV}
            className="px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: "#161616",
              border: "1px solid #262626",
              color: "#666",
            }}
          >
            Export CSV
          </button>
        )}

        {/* Data mode toggle (Demo / Live) */}
        {!selected && (
          <div className="flex rounded-lg p-0.5" style={{ background: "#161616", border: "1px solid #262626" }}>
            <button
              onClick={() => setDataMode("demo")}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
              style={{
                background: dataMode === "demo" ? "#262626" : "transparent",
                color: dataMode === "demo" ? "#E2E2E2" : "#666",
              }}
            >
              Demo
            </button>
            <button
              onClick={() => setDataMode("live")}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
              style={{
                background: dataMode === "live" ? "rgba(255,122,47,0.2)" : "transparent",
                color: dataMode === "live" ? "#FF7A2F" : "#666",
              }}
            >
              Live
            </button>
          </div>
        )}

        {/* HubSpot toggle */}
        {hubspotAvailable !== false && (
          <button
            onClick={toggleHubspot}
            disabled={hubspotLoading}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all relative"
            style={{
              background: useHubspot
                ? "rgba(255,122,47,0.1)"
                : "#161616",
              border: `1px solid ${
                useHubspot
                  ? "rgba(255,122,47,0.3)"
                  : hubspotError
                  ? "rgba(239,68,68,0.3)"
                  : "#262626"
              }`,
              color: useHubspot
                ? "#FF7A2F"
                : hubspotError
                ? "#EF4444"
                : "#666",
              opacity: hubspotLoading ? 0.7 : 1,
            }}
            title={
              hubspotError
                ? `Error: ${hubspotError}`
                : useHubspot
                ? `${hubspotDeals?.length || 0} live deals loaded`
                : "Switch to live HubSpot deals"
            }
          >
            {hubspotLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : useHubspot ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                HubSpot Live ({hubspotDeals?.length || 0})
              </span>
            ) : hubspotError ? (
              "HubSpot Error"
            ) : (
              "Connect HubSpot"
            )}
          </button>
        )}

        {/* Gmail connect */}
        <div className="relative">
          {gmailConnected ? (
            <button
              onClick={() => setShowGmailSetup(!showGmailSetup)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: "rgba(52,168,83,0.1)",
                border: "1px solid rgba(52,168,83,0.3)",
                color: "#34A853",
              }}
            >
              Gmail Connected
            </button>
          ) : (
            <button
              onClick={() => setShowGmailSetup(!showGmailSetup)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: "#161616",
                border: "1px solid #262626",
                color: "#666",
              }}
            >
              Connect Gmail
            </button>
          )}

          {/* Gmail setup dropdown */}
          {showGmailSetup && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl p-4 z-50"
              style={{ background: "#1a1a1a", border: "1px solid #333" }}
            >
              {gmailConnected ? (
                <div>
                  <p className="text-xs text-green-400 mb-3">Gmail is connected. Emails from deal contacts will appear automatically.</p>
                  <button
                    onClick={() => {
                      disconnectGmail();
                      setShowGmailSetup(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" }}
                  >
                    Disconnect Gmail
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-400 mb-3">
                    Connect Gmail to pull email history with deal contacts. Requires a Google OAuth Client ID.
                  </p>
                  <input
                    type="text"
                    placeholder="Google OAuth Client ID"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs mb-2 outline-none"
                    style={{ background: "#0E0E0E", border: "1px solid #333", color: "#E2E2E2" }}
                  />
                  {gmailError && (
                    <p className="text-xs text-red-400 mb-2">{gmailError}</p>
                  )}
                  <button
                    onClick={async () => {
                      if (clientIdInput.trim()) {
                        setGmailClientId(clientIdInput.trim());
                        await connectGmail();
                        if (useStore.getState().gmailConnected) {
                          setShowGmailSetup(false);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "rgba(66,133,244,0.15)", border: "1px solid rgba(66,133,244,0.3)", color: "#4285F4" }}
                  >
                    Connect with Google
                  </button>
                  <p className="text-[10px] text-slate-600 mt-2">
                    Read-only access.{" "}
                    {clientIdInput
                      ? "Click Connect to authorize."
                      : "Set GOOGLE_OAUTH_CLIENT_ID env var, or paste a Client ID above."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* API status indicator */}
        {apiStatus === false && (
          <span
            className="px-3 py-1.5 rounded-lg text-[10px] font-medium"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" }}
            title="API server unreachable. The deployment may need to be restarted."
          >
            API Offline
          </span>
        )}

        {/* User avatar & logout */}
        {user && (
          <div className="flex items-center gap-2">
            {user.picture && (
              <img
                src={user.picture}
                alt=""
                className="w-7 h-7 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: "#161616", border: "1px solid #262626", color: "#666" }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
