import type { ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import LeadJourneyContext from "@/components/LeadJourneyContext";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="admin-shell">
      <AdminSidebar />

      <main className="admin-shell-main">
        <LeadJourneyContext />
        {children}
      </main>
    </div>
  );
}