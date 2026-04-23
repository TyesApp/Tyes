
"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Search, Bell, ChevronDown, ChevronLeft, Download, MoreVertical, Plus, Edit,
  Trash2, Eye, Check, X, Clock, RefreshCw, TrendingUp, TrendingDown, Users,
  ShoppingCart, DollarSign, Image, Settings, LogOut, Home, Package, CreditCard,
  BarChart2, UserCheck, Star, ArrowUpRight, ArrowDownRight, Menu, Save,
  Mail, Shield, Key, Webhook, User
} from "lucide-react";

type ToastType = "success"|"error"|"warning"|"info";
interface Toast { id:number; message:string; type:ToastType; }
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message:string, type:ToastType="success") => {
    const id = Date.now();
    setToasts(t => [...t, {id, message, type}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return { toasts, addToast };
}

const revenueData = [
  {month:"Sep",revenue:2800,orders:32},{month:"Oct",revenue:4200,orders:48},
  {month:"Nov",revenue:5100,orders:55},{month:"Dec",revenue:7300,orders:78},
  {month:"Jan",revenue:6800,orders:72},{month:"Feb",revenue:8900,orders:94},
  {month:"Mar",revenue:11200,orders:118},
];
const categoryData = [
  {name:"Makeup",value:32,color:"#ec4899"},{name:"Skincare",value:28,color:"#34d399"},
  {name:"Hair Care",value:15,color:"#fbbf24"},{name:"Fragrance",value:12,color:"#c084fc"},
  {name:"Supplements",value:8,color:"#22d3ee"},{name:"Fashion",value:5,color:"#d946ef"},
];
const dailyOrders = [
  {day:"Mon",orders:12},{day:"Tue",orders:18},{day:"Wed",orders:15},
  {day:"Thu",orders:22},{day:"Fri",orders:28},{day:"Sat",orders:8},{day:"Sun",orders:5},
];
const initOrders = [
  {id:"ORD-3012",customer:"L'Oréal Paris",email:"digital@loreal.com",plan:"Enterprise",images:50,status:"in_progress",category:"Makeup",date:"2026-04-14",revenue:2500,revisions:0,progress:35},
  {id:"ORD-3011",customer:"Glossier Inc.",email:"studio@glossier.com",plan:"Growth",images:10,status:"revision",category:"Skincare",date:"2026-04-13",revenue:80,revisions:2,progress:75},
  {id:"ORD-3010",customer:"Aesop",email:"creative@aesop.com",plan:"Starter",images:5,status:"completed",category:"Skincare",date:"2026-04-12",revenue:45,revisions:1,progress:100},
  {id:"ORD-3009",customer:"Fenty Beauty",email:"content@fentybeauty.com",plan:"Growth",images:10,status:"delivered",category:"Makeup",date:"2026-04-11",revenue:80,revisions:0,progress:100},
  {id:"ORD-3008",customer:"Olaplex",email:"marketing@olaplex.com",plan:"Starter",images:5,status:"in_progress",category:"Hair Care",date:"2026-04-10",revenue:45,revisions:0,progress:55},
];
const initUsers = [
  {id:1,name:"L'Oréal Paris",email:"digital@loreal.com",orders:12,spent:8500,joined:"2025-11-02",status:"active",tier:"enterprise"},
  {id:2,name:"Glossier Inc.",email:"studio@glossier.com",orders:8,spent:640,joined:"2025-12-15",status:"active",tier:"pro"},
  {id:3,name:"Fenty Beauty",email:"content@fentybeauty.com",orders:15,spent:1200,joined:"2025-10-20",status:"active",tier:"pro"},
  {id:4,name:"Aesop",email:"creative@aesop.com",orders:5,spent:225,joined:"2026-01-10",status:"active",tier:"starter"},
  {id:5,name:"The Ordinary",email:"visuals@theordinary.com",orders:3,spent:135,joined:"2026-02-28",status:"active",tier:"starter"},
];
const initPlans = [
  {id:0,name:"Free Test",images:1,price:0,active:true},
  {id:1,name:"Single",images:1,price:10,active:true},
  {id:2,name:"Starter",images:5,price:45,active:true},
  {id:3,name:"Growth",images:10,price:80,active:true},
  {id:4,name:"Social Media Pack",images:7,price:55,active:true},
  {id:5,name:"Custom / Enterprise",images:0,price:0,active:true},
];
const activityLog = [
  {time:"2 min ago",action:"New order",detail:"ORD-3012 from L'Oréal Paris",type:"order"},
  {time:"18 min ago",action:"Revision requested",detail:"ORD-3011 — Glossier (rev 2)",type:"revision"},
  {time:"1 hr ago",action:"Order completed",detail:"ORD-3010 delivered to Aesop",type:"complete"},
  {time:"2 hrs ago",action:"New signup",detail:"Rare Beauty joined (Free Test)",type:"user"},
];
const statusConfig: Record<string,{label:string;bg:string;color:string;icon:any}> = {
  in_progress:{label:"In Progress",bg:"rgba(59,130,246,0.15)",color:"#60a5fa",icon:Clock},
  revision:{label:"Revision",bg:"rgba(251,191,36,0.15)",color:"#fbbf24",icon:RefreshCw},
  completed:{label:"Completed",bg:"rgba(16,185,129,0.15)",color:"#34d399",icon:Check},
  delivered:{label:"Delivered",bg:"rgba(78,205,196,0.15)",color:"#4ecdc4",icon:Package},
};
const tierColors: Record<string,string> = {free:"#6b7280",starter:"#60a5fa",pro:"#4ecdc4",enterprise:"#f472b6"};
const fmt = (n:number) => n>=1000 ? `$${(n/1000).toFixed(1)}k` : `$${n}`;

const StatusBadge = ({status}:{status:string}) => {
  const c = statusConfig[status]; const I = c.icon;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,background:c.bg,color:c.color,fontSize:11,fontWeight:600}}><I size={11}/> {c.label}</span>;
};

const StatCard = ({icon:Icon,label,value,change,positive,sub}:any) => (
  <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"20px 22px",flex:1,minWidth:200}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
      <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon size={16} color="#fff"/></div>
      {change && <span style={{display:"flex",alignItems:"center",gap:2,fontSize:11,fontWeight:600,color:positive?"#34d399":"#f87171"}}>{positive?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>} {change}</span>}
    </div>
    <div style={{fontSize:26,fontWeight:800,color:"#fff",marginBottom:2}}>{value}</div>
    <div style={{fontSize:12,color:"#6b7280"}}>{label}</div>
    {sub && <div style={{fontSize:11,color:"#4b5563",marginTop:4}}>{sub}</div>}
  </div>
);

const navPages = [
  {id:"dashboard",label:"Dashboard",icon:Home},
  {id:"orders",label:"Orders",icon:ShoppingCart},
  {id:"clients",label:"Clients",icon:Users},
  {id:"analytics",label:"Analytics",icon:BarChart2},
  {id:"pricing",label:"Pricing",icon:CreditCard},
  {id:"settings",label:"Settings",icon:Settings},
];

export default function AdminDashboard() {
  const router = useRouter();
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState(initOrders);
  const [users, setUsers] = useState(initUsers);
  const [plans, setPlans] = useState(initPlans);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const {toasts, addToast} = useToast();

  const renderPage = () => {
    switch(page) {
      case "dashboard": return <DashPage toast={addToast} goTo={setPage}/>;
      case "orders": return <OrdersPage orders={orders} setOrders={setOrders} toast={addToast}/>;
      case "clients": return <ClientsPage users={users} setUsers={setUsers} toast={addToast}/>;
      case "analytics": return <AnalyticsPage users={users}/>;
      case "pricing": return <PricingPage plans={plans} setPlans={setPlans} toast={addToast}/>;
      case "settings": return <SettingsPage toast={addToast}/>;
      default: return <DashPage toast={addToast} goTo={setPage}/>;
    }
  };

  return (
    <div style={{display:"flex",height:"100vh",background:"#0a0a0a",fontFamily:"'Inter',-apple-system,sans-serif",color:"#fff",overflow:"hidden"}}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{position:"fixed",top:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8}}>
        {toasts.map(t=>(
          <div key={t.id} style={{padding:"10px 18px",borderRadius:10,background:t.type==="success"?"#065f46":t.type==="error"?"#7f1d1d":t.type==="warning"?"#78350f":"#1e3a5f",color:"#fff",fontSize:13,fontWeight:500,boxShadow:"0 8px 30px rgba(0,0,0,0.4)",animation:"slideIn 0.3s ease",border:`1px solid ${t.type==="success"?"#34d399":t.type==="error"?"#f87171":t.type==="warning"?"#fbbf24":"#60a5fa"}44`}}>{t.message}</div>
        ))}
      </div>

      {/* Sidebar */}
      <div style={{width:collapsed?64:220,borderRight:"1px solid rgba(255,255,255,0.06)",display:"flex",flexDirection:"column",padding:collapsed?"16px 8px":"16px 12px",flexShrink:0,transition:"width 0.2s",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 6px",marginBottom:24}}>
          <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:13,flexShrink:0}}>T</div>
          {!collapsed && <div><div style={{fontSize:13,fontWeight:800,color:"#fff",lineHeight:1.1}}>Tyes</div><div style={{fontSize:9,color:"#4ecdc4",fontStyle:"italic"}}>AI tied with a pulse</div><div style={{fontSize:10,color:"#6b7280"}}>Admin Panel</div></div>}
          <button onClick={()=>setCollapsed(!collapsed)} style={{marginLeft:"auto",background:"none",border:"none",color:"#4b5563",cursor:"pointer",padding:2,display:collapsed?"none":"block"}}><ChevronLeft size={14}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:2,flex:1}}>
          {navPages.map(p=>(
            <button key={p.id} onClick={()=>setPage(p.id)}
              style={{display:"flex",alignItems:"center",gap:10,padding:collapsed?"10px 12px":"10px 14px",borderRadius:10,width:"100%",border:"none",cursor:"pointer",fontSize:13,fontWeight:page===p.id?600:400,color:page===p.id?"#fff":"#6b7280",background:page===p.id?"linear-gradient(135deg,rgba(78,205,196,0.25),rgba(42,183,169,0.15))":"transparent",justifyContent:collapsed?"center":"flex-start"}}
              onMouseEnter={e=>{if(page!==p.id)e.currentTarget.style.background="rgba(255,255,255,0.04)"}}
              onMouseLeave={e=>{if(page!==p.id)e.currentTarget.style.background="transparent"}}
            >
              <p.icon size={17} style={{flexShrink:0}}/>{!collapsed && p.label}
            </button>
          ))}
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:12,marginTop:8}}>
          <button onClick={()=>router.push("/auth")} style={{display:"flex",alignItems:"center",gap:10,padding:collapsed?"10px 12px":"10px 14px",borderRadius:10,width:"100%",border:"none",cursor:"pointer",fontSize:13,color:"#6b7280",background:"transparent",justifyContent:collapsed?"center":"flex-start"}}>
            <LogOut size={17}/>{!collapsed && "Log Out"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 28px",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {collapsed && <button onClick={()=>setCollapsed(false)} style={{background:"none",border:"none",color:"#6b7280",cursor:"pointer"}}><Menu size={18}/></button>}
            <div style={{position:"relative"}}><Search size={14} style={{position:"absolute",left:10,top:9,color:"#4b5563"}}/><input placeholder="Search anything..." style={{padding:"7px 12px 7px 32px",borderRadius:8,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.03)",color:"#fff",fontSize:12,outline:"none",width:260}}/></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{position:"relative"}}>
              <button onClick={()=>{setNotifOpen(!notifOpen);setProfileOpen(false);}} style={{position:"relative",background:"none",border:"none",color:"#6b7280",cursor:"pointer"}}>
                <Bell size={17}/><span style={{position:"absolute",top:-2,right:-2,width:7,height:7,borderRadius:"50%",background:"#ef4444"}}/>
              </button>
              {notifOpen && (
                <div style={{position:"absolute",right:0,top:"100%",marginTop:8,width:280,background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:8,zIndex:100,boxShadow:"0 12px 40px rgba(0,0,0,0.5)"}}>
                  <div style={{padding:"8px 12px",fontSize:13,fontWeight:700,color:"#fff",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>Notifications</div>
                  {activityLog.map((a,i)=>(
                    <div key={i} style={{display:"flex",gap:8,padding:"10px 12px",cursor:"pointer",borderRadius:8}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{width:6,height:6,borderRadius:"50%",marginTop:5,background:a.type==="order"?"#60a5fa":a.type==="revision"?"#fbbf24":"#34d399"}}/>
                      <div><div style={{fontSize:12,color:"#d1d5db"}}>{a.action}</div><div style={{fontSize:11,color:"#4b5563"}}>{a.time}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{position:"relative"}}>
              <div onClick={()=>{setProfileOpen(!profileOpen);setNotifOpen(false);}} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:11}}>S</div>
                <span style={{fontSize:12,color:"#e5e7eb",fontWeight:500}}>Sheika</span>
                <ChevronDown size={12} color="#6b7280"/>
              </div>
              {profileOpen && (
                <div style={{position:"absolute",right:0,top:"100%",marginTop:8,width:160,background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:4,zIndex:100}}>
                  <button onClick={()=>router.push("/auth")} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 12px",border:"none",background:"transparent",color:"#f87171",fontSize:12,cursor:"pointer",borderRadius:6}}>
                    <LogOut size={13}/>Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:28}} onClick={()=>{setNotifOpen(false);setProfileOpen(false);}}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

function DashPage({toast,goTo}:any) {
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
        <div><h1 style={{fontSize:24,fontWeight:800,color:"#fff",margin:0}}>Dashboard</h1><p style={{fontSize:13,color:"#6b7280",margin:0}}>Welcome back. Here's what's happening today.</p></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>toast("CSV exported")} style={{padding:"8px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#9ca3af",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><Download size={13}/> Export</button>
          <button onClick={()=>goTo("orders")} style={{padding:"8px 16px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ New Order</button>
        </div>
      </div>
      <div style={{display:"flex",gap:16,marginBottom:24,flexWrap:"wrap"}}>
        <StatCard icon={DollarSign} label="Revenue (March)" value="$11,200" change="+25.8%" positive sub="vs $8,900 in Feb"/>
        <StatCard icon={ShoppingCart} label="Orders (March)" value="118" change="+25.5%" positive sub="94 in Feb"/>
        <StatCard icon={Users} label="Active Clients" value="47" change="+12.3%" positive sub="8 new this month"/>
        <StatCard icon={Image} label="Images Delivered" value="842" change="+18.6%" positive sub="Avg 7.1 per order"/>
      </div>
      <div style={{display:"flex",gap:16,marginBottom:24,flexWrap:"wrap"}}>
        <div style={{flex:2,minWidth:340,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:22}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}><h3 style={{fontSize:14,fontWeight:700,color:"#fff",margin:0}}>Revenue Trend</h3><span style={{fontSize:11,color:"#6b7280"}}>Last 7 months</span></div>
          <ResponsiveContainer width="100%" height={220}><AreaChart data={revenueData}><defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4ecdc4" stopOpacity={0.3}/><stop offset="100%" stopColor="#4ecdc4" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="month" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`}/><Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12,color:"#fff"}}/><Area type="monotone" dataKey="revenue" stroke="#4ecdc4" fill="url(#gr)" strokeWidth={2.5}/></AreaChart></ResponsiveContainer>
        </div>
        <div style={{flex:1,minWidth:240,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:22}}>
          <h3 style={{fontSize:14,fontWeight:700,color:"#fff",margin:"0 0 18px"}}>By Category</h3>
          <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke="none">{categoryData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12,color:"#fff"}}/></PieChart></ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>{categoryData.map((d,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#9ca3af"}}><span style={{width:7,height:7,borderRadius:"50%",background:d.color,display:"inline-block"}}/>{d.name}</span>)}</div>
        </div>
      </div>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:22}}>
        <h3 style={{fontSize:14,fontWeight:700,color:"#fff",margin:"0 0 18px"}}>This Week Orders</h3>
        <ResponsiveContainer width="100%" height={180}><BarChart data={dailyOrders} barSize={28}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="day" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12,color:"#fff"}}/><Bar dataKey="orders" fill="#4ecdc4" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer>
      </div>
    </div>
  );
}

function OrdersPage({orders,setOrders,toast}:any) {
  const [filter,setFilter] = useState("all");
  const [search,setSearch] = useState("");
  const filtered = orders.filter((o:any) => {
    if(filter!=="all" && o.status!==filter) return false;
    if(search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const updateStatus = (id:string, s:string) => {
    setOrders((prev:any[])=>prev.map(o=>o.id===id?{...o,status:s,progress:s==="delivered"||s==="completed"?100:o.progress}:o));
    toast(`${id} marked as ${statusConfig[s].label}`);
  };
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,color:"#fff",margin:0}}>Orders</h1>
        <button onClick={()=>toast("New order form","info")} style={{padding:"8px 16px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ New Order</button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {["all","in_progress","revision","completed","delivered"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{padding:"6px 14px",borderRadius:20,border:"1px solid",borderColor:filter===s?"rgba(78,205,196,0.5)":"rgba(255,255,255,0.06)",background:filter===s?"rgba(78,205,196,0.15)":"transparent",color:filter===s?"#4ecdc4":"#6b7280",fontSize:12,cursor:"pointer"}}>
            {s==="all"?"All":(statusConfig[s]?.label||s)}
          </button>
        ))}
      </div>
      <div style={{marginBottom:16,position:"relative"}}><Search size={14} style={{position:"absolute",left:12,top:10,color:"#4b5563"}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders..." style={{width:"100%",maxWidth:360,padding:"8px 12px 8px 34px",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.03)",color:"#fff",fontSize:12,outline:"none"}}/></div>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>{["Order","Client","Plan","Imgs","Status","Progress","Revenue","Date"].map((h,i)=><th key={i} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map((o:any)=>(
            <tr key={o.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{padding:"12px 16px",fontSize:12,color:"#7dd8d0",fontWeight:600}}>{o.id}</td>
              <td style={{padding:"12px 16px"}}><div style={{fontSize:12,color:"#e5e7eb",fontWeight:500}}>{o.customer}</div><div style={{fontSize:11,color:"#4b5563"}}>{o.category}</div></td>
              <td style={{padding:"12px 16px",fontSize:12,color:"#9ca3af"}}>{o.plan}</td>
              <td style={{padding:"12px 16px",fontSize:12,color:"#9ca3af"}}>{o.images}</td>
              <td style={{padding:"12px 16px"}}><StatusBadge status={o.status}/></td>
              <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,height:4,borderRadius:2,background:"rgba(255,255,255,0.06)"}}><div style={{width:`${o.progress}%`,height:"100%",borderRadius:2,background:o.progress===100?"#34d399":"linear-gradient(90deg,#4ecdc4,#2ab7a9)"}}/></div><span style={{fontSize:11,color:"#6b7280"}}>{o.progress}%</span></div></td>
              <td style={{padding:"12px 16px",fontSize:12,color:o.revenue>0?"#34d399":"#4b5563",fontWeight:600}}>{o.revenue>0?`$${o.revenue}`:"Free"}</td>
              <td style={{padding:"12px 16px",fontSize:11,color:"#6b7280"}}>{o.date}</td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length===0 && <div style={{padding:40,textAlign:"center",color:"#4b5563",fontSize:13}}>No orders found.</div>}
      </div>
    </div>
  );
}

function ClientsPage({users,setUsers,toast}:any) {
  const [search,setSearch] = useState("");
  const filtered = users.filter((u:any)=>!search||u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,color:"#fff",margin:0}}>Clients</h1>
        <button onClick={()=>toast("CSV exported")} style={{padding:"8px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#9ca3af",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><Download size={13}/> Export CSV</button>
      </div>
      <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap"}}>
        <StatCard icon={Users} label="Total Clients" value={users.length}/>
        <StatCard icon={UserCheck} label="Active" value={users.filter((u:any)=>u.status==="active").length}/>
        <StatCard icon={Star} label="Enterprise" value={users.filter((u:any)=>u.tier==="enterprise").length}/>
        <StatCard icon={DollarSign} label="Total Revenue" value={fmt(users.reduce((a:number,u:any)=>a+u.spent,0))}/>
      </div>
      <div style={{marginBottom:16,position:"relative"}}><Search size={14} style={{position:"absolute",left:12,top:10,color:"#4b5563"}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients..." style={{width:"100%",maxWidth:360,padding:"8px 12px 8px 34px",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.03)",color:"#fff",fontSize:12,outline:"none"}}/></div>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>{["Client","Email","Tier","Orders","Spent","Joined","Status"].map((h,i)=><th key={i} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:600,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>)}</tr></thead>
          <tbody>{filtered.map((u:any)=>(
            <tr key={u.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${tierColors[u.tier]},${tierColors[u.tier]}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12}}>{u.name.charAt(0)}</div><span style={{fontSize:13,color:"#e5e7eb",fontWeight:500}}>{u.name}</span></div></td>
              <td style={{padding:"12px 16px",fontSize:12,color:"#6b7280"}}>{u.email}</td>
              <td style={{padding:"12px 16px"}}><span style={{padding:"3px 10px",borderRadius:20,background:`${tierColors[u.tier]}22`,color:tierColors[u.tier],fontSize:11,fontWeight:600,textTransform:"capitalize"}}>{u.tier}</span></td>
              <td style={{padding:"12px 16px",fontSize:12,color:"#9ca3af"}}>{u.orders}</td>
              <td style={{padding:"12px 16px",fontSize:12,color:"#34d399",fontWeight:600}}>{u.spent>0?`$${u.spent.toLocaleString()}`:"—"}</td>
              <td style={{padding:"12px 16px",fontSize:11,color:"#6b7280"}}>{u.joined}</td>
              <td style={{padding:"12px 16px"}}><span style={{fontSize:11,color:u.status==="active"?"#34d399":"#6b7280"}}><span style={{width:6,height:6,borderRadius:"50%",display:"inline-block",background:u.status==="active"?"#34d399":"#4b5563",marginRight:6}}/>{u.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsPage({users}:any) {
  return (
    <div>
      <h1 style={{fontSize:24,fontWeight:800,color:"#fff",margin:"0 0 24px"}}>Analytics</h1>
      <div style={{display:"flex",gap:16,marginBottom:24,flexWrap:"wrap"}}>
        <StatCard icon={TrendingUp} label="Conversion Rate" value="34.2%" change="+5.1%" positive sub="Free to Paid"/>
        <StatCard icon={Clock} label="Avg Delivery Time" value="1.8 hrs" change="-12%" positive sub="Target: 2 hrs"/>
        <StatCard icon={Star} label="Client Satisfaction" value="4.9/5" change="+0.1" positive sub="86 reviews"/>
        <StatCard icon={RefreshCw} label="Revision Rate" value="18%" change="-3%" positive sub="Down from 21%"/>
      </div>
      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:22}}>
        <h3 style={{fontSize:14,fontWeight:700,color:"#fff",margin:"0 0 18px"}}>Orders vs Revenue</h3>
        <ResponsiveContainer width="100%" height={260}><LineChart data={revenueData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="month" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/><YAxis yAxisId="left" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/><YAxis yAxisId="right" orientation="right" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`}/><Tooltip contentStyle={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,fontSize:12,color:"#fff"}}/><Legend wrapperStyle={{fontSize:11,color:"#6b7280"}}/><Line yAxisId="left" type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} dot={{r:3}}/><Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#2ab7a9" strokeWidth={2} dot={{r:3}}/></LineChart></ResponsiveContainer>
      </div>
    </div>
  );
}

function PricingPage({plans,setPlans,toast}:any) {
  const togglePlan = (id:number) => {
    const p = plans.find((p:any)=>p.id===id);
    setPlans((prev:any[])=>prev.map(p=>p.id===id?{...p,active:!p.active}:p));
    toast(`"${p.name}" ${p.active?"disabled":"enabled"}`);
  };
  return (
    <div>
      <h1 style={{fontSize:24,fontWeight:800,color:"#fff",margin:"0 0 24px"}}>Pricing Plans</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {plans.map((p:any)=>(
          <div key={p.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:24,opacity:p.active?1:0.5,transition:"all 0.2s"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h3 style={{fontSize:16,fontWeight:700,color:"#fff",margin:0}}>{p.name}</h3>
            </div>
            <div style={{fontSize:32,fontWeight:900,color:"#fff",marginBottom:4}}>{p.price===0?"Free":`$${p.price}`}</div>
            <div style={{fontSize:12,color:"#6b7280",marginBottom:16}}>{p.images===0?"Custom pricing":`${p.images} image${p.images>1?"s":""}`}</div>
            <span onClick={()=>togglePlan(p.id)} style={{fontSize:11,color:p.active?"#34d399":"#f87171",cursor:"pointer"}}><span style={{width:6,height:6,borderRadius:"50%",display:"inline-block",background:p.active?"#34d399":"#f87171",marginRight:6}}/>{p.active?"Active":"Inactive"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage({toast}:any) {
  const [name,setName] = useState("Tyes Studio");
  const [email,setEmail] = useState("hello@tyes.studio");
  return (
    <div>
      <h1 style={{fontSize:24,fontWeight:800,color:"#fff",margin:"0 0 24px"}}>Settings</h1>
      <div style={{maxWidth:560,display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:24}}>
          <h3 style={{fontSize:14,fontWeight:700,color:"#fff",margin:"0 0 16px"}}>Studio Profile</h3>
          <label style={{display:"block",fontSize:12,fontWeight:600,color:"#d1d5db",marginBottom:6}}>Studio Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",padding:"9px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#fff",fontSize:13,outline:"none",marginBottom:14}}/>
          <label style={{display:"block",fontSize:12,fontWeight:600,color:"#d1d5db",marginBottom:6}}>Contact Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%",padding:"9px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",color:"#fff",fontSize:13,outline:"none",marginBottom:14}}/>
          <button onClick={()=>toast("Profile saved")} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#4ecdc4,#2ab7a9)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><Save size={12}/> Save Changes</button>
        </div>
      </div>
    </div>
  );
}
