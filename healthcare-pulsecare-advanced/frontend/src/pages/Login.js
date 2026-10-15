import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Toast from "../components/Toast";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const submit = async (e) => {
    e.preventDefault(); setError("");
    if (!form.email || !form.password) return setError("Please enter your email and password.");
    try {
      setLoading(true);
      const res = await API.post("/api/auth/login", form);
      const u = res.data.user;
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", u.name); localStorage.setItem("role", u.role);
      localStorage.setItem("userEmail", u.email);
      nav(u.role === "doctor" ? "/doctor" : "/dashboard");
    } catch (err) { setToast({ type: "error", message: err.response?.data?.message || "Login failed" }); }
    finally { setLoading(false); }
  };

  return <main className="auth-page"><Toast toast={toast} onClose={() => setToast(null)} /><section className="auth-shell">
    <div className="auth-hero"><div><div className="brand"><div className="brand-mark">✚</div><div className="brand-name">PulseCare</div></div><div className="eyebrow">Healthcare, but make it simple.</div><h1>Your health.<br/><span>Your flow.</span></h1><p>A modern healthcare workspace for patients and doctors — appointments, availability and care updates in one clean dashboard.</p><div className="hero-pills"><span className="hero-pill">⚡ Smart booking</span><span className="hero-pill">🩺 Doctor workspace</span><span className="hero-pill">🔔 Live status</span></div></div><div className="hero-note">MERN healthcare workflow · React + Express + MongoDB</div></div>
    <div className="auth-card"><div className="mobile-brand"><div className="brand"><div className="brand-mark">✚</div><div className="brand-name">PulseCare</div></div></div><h2>Welcome back 👋</h2><p className="sub">Sign in to continue to your workspace.</p>{error && <div className="error-box">{error}</div>}
      <form onSubmit={submit}><div className="field"><label>Email</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div><div className="field"><label>Password</label><input type="password" placeholder="Enter your password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div><button className="primary-btn full" disabled={loading}>{loading ? "Signing in..." : "Enter workspace →"}</button></form><p className="auth-switch">New here? <button className="link-btn" onClick={()=>nav("/register")}>Create an account</button></p>
    </div>
  </section></main>;
}
