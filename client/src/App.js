import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import PromiseDatabase from "./components/PromiseDatabase";
import VideoUpload from "./components/VideoUpload";
import Compare from "./components/Compare";
import LandingPage from "./pages/LandingPage";

const VIEWS = {
  dashboard: Dashboard,
  promises: PromiseDatabase,
  upload: VideoUpload,
  compare: Compare,
};

function App() {
  const { isAuthenticated, isLoading } = useAuth0();
  const [activeView, setActiveView] = useState("dashboard");
  const ViewComponent = VIEWS[activeView] || Dashboard;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activeView={activeView} onViewChange={setActiveView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ViewComponent onViewChange={setActiveView} />
      </main>
    </div>
  );
}

export default App;