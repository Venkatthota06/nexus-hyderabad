"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Activity, ArrowRight, BarChart3, Eye, EyeOff, FlaskConical, LockKeyhole, Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) { setError("Invalid email or password."); return; }
      router.push("/admin"); router.refresh();
    } catch { setError("Unable to sign in. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <main className="nexus-login-page">
      <div className="nexus-login-grid" /><div className="nexus-login-orb nexus-login-orb-one" /><div className="nexus-login-orb nexus-login-orb-two" /><div className="nexus-login-orb nexus-login-orb-three" />
      <section className="nexus-login-shell">
        <div className="nexus-login-story">
          <div className="nexus-login-brand nexus-login-reveal"><div className="nexus-login-logo-wrap"><img src="/nexus-logo.png" alt="Nexus Test Labs" /></div><div><span className="nexus-login-eyebrow">NEXUS TEST LABS</span><p>Hyderabad Operations</p></div></div>
          <div className="nexus-login-hero nexus-login-reveal nexus-login-delay-1"><div className="nexus-login-chip"><Sparkles size={14} /> Business Intelligence Workspace</div><h1>One command center.<br /><span>Every operation in focus.</span></h1><p>From client opportunities to samples, reports and collections — manage Hyderabad operations through one secure workspace.</p></div>
          <div className="nexus-login-flow nexus-login-reveal nexus-login-delay-2" aria-label="Nexus workflow"><div className="nexus-login-flow-card"><BarChart3 size={20} /><span>Business</span></div><div className="nexus-login-flow-line"><i /></div><div className="nexus-login-flow-card"><FlaskConical size={20} /><span>Testing</span></div><div className="nexus-login-flow-line"><i /></div><div className="nexus-login-flow-card"><Activity size={20} /><span>Operations</span></div></div>
          <div className="nexus-login-status nexus-login-reveal nexus-login-delay-3"><span className="nexus-login-live-dot" /><div><strong>Operations workspace online</strong><small>Secure access • Hyderabad CRM</small></div></div>
        </div>
        <div className="nexus-login-panel-wrap nexus-login-reveal nexus-login-delay-1"><div className="nexus-login-panel-glow" /><form onSubmit={handleSubmit} className="nexus-login-panel">
          <div className="nexus-login-panel-top"><div className="nexus-login-security"><ShieldCheck size={18} /></div><div><span>SECURE ACCESS</span><small>Authorized team members only</small></div></div>
          <div className="nexus-login-heading"><p>Welcome back</p><h2>Enter the Nexus Command Center</h2><span>Sign in to continue to your operations dashboard.</span></div>
          <div className="nexus-login-field"><label htmlFor="admin-email">Admin Email</label><div className="nexus-login-input-wrap"><Mail size={18} /><input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="name@nexustestlabs.com" /></div></div>
          <div className="nexus-login-field"><label htmlFor="admin-password">Password</label><div className="nexus-login-input-wrap"><LockKeyhole size={18} /><input id="admin-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter your password" /><button type="button" className="nexus-login-eye" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
          {error && <div className="nexus-login-error">{error}</div>}
          <button type="submit" disabled={loading} className="nexus-login-submit"><span>{loading ? "Authenticating..." : "Enter Command Center"}</span>{loading ? <Loader2 size={19} className="nexus-login-spinner" /> : <ArrowRight size={19} />}</button>
          <div className="nexus-login-trust"><ShieldCheck size={14} /><span>Protected administrator session</span></div>
        </form></div>
      </section>
      <div className="nexus-login-footer">Nexus Test Labs Pvt. Ltd. <span>•</span> Hyderabad Operations</div>
    </main>
  );
}
