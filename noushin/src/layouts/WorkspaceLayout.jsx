import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

// The frame around every operator, recycler and admin page: sidebar on the left, top bar above the page.
// The sidebar shows the menu for the logged-in user's role.
export default function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // only used on phones

  return (
    <div className="grid min-h-screen gap-4 p-4 lg:grid-cols-[250px_minmax(0,1fr)]">
      <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="fixed inset-0 z-[45] bg-ink/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="grid min-w-0 content-start gap-5">
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="grid min-w-0 content-start gap-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
