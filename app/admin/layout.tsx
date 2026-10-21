import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminSidebar from "@/components/AdminSidebar";
import LeadJourneyContext from "@/components/LeadJourneyContext";
import "./responsive-final.css";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = String(
    (session.user as { role?: string | null }).role || "TEAM",
  ).toUpperCase();

  if (role !== "ADMIN" && role !== "MANAGER") {
    redirect("/team");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <main className="admin-shell-main">
        <Suspense fallback={null}>
          <LeadJourneyContext />
        </Suspense>
        {children}
      </main>
    </div>
  );
}
