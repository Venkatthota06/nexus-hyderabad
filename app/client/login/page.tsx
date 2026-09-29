"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("uday.demo@nexustestlabs.com");
  const [accessCode, setAccessCode] = useState("DEMO2026");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sessionStorage.setItem("nexus-client-demo", "active");
    router.push("/client/dashboard");
  }

  return (
    <main className="client-login-page">
      <section className="client-login-brand">
        <div className="client-logo-box">
          <Image
  src="/nexus-logo.png"
  alt="Nexus Test Labs"
  width={180}
  height={70}
  priority
/>
        </div>
        <div className="client-brand-copy">
          <div className="eyebrow">Nexus Client Portal</div>
          <h1>Your testing journey, visible from collection to report.</h1>
          <p>
            Track samples, follow testing progress and access completed
            laboratory reports from one secure customer portal.
          </p>
        </div>
        <div className="client-demo-pill">
          DEMO ENVIRONMENT • NO REAL CLIENT DATA
        </div>
      </section>

      <section className="client-login-panel">
        <form className="client-login-card" onSubmit={handleSubmit}>
          <h2>Client sign in</h2>
          <p>
            For this demonstration, imagine you are a Nexus customer checking
            your Hyderabad testing activity.
          </p>
          <div className="client-field">
            <label htmlFor="email">Registered email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="client-field">
            <label htmlFor="code">Demo access code</label>
            <input
              id="code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
            />
          </div>
          <button className="client-primary-btn" type="submit">
            Open my client portal
          </button>
          <div className="client-login-note">
            <strong>Demo only:</strong> this sign-in is intentionally isolated
            from the production CRM. Real customer authentication and
            permissions will be connected only after approval.
          </div>
        </form>
      </section>
    </main>
  );
}
