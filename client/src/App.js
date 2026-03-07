import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import PromiseDatabase from "./components/PromiseDatabase";
import VideoUpload from "./components/VideoUpload";
import Compare from "./components/Compare";

const VIEWS = {
  dashboard: Dashboard,
  promises: PromiseDatabase,
  upload: VideoUpload,
  compare: Compare,
};

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const ViewComponent = VIEWS[activeView] || Dashboard;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activeView={activeView} onViewChange={setActiveView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ViewComponent />
      </main>
    </div>
  );
}

export default App;
