"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Search, Bell, ChevronDown, ChevronLeft, Download, Plus, Eye, Check, X,
  Clock, RefreshCw, Upload, Image, Settings, LogOut, Home, Package, CreditCard,
  FileText, MessageSquare, User, Send, Star, Menu, ArrowUpRight, Zap
} from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
interface Toast { id: number; message: string; type: ToastType; }

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return { toasts, addToast };
}

const spendData = [
  { month: "Nov", spent: 45 }, { month: "Dec", spent: 80 }, { month: "Jan", spent: 125 },
  { month: "Feb", spent: 45 }, { month: "Mar", spent: 160 }, { month: "Apr", spent: 80 },
];

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: any }> = {
  pending: { label: "Pending", bg: "rgba(107,114,128,0.15)", color: "#9ca3af", icon: Clock },
  in_progress: { label: "In Progress", bg: "rgba(59,130,246,0.15)", color: "#60a5fa", icon: Clock },
  revision: { label: "Revision", bg: "rgba(251,191,36,0.15)", color: "#fbbf24", icon: RefreshCw },
  approved: { label: "Approved", bg: "rgba(16,185,129,0.15)", color: "#34d399", icon: Check },
  completed: { label: "Completed", bg: "rgba(16,185,129,0.15)", color: "#34d399", icon: Check },
  delivered: { label: "Delivered", bg: "rgba(78,205,196,0.15)", color: "#4ecdc4", icon: Package },
};

const StatusBadge = ({ status }: { status: string }) => {
  const c = statusConfig[status] || statusConfig.pending;
  const I = c.icon;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.color, fontSize: 11, fontWeight: 600 }}><I size={11} /> {c.label}</span>;
};

const initOrders = [
  { id: "ORD-3011", title: "Spring Skincare Campaign", plan: "Growth", images: 10, status: "revision", category: "Skincare", date: "2026-04-13", revenue: 80, revisions: 2, maxRevisions: 3, progress: 75 },
  { id: "ORD-2988", title: "Cloud Paint Collection", plan: "Starter", images: 5, status: "delivered", category: "Makeup", date: "2026-03-28", revenue: 45, revisions: 1, maxRevisions: 3, progress: 100 },
  { id: "ORD-2965", title: "Boy Brow Product Shots", plan: "Starter", images: 5, status: "delivered", category: "Makeup", date: "2026-03-15", revenue: 45, revisions: 0, maxRevisions: 3, progress: 100 },
  { id: "ORD-2940", title: "Futuredew Editorial", plan: "Growth", images: 10, status: "delivered", category: "Skincare", date: "2026-03-01", revenue: 80, revisions: 1, maxRevisions: 3, progress: 100 },
];

const navPages = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "new-order", label: "New Order", icon: Plus },
  { id: "messages", label: "Messages", icon: MessageSquare, badge: "1" },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "account", label: "Account", icon: User },
];

export default function ClientDashboard() {
  const router = useRouter();
  const { toasts, addToast } = useToast();
  const [page, setPage] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [orders] = useState(initOrders);

  const renderPage = () => {
    switch (page) {
      case "overview": return <OverviewPage orders={orders} goTo={setPage} toast={addToast} />;
      case "orders": return <OrdersPage orders={orders} toast={addToast} />;
      case "new-order": return <NewOrderPage toast={addToast} goTo={setPage} />;
      case "messages": return <MessagesPage toast={addToast} />;
      case "invoices": return <InvoicesPage orders={orders} toast={addToast} />;
      case "account": return <AccountPage toast={addToast} />;
      default: return <OverviewPage orders={orders} goTo={setPage} toast={addToast} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0a", fontFamily: "'Inter',-apple-system,sans-serif", color: "#fff", overflow: "hidden" }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>

      {/* Toasts */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding: "10px 18px", borderRadius: 10, background: t.type === "success" ? "#065f46" : t.type === "error" ? "#7f1d1d" : t.type === "warning" ? "#78350f" : "#1e3a5f", color: "#fff", fontSize: 13, fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease", border: `1px solid ${t.type === "success" ? "#34d399" : t.type === "error" ? "#f87171" : t.type === "warning" ? "#fbbf24" : "#60a5fa"}44` }}>{t.message}</div>
        ))}
      </div>

      {/* Sidebar */}
      <div style={{ width: collapsed ? 64 : 220, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: collapsed ? "16px 8px" : "16px 12px", flexShrink: 0, transition: "width 0.2s", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px", marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>T</div>
          {!collapsed && <div><div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>Tyes</div><div style={{ fontSize: 9, color: "#4ecdc4", fontStyle: "italic" }}>AI tied with a pulse</div></div>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#4b5563", cursor: "pointer", padding: 2, display: collapsed ? "none" : "block" }}><ChevronLeft size={14} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {navPages.map(p => (
            <button key={p.id} onClick={() => setPage(p.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 12px" : "10px 14px", borderRadius: 10, width: "100%", border: "none", cursor: "pointer", fontSize: 13, fontWeight: page === p.id ? 600 : 400, color: page === p.id ? "#fff" : "#6b7280", background: page === p.id ? "linear-gradient(135deg,rgba(78,205,196,0.25),rgba(42,183,169,0.15))" : "transparent", justifyContent: collapsed ? "center" : "flex-start", position: "relative" }}
              onMouseEnter={e => { if (page !== p.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (page !== p.id) e.currentTarget.style.background = "transparent"; }}
            >
              <p.icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{p.label}</span>}
              {!collapsed && (p as any).badge && <span style={{ background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{(p as any).badge}</span>}
            </button>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, marginTop: 8 }}>
          <button onClick={() => router.push("/auth")} style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 12px" : "10px 14px", borderRadius: 10, width: "100%", border: "none", cursor: "pointer", fontSize: 13, color: "#6b7280", background: "transparent", justifyContent: collapsed ? "center" : "flex-start" }}>
            <LogOut size={17} />{!collapsed && "Log Out"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {collapsed && <button onClick={() => setCollapsed(false)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}><Menu size={18} /></button>}
            <div style={{ position: "relative" }}><Search size={14} style={{ position: "absolute", left: 10, top: 9, color: "#4b5563" }} /><input placeholder="Search..." style={{ padding: "7px 12px 7px 32px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 12, outline: "none", width: 220 }} /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ position: "relative", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                <Bell size={17} /><span style={{ position: "absolute", top: -2, right: -2, width: 7, height: 7, borderRadius: "50%", background: "#ef4444" }} />
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, width: 260, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 8, zIndex: 100, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                  <div style={{ padding: "8px 12px", fontSize: 13, fontWeight: 700, color: "#fff" }}>Notifications</div>
                  <div style={{ padding: "10px 12px", cursor: "pointer", borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: "#d1d5db" }}>Revision ready for ORD-3011</div>
                    <div style={{ fontSize: 11, color: "#4b5563" }}>2 min ago</div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>R</div>
              <span style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>Rayhan Inc.</span>
              <ChevronDown size={12} color="#6b7280" />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 28 }} onClick={() => setNotifOpen(false)}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

function OverviewPage({ orders, goTo, toast }: any) {
  const active = orders.find((o: any) => o.status === "revision" || o.status === "in_progress");
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>Welcome back, Rayhan 👋</h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>Here's an overview of your Tyes account.</p>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { icon: Package, label: "Total Orders", value: orders.length, sub: "All time" },
          { icon: Image, label: "Images Delivered", value: 42, sub: "Across all orders" },
          { icon: CreditCard, label: "Total Spent", value: "$640", sub: "Since Dec 2025" },
          { icon: Star, label: "Revisions Used", value: "4/9", sub: "Across orders" },
        ].map((c, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 22px", flex: 1, minWidth: 180 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><c.icon size={16} color="#fff" /></div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{c.label}</div>
            <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      {active && (
        <div style={{ background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 16, padding: 22, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Active Order: {active.title}</div><div style={{ fontSize: 12, color: "#6b7280" }}>{active.id} · {active.plan} · {active.images} images</div></div>
            <StatusBadge status={active.status} />
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", marginBottom: 8 }}>
            <div style={{ width: `${active.progress}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg,#4ecdc4,#2ab7a9)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#6b7280" }}>{active.progress}% complete</span>
            <button onClick={() => goTo("orders")} style={{ fontSize: 11, color: "#4ecdc4", background: "none", border: "none", cursor: "pointer" }}>View details →</button>
          </div>
        </div>
      )}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 22, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 18px" }}>Spending History</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={spendData}>
            <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4ecdc4" stopOpacity={0.3} /><stop offset="100%" stopColor="#4ecdc4" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, color: "#fff" }} />
            <Area type="monotone" dataKey="spent" stroke="#4ecdc4" fill="url(#sg)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ background: "linear-gradient(135deg,rgba(78,205,196,0.12),rgba(42,183,169,0.06))", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 16, padding: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Ready for your next project?</div><div style={{ fontSize: 13, color: "#6b7280" }}>AI-powered retouching, delivered in hours.</div></div>
        <button onClick={() => goTo("new-order")} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Zap size={14} /> New Order</button>
      </div>
    </div>
  );
}

function OrdersPage({ orders, toast }: any) {
  const [selected, setSelected] = useState<string | null>(null);
  const order = orders.find((o: any) => o.id === selected);
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 24px" }}>My Orders</h1>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          {orders.map((o: any) => (
            <div key={o.id} onClick={() => setSelected(o.id === selected ? null : o.id)}
              style={{ background: selected === o.id ? "rgba(78,205,196,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${selected === o.id ? "rgba(78,205,196,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: 18, marginBottom: 12, cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{o.title}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{o.id} · {o.plan} · {o.images} images</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                <div style={{ width: `${o.progress}%`, height: "100%", borderRadius: 2, background: o.progress === 100 ? "#34d399" : "linear-gradient(90deg,#4ecdc4,#2ab7a9)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "#6b7280" }}>{o.progress}%</span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>{o.date} · ${o.revenue}</span>
              </div>
            </div>
          ))}
        </div>
        {order && (
          <div style={{ width: 300, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, flexShrink: 0, height: "fit-content" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>{order.title}</h3>
            {[["Order ID", order.id], ["Plan", order.plan], ["Images", order.images], ["Category", order.category], ["Revisions", `${order.revisions}/${order.maxRevisions}`], ["Revenue", `$${order.revenue}`], ["Status", order.status]].map(([k, v]: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>{k}</span>
                <span style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            {order.status === "revision" && (
              <button onClick={() => toast("Revision note submitted", "success")} style={{ width: "100%", marginTop: 14, padding: "9px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Request Revision</button>
            )}
            {order.status === "delivered" && (
              <button onClick={() => toast("Files downloaded!", "success")} style={{ width: "100%", marginTop: 14, padding: "9px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><ArrowUpRight size={13} /> Download Files</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NewOrderPage({ toast, goTo }: any) {
  const [plan, setPlan] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const plans = [
    { id: "free", name: "Free Test", images: 1, price: 0 },
    { id: "single", name: "Single", images: 1, price: 10 },
    { id: "starter", name: "Starter", images: 5, price: 45 },
    { id: "growth", name: "Growth", images: 10, price: 80 },
    { id: "social", name: "Social Media Pack", images: 7, price: 55 },
  ];
  const submit = () => {
    if (!plan) { toast("Please select a plan", "warning"); return; }
    toast("Order submitted! We'll start shortly.", "success");
    setTimeout(() => goTo("orders"), 1500);
  };
  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>New Order</h1>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 28px" }}>Select a plan and upload your product images.</p>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>1. Choose a Plan</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
          {plans.map(p => (
            <div key={p.id} onClick={() => setPlan(p.id)}
              style={{ padding: 14, borderRadius: 12, border: `1px solid ${plan === p.id ? "rgba(78,205,196,0.5)" : "rgba(255,255,255,0.06)"}`, background: plan === p.id ? "rgba(78,205,196,0.1)" : "transparent", cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{p.price === 0 ? "Free" : `$${p.price}`}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: plan === p.id ? "#4ecdc4" : "#e5e7eb", marginTop: 2 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{p.images} image{p.images > 1 ? "s" : ""}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>2. Upload Images</h3>
        <div style={{ border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 12, padding: 32, textAlign: "center", cursor: "pointer" }} onClick={() => toast("File picker would open here", "info")}>
          <Upload size={24} color="#4b5563" style={{ margin: "0 auto 8px" }} />
          <div style={{ fontSize: 13, color: "#6b7280" }}>Click to upload or drag & drop</div>
          <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>PNG, JPG up to 50MB each</div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>3. Notes</h3>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none", marginBottom: 14 }}>
          <option value="">Select category</option>
          {["Makeup", "Skincare", "Hair Care", "Fragrance", "Supplements", "Fashion"].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Special Instructions</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Background color, style references, mood..." rows={4} style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none", resize: "vertical" }} />
      </div>
      <button onClick={submit} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Place Order</button>
    </div>
  );
}

function MessagesPage({ toast }: any) {
  const [msg, setMsg] = useState("");
  const [msgs] = useState([
    { from: "tyes", text: "Hey! ORD-3011 revision is ready for your review. Let us know if you'd like any changes.", time: "2 min ago" },
    { from: "me", text: "Thanks! I'll check it now.", time: "1 min ago" },
  ]);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 20px" }}>Messages</h1>
      <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, overflow: "auto", display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.from === "me" ? "linear-gradient(135deg,#4ecdc4,#2ab7a9)" : "rgba(255,255,255,0.06)", fontSize: 13, color: "#fff" }}>
              <div>{m.text}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." onKeyDown={e => { if (e.key === "Enter" && msg.trim()) { toast("Message sent", "success"); setMsg(""); } }} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none" }} />
        <button onClick={() => { if (msg.trim()) { toast("Message sent", "success"); setMsg(""); } }} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Send size={14} /> Send</button>
      </div>
    </div>
  );
}

function InvoicesPage({ orders, toast }: any) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>Invoices</h1>
        <button onClick={() => toast("CSV exported", "success")} style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#9ca3af", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Download size={13} /> Export</button>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{["Order", "Description", "Date", "Amount", "Status"].map((h, i) => <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>)}</tr></thead>
          <tbody>{orders.filter((o: any) => o.revenue > 0).map((o: any) => (
            <tr key={o.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#7dd8d0", fontWeight: 600 }}>{o.id}</td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#e5e7eb" }}>{o.title}</td>
              <td style={{ padding: "12px 16px", fontSize: 11, color: "#6b7280" }}>{o.date}</td>
              <td style={{ padding: "12px 16px", fontSize: 12, color: "#34d399", fontWeight: 600 }}>${o.revenue}</td>
              <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 11, color: "#34d399" }}>● Paid</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function AccountPage({ toast }: any) {
  const [name, setName] = useState("Rayhan Inc.");
  const [email, setEmail] = useState("studio@rayhan.com");
  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 24px" }}>Account</h1>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 20 }}>R</div>
          <div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{name}</div><div style={{ fontSize: 12, color: "#6b7280" }}>Pro Plan · Member since Dec 2025</div></div>
        </div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Studio Name</label>
        <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none", marginBottom: 14 }} />
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none", marginBottom: 14 }} />
        <button onClick={() => toast("Profile saved")} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Save Changes</button>
      </div>
    </div>
  );
}
