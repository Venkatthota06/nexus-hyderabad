import type { ReactNode } from "react";
import "./client-portal.css";

export const metadata = {
  title: "Client Portal Demo | Nexus Test Labs",
  robots: { index: false, follow: false },
};

export default function ClientLayout({ children }: { children: ReactNode }) {
  return <div className="client-portal-shell">{children}</div>;
}
