"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ToastContainer } from "./Toast";
import { ConfirmDialog } from "./ConfirmDialog";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell min-h-screen bg-gray-900 text-gray-100">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-0 md:ml-64">
          <Topbar />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
}
