"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Search, Bell, ChevronDown, ChevronRight, Filter, Download, MoreVertical, Plus, Edit, Trash2, Eye, Check, X, Clock, RefreshCw, TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Image, Settings, LogOut, Home, Package, CreditCard, BarChart2, UserCheck, Star, AlertCircle, ArrowUpRight, ArrowDownRight, Menu, ChevronLeft, Save, Mail, Globe, Zap, Shield, Key, Webhook, User } from "lucide-react";

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
// DROPDOWN MENU
// ══════════════════════════════════════
const Dropdown = ({ items, onClose }) => (
  <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 100, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 4, minWidth: 160, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
    {items.map((item, i) => item.divider ? (
      <div key={i} style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
    ) : (
      <button key={i} onClick={() => { item.action(); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: "transparent", color: item.danger ? "#f87171" : "#d1d5db", fontSize: 12, cursor: "pointer", borderRadius: 6, textAlign: "left" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        {item.icon && <item.icon size={13} />}
        {item.label}
      </button>
    ))}
  </div>
);

// ══════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════
const revenueData = [
  { month: "Sep", revenue: 2800, orders: 32 }, { month: "Oct", revenue: 4200, orders: 48 },
  { month: "Nov", revenue: 5100, orders: 55 }, { month: "Dec", revenue: 7300, orders: 78 },
  { month: "Jan", revenue: 6800, orders: 72 }, { month: "Feb", revenue: 8900, orders: 94 },
  { month: "Mar", revenue: 11200, orders: 118 },
];
const categoryData = [
  { name: "Makeup", value: 32, color: "#ec4899" }, { name: "Skincare", value: 28, color: "#34d399" },
  { name: "Hair Care", value: 15, color: "#fbbf24" }, { name: "Fragrance", value: 12, color: "#c084fc" },
  { name: "Supplements", value: 8, color: "#22d3ee" }, { name: "Fashion", value: 5, color: "#d946ef" },
];
const dailyOrders = [
  { day: "Mon", orders: 12 }, { day: "Tue", orders: 18 }, { day: "Wed", orders: 15 },
  { day: "Thu", orders: 22 }, { day: "Fri", orders: 28 }, { day: "Sat", orders: 8 }, { day: "Sun", orders: 5 },
];
const initOrders = [
  { id: "ORD-3012", customer: "L'Oréal Paris", email: "digital@loreal.com", plan: "Enterprise", images: 50, status: "in_progress", category: "Makeup", date: "2026-04-14", revenue: 2500, revisions: 0, progress: 35 },
  { id: "ORD-3011", customer: "Glossier Inc.", email: "studio@glossier.com", plan: "Growth", images: 10, status: "revision", category: "Skincare", date: "2026-04-13", revenue: 80, revisions: 2, progress: 75 },
  { id: "ORD-3010", customer: "Aesop", email: "creative@aesop.com", plan: "Starter", images: 5, status: "completed", category: "Skincare", date: "2026-04-12", revenue: 45, revisions: 1, progress: 100 },
  { id: "ORD-3009", customer: "Fenty Beauty", email: "content@fentybeauty.com", plan: "Growth", images: 10, status: "delivered", category: "Makeup", date: "2026-04-11", revenue: 80, revisions: 0, progress: 100 },
  { id: "ORD-3008", customer: "Olaplex", email: "marketing@olaplex.com", plan: "Starter", images: 5, status: "in_progress", category: "Hair Care", date: "2026-04-10", revenue: 45, revisions: 0, progress: 55 },
  { id: "ORD-3007", customer: "Charlotte Tilbury", email: "studio@charlottetilbury.com", plan: "Growth", images: 10, status: "completed", category: "Makeup", date: "2026-04-09", revenue: 80, revisions: 1, progress: 100 },
  { id: "ORD-3006", customer: "The Ordinary", email: "visuals@theordinary.com", plan: "Starter", images: 5, status: "delivered", category: "Skincare", date: "2026-04-08", revenue: 45, revisions: 0, progress: 100 },
  { id: "ORD-3005", customer: "Jo Malone", email: "creative@jomalone.com", plan: "Single", images: 1, status: "delivered", category: "Fragrance", date: "2026-04-07", revenue: 10, revisions: 0, progress: 100 },
  { id: "ORD-3004", customer: "Drunk Elephant", email: "brand@drunkelephant.com", plan: "Growth", images: 10, status: "revision", category: "Skincare", date: "2026-04-06", revenue: 80, revisions: 3, progress: 90 },
  { id: "ORD-3003", customer: "MAC Cosmetics", email: "studio@maccosmetics.com", plan: "Enterprise", images: 30, status: "in_progress", category: "Makeup", date: "2026-04-05", revenue: 1500, revisions: 0, progress: 20 },
  { id: "ORD-3002", customer: "Rare Beauty", email: "content@rarebeauty.com", plan: "Free Test", images: 1, status: "completed", category: "Makeup", date: "2026-04-04", revenue: 0, revisions: 0, progress: 100 },
  { id: "ORD-3001", customer: "Byredo", email: "visuals@byredo.com", plan: "Starter", images: 5, status: "delivered", category: "Fragrance", date: "2026-04-03", revenue: 45, revisions: 1, progress: 100 },
];
const initUsers = [
  { id: 1, name: "L'Oréal Paris", email: "digital@loreal.com", orders: 12, spent: 8500, joined: "2025-11-02", status: "active", tier: "enterprise" },
  { id: 2, name: "Glossier Inc.", email: "studio@glossier.com", orders: 8, spent: 640, joined: "2025-12-15", status: "active", tier: "pro" },
  { id: 3, name: "Fenty Beauty", email: "content@fentybeauty.com", orders: 15, spent: 1200, joined: "2025-10-20", status: "active", tier: "pro" },
  { id: 4, name: "Aesop", email: "creative@aesop.com", orders: 5, spent: 225, joined: "2026-01-10", status: "active", tier: "starter" },
  { id: 5, name: "The Ordinary", email: "visuals@theordinary.com", orders: 3, spent: 135, joined: "2026-02-28", status: "active", tier: "starter" },
  { id: 6, name: "Charlotte Tilbury", email: "studio@charlottetilbury.com", orders: 6, spent: 480, joined: "2026-01-05", status: "active", tier: "pro" },
  { id: 7, name: "Drunk Elephant", email: "brand@drunkelephant.com", orders: 4, spent: 320, joined: "2026-03-01", status: "active", tier: "starter" },
  { id: 8, name: "MAC Cosmetics", email: "studio@maccosmetics.com", orders: 9, spent: 5400, joined: "2025-09-18", status: "active", tier: "enterprise" },
  { id: 9, name: "Jo Malone", email: "creative@jomalone.com", orders: 2, spent: 20, joined: "2026-03-20", status: "inactive", tier: "free" },
  { id: 10, name: "Rare Beauty", email: "content@rarebeauty.com", orders: 1, spent: 0, joined: "2026-04-01", status: "active", tier: "free" },
];
const initPlans = [
  { id: 0, name: "Free Test", images: 1, price: 0, active: true },
  { id: 1, name: "Single", images: 1, price: 10, active: true },
  { id: 2, name: "Starter", images: 5, price: 45, active: true },
  { id: 3, name: "Growth", images: 10, price: 80, active: true },
  { id: 4, name: "Social Media Pack", images: 7, price: 55, active: true },
  { id: 5, name: "Custom / Enterprise", images: 0, price: 0, active: true },
];
const activityLog = [
  { time: "2 min ago", action: "New order", detail: "ORD-3012 from L'Oréal Paris", type: "order" },
  { time: "18 min ago", action: "Revision requested", detail: "ORD-3011 — Glossier (rev 2)", type: "revision" },
  { time: "1 hr ago", action: "Order completed", detail: "ORD-3010 delivered to Aesop", type: "complete" },
  { time: "2 hrs ago", action: "New signup", detail: "Rare Beauty joined (Free Test)", type: "user" },
  { time: "3 hrs ago", action: "Payment received", detail: "$80 from Fenty Beauty", type: "payment" },
  { time: "5 hrs ago", action: "Order completed", detail: "ORD-3006 delivered to The Ordinary", type: "complete" },
];

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════
const statusConfig = {
  in_progress: { label: "In Progress", bg: "rgba(59,130,246,0.15)", color: "#60a5fa", icon: Clock },
  revision: { label: "Revision", bg: "rgba(251,191,36,0.15)", color: "#fbbf24", icon: RefreshCw },
  completed: { label: "Completed", bg: "rgba(16,185,129,0.15)", color: "#34d399", icon: Check },
  delivered: { label: "Delivered", bg: "rgba(78,205,196,0.15)", color: "#4ecdc4", icon: Package },
};
const tierColors = { free: "#6b7280", starter: "#60a5fa", pro: "#4ecdc4", enterprise: "#f472b6" };
const fmt = (n) => n >= 1000 ? `$${(n/1000).toFixed(1)}k` : `$${n}`;

// ══════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════
const StatusBadge = ({ status }) => { const c = statusConfig[status]; const I = c.icon; return <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, background:c.bg, color:c.color, fontSize:11, fontWeight:600 }}><I size={11}/> {c.label}</span>; };

const StatCard = ({ icon: Icon, label, value, change, positive, sub }) => (
  <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:"20px 22px", flex:1, minWidth:200 }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
      <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon size={16} color="#fff"/></div>
      {change && <span style={{ display:"flex", alignItems:"center", gap:2, fontSize:11, fontWeight:600, color:positive?"#34d399":"#f87171" }}>{positive?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>} {change}</span>}
    </div>
    <div style={{ fontSize:26, fontWeight:800, color:"#fff", marginBottom:2 }}>{value}</div>
    <div style={{ fontSize:12, color:"#6b7280" }}>{label}</div>
    {sub && <div style={{ fontSize:11, color:"#4b5563", marginTop:4 }}>{sub}</div>}
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, padding:collapsed?"10px 12px":"10px 14px", borderRadius:10, width:"100%", border:"none", cursor:"pointer", fontSize:13, fontWeight:active?600:400, color:active?"#fff":"#6b7280", background:active?"linear-gradient(135deg,rgba(78,205,196,0.25),rgba(42,183,169,0.15))":"transparent", transition:"all 0.2s", justifyContent:collapsed?"center":"flex-start" }} onMouseEnter={e=>{if(!active)e.currentTarget.style.background="rgba(255,255,255,0.04)"}} onMouseLeave={e=>{if(!active)e.currentTarget.style.background="transparent"}}>
    <Icon size={17} style={{flexShrink:0}}/>{!collapsed && label}
  </button>
);

const InputField = ({ label, value, onChange, placeholder, type }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#d1d5db", marginBottom: 6 }}>{label}</label>
    <input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 13, outline: "none" }} />
  </div>
);

// ══════════════════════════════════════
// PAGES
// ══════════════════════════════════════

const DashboardPage = ({ toast, goTo }) => (
  <div>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
      <div><h1 style={{ fontSize:24, fontWeight:800, color:"#fff", margin:0 }}>Dashboard</h1><p style={{ fontSize:13, color:"#6b7280", margin:0 }}>Welcome back. Here's what's happening today.</p></div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={() => toast("CSV report exported successfully")} style={{ padding:"8px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)", color:"#9ca3af", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Download size={13}/> Export</button>
        <button onClick={() => goTo("orders")} style={{ padding:"8px 16px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>+ New Order</button>
      </div>
    </div>
    <div style={{ display:"flex", gap:16, marginBottom:24, flexWrap:"wrap" }}>
      <StatCard icon={DollarSign} label="Revenue (March)" value="$11,200" change="+25.8%" positive sub="vs $8,900 in Feb"/>
      <StatCard icon={ShoppingCart} label="Orders (March)" value="118" change="+25.5%" positive sub="94 in Feb"/>
      <StatCard icon={Users} label="Active Clients" value="47" change="+12.3%" positive sub="8 new this month"/>
      <StatCard icon={Image} label="Images Delivered" value="842" change="+18.6%" positive sub="Avg 7.1 per order"/>
    </div>
    <div style={{ display:"flex", gap:16, marginBottom:24, flexWrap:"wrap" }}>
      <div style={{ flex:2, minWidth:400, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:22 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}><h3 style={{ fontSize:14, fontWeight:700, color:"#fff", margin:0 }}>Revenue Trend</h3><span style={{ fontSize:11, color:"#6b7280" }}>Last 7 months</span></div>
        <ResponsiveContainer width="100%" height={240}><AreaChart data={revenueData}><defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4ecdc4" stopOpacity={0.3}/><stop offset="100%" stopColor="#4ecdc4" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="month" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`}/><Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12,color:"#fff"}}/><Area type="monotone" dataKey="revenue" stroke="#4ecdc4" fill="url(#gr)" strokeWidth={2.5} dot={{fill:"#4ecdc4",r:4,strokeWidth:0}}/></AreaChart></ResponsiveContainer>
      </div>
      <div style={{ flex:1, minWidth:260, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:22 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 18px" }}>Orders by Category</h3>
        <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">{categoryData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12,color:"#fff"}}/></PieChart></ResponsiveContainer>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>{categoryData.map((d,i)=><span key={i} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#9ca3af" }}><span style={{ width:7, height:7, borderRadius:"50%", background:d.color, display:"inline-block" }}/>{d.name} ({d.value}%)</span>)}</div>
      </div>
    </div>
    <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
      <div style={{ flex:2, minWidth:400, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:22 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 18px" }}>This Week</h3>
        <ResponsiveContainer width="100%" height={200}><BarChart data={dailyOrders} barSize={28}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="day" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12,color:"#fff"}}/><Bar dataKey="orders" fill="#4ecdc4" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer>
      </div>
      <div style={{ flex:1, minWidth:260, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:22 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 16px" }}>Recent Activity</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>{activityLog.map((a,i)=><div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}><div style={{ width:6, height:6, borderRadius:"50%", marginTop:5, flexShrink:0, background:a.type==="order"?"#60a5fa":a.type==="revision"?"#fbbf24":a.type==="complete"?"#34d399":a.type==="payment"?"#4ecdc4":"#6b7280" }}/><div><div style={{ fontSize:12, color:"#d1d5db", fontWeight:500 }}>{a.action}</div><div style={{ fontSize:11, color:"#6b7280" }}>{a.detail}</div><div style={{ fontSize:10, color:"#4b5563", marginTop:2 }}>{a.time}</div></div></div>)}</div>
      </div>
    </div>
  </div>
);

const OrdersPage = ({ orders, setOrders, toast, goTo }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const filtered = orders.filter(o => { if (filter !== "all" && o.status !== filter) return false; if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false; return true; });
  const counts = { all: orders.length, in_progress: orders.filter(o=>o.status==="in_progress").length, revision: orders.filter(o=>o.status==="revision").length, completed: orders.filter(o=>o.status==="completed").length, delivered: orders.filter(o=>o.status==="delivered").length };

  const updateStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, progress: newStatus === "delivered" ? 100 : newStatus === "completed" ? 100 : o.progress } : o));
    toast(`${id} marked as ${statusConfig[newStatus].label}`);
  };
  const deleteOrder = (id) => { setOrders(prev => prev.filter(o => o.id !== id)); toast(`${id} deleted`, "warning"); };

  return (
    <div>
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order ${viewOrder?.id}`} width={520}>
        {viewOrder && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["Client", viewOrder.customer], ["Email", viewOrder.email], ["Plan", viewOrder.plan], ["Category", viewOrder.category], ["Images", viewOrder.images], ["Revisions", viewOrder.revisions], ["Revenue", viewOrder.revenue > 0 ? `$${viewOrder.revenue}` : "Free"], ["Date", viewOrder.date]].map(([k, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{k}</span>
                <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Status</span>
              <StatusBadge status={viewOrder.status} />
            </div>
            <div style={{ marginTop: 8 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, color: "#6b7280" }}>Progress</span><span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{viewOrder.progress}%</span></div><div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}><div style={{ width: `${viewOrder.progress}%`, height: "100%", borderRadius: 4, background: viewOrder.progress === 100 ? "#34d399" : "linear-gradient(90deg,#4ecdc4,#2ab7a9)" }} /></div></div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Change status:</span>
              {Object.keys(statusConfig).map(s => <button key={s} onClick={() => { updateStatus(viewOrder.id, s); setViewOrder({ ...viewOrder, status: s }); }} style={{ padding: "4px 10px", borderRadius: 16, border: `1px solid ${statusConfig[s].color}33`, background: viewOrder.status === s ? statusConfig[s].bg : "transparent", color: statusConfig[s].color, fontSize: 11, cursor: "pointer" }}>{statusConfig[s].label}</button>)}
            </div>
          </div>
        )}
      </Modal>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#fff", margin:0 }}>Orders</h1>
        <button onClick={() => toast("New order form would open here", "info")} style={{ padding:"8px 16px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>+ New Order</button>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {["all","in_progress","revision","completed","delivered"].map(s=><button key={s} onClick={()=>setFilter(s)} style={{ padding:"6px 14px", borderRadius:20, border:"1px solid", borderColor:filter===s?"rgba(78,205,196,0.5)":"rgba(255,255,255,0.06)", background:filter===s?"rgba(78,205,196,0.15)":"transparent", color:filter===s?"#4ecdc4":"#6b7280", fontSize:12, fontWeight:500, cursor:"pointer" }}>{s==="all"?"All":statusConfig[s]?.label} ({counts[s]})</button>)}
      </div>
      <div style={{ marginBottom:16, position:"relative" }}><Search size={14} style={{ position:"absolute", left:12, top:10, color:"#4b5563" }}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders or clients..." style={{ width:"100%", maxWidth:360, padding:"8px 12px 8px 34px", borderRadius:10, border:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.03)", color:"#fff", fontSize:12, outline:"none" }}/></div>
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{["Order","Client","Plan","Imgs","Status","Progress","Revenue","Date",""].map((h,i)=><th key={i} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map(o=>(
            <tr key={o.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{ padding:"12px 16px", fontSize:12, color:"#7dd8d0", fontWeight:600, cursor:"pointer" }} onClick={() => setViewOrder(o)}>{o.id}</td>
              <td style={{ padding:"12px 16px" }}><div style={{ fontSize:12, color:"#e5e7eb", fontWeight:500 }}>{o.customer}</div><div style={{ fontSize:11, color:"#4b5563" }}>{o.category}</div></td>
              <td style={{ padding:"12px 16px", fontSize:12, color:"#9ca3af" }}>{o.plan}</td>
              <td style={{ padding:"12px 16px", fontSize:12, color:"#9ca3af" }}>{o.images}</td>
              <td style={{ padding:"12px 16px" }}><StatusBadge status={o.status}/></td>
              <td style={{ padding:"12px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ flex:1, height:4, borderRadius:2, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}><div style={{ width:`${o.progress}%`, height:"100%", borderRadius:2, background:o.progress===100?"#34d399":"linear-gradient(90deg,#4ecdc4,#2ab7a9)" }}/></div><span style={{ fontSize:11, color:"#6b7280", minWidth:28 }}>{o.progress}%</span></div></td>
              <td style={{ padding:"12px 16px", fontSize:12, color:o.revenue>0?"#34d399":"#4b5563", fontWeight:600 }}>{o.revenue>0?`$${o.revenue}`:"Free"}</td>
              <td style={{ padding:"12px 16px", fontSize:11, color:"#6b7280" }}>{o.date}</td>
              <td style={{ padding:"12px 16px", position:"relative" }}>
                <button onClick={() => setMenuOpen(menuOpen === o.id ? null : o.id)} style={{ background:"none", border:"none", color:"#4b5563", cursor:"pointer", padding:4 }}><MoreVertical size={14}/></button>
                {menuOpen === o.id && <Dropdown onClose={() => setMenuOpen(null)} items={[
                  { icon: Eye, label: "View Details", action: () => setViewOrder(o) },
                  { icon: Mail, label: "Email Client", action: () => toast(`Email draft opened for ${o.customer}`, "info") },
                  { divider: true },
                  { icon: Clock, label: "Mark In Progress", action: () => updateStatus(o.id, "in_progress") },
                  { icon: RefreshCw, label: "Mark Revision", action: () => updateStatus(o.id, "revision") },
                  { icon: Check, label: "Mark Completed", action: () => updateStatus(o.id, "completed") },
                  { icon: Package, label: "Mark Delivered", action: () => updateStatus(o.id, "delivered") },
                  { divider: true },
                  { icon: Trash2, label: "Delete Order", action: () => deleteOrder(o.id), danger: true },
                ]} />}
              </td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding:40, textAlign:"center", color:"#4b5563", fontSize:13 }}>No orders found.</div>}
      </div>
    </div>
  );
};

const UsersPage = ({ users, setUsers, toast }) => {
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
    const u = users.find(u => u.id === id);
    toast(`${u.name} marked as ${u.status === "active" ? "inactive" : "active"}`);
  };

  return (
    <div>
      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title={viewUser?.name} width={460}>
        {viewUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["Email", viewUser.email], ["Tier", viewUser.tier], ["Orders", viewUser.orders], ["Total Spent", viewUser.spent > 0 ? `$${viewUser.spent.toLocaleString()}` : "$0"], ["Joined", viewUser.joined], ["Status", viewUser.status]].map(([k, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{k}</span>
                <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500, textTransform: k === "Tier" || k === "Status" ? "capitalize" : "none" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => { toggleStatus(viewUser.id); setViewUser({ ...viewUser, status: viewUser.status === "active" ? "inactive" : "active" }); }} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>{viewUser.status === "active" ? "Deactivate" : "Activate"}</button>
              <button onClick={() => { toast(`Email draft opened for ${viewUser.name}`, "info"); }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Send Email</button>
            </div>
          </div>
        )}
      </Modal>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#fff", margin:0 }}>Clients</h1>
        <button onClick={() => toast("CSV with all client data exported", "success")} style={{ padding:"8px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)", color:"#9ca3af", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Download size={13}/> Export CSV</button>
      </div>
      <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard icon={Users} label="Total Clients" value={users.length}/>
        <StatCard icon={UserCheck} label="Active" value={users.filter(u=>u.status==="active").length}/>
        <StatCard icon={Star} label="Enterprise" value={users.filter(u=>u.tier==="enterprise").length}/>
        <StatCard icon={DollarSign} label="Total Revenue" value={fmt(users.reduce((a,u)=>a+u.spent,0))}/>
      </div>
      <div style={{ marginBottom:16, position:"relative" }}><Search size={14} style={{ position:"absolute", left:12, top:10, color:"#4b5563" }}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients..." style={{ width:"100%", maxWidth:360, padding:"8px 12px 8px 34px", borderRadius:10, border:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.03)", color:"#fff", fontSize:12, outline:"none" }}/></div>
      <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{["Client","Email","Tier","Orders","Spent","Joined","Status",""].map((h,i)=><th key={i} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map(u=>(
            <tr key={u.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{ padding:"12px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:10 }}><div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${tierColors[u.tier]},${tierColors[u.tier]}88)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:12 }}>{u.name.charAt(0)}</div><span style={{ fontSize:13, color:"#e5e7eb", fontWeight:500, cursor:"pointer" }} onClick={() => setViewUser(u)}>{u.name}</span></div></td>
              <td style={{ padding:"12px 16px", fontSize:12, color:"#6b7280" }}>{u.email}</td>
              <td style={{ padding:"12px 16px" }}><span style={{ padding:"3px 10px", borderRadius:20, background:`${tierColors[u.tier]}22`, color:tierColors[u.tier], fontSize:11, fontWeight:600, textTransform:"capitalize" }}>{u.tier}</span></td>
              <td style={{ padding:"12px 16px", fontSize:12, color:"#9ca3af" }}>{u.orders}</td>
              <td style={{ padding:"12px 16px", fontSize:12, color:"#34d399", fontWeight:600 }}>{u.spent>0?`$${u.spent.toLocaleString()}`:"—"}</td>
              <td style={{ padding:"12px 16px", fontSize:11, color:"#6b7280" }}>{u.joined}</td>
              <td style={{ padding:"12px 16px" }}><span onClick={() => toggleStatus(u.id)} style={{ cursor: "pointer" }}><span style={{ width:6, height:6, borderRadius:"50%", display:"inline-block", background:u.status==="active"?"#34d399":"#4b5563", marginRight:6 }}/><span style={{ fontSize:11, color:u.status==="active"?"#34d399":"#6b7280" }}>{u.status}</span></span></td>
              <td style={{ padding:"12px 16px" }}><button onClick={() => setViewUser(u)} style={{ background:"none", border:"none", color:"#4b5563", cursor:"pointer", padding:4 }}><Eye size={14}/></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

const PricingPage = ({ plans, setPlans, toast }) => {
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState({ name: "", images: "", price: "" });

  const openEdit = (p) => { setForm({ name: p.name, images: String(p.images), price: String(p.price) }); setEditPlan(p.id); };
  const savePlan = () => {
    setPlans(prev => prev.map(p => p.id === editPlan ? { ...p, name: form.name, images: Number(form.images), price: Number(form.price) } : p));
    toast(`"${form.name}" plan updated`);
    setEditPlan(null);
  };
  const togglePlan = (id) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    const p = plans.find(p => p.id === id);
    toast(`"${p.name}" ${p.active ? "disabled" : "enabled"}`);
  };
  const addPlan = () => {
    const newId = Math.max(...plans.map(p => p.id)) + 1;
    setPlans(prev => [...prev, { id: newId, name: "New Plan", images: 1, price: 15, active: true }]);
    toast("New plan created — click edit to customize");
  };
  const deletePlan = (id) => {
    const p = plans.find(p => p.id === id);
    setPlans(prev => prev.filter(p => p.id !== id));
    toast(`"${p.name}" plan deleted`, "warning");
  };

  return (
    <div>
      <Modal open={editPlan !== null} onClose={() => setEditPlan(null)} title="Edit Plan">
        <InputField label="Plan Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Starter" />
        <InputField label="Number of Images" value={form.images} onChange={v => setForm({ ...form, images: v })} type="number" />
        <InputField label="Price ($)" value={form.price} onChange={v => setForm({ ...form, price: v })} type="number" />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={() => setEditPlan(null)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button onClick={savePlan} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Save size={12} /> Save</button>
        </div>
      </Modal>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#fff", margin:0 }}>Pricing Plans</h1>
        <button onClick={addPlan} style={{ padding:"8px 16px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>+ Add Plan</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
        {plans.map(p=>(
          <div key={p.id} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${p.active ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)"}`, borderRadius:16, padding:24, opacity: p.active ? 1 : 0.5, transition: "all 0.2s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#fff", margin:0 }}>{p.name}</h3>
              <div style={{ display:"flex", gap:4 }}>
                <button onClick={() => openEdit(p)} style={{ background:"rgba(255,255,255,0.05)", border:"none", borderRadius:6, padding:6, cursor:"pointer", color:"#6b7280" }} title="Edit plan"><Edit size={12}/></button>
                <button onClick={() => deletePlan(p.id)} style={{ background:"rgba(255,255,255,0.05)", border:"none", borderRadius:6, padding:6, cursor:"pointer", color:"#6b7280" }} title="Delete plan"><Trash2 size={12}/></button>
              </div>
            </div>
            <div style={{ fontSize:32, fontWeight:900, color:"#fff", marginBottom:4 }}>{p.price===0?"Free":`$${p.price}`}</div>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:16 }}>{p.images===0?"Custom pricing":`${p.images} image${p.images>1?"s":""}`}</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span onClick={() => togglePlan(p.id)} style={{ fontSize:11, color:p.active?"#34d399":"#f87171", cursor:"pointer" }}><span style={{ width:6, height:6, borderRadius:"50%", display:"inline-block", background:p.active?"#34d399":"#f87171", marginRight:6 }}/>{p.active?"Active":"Inactive"}</span>
              {p.images>0&&p.price>0&&<span style={{ fontSize:11, color:"#4b5563" }}>${(p.price/p.images).toFixed(0)}/image</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:32, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:24 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 16px" }}>Revenue by Plan (March)</h3>
        <ResponsiveContainer width="100%" height={220}><BarChart data={[{plan:"Free",revenue:0},{plan:"Single",revenue:280},{plan:"Starter",revenue:2700},{plan:"Growth",revenue:4800},{plan:"Social",revenue:550},{plan:"Enterprise",revenue:2870}]} barSize={36}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="plan" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/><Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12,color:"#fff"}}/><Bar dataKey="revenue" fill="#2ab7a9" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer>
      </div>
    </div>
  );
};

const AnalyticsPage = ({ users }) => (
  <div>
    <h1 style={{ fontSize:24, fontWeight:800, color:"#fff", margin:"0 0 24px" }}>Analytics</h1>
    <div style={{ display:"flex", gap:16, marginBottom:24, flexWrap:"wrap" }}>
      <StatCard icon={TrendingUp} label="Conversion Rate" value="34.2%" change="+5.1%" positive sub="Free to Paid"/>
      <StatCard icon={Clock} label="Avg Delivery Time" value="1.8 hrs" change="-12%" positive sub="Target: 2 hrs"/>
      <StatCard icon={Star} label="Client Satisfaction" value="4.9/5" change="+0.1" positive sub="Based on 86 reviews"/>
      <StatCard icon={RefreshCw} label="Revision Rate" value="18%" change="-3%" positive sub="Down from 21%"/>
    </div>
    <div style={{ display:"flex", gap:16, marginBottom:24, flexWrap:"wrap" }}>
      <div style={{ flex:1, minWidth:400, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:22 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 18px" }}>Orders vs Revenue</h3>
        <ResponsiveContainer width="100%" height={260}><LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="month" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/><YAxis yAxisId="left" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/><YAxis yAxisId="right" orientation="right" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`}/><Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12,color:"#fff"}}/><Legend wrapperStyle={{fontSize:11,color:"#6b7280"}}/><Line yAxisId="left" type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} dot={{r:3}}/><Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#2ab7a9" strokeWidth={2} dot={{r:3}}/></LineChart></ResponsiveContainer>
      </div>
      <div style={{ flex:1, minWidth:300, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:22 }}>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 18px" }}>Top Clients by Revenue</h3>
        {[...users].sort((a,b)=>b.spent-a.spent).slice(0,6).map((u,i)=><div key={u.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:i<5?"1px solid rgba(255,255,255,0.03)":"none" }}><span style={{ fontSize:11, color:"#4b5563", minWidth:18 }}>#{i+1}</span><div style={{ width:28, height:28, borderRadius:7, background:`linear-gradient(135deg,${tierColors[u.tier]},${tierColors[u.tier]}88)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:11 }}>{u.name.charAt(0)}</div><div style={{ flex:1 }}><div style={{ fontSize:12, color:"#e5e7eb", fontWeight:500 }}>{u.name}</div><div style={{ fontSize:10, color:"#4b5563" }}>{u.orders} orders</div></div><span style={{ fontSize:13, color:"#34d399", fontWeight:700 }}>${u.spent.toLocaleString()}</span></div>)}
      </div>
    </div>
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:22 }}>
      <h3 style={{ fontSize:14, fontWeight:700, color:"#fff", margin:"0 0 18px" }}>Performance Metrics</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:16 }}>
        {[{label:"Images This Month",value:"842",bar:84},{label:"On-Time Delivery",value:"96.2%",bar:96},{label:"First-Time Approval",value:"82%",bar:82},{label:"Client Retention",value:"91%",bar:91},{label:"Avg Order Value",value:"$94.90",bar:63},{label:"Capacity Used",value:"72%",bar:72}].map((m,i)=><div key={i}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}><span style={{ fontSize:12, color:"#9ca3af" }}>{m.label}</span><span style={{ fontSize:12, color:"#fff", fontWeight:600 }}>{m.value}</span></div><div style={{ height:6, borderRadius:3, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}><div style={{ width:`${m.bar}%`, height:"100%", borderRadius:3, background:m.bar>90?"#34d399":m.bar>70?"linear-gradient(90deg,#4ecdc4,#2ab7a9)":"#60a5fa" }}/></div></div>)}
      </div>
    </div>
  </div>
);

const SettingsPage = ({ toast }) => {
  const [openSection, setOpenSection] = useState(null);
  const [studioName, setStudioName] = useState("Tyes Studio");
  const [studioEmail, setStudioEmail] = useState("hello@tyes.studio");
  const [studioUrl, setStudioUrl] = useState("https://tyes.studio");
  const [notifOrders, setNotifOrders] = useState(true);
  const [notifRevisions, setNotifRevisions] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);
  const [slaTarget, setSlaTarget] = useState("2");
  const [webhookUrl, setWebhookUrl] = useState("");

  const Toggle = ({ checked, onChange }) => (
    <div onClick={() => onChange(!checked)} style={{ width: 36, height: 20, borderRadius: 10, background: checked ? "#4ecdc4" : "rgba(255,255,255,0.1)", padding: 2, cursor: "pointer", transition: "background 0.2s" }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", transform: checked ? "translateX(16px)" : "translateX(0)", transition: "transform 0.2s" }} />
    </div>
  );

  const sections = [
    { id: "profile", title: "Studio Profile", desc: "Brand name, logo, description, and contact info", icon: Home, content: (
      <div style={{ padding: "16px 0" }}>
        <InputField label="Studio Name" value={studioName} onChange={setStudioName} />
        <InputField label="Contact Email" value={studioEmail} onChange={setStudioEmail} />
        <InputField label="Website URL" value={studioUrl} onChange={setStudioUrl} />
        <button onClick={() => toast("Studio profile saved")} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Save size={12} /> Save Changes</button>
      </div>
    )},
    { id: "team", title: "Team Members", desc: "Manage retouchers, admins, and permissions", icon: Users, content: (
      <div style={{ padding: "16px 0" }}>
        {[{ name: "Sheika", role: "Owner", email: "ralucaandco@gmail.com" }, { name: "Alex R.", role: "Retoucher", email: "alex@tyes.studio" }, { name: "Dana M.", role: "Retoucher", email: "dana@tyes.studio" }].map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{m.name.charAt(0)}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>{m.name}</div><div style={{ fontSize: 11, color: "#4b5563" }}>{m.email}</div></div>
            <span style={{ fontSize: 11, color: "#7dd8d0", background: "rgba(78,205,196,0.1)", padding: "2px 8px", borderRadius: 10 }}>{m.role}</span>
          </div>
        ))}
        <button onClick={() => toast("Invite sent to team member", "info")} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "1px dashed rgba(255,255,255,0.12)", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Plus size={12} /> Invite Member</button>
      </div>
    )},
    { id: "notifications", title: "Notifications", desc: "Email alerts for orders, revisions, and payments", icon: Bell, content: (
      <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {[["New order received", notifOrders, setNotifOrders], ["Revision requested", notifRevisions, setNotifRevisions], ["Payment received", notifPayments, setNotifPayments]].map(([label, val, setter], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#d1d5db" }}>{label}</span>
            <Toggle checked={val} onChange={setter} />
          </div>
        ))}
        <button onClick={() => toast("Notification preferences saved")} style={{ marginTop: 8, padding: "8px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}>Save</button>
      </div>
    )},
    { id: "billing", title: "Payment & Billing", desc: "Stripe integration, invoices, and payout settings", icon: CreditCard, content: (
      <div style={{ padding: "16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(78,205,196,0.06)", border: "1px solid rgba(78,205,196,0.15)", marginBottom: 14 }}>
          <Shield size={16} color="#4ecdc4" />
          <div style={{ flex: 1 }}><div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>Stripe Connected</div><div style={{ fontSize: 11, color: "#4b5563" }}>acct_1234...xyz</div></div>
          <span style={{ fontSize: 11, color: "#34d399" }}>Active</span>
        </div>
        <button onClick={() => toast("Opening Stripe dashboard...", "info")} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>Manage in Stripe</button>
      </div>
    )},
    { id: "delivery", title: "Delivery Settings", desc: "SLA targets, auto-notifications, file formats", icon: Package, content: (
      <div style={{ padding: "16px 0" }}>
        <InputField label="SLA Target (hours)" value={slaTarget} onChange={setSlaTarget} type="number" />
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>Default file formats: <span style={{ color: "#e5e7eb" }}>PNG, JPG (High-Res)</span></div>
        <button onClick={() => toast("Delivery settings saved")} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Save</button>
      </div>
    )},
    { id: "api", title: "API & Integrations", desc: "Webhook URLs, Zapier, and third-party connections", icon: Webhook, content: (
      <div style={{ padding: "16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 14 }}>
          <Key size={14} color="#6b7280" /><span style={{ fontSize: 12, color: "#6b7280" }}>API Key:</span><code style={{ fontSize: 12, color: "#7dd8d0", background: "rgba(78,205,196,0.08)", padding: "2px 8px", borderRadius: 4, flex: 1 }}>pm_live_sk_...7x9z</code>
          <button onClick={() => toast("API key copied to clipboard")} style={{ background: "none", border: "none", color: "#4ecdc4", fontSize: 11, cursor: "pointer" }}>Copy</button>
        </div>
        <InputField label="Webhook URL" value={webhookUrl} onChange={setWebhookUrl} placeholder="https://your-app.com/webhooks/tyes" />
        <button onClick={() => toast(webhookUrl ? "Webhook URL saved" : "Please enter a webhook URL", webhookUrl ? "success" : "warning")} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#4ecdc4,#2ab7a9)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Save</button>
      </div>
    )},
  ];

  return (
    <div>
      <h1 style={{ fontSize:24, fontWeight:800, color:"#fff", margin:"0 0 24px" }}>Settings</h1>
      <div style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:640 }}>
        {sections.map(s => (
          <div key={s.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, overflow:"hidden" }}>
            <div onClick={() => setOpenSection(openSection === s.id ? null : s.id)} style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 22px", cursor:"pointer" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ width:40, height:40, borderRadius:10, background:"rgba(78,205,196,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}><s.icon size={18} color="#7dd8d0"/></div>
              <div style={{ flex:1 }}><div style={{ fontSize:14, color:"#e5e7eb", fontWeight:600 }}>{s.title}</div><div style={{ fontSize:12, color:"#6b7280" }}>{s.desc}</div></div>
              <ChevronDown size={16} color="#4b5563" style={{ transform:openSection===s.id?"rotate(180deg)":"none", transition:"transform 0.2s" }}/>
            </div>
            {openSection === s.id && <div style={{ padding:"0 22px 18px", borderTop:"1px solid rgba(255,255,255,0.04)" }}>{s.content}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════
const navPages = [
  { id:"dashboard", label:"Dashboard", icon:Home },
  { id:"orders", label:"Orders", icon:ShoppingCart },
  { id:"clients", label:"Clients", icon:Users },
  { id:"analytics", label:"Analytics", icon:BarChart2 },
  { id:"pricing", label:"Pricing", icon:CreditCard },
  { id:"settings", label:"Settings", icon:Settings },
];

export default function TyesAdmin() {
  const router = useRouter();
  const { toasts, addToast } = useToast();
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState(initOrders);
  const [users, setUsers] = useState(initUsers);
  const [plans, setPlans] = useState(initPlans);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth");
    } catch (error) {
      addToast("Error logging out", "error");
    }
  };

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <DashboardPage toast={addToast} goTo={setPage}/>;
      case "orders": return <OrdersPage orders={orders} setOrders={setOrders} toast={addToast} goTo={setPage}/>;
      case "clients": return <UsersPage users={users} setUsers={setUsers} toast={addToast}/>;
      case "analytics": return <AnalyticsPage users={users}/>;
      case "pricing": return <PricingPage plans={plans} setPlans={setPlans} toast={addToast}/>;
      case "settings": return <SettingsPage toast={addToast}/>;
      default: return <DashboardPage toast={addToast} goTo={setPage}/>;
    }
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:"#0a0a0a", fontFamily:"'Inter',-apple-system,sans-serif", color:"#fff", overflow:"hidden" }}>
      <ToastContainer toasts={toasts} />

      {/* Sidebar */}
      <div style={{ width:collapsed?64:220, borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", padding:collapsed?"16px 8px":"16px 12px", flexShrink:0, transition:"width 0.2s", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"4px 6px", marginBottom:24 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:13, flexShrink:0 }}>T</div>
          {!collapsed&&<div><div style={{ fontSize:13, fontWeight:800, color:"#fff", lineHeight:1.1 }}>Tyes</div><div style={{ fontSize:9, color:"#4ecdc4", fontStyle:"italic" }}>AI tied with a pulse</div><div style={{ fontSize:10, color:"#6b7280" }}>Admin Panel</div></div>}
          <button onClick={()=>setCollapsed(!collapsed)} style={{ marginLeft:"auto", background:"none", border:"none", color:"#4b5563", cursor:"pointer", padding:2, display:collapsed?"none":"block" }}><ChevronLeft size={14}/></button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:2, flex:1 }}>
          {navPages.map(p=><SidebarItem key={p.id} icon={p.icon} label={p.label} active={page===p.id} onClick={()=>setPage(p.id)} collapsed={collapsed}/>)}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:12, marginTop:8 }}>
          <SidebarItem icon={LogOut} label="Log Out" onClick={handleLogout} collapsed={collapsed}/>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 28px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {collapsed&&<button onClick={()=>setCollapsed(false)} style={{ background:"none", border:"none", color:"#6b7280", cursor:"pointer" }}><Menu size={18}/></button>}
            <div style={{ position:"relative" }}><Search size={14} style={{ position:"absolute", left:10, top:9, color:"#4b5563" }}/><input placeholder="Search anything..." style={{ padding:"7px 12px 7px 32px", borderRadius:8, border:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.03)", color:"#fff", fontSize:12, outline:"none", width:260 }}/></div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} style={{ position:"relative", background:"none", border:"none", color:"#6b7280", cursor:"pointer" }}>
                <Bell size={17}/><span style={{ position:"absolute", top:-2, right:-2, width:7, height:7, borderRadius:"50%", background:"#ef4444" }}/>
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, width: 300, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 8, zIndex: 100, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                  <div style={{ padding: "8px 12px", fontSize: 13, fontWeight: 700, color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Notifications</div>
                  {activityLog.slice(0, 4).map((a, i) => (
                    <div key={i} onClick={() => { if (a.type === "order") setPage("orders"); setNotifOpen(false); }} style={{ display: "flex", gap: 8, padding: "10px 12px", cursor: "pointer", borderRadius: 8 }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 5, background: a.type === "order" ? "#60a5fa" : a.type === "revision" ? "#fbbf24" : a.type === "complete" ? "#34d399" : "#4ecdc4" }} />
                      <div><div style={{ fontSize: 12, color: "#d1d5db" }}>{a.action}</div><div style={{ fontSize: 11, color: "#4b5563" }}>{a.detail}</div><div style={{ fontSize: 10, color: "#374151" }}>{a.time}</div></div>
                    </div>
                  ))}
                  <button onClick={() => { addToast("All notifications marked as read"); setNotifOpen(false); }} style={{ width: "100%", padding: "8px", border: "none", background: "transparent", color: "#4ecdc4", fontSize: 11, cursor: "pointer", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 4 }}>Mark all as read</button>
                </div>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <div onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:11 }}>S</div>
                <span style={{ fontSize:12, color:"#e5e7eb", fontWeight:500 }}>Sheika</span>
                <ChevronDown size={12} color="#6b7280"/>
              </div>
              {profileOpen && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, width: 180, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 4, zIndex: 100, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                  {[{ icon: User, label: "Profile", action: () => { setPage("settings"); setProfileOpen(false); } }, { icon: Settings, label: "Settings", action: () => { setPage("settings"); setProfileOpen(false); } }, { divider: true }, { icon: LogOut, label: "Log Out", action: () => { handleLogout(); setProfileOpen(false); }, danger: true }].map((item, i) => item.divider ? <div key={i} style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} /> : (
                    <button key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", border: "none", background: "transparent", color: item.danger ? "#f87171" : "#d1d5db", fontSize: 12, cursor: "pointer", borderRadius: 6 }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><item.icon size={13} />{item.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ flex:1, overflow:"auto", padding:28 }} onClick={() => { setNotifOpen(false); setProfileOpen(false); }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
