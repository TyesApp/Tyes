"use client";
import React from "react";
import { X } from "lucide-react";
import { Toast } from "@/hooks/useToast";

// ── Toast Container ──────────────────────────────────────
export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease", color: "#fff",
          background: t.type === "success" ? "#065f46" : t.type === "error" ? "#7f1d1d" : t.type === "warning" ? "#78350f" : "#1e3a5f",
          border: `1px solid ${t.type === "success" ? "#34d399" : t.type === "error" ? "#f87171" : t.type === "warning" ? "#fbbf24" : "#60a5fa"}44`,
        }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number;
}) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, width: width || 440, maxWidth: "90vw", maxHeight: "80vh", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#6b7280" }}><X size={14} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Dropdown ─────────────────────────────────────────────
interface DropdownItem {
  icon?: React.ComponentType<{ size?: number }>;
  label?: string;
  action?: () => void;
  danger?: boolean;
  divider?: boolean;
}
export function Dropdown({ items, onClose }: { items: DropdownItem[]; onClose: () => void }) {
  return (
    <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 100, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 4, minWidth: 160, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
      {items.map((item, i) => item.divider ? (
        <div key={i} style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
      ) : (
        <button key={i} onClick={() => { item.action?.(); onClose(); }}
          style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: "transparent", color: item.danger ? "#f87171" : "#d1d5db", fontSize: 12, cursor: "pointer", borderRadius: 6, textAlign: "left" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {item.icon && React.createElement(item.icon, { size: 13 })}
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ── Input Field ──────────────────────────────────────────
export function InputField({ label, value, onChange, placeholder, type }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>{label}</label>
      <input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none" }} />
    </div>
  );
}

// ── Sidebar Item ─────────────────────────────────────────
export function SidebarItem({ icon: Icon, label, active, onClick, collapsed }: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string; active: boolean; onClick: () => void; collapsed: boolean;
}) {
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 12px" : "10px 14px", borderRadius: 10, width: "100%", border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#fff" : "#6b7280", background: active ? "linear-gradient(135deg,rgba(78,205,196,0.25),rgba(42,183,169,0.15))" : "transparent", transition: "all 0.2s", justifyContent: collapsed ? "center" : "flex-start" }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <Icon size={17} style={{ flexShrink: 0 }} />
      {!collapsed && label}
    </button>
  );
}
