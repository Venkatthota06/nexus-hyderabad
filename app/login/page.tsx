"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Activity, ArrowRight, BarChart3, Check, Eye, EyeOff, FileCheck2, FlaskConical, LockKeyhole, Mail, ShieldCheck, Sparkles, TestTubes, UsersRound } from "lucide-react";
import "./login.css";

type LoginStage = "idle" | "checking" | "verified";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stage, setStage] = useState<LoginStage>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (stage !== "verified") return;
    const timer = window.setTimeout(() => { router.push("/admin"); router.refresh(); }, 900);
    return () => window.clearTimeout(timer);
  }, [stage, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStage("checking"); setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) { setError("Access not recognized. Check your email and password."); setStage("idle"); return; }
      setStage("verified");
    } catch { setError("Unable to connect to the secure workspace. Please try again."); setStage("idle"); }
  }

  const busy = stage !== "idle";

  return (
    <main className={`nexus-login-page ${stage === "verified" ? "is-verified" : ""}`}>
      <div className="nexus-login-grid" /><div className="nexus-login-beam" /><div className="nexus-login-orb nexus-login-orb-one" /><div className="nexus-login-orb nexus-login-orb-two" /><div className="nexus-login-orb nexus-login-orb-three" />
      <div className="nexus-login-radar" aria-hidden="true"><span /><i /><b /></div>
      <div className="nexus-login-particles" aria-hidden="true">{Array.from({length:12}).map((_,i)=><i key={i} />)}</div>

      <section className="nexus-login-shell">
        <div className="nexus-login-story">
          <div className="nexus-login-brand nexus-login-reveal"><div className="nexus-login-logo-wrap"><img src="/nexus-logo.png" alt="Nexus Test Labs" /></div><div><span className="nexus-login-eyebrow">NEXUS TEST LABS</span><p>Hyderabad Operations Platform</p></div></div>
          <div className="nexus-login-hero nexus-login-reveal nexus-login-delay-1"><div className="nexus-login-chip"><Sparkles size={14}/> Operations Intelligence</div><h1>From enquiry to report.<br/><span>One connected workspace.</span></h1><p>Track business, testing and field operations through the secure Nexus command center built for the Hyderabad team.</p></div>

          <div className="nexus-command-strip nexus-login-reveal nexus-login-delay-2">
            <div className="nexus-command-item"><span><UsersRound size={17}/></span><div><small>CLIENTS</small><strong>Business Pipeline</strong></div></div><div className="nexus-command-divider"/>
            <div className="nexus-command-item"><span><TestTubes size={17}/></span><div><small>LAB FLOW</small><strong>Samples & Testing</strong></div></div><div className="nexus-command-divider"/>
            <div className="nexus-command-item"><span><FileCheck2 size={17}/></span><div><small>DELIVERY</small><strong>Reports & Follow-ups</strong></div></div>
          </div>

          <div className="nexus-login-flow nexus-login-reveal nexus-login-delay-3" aria-label="Nexus workflow"><div className="nexus-login-flow-card"><BarChart3 size={18}/><span>Business</span></div><div className="nexus-login-flow-line"><i/></div><div className="nexus-login-flow-card"><FlaskConical size={18}/><span>Testing</span></div><div className="nexus-login-flow-line"><i/></div><div className="nexus-login-flow-card"><Activity size={18}/><span>Operations</span></div></div>
          <div className="nexus-login-status nexus-login-reveal nexus-login-delay-3"><span className="nexus-login-live-dot"/><div><strong>Command center available</strong><small>Secure workspace • Hyderabad Operations</small></div></div>
        </div>

        <div className="nexus-login-panel-wrap nexus-login-reveal nexus-login-delay-1"><div className="nexus-login-panel-glow"/><div className="nexus-panel-ring nexus-panel-ring-one"/><div className="nexus-panel-ring nexus-panel-ring-two"/>
          <form onSubmit={handleSubmit} className="nexus-login-panel">
            <div className="nexus-login-panel-top"><div className="nexus-login-security"><ShieldCheck size={18}/></div><div><span>SECURE ADMIN ACCESS</span><small>Nexus Test Labs internal workspace</small></div><div className="nexus-login-encrypted"><i/> ENCRYPTED</div></div>
            <div className="nexus-login-heading"><p>Welcome back</p><h2>Access your workspace</h2><span>Use your authorized administrator credentials.</span></div>
            <div className="nexus-login-field"><label htmlFor="admin-email">Email address</label><div className="nexus-login-input-wrap"><Mail size={18}/><input id="admin-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" placeholder="name@nexustestlabs.com" disabled={busy}/></div></div>
            <div className="nexus-login-field"><label htmlFor="admin-password">Password</label><div className="nexus-login-input-wrap"><LockKeyhole size={18}/><input id="admin-password" type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter your password" disabled={busy}/><button type="button" className="nexus-login-eye" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"} disabled={busy}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></div>
            {error&&<div className="nexus-login-error">{error}</div>}
            <button type="submit" disabled={busy} className={`nexus-login-submit ${stage==="verified"?"is-success":""}`}>{stage==="checking"?<><span className="nexus-login-loader"><i/><i/><i/></span><span>Verifying secure access</span></>:stage==="verified"?<><span className="nexus-login-check"><Check size={17}/></span><span>Access verified</span></>:<><span>Open Command Center</span><ArrowRight size={19}/></>}</button>
            <div className="nexus-login-progress" aria-hidden="true"><span className={stage==="checking"?"is-running":stage==="verified"?"is-complete":""}/></div>
            <div className="nexus-login-trust"><ShieldCheck size={14}/><span>Protected administrator session</span><b>•</b><span>Internal access</span></div>
          </form>
        </div>
      </section>
      <div className="nexus-login-footer"><span>Nexus Test Labs Pvt. Ltd.</span><i/> Hyderabad Operations</div>
      {stage==="verified"&&<div className="nexus-access-overlay"><div className="nexus-access-halo"/><div className="nexus-access-ring"><Check size={30}/></div><strong>Access verified</strong><span>Opening Nexus Command Center...</span><div className="nexus-access-line"><i/></div></div>}
    </main>
  );
}
