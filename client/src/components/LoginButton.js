import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function LoginButton({ variant = "primary", className = "" }) {
  const { loginWithRedirect } = useAuth0();
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await loginWithRedirect({
        openUrl: (url) => window.location.assign(url),
        authorizationParams: {
          prompt: "login",
        },
      });
    } catch (err) {
      console.error("Auth0 login error:", err);
      setError(err.message || "Login failed. Check the console for details.");
    }
  };

  const base = "inline-flex items-center justify-center font-semibold transition-colors rounded-xl";
  const styles = {
    primary:
      "px-8 py-4 bg-pink-600 text-white shadow-lg shadow-pink-600/25 hover:bg-pink-700",
    secondary: "px-4 py-2 text-slate-700 hover:bg-white/80",
    dark: "px-6 py-3 bg-white text-slate-900 hover:bg-slate-100",
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <button
        onClick={handleLogin}
        type="button"
        className={`${base} ${styles[variant] || styles.primary} ${className}`}
      >
        Login / Sign up with Auth0
      </button>
      {error && (
        <p className="text-sm text-rose-600 max-w-xs text-center">{error}</p>
      )}
    </div>
  );
}

export default LoginButton;