import type { ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="admin-shell">
      <AdminSidebar />

      <main className="admin-shell-main">
        {children}
      </main>
    </div>
  );
}