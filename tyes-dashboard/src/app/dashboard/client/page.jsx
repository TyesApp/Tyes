"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Bell, ChevronDown, ChevronRight, ChevronLeft, Download, MoreVertical, Plus, Eye, Check, X, Clock, RefreshCw, Upload, Image, Settings, LogOut, Home, Package, CreditCard, FileText, MessageSquare, User, Camera, Paperclip, Send, Star, ArrowUpRight, Menu, AlertCircle, Zap, ExternalLink, Trash2, Edit, Save } from "lucide-react";

// ══════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ══════════════════════════════════════
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return { toasts, addToast };
};

const ToastContainer = ({ toasts }) => (
  <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{ padding: "10px 18px", borderRadius: 10, background: t.type === "success" ? "#065f46" : t.type === "error" ? "#7f1d1d" : t.type === "warning" ? "#78350f" : "#1e3a5f", color: "#fff", fontSize: 13, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease", border: `1px solid ${t.type === "success" ? "#34d399" : t.type === "error" ? "#f87171" : t.type === "warning" ? "#fbbf24" : "#60a5fa"}44` }}>
        {t.message}
      </div>
    ))}
  </div>
);

// ══════════════════════════════════════
// MODAL SYSTEM
// ══════════════════════════════════════
const Modal = ({ open, onClose, title, children, width }) => {
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
};

// ══════════════════════════════════════
// HELPERS & COMPONENTS
// ══════════════════════════════════════
const statusConfig = {
  pending: { label: "Pending", bg: "rgba(107,114,128,0.15)", color: "#9ca3af", icon: Clock },
  in_progress: { label: "In Progress", bg: "rgba(59,130,246,0.15)", color: "#60a5fa", icon: Clock },
  revision: { label: "Revision", bg: "rgba(251,191,36,0.15)", color: "#fbbf24", icon: RefreshCw },
  approved: { label: "Approved", bg: "rgba(16,185,129,0.15)", color: "#34d399", icon: Check },
  completed: { label: "Completed", bg: "rgba(16,185,129,0.15)", color: "#34d399", icon: Check },
  delivered: { label: "Delivered", bg: "rgba(78,205,196,0.15)", color: "#4ecdc4", icon: Package },
};

const StatusBadge = ({ status }) => {
  const c = statusConfig[status] || statusConfig.pending;
  const Icon = c.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.color, fontSize: 11, fontWeight: 600 }}>
      <Icon size={11} /> {c.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, accent, onClick }) => (
  <div onClick={onClick} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 22px", flex: 1, minWidth: 180, cursor: onClick ? "pointer" : "default", transition: "all 0.2s" }} onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = "rgba(78,205,196,0.2)"; }} onMouseLeave={e => { if (onClick) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
      <Icon size={16} color="#fff" />
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: accent || "#fff", marginBottom: 2 }}>{value}</div>
    <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>{sub}</div>}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed, badge }) => (
  <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 12px" : "10px 14px", borderRadius: 10, width: "100%", border: "none", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#fff" : "#6b7280", background: active ? "linear-gradient(135deg,rgba(78,205,196,0.25),rgba(42,183,169,0.15))" : "transparent", transition: "all 0.2s", justifyContent: collapsed ? "center" : "flex-start", position: "relative" }} onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = active ? "linear-gradient(135deg,rgba(78,205,196,0.25),rgba(42,183,169,0.15))" : "transparent"; }}>
    <Icon size={17} style={{ flexShrink: 0 }} />
    {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{label}</span>}
    {!collapsed && badge && <span style={{ background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{badge}</span>}
  </button>
);

const InputField = ({ label, value, onChange, placeholder, type }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>{label}</label>
    <input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
  </div>
);

// ══════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════
const navPages = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "new-order", label: "New Order", icon: Plus },
  { id: "messages", label: "Messages", icon: MessageSquare, badge: "1" },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "account", label: "Account", icon: User },
];

export default function TyesClient() {
  const router = useRouter();
  const supabase = createClient();
  const { toasts, addToast } = useToast();
  const [page, setPage] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifDrop, setShowNotifDrop] = useState(false);
  const [showProfileDrop, setShowProfileDrop] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth");
    } catch (error) {
      addToast("Error logging out", "error");
    }
  };
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(null);
  const [showRevisionModal, setShowRevisionModal] = useState(null);

  // ── Client Info State ──
  const [clientInfo, setClientInfo] = useState({
    name: "Glossier Inc.", email: "studio@glossier.com", tier: "pro", joined: "Dec 2025", totalOrders: 8, totalSpent: 640, imagesDelivered: 42, freeTestUsed: true,
  });

  // ── Orders State ──
  const [orders, setOrders] = useState([
    { id: "ORD-3011", title: "Spring Skincare Campaign", plan: "Growth", images: 10, status: "revision", category: "Skincare", date: "2026-04-13", revenue: 80, revisions: 2, maxRevisions: 3, progress: 75, items: [
      { name: "Milky Jelly Cleanser — Hero", status: "approved" },
      { name: "Milky Jelly Cleanser — Lifestyle", status: "approved" },
      { name: "Priming Moisturizer — Product Shot", status: "revision" },
      { name: "Priming Moisturizer — Editorial", status: "revision" },
      { name: "Super Pure Serum — Close Up", status: "in_progress" },
      { name: "Super Pure Serum — Flatlay", status: "in_progress" },
      { name: "Balm Dotcom — Hero", status: "pending" },
      { name: "Balm Dotcom — Texture", status: "pending" },
      { name: "Solution — Product Shot", status: "pending" },
      { name: "Solution — Before/After", status: "pending" },
    ]},
    { id: "ORD-2988", title: "Cloud Paint Collection", plan: "Starter", images: 5, status: "delivered", category: "Makeup", date: "2026-03-28", revenue: 45, revisions: 1, maxRevisions: 3, progress: 100, items: [
      { name: "Cloud Paint Dusk — Hero", status: "delivered" },
      { name: "Cloud Paint Beam — Hero", status: "delivered" },
      { name: "Cloud Paint Storm — Hero", status: "delivered" },
      { name: "Cloud Paint Puff — Lifestyle", status: "delivered" },
      { name: "Cloud Paint Range — Flatlay", status: "delivered" },
    ]},
    { id: "ORD-2965", title: "Boy Brow Product Shots", plan: "Starter", images: 5, status: "delivered", category: "Makeup", date: "2026-03-15", revenue: 45, revisions: 0, maxRevisions: 3, progress: 100, items: [] },
    { id: "ORD-2940", title: "Futuredew Editorial", plan: "Growth", images: 10, status: "delivered", category: "Skincare", date: "2026-03-01", revenue: 80, revisions: 1, maxRevisions: 3, progress: 100, items: [] },
    { id: "ORD-2921", title: "Lash Slick Campaign", plan: "Starter", images: 5, status: "delivered", category: "Makeup", date: "2026-02-18", revenue: 45, revisions: 0, maxRevisions: 3, progress: 100, items: [] },
    { id: "ORD-2900", title: "Skin Tint Launch", plan: "Growth", images: 10, status: "delivered", category: "Makeup", date: "2026-02-05", revenue: 80, revisions: 2, maxRevisions: 3, progress: 100, items: [] },
    { id: "ORD-2880", title: "Glossier You Perfume", plan: "Single", images: 1, status: "delivered", category: "Fragrance", date: "2026-01-20", revenue: 10, revisions: 0, maxRevisions: 3, progress: 100, items: [] },
    { id: "ORD-2855", title: "Free Test — Milky Jelly", plan: "Free Test", images: 1, status: "delivered", category: "Skincare", date: "2025-12-18", revenue: 0, revisions: 0, maxRevisions: 3, progress: 100, items: [] },
  ]);

  // ── Messages State ──
  const [messagesList, setMessagesList] = useState([
    { id: 1, from: "team", name: "Tyes Team", text: "Hi! We've started working on ORD-3011. Two images need a small revision on the label area — could you confirm the font is Futura PT?", time: "2 hrs ago", read: true },
    { id: 2, from: "client", name: "You", text: "Yes, it's Futura PT Bold for the headline and Futura PT Book for body text. File attached in the brief.", time: "1 hr ago", read: true },
    { id: 3, from: "team", name: "Tyes Team", text: "Perfect, thank you! We'll have the revision ready within the hour.", time: "45 min ago", read: false },
  ]);

  // ── Invoices State ──
  const [invoices, setInvoices] = useState([
    { id: "INV-0087", order: "ORD-3011", amount: 80, status: "pending", date: "2026-04-13", due: "2026-04-27" },
    { id: "INV-0074", order: "ORD-2988", amount: 45, status: "paid", date: "2026-03-28", due: "2026-04-11" },
    { id: "INV-0068", order: "ORD-2965", amount: 45, status: "paid", date: "2026-03-15", due: "2026-03-29" },
    { id: "INV-0055", order: "ORD-2940", amount: 80, status: "paid", date: "2026-03-01", due: "2026-03-15" },
    { id: "INV-0044", order: "ORD-2921", amount: 45, status: "paid", date: "2026-02-18", due: "2026-03-04" },
    { id: "INV-0033", order: "ORD-2900", amount: 80, status: "paid", date: "2026-02-05", due: "2026-02-19" },
    { id: "INV-0021", order: "ORD-2880", amount: 10, status: "paid", date: "2026-01-20", due: "2026-02-03" },
  ]);

  // ── Notifications ──
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Revision ready for ORD-3011", time: "10 min ago", read: false },
    { id: 2, text: "Invoice INV-0087 generated", time: "2 hrs ago", read: false },
    { id: 3, text: "ORD-2988 delivered", time: "1 day ago", read: true },
  ]);

  // ── Account Prefs State ──
  const [prefs, setPrefs] = useState({ orderNotif: true, msgNotif: true, weeklyReport: false });
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyName, setCompanyName] = useState("Glossier Inc.");
  const [companyEmail, setCompanyEmail] = useState("studio@glossier.com");

  const spendingData = [
    { month: "Jan", spent: 10 }, { month: "Feb", spent: 125 },
    { month: "Mar", spent: 170 }, { month: "Apr", spent: 80 },
  ];

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadMsgs = messagesList.filter(m => !m.read && m.from === "team").length;

  const markNotifsRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));

  // ══════════════════════════════════════
  // OVERVIEW PAGE
  // ══════════════════════════════════════
  const OverviewPage = () => {
    const activeOrder = orders.find(o => o.status !== "delivered");
    return (
      <div>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>Welcome back, {companyName.split(" ")[0]}</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Here's an overview of your account.</p>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard icon={Package} label="Total Orders" value={orders.length} sub={`Since ${clientInfo.joined}`} onClick={() => setPage("orders")} />
          <StatCard icon={Image} label="Images Delivered" value={orders.filter(o => o.status === "delivered").reduce((s, o) => s + o.images, 0)} sub="Across all orders" onClick={() => setPage("orders")} />
          <StatCard icon={CreditCard} label="Total Spent" value={`$${orders.reduce((s, o) => s + o.revenue, 0)}`} accent="#34d399" sub="Lifetime" onClick={() => setPage("invoices")} />
          <StatCard icon={Star} label="Your Tier" value="Pro" sub="5+ orders" />
        </div>

        {activeOrder && (
          <div style={{ background: "rgba(78,205,196,0.04)", border: "1px solid rgba(78,205,196,0.15)", borderRadius: 16, padding: 24, marginBottom: 24, cursor: "pointer" }} onClick={() => { setPage("orders"); }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Zap size={14} color="#4ecdc4" />
                  <span style={{ fontSize: 12, color: "#4ecdc4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Order</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{activeOrder.title}</h3>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{activeOrder.id} · {activeOrder.plan} · {activeOrder.images} images</span>
              </div>
              <StatusBadge status={activeOrder.status} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Progress</span>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{activeOrder.progress}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ width: `${activeOrder.progress}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#4ecdc4,#2ab7a9)", transition: "width 0.5s" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {activeOrder.items.slice(0, 6).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusConfig[item.status]?.color || "#6b7280" }} />
                  <span style={{ fontSize: 11, color: "#d1d5db" }}>{item.name}</span>
                </div>
              ))}
              {activeOrder.items.length > 6 && <span style={{ fontSize: 11, color: "#4b5563", alignSelf: "center" }}>+{activeOrder.items.length - 6} more</span>}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 380, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 18px" }}>Spending Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ecdc4" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#4ecdc4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, color: "#fff" }} />
                <Area type="monotone" dataKey="spent" stroke="#4ecdc4" fill="url(#sg)" strokeWidth={2.5} dot={{ fill: "#4ecdc4", r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, minWidth: 260, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: Plus, label: "New Order", desc: "Start a new project", action: () => setPage("new-order") },
                { icon: MessageSquare, label: "Messages", desc: `${unreadMsgs} unread message${unreadMsgs !== 1 ? "s" : ""}`, action: () => setPage("messages") },
                { icon: Download, label: "Download All", desc: "Latest delivered images", action: () => addToast("Downloading delivered images...", "info") },
                { icon: FileText, label: "View Invoices", desc: `$${invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0)} pending`, action: () => setPage("invoices") },
              ].map((a, i) => (
                <div key={i} onClick={a.action} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(78,205,196,0.2)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"}>
                  <a.icon size={15} color="#4ecdc4" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>{a.label}</div>
                    <div style={{ fontSize: 10, color: "#4b5563" }}>{a.desc}</div>
                  </div>
                  <ChevronRight size={13} color="#4b5563" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════
  // ORDERS PAGE
  // ══════════════════════════════════════
  const OrdersPage = () => {
    const [expanded, setExpanded] = useState(null);
    const [filter, setFilter] = useState("all");
    const filtered = orders.filter(o => filter === "all" || o.status === filter);

    const handleDownloadAll = (orderId) => {
      addToast(`Downloading all images for ${orderId}...`, "info");
    };

    const handleDownloadItem = (itemName) => {
      addToast(`Downloading ${itemName}...`, "info");
    };

    const handleRequestRevision = (order) => {
      setShowRevisionModal(order);
    };

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>My Orders</h1>
          <button onClick={() => setPage("new-order")} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={13} /> New Order</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[{ key: "all", label: "All" }, { key: "in_progress", label: "In Progress" }, { key: "revision", label: "Revision" }, { key: "delivered", label: "Delivered" }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid", borderColor: filter === f.key ? "rgba(78,205,196,0.5)" : "rgba(255,255,255,0.06)", background: filter === f.key ? "rgba(78,205,196,0.15)" : "transparent", color: filter === f.key ? "#4ecdc4" : "#6b7280", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              {f.label} {f.key !== "all" && `(${orders.filter(o => o.status === f.key).length})`}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(o => (
            <div key={o.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", transition: "all 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", cursor: "pointer", gap: 16 }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#7dd8d0", fontWeight: 600 }}>{o.id}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>{o.title}</h3>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{o.plan} · {o.images} images · {o.date}</span>
                </div>
                <div style={{ textAlign: "right", marginRight: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: o.revenue > 0 ? "#34d399" : "#6b7280" }}>{o.revenue > 0 ? `$${o.revenue}` : "Free"}</div>
                  <div style={{ fontSize: 11, color: "#4b5563" }}>Rev {o.revisions}/{o.maxRevisions}</div>
                </div>
                <div style={{ width: 60 }}>
                  <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ width: `${o.progress}%`, height: "100%", borderRadius: 3, background: o.progress === 100 ? "#34d399" : "linear-gradient(90deg,#4ecdc4,#2ab7a9)" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#6b7280", textAlign: "center", marginTop: 2 }}>{o.progress}%</div>
                </div>
                <ChevronDown size={16} color="#4b5563" style={{ transform: expanded === o.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </div>
              {expanded === o.id && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "16px 20px" }}>
                  {o.items.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
                      {o.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Image size={14} color="#6b7280" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>{item.name}</div>
                          </div>
                          <StatusBadge status={item.status} />
                          {item.status === "delivered" && (
                            <button onClick={(e) => { e.stopPropagation(); handleDownloadItem(item.name); }} style={{ background: "none", border: "none", color: "#4ecdc4", cursor: "pointer", padding: 2 }}><Download size={13} /></button>
                          )}
                          {item.status === "revision" && (
                            <button onClick={(e) => { e.stopPropagation(); setPage("messages"); }} style={{ background: "none", border: "none", color: "#fbbf24", cursor: "pointer", padding: 2 }}><MessageSquare size={13} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "#4b5563", textAlign: "center", padding: 16 }}>No item details available for this order.</div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
                    <button onClick={() => setShowOrderDetailModal(o)} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Eye size={12} /> View Details</button>
                    {o.status === "delivered" && (
                      <button onClick={() => handleDownloadAll(o.id)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Download size={12} /> Download All</button>
                    )}
                    {o.status === "revision" && (
                      <button onClick={() => handleRequestRevision(o)} style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.1)", color: "#fbbf24", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><RefreshCw size={12} /> Request Revision</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════
  // NEW ORDER PAGE
  // ══════════════════════════════════════
  const NewOrderPage = () => {
    const [step, setStep] = useState(1);
    const [plan, setPlan] = useState(null);
    const [projectTitle, setProjectTitle] = useState("");
    const [briefDesc, setBriefDesc] = useState("");
    const [selectedStyles, setSelectedStyles] = useState([]);
    const plans = [
      { id: 1, name: "Single", images: 1, price: 10 },
      { id: 2, name: "Starter", images: 5, price: 45, badge: "Popular" },
      { id: 3, name: "Growth", images: 10, price: 80, badge: "Best Value" },
      { id: 4, name: "Social Pack", images: 7, price: 55 },
    ];

    const toggleStyle = (s) => setSelectedStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

    const handleSubmitOrder = () => {
      const selectedPlan = plans.find(p => p.id === plan);
      if (!selectedPlan) return;
      const newId = `ORD-${3012 + orders.length}`;
      const newOrder = {
        id: newId, title: projectTitle || `New ${selectedPlan.name} Order`, plan: selectedPlan.name, images: selectedPlan.images, status: "pending", category: "General", date: new Date().toISOString().split("T")[0], revenue: selectedPlan.price, revisions: 0, maxRevisions: 3, progress: 0, items: [],
      };
      setOrders(prev => [newOrder, ...prev]);
      setInvoices(prev => [{ id: `INV-${88 + prev.length}`, order: newId, amount: selectedPlan.price, status: "pending", date: newOrder.date, due: "2026-04-29" }, ...prev]);
      addToast(`Order ${newId} submitted! We'll start working on it right away.`);
      setPage("orders");
    };

    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>New Order</h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 28px" }}>Fill in your brief and we'll get started right away.</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {["Choose Plan", "Upload Brief", "Review & Submit"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: step > i + 1 ? "#34d399" : step === i + 1 ? "linear-gradient(135deg,#4ecdc4,#2ab7a9)" : "rgba(255,255,255,0.06)", color: step >= i + 1 ? "#fff" : "#4b5563" }}>
                {step > i + 1 ? <Check size={13} /> : i + 1}
              </div>
              <span style={{ fontSize: 12, color: step === i + 1 ? "#fff" : "#4b5563", fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? "#34d399" : "rgba(255,255,255,0.06)", margin: "0 8px" }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {plans.map(p => (
              <div key={p.id} onClick={() => setPlan(p.id)} style={{ background: plan === p.id ? "rgba(78,205,196,0.06)" : "rgba(255,255,255,0.03)", border: `2px solid ${plan === p.id ? "rgba(78,205,196,0.5)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s", position: "relative" }}>
                {p.badge && <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(78,205,196,0.15)", color: "#4ecdc4", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10 }}>{p.badge}</span>}
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>${p.price}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e5e7eb", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{p.images} image{p.images > 1 ? "s" : ""} · 3 revisions</div>
                {plan === p.id && <div style={{ position: "absolute", top: 12, left: 12 }}><Check size={16} color="#4ecdc4" /></div>}
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div style={{ maxWidth: 600 }}>
            <InputField label="Project Title" value={projectTitle} onChange={setProjectTitle} placeholder="e.g. Summer Skincare Launch" />
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Brief / Mood Description</label>
              <textarea value={briefDesc} onChange={e => setBriefDesc(e.target.value)} placeholder="Describe the mood, style, angles you want..." rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Style (click to select)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Product Shot", "Editorial", "Lifestyle", "Flat Lay", "Minimal", "Mood Lighting", "Artistic"].map(s => (
                  <button key={s} onClick={() => toggleStyle(s)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${selectedStyles.includes(s) ? "rgba(78,205,196,0.5)" : "rgba(255,255,255,0.08)"}`, background: selectedStyles.includes(s) ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.03)", color: selectedStyles.includes(s) ? "#4ecdc4" : "#9ca3af", fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div onClick={() => addToast("File picker opened — select your product photo", "info")} style={{ border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(78,205,196,0.3)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
                <Camera size={24} color="#4b5563" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>Product Photo</div>
                <div style={{ fontSize: 11, color: "#4b5563" }}>White background, high-res</div>
              </div>
              <div onClick={() => addToast("File picker opened — select your label/font file", "info")} style={{ border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(78,205,196,0.3)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
                <FileText size={24} color="#4b5563" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>Label / Font File</div>
                <div style={{ fontSize: 11, color: "#4b5563" }}>.ai, .pdf, .ttf, .otf</div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ maxWidth: 500, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Order Summary</h3>
            {[
              { label: "Plan", val: plans.find(p => p.id === plan)?.name || "—" },
              { label: "Project", val: projectTitle || "Untitled" },
              { label: "Images", val: plans.find(p => p.id === plan)?.images || 0 },
              { label: "Style", val: selectedStyles.join(", ") || "Not specified" },
              { label: "Revisions", val: "3 included" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
                <span style={{ color: "#9ca3af" }}>{r.label}</span><span style={{ color: "#fff", fontWeight: 500 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 18 }}>
              <span style={{ color: "#9ca3af", fontWeight: 600 }}>Total</span><span style={{ color: "#4ecdc4", fontWeight: 800 }}>${plans.find(p => p.id === plan)?.price || 0}</span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          {step > 1 && <button onClick={() => setStep(step - 1)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 13, cursor: "pointer" }}>Back</button>}
          {step < 3 && <button onClick={() => { if (step === 1 && !plan) { addToast("Please select a plan first", "warning"); return; } setStep(step + 1); }} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: step === 1 && !plan ? 0.4 : 1 }}>Continue</button>}
          {step === 3 && <button onClick={handleSubmitOrder} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Send size={13} /> Submit Order</button>}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════
  // MESSAGES PAGE
  // ══════════════════════════════════════
  const MessagesPage = () => {
    const [msg, setMsg] = useState("");

    const handleSend = () => {
      if (!msg.trim()) return;
      setMessagesList(prev => [...prev, { id: Date.now(), from: "client", name: "You", text: msg, time: "Just now", read: true }]);
      setMsg("");
      addToast("Message sent!");
      setTimeout(() => {
        setMessagesList(prev => [...prev, { id: Date.now() + 1, from: "team", name: "Tyes Team", text: "Thanks for your message! We'll get back to you shortly.", time: "Just now", read: false }]);
      }, 2000);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 20px" }}>Messages</h1>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>T</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Tyes Team</div>
              <div style={{ fontSize: 11, color: "#4b5563" }}>RE: ORD-3011 — Spring Skincare Campaign</div>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {messagesList.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.from === "client" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: 14, background: m.from === "client" ? "rgba(78,205,196,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${m.from === "client" ? "rgba(78,205,196,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                  <div style={{ fontSize: 13, color: "#e5e7eb", lineHeight: 1.5 }}>{m.text}</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginTop: 6, textAlign: m.from === "client" ? "right" : "left" }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10 }}>
            <button onClick={() => addToast("Attach a file from your computer", "info")} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer" }}><Paperclip size={16} /></button>
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSend(); }} placeholder="Type a message..." style={{ flex: 1, padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none" }} />
            <button onClick={handleSend} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: msg.trim() ? "linear-gradient(135deg,#4ecdc4,#2ab7a9)" : "rgba(255,255,255,0.06)", color: msg.trim() ? "#fff" : "#4b5563", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.2s" }}><Send size={12} /> Send</button>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════
  // INVOICES PAGE
  // ══════════════════════════════════════
  const InvoicesPage = () => {
    const handlePayInvoice = (inv) => {
      setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "paid" } : i));
      addToast(`Invoice ${inv.id} paid successfully!`);
    };

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>Invoices</h1>
          <button onClick={() => { addToast("Exporting all invoices as CSV...", "info"); }} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Download size={12} /> Export CSV</button>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Invoice", "Order", "Amount", "Status", "Date", "Due", ""].map((h, i) => (
                  <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#7dd8d0", fontWeight: 600 }}>{inv.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#9ca3af", cursor: "pointer" }} onClick={() => setPage("orders")}>{inv.order}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#fff", fontWeight: 600 }}>${inv.amount}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: inv.status === "paid" ? "rgba(16,185,129,0.15)" : "rgba(251,191,36,0.15)", color: inv.status === "paid" ? "#34d399" : "#fbbf24" }}>
                      {inv.status === "paid" ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{inv.date}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{inv.due}</td>
                  <td style={{ padding: "12px 16px", display: "flex", gap: 6 }}>
                    <button onClick={() => addToast(`Downloading ${inv.id}...`, "info")} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 4 }}><Download size={13} /></button>
                    {inv.status === "pending" && (
                      <button onClick={() => handlePayInvoice(inv)} style={{ background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.3)", borderRadius: 6, color: "#4ecdc4", cursor: "pointer", padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Pay</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════
  // ACCOUNT PAGE
  // ══════════════════════════════════════
  const AccountPage = () => (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 24px" }}>Account Settings</h1>
      <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>Company Info</h3>
            <button onClick={() => {
              if (editingCompany) {
                setClientInfo(prev => ({ ...prev, name: companyName, email: companyEmail }));
                addToast("Company info updated!");
              }
              setEditingCompany(!editingCompany);
            }} style={{ background: "none", border: "none", color: "#4ecdc4", cursor: "pointer", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              {editingCompany ? <><Save size={12} /> Save</> : <><Edit size={12} /> Edit</>}
            </button>
          </div>
          {editingCompany ? (
            <div>
              <InputField label="Company Name" value={companyName} onChange={setCompanyName} />
              <InputField label="Email" value={companyEmail} onChange={setCompanyEmail} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Tier</span>
                <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>Pro</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Member Since</span>
                <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>{clientInfo.joined}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Company Name", value: companyName },
                { label: "Email", value: companyEmail },
                { label: "Tier", value: "Pro" },
                { label: "Member Since", value: clientInfo.joined },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{f.label}</span>
                  <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>{f.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Preferences</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Email notifications for order updates", key: "orderNotif" },
              { label: "Email notifications for messages", key: "msgNotif" },
              { label: "Weekly summary report", key: "weeklyReport" },
            ].map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#d1d5db" }}>{p.label}</span>
                <div onClick={() => { setPrefs(prev => ({ ...prev, [p.key]: !prev[p.key] })); addToast(prefs[p.key] ? `${p.label} disabled` : `${p.label} enabled`); }} style={{ width: 36, height: 20, borderRadius: 10, background: prefs[p.key] ? "#4ecdc4" : "rgba(255,255,255,0.1)", padding: 2, cursor: "pointer", transition: "background 0.2s" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", transform: prefs[p.key] ? "translateX(16px)" : "translateX(0)", transition: "transform 0.2s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Payment Method</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <CreditCard size={18} color="#6b7280" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#e5e7eb" }}>Visa ending in 4242</div>
              <div style={{ fontSize: 11, color: "#4b5563" }}>Expires 08/2028</div>
            </div>
            <button onClick={() => addToast("Payment method update — redirecting to billing portal...", "info")} style={{ fontSize: 12, color: "#4ecdc4", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Change</button>
          </div>
        </div>
        <button onClick={() => addToast("Account deletion request sent — our team will contact you", "warning")} style={{ padding: "10px 0", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", color: "#f87171", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Delete Account</button>
      </div>
    </div>
  );

  // ══════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════
  const renderPage = () => {
    switch (page) {
      case "overview": return <OverviewPage />;
      case "orders": return <OrdersPage />;
      case "new-order": return <NewOrderPage />;
      case "messages": return <MessagesPage />;
      case "invoices": return <InvoicesPage />;
      case "account": return <AccountPage />;
      default: return <OverviewPage />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0a", fontFamily: "'Inter',-apple-system,sans-serif", color: "#fff", overflow: "hidden" }}>
      <ToastContainer toasts={toasts} />

      {/* Logout Modal */}
      <Modal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Log Out">
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 20px" }}>Are you sure you want to log out of your account?</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setShowLogoutModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Log Out</button>
        </div>
      </Modal>

      {/* Order Detail Modal */}
      <Modal open={!!showOrderDetailModal} onClose={() => setShowOrderDetailModal(null)} title={showOrderDetailModal ? `Order ${showOrderDetailModal.id}` : ""} width={520}>
        {showOrderDetailModal && (
          <div>
            <h4 style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: "0 0 12px" }}>{showOrderDetailModal.title}</h4>
            {[
              { label: "Plan", val: showOrderDetailModal.plan },
              { label: "Images", val: showOrderDetailModal.images },
              { label: "Category", val: showOrderDetailModal.category },
              { label: "Date", val: showOrderDetailModal.date },
              { label: "Revenue", val: `$${showOrderDetailModal.revenue}` },
              { label: "Revisions Used", val: `${showOrderDetailModal.revisions}/${showOrderDetailModal.maxRevisions}` },
              { label: "Progress", val: `${showOrderDetailModal.progress}%` },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
                <span style={{ color: "#6b7280" }}>{r.label}</span>
                <span style={{ color: "#e5e7eb", fontWeight: 500 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}><StatusBadge status={showOrderDetailModal.status} /></div>
          </div>
        )}
      </Modal>

      {/* Revision Request Modal */}
      <Modal open={!!showRevisionModal} onClose={() => setShowRevisionModal(null)} title="Request Revision">
        {showRevisionModal && (
          <div>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 16px" }}>Requesting revision for <strong style={{ color: "#fff" }}>{showRevisionModal.title}</strong> ({showRevisionModal.revisions}/{showRevisionModal.maxRevisions} revisions used)</p>
            {showRevisionModal.revisions >= showRevisionModal.maxRevisions ? (
              <div style={{ padding: 16, borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 13 }}>
                <AlertCircle size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> You've used all available revisions for this order. Please contact support for additional revisions.
              </div>
            ) : (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Revision Notes</label>
                <textarea placeholder="Describe what changes you'd like..." rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 16 }} />
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={() => setShowRevisionModal(null)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => {
                    setOrders(prev => prev.map(o => o.id === showRevisionModal.id ? { ...o, revisions: o.revisions + 1 } : o));
                    setShowRevisionModal(null);
                    addToast("Revision requested! Our team will review your notes.");
                  }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Submit Revision</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Sidebar */}
      <div style={{ width: collapsed ? 64 : 220, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: collapsed ? "16px 8px" : "16px 12px", flexShrink: 0, transition: "width 0.2s", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px", marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>T</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>Tyes</div>
              <div style={{ fontSize: 9, color: "#4ecdc4", fontStyle: "italic" }}>AI tied with a pulse</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Client Portal</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 2, display: collapsed ? "none" : "block" }}>
            <ChevronLeft size={14} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {navPages.map(p => (
            <SidebarItem key={p.id} icon={p.icon} label={p.label} active={page === p.id} onClick={() => setPage(p.id)} collapsed={collapsed} badge={p.id === "messages" && unreadMsgs > 0 ? String(unreadMsgs) : p.badge && p.id !== "messages" ? p.badge : null} />
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, marginTop: 8 }}>
          <SidebarItem icon={LogOut} label="Log Out" onClick={() => setShowLogoutModal(true)} collapsed={collapsed} />
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {collapsed && <button onClick={() => setCollapsed(false)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}><Menu size={18} /></button>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(78,205,196,0.12)", color: "#4ecdc4", fontSize: 11, fontWeight: 600 }}>Pro</span>

            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowNotifDrop(!showNotifDrop); setShowProfileDrop(false); if (!showNotifDrop) markNotifsRead(); }} style={{ position: "relative", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                <Bell size={17} />
                {unreadNotifs > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />}
              </button>
              {showNotifDrop && (
                <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 100, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 8, minWidth: 260, boxShadow: "0 12px 40px rgba(0,0,0,0.5)", marginTop: 8 }}>
                  <div style={{ padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>Notifications</div>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: "8px 12px", borderRadius: 8, fontSize: 12, color: n.read ? "#6b7280" : "#e5e7eb", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div>{n.text}</div>
                      <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: "relative" }}>
              <div onClick={() => { setShowProfileDrop(!showProfileDrop); setShowNotifDrop(false); }} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>{companyName[0]}</div>
                <span style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>{companyName.split(" ")[0]}</span>
                <ChevronDown size={12} color="#6b7280" />
              </div>
              {showProfileDrop && (
                <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 100, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 4, minWidth: 160, boxShadow: "0 12px 40px rgba(0,0,0,0.5)", marginTop: 8 }}>
                  {[
                    { label: "Account Settings", icon: Settings, action: () => { setPage("account"); setShowProfileDrop(false); } },
                    { label: "My Orders", icon: Package, action: () => { setPage("orders"); setShowProfileDrop(false); } },
                    { label: "Log Out", icon: LogOut, action: () => { setShowProfileDrop(false); setShowLogoutModal(true); }, danger: true },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", borderRadius: 8, background: "transparent", color: item.danger ? "#f87171" : "#d1d5db", fontSize: 12, cursor: "pointer", textAlign: "left" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <item.icon size={13} /> {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 28 }} onClick={() => { setShowNotifDrop(false); setShowProfileDrop(false); }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
