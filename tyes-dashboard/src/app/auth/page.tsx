"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type Tab = "signin" | "signup" | "forgot";

// ══════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ══════════════════════════════════════
const useToast = () => {
  const [toasts, setToasts] = useState<any[]>([]);
  const addToast = useCallback((message: string, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return { toasts, addToast };
};

const ToastContainer = ({ toasts }: { toasts: any[] }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        padding: "10px 18px",
        borderRadius: 10,
        background: t.type === "success" ? "#065f46" : t.type === "error" ? "#7f1d1d" : t.type === "warning" ? "#78350f" : "#1e3a5f",
        color: "#fff",
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        border: `1px solid ${t.type === "success" ? "#34d399" : t.type === "error" ? "#f87171" : t.type === "warning" ? "#fbbf24" : "#60a5fa"}44`
      }}>
        {t.message}
      </div>
    ))}
  </div>
);

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toasts, addToast } = useToast();
  const [mounted, setMounted] = useState(false);

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  const title = tab === "signin" ? "Welcome back" : tab === "signup" ? "Create account" : "Reset password";
  const subtitle = tab === "signin" ? "Sign in to your account or create a new one" : tab === "signup" ? "Get started with tyes today" : "We'll help you get back in";

  if (!mounted) return null;

  const handleSignIn = async () => {
    setError("");
    if (!email || !password) { addToast("Please enter your credentials", "error"); return; }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        addToast("Signed in successfully!", "success");
        const role = data.user.user_metadata?.role || "client";
        router.push(role === "admin" ? "/dashboard/admin" : "/dashboard/client");
      }
    } catch (err: any) {
      addToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError("");
    if (!firstName || !email || !password) { addToast("Please fill in all required fields", "error"); return; }
    if (password !== confirmPassword) { addToast("Passwords do not match", "error"); return; }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: "client",
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        addToast("Account created successfully!", "success");
        const role = data.user.user_metadata?.role || "client";
        router.push(role === "admin" ? "/dashboard/admin" : "/dashboard/client");
      }
    } catch (err: any) {
      addToast(err.message || "An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };


  const handleReset = () => {
    if (!resetEmail) { addToast("Please enter your email", "error"); return; }
    addToast("Reset link sent to your email!", "success");
    setTab("signin");
  };

  return (
    <div style={{
      fontFamily: "Montserrat, sans-serif",
      background: "#050505",
      color: "#fff",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <ToastContainer toasts={toasts} />
      <style>{`
        .auth-input { width:100%; padding:0.85rem 1rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:#fff; font-family:Montserrat,sans-serif; font-size:0.9rem; font-weight:500; margin-bottom:1rem; outline:none; transition:border-color 0.3s; }
        .auth-input::placeholder { color:rgba(255,255,255,0.3); }
        .auth-input:focus { border-color:#58b2ad; }
        .auth-btn { width:100%; padding:0.9rem; background:#58b2ad; color:#fff; border:none; border-radius:6px; font-family:Montserrat,sans-serif; font-size:0.9rem; font-weight:500; text-transform:uppercase; letter-spacing:0.1em; cursor:pointer; transition:opacity 0.3s; margin-top:0.5rem; }
        .auth-btn:hover { opacity:0.85; }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .auth-btn-outline { width:100%; padding:0.9rem; background:transparent; border:1px solid rgba(255,255,255,0.15); color:#fff; border-radius:6px; font-family:Montserrat,sans-serif; font-size:0.9rem; font-weight:500; text-transform:uppercase; letter-spacing:0.1em; cursor:pointer; transition:all 0.3s; margin-top:0.5rem; }
        .auth-btn-outline:hover { background:rgba(255,255,255,0.05); }
        .auth-tab { flex:1; padding:0.75rem; text-align:center; font-family:Montserrat,sans-serif; font-size:0.85rem; font-weight:500; text-transform:uppercase; letter-spacing:0.08em; cursor:pointer; background:transparent; border:none; color:rgba(255,255,255,0.4); transition:all 0.3s; }
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
        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.9rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: "2.5rem" }}>{subtitle}</p>

        {/* Tabs */}
        {tab !== "forgot" && (
          <div style={{ display: "flex", gap: 0, marginBottom: "2rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden" }}>
            <button className={`auth-tab ${tab === "signin" ? "active" : ""}`} onClick={() => setTab("signin")}>Sign In</button>
            <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Sign Up</button>
          </div>
        )}


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
            <button className="auth-btn-outline" onClick={() => addToast("Google sign-in coming soon", "warning")}>Continue with Google</button>
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
            <button className="auth-btn-outline" onClick={() => addToast("Google sign-in coming soon", "warning")}>Continue with Google</button>
          </div>
        )}

        {/* Forgot Password Form */}
        {tab === "forgot" && (
          <div>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem", textAlign: "center" }}>
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
