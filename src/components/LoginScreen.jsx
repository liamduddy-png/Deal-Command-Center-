import { useEffect, useRef } from "react";
import useStore from "../store/useStore";

export default function LoginScreen() {
  const login = useStore((s) => s.login);
  const authError = useStore((s) => s.authError);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: "966154775580-dh3q3n588fgbp0iujd22v08bnfg6g4b8.apps.googleusercontent.com",
      callback: (response) => {
        // Decode the JWT credential to get user info
        const payload = JSON.parse(atob(response.credential.split(".")[1]));
        login({
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
        });
      },
    });

    // Render the Google Sign-In button
    if (btnRef.current) {
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "signin_with",
        width: 280,
      });
    }
  }, [login]);

  return (
    <div className="h-screen flex items-center justify-center" style={{ background: "#0E0E0E" }}>
      <div className="flex flex-col items-center gap-8">
        {/* Logo & title */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold" style={{ color: "#E2E2E2" }}>
            Trunk Tools
          </h1>
          <p className="text-sm mt-1" style={{ color: "#555" }}>
            Deal Command Center
          </p>
        </div>

        {/* Google Sign-In button */}
        <div
          ref={btnRef}
          className="flex items-center justify-center"
          style={{ minHeight: 44 }}
        />

        {authError && (
          <p className="text-xs text-red-400">{authError}</p>
        )}

        <p className="text-[11px]" style={{ color: "#444" }}>
          Sign in with your Google account to continue
        </p>
      </div>
    </div>
  );
}
