"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  MapPin,
  TestTube2,
  FileText,
} from "lucide-react";

const links = [
  {
    href: "/client/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/client/samples",
    label: "Samples",
    icon: TestTube2,
  },
  {
    href: "/client/reports",
    label: "Reports",
    icon: FileText,
  },
  {
    href: "/client/locations",
    label: "Locations",
    icon: MapPin,
  },
];

export default function PortalHeader() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    sessionStorage.removeItem("nexus-client-demo");
    router.push("/client/login");
  }

  return (
    <header className="client-topbar">
      <Link href="/client/dashboard">
        <Image
  src="/nexus-logo.png"
  alt="Nexus Test Labs"
  width={145}
  height={56}
  priority
/>
      </Link>

      <nav
        className="client-nav"
        aria-label="Client portal navigation"
      >
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            className={`client-nav-link ${
              pathname.startsWith(href) ? "is-active" : ""
            }`}
            href={href}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="client-topbar-actions">
        <span className="client-demo-badge">
          DEMO CLIENT
        </span>

        <div className="client-user">
          <div className="client-avatar">U</div>

          <div>
            <strong>Uday Demo Industries</strong>
            <span>Hyderabad</span>
          </div>
        </div>

        <button
          className="client-logout"
          onClick={logout}
          title="Sign out"
        >
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}