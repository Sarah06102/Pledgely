import { useAuth0 } from "@auth0/auth0-react";

function LogoutButton() {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
      className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-200 transition-colors"
    >
      Log Out
    </button>
  );
}

export default LogoutButton;