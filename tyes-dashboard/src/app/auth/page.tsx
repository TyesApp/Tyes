"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Tab = "signin" | "signup" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError("");
    if (!email || !password) { setError("Please enter your credentials"); return; }
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Redirect to client dashboard on success
        router.push("/dashboard/client");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError("");
    if (!firstName || !email || !password) { setError("Please fill in all required fields"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        alert("Registration successful! Please check your email for confirmation (if enabled) or sign in.");
        setTab("signin");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (!resetEmail) { setError("Please enter your email"); return; }
    setError("");
    alert("Reset link sent! (demo)");
    setTab("signin");
  };

  const title = tab === "signin" ? "Welcome back" : tab === "signup" ? "Create account" : "Reset password";
  const subtitle = tab === "signin" ? "Sign in to your account or create a new one" : tab === "signup" ? "Get started with tyes today" : "We'll help you get back in";

  return (
    <div style={{
      fontFamily: "'Montserrat', sans-serif",
      background: "#050505",
      color: "#fff",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@700;800&family=Montserrat:wght@400;500;600&display=swap');
        .auth-input { width:100%; padding:0.85rem 1rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#fff; font-family:'Montserrat',sans-serif; font-size:0.9rem; font-weight:500; margin-bottom:1rem; outline:none; transition:border-color 0.3s; }
        .auth-input::placeholder { color:rgba(255,255,255,0.3); }
        .auth-input:focus { border-color:#58b2ad; }
        .auth-btn { width:100%; padding:0.9rem; background:#58b2ad; color:#fff; border:none; border-radius:6px; font-family:'Montserrat',sans-serif; font-size:0.9rem; font-weight:500; text-transform:uppercase; letter-spacing:0.1em; cursor:pointer; transition:opacity 0.3s; margin-top:0.5rem; }
        .auth-btn:hover { opacity:0.85; }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .auth-btn-outline { width:100%; padding:0.9rem; background:transparent; border:1px solid rgba(255,255,255,0.15); color:#fff; border-radius:6px; font-family:'Montserrat',sans-serif; font-size:0.9rem; font-weight:500; text-transform:uppercase; letter-spacing:0.1em; cursor:pointer; transition:all 0.3s; margin-top:0.5rem; }
        .auth-btn-outline:hover { background:rgba(255,255,255,0.05); }
        .auth-tab { flex:1; padding:0.75rem; text-align:center; font-family:'Montserrat',sans-serif; font-size:0.85rem; font-weight:500; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer; background:transparent; border:none; color:rgba(255,255,255,0.4); transition:all 0.3s; }
        .auth-tab.active { background:#58b2ad; color:#fff; }
        .auth-link { color:#58b2ad; text-decoration:none; font-size:0.85rem; font-weight:500; }
        .auth-link:hover { text-decoration:underline; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420, padding: "2rem" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "3rem" }}>
          <img src="/images/tyes-logo-new.svg" alt="tyes" style={{ height: 36 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <span style={{ fontFamily: "'League Spartan',sans-serif", fontSize: "1.5rem", color: "#4ecdc4" }}>tyes</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'League Spartan',sans-serif", fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>{title}</h1>
        <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: "0.9rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: "2.5rem" }}>{subtitle}</p>

        {/* Tabs */}
        {tab !== "forgot" && (
          <div style={{ display: "flex", gap: 0, marginBottom: "2rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden" }}>
            <button className={`auth-tab ${tab === "signin" ? "active" : ""}`} onClick={() => setTab("signin")}>Sign In</button>
            <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Sign Up</button>
          </div>
        )}

        {/* Error */}
        {error && <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#f87171" }}>{error}</div>}

        {/* Sign In Form */}
        {tab === "signin" && (
          <div>
            <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSignIn()} />
            <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSignIn()} />
            <div style={{ textAlign: "right", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
              <button className="auth-link" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }} onClick={() => setTab("forgot")}>Forgot password?</button>
            </div>
            <button className="auth-btn" disabled={loading} onClick={handleSignIn}>{loading ? "Signing in…" : "Sign In"}</button>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", fontWeight: 500 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} /> or <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>
            <button className="auth-btn-outline" onClick={() => alert("Google sign-in coming soon")}>Continue with Google</button>
          </div>
        )}

        {/* Sign Up Form */}
        {tab === "signup" && (
          <div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <input className="auth-input" type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} style={{ flex: 1 }} />
              <input className="auth-input" type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} style={{ flex: 1 }} />
            </div>
            <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <input className="auth-input" type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <button className="auth-btn" disabled={loading} onClick={handleSignUp}>{loading ? "Creating account…" : "Create Account"}</button>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", fontWeight: 500 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} /> or <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>
            <button className="auth-btn-outline" onClick={() => alert("Google sign-in coming soon")}>Continue with Google</button>
          </div>
        )}

        {/* Forgot Password Form */}
        {tab === "forgot" && (
          <div>
            <p style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 500, fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem", textAlign: "center" }}>
              Enter your email and we'll send you a reset link.
            </p>
            <input className="auth-input" type="email" placeholder="Email address" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
            <button className="auth-btn" onClick={handleReset}>Send Reset Link</button>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button className="auth-link" style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setTab("signin")}>← Back to Sign In</button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
          <a href="/main.html" className="auth-link">← Back to home</a>
        </div>

      </div>
    </div>
  );
}
