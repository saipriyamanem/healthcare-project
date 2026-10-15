import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";
import Toast from "../components/Toast";

const badge=(status)=>status.toLowerCase();

export default function Dashboard(){
 const nav=useNavigate();
 const location=useLocation();
 const [data,setData]=useState([]);
 const [waitlist,setWaitlist]=useState([]);
 const [notifications,setNotifications]=useState([]);
 const [loading,setLoading]=useState(true);
 const [toast,setToast]=useState(location.state?.toast?{message:location.state.toast,type:"success"}:null);
 const [showNotifications,setShowNotifications]=useState(false);
 const [browserAlerts,setBrowserAlerts]=useState("Notification" in window && Notification.permission==="granted");
 const name=localStorage.getItem("userName")||"Patient";
 const firstNotificationLoad=useRef(true);
 const knownIds=useRef(new Set(JSON.parse(localStorage.getItem("pulsecare_seen_notifications")||"[]")));

 const notifyBrowser=(n)=>{
   if(!browserAlerts || !("Notification" in window) || Notification.permission!=="granted") return;
   new Notification(n.title,{body:n.message,icon:"/logo192.png"});
 };

 const fetchData=async(silent=false)=>{
  try{
   if(!silent)setLoading(true);
   const [a,w,n]=await Promise.all([
    API.get("/api/appointments/my"),
    API.get("/api/waitlist/my"),
    API.get("/api/notifications")
   ]);
   setData(a.data); setWaitlist(w.data);
   const incoming=n.data||[];
   if(!firstNotificationLoad.current){
     incoming.filter(x=>!knownIds.current.has(x._id)).slice(0,3).forEach(x=>{
       notifyBrowser(x);
       setToast({message:x.message,type:"success"});
     });
   }
   incoming.forEach(x=>knownIds.current.add(x._id));
   localStorage.setItem("pulsecare_seen_notifications",JSON.stringify(Array.from(knownIds.current).slice(-100)));
   setNotifications(incoming);
   firstNotificationLoad.current=false;
  }catch(e){
   if(e.response?.status===401){localStorage.clear();nav("/")}
   else if(!silent)setToast({type:"error",message:e.response?.data?.message||"Could not load appointments"});
  }finally{if(!silent)setLoading(false)}
 };

 useEffect(()=>{fetchData(); const timer=setInterval(()=>fetchData(true),12000); return()=>clearInterval(timer)},[]);
 useEffect(()=>{if(location.state?.toast)window.history.replaceState({},"")},[location.state]);

 const stats=useMemo(()=>({
  total:data.length,
  pending:data.filter(a=>a.status==="Pending").length,
  confirmed:data.filter(a=>a.status==="Confirmed").length,
  completed:data.filter(a=>a.status==="Completed").length
 }),[data]);

 const unread=notifications.filter(n=>!n.read).length;
 const nextAppointment=useMemo(()=>{
   const now=new Date();
   return data.filter(a=>a.status==="Confirmed" && new Date(`${a.appointmentDate}T${a.appointmentTime}`)>now)
     .sort((a,b)=>new Date(`${a.appointmentDate}T${a.appointmentTime}`)-new Date(`${b.appointmentDate}T${b.appointmentTime}`))[0];
 },[data]);

 const cancel=async(id)=>{
  try{await API.patch(`/api/appointments/cancel/${id}`);setToast({message:"Appointment cancelled",type:"success"});fetchData(true)}
  catch(e){setToast({message:e.response?.data?.message||"Could not cancel appointment",type:"error"})}
 };

 const leaveWaitlist=async(id)=>{
  try{await API.patch(`/api/waitlist/leave/${id}`);setWaitlist(x=>x.filter(w=>w._id!==id));setToast({message:"Removed from waitlist",type:"success"})}
  catch(e){setToast({message:e.response?.data?.message||"Could not leave waitlist",type:"error"})}
 };

 const enableAlerts=async()=>{
   if(!("Notification" in window)){setToast({type:"error",message:"Browser notifications are not supported here."});return}
   const permission=await Notification.requestPermission();
   if(permission==="granted"){setBrowserAlerts(true);setToast({message:"Availability and appointment alerts are enabled ✓",type:"success"})}
   else setToast({type:"error",message:"Notification permission was not granted."});
 };

 const markAllRead=async()=>{
   try{await API.patch("/api/notifications/read-all");setNotifications(x=>x.map(n=>({...n,read:true})));}
   catch(e){}
 };

 const logout=()=>{localStorage.clear();nav("/")};

 return <main className="app-shell">
  <Toast toast={toast} onClose={()=>setToast(null)}/>
  <header className="topbar">
   <div className="brand"><div className="brand-mark">✚</div><div><div className="brand-name">PulseCare</div><small>Patient workspace</small></div></div>
   <div className="topbar-actions">
    <button className="ghost-btn" onClick={enableAlerts}>🔔 {browserAlerts?"Alerts on":"Enable alerts"}</button>
    <button className="ghost-btn notification-btn" onClick={()=>setShowNotifications(!showNotifications)}>Notifications {unread>0&&<b>{unread}</b>}</button>
    <button className="ghost-btn" onClick={()=>fetchData()}>↻ Refresh</button>
    <button className="danger-btn" onClick={logout}>Log out</button>
   </div>
  </header>

  {showNotifications&&<section className="notification-panel">
    <div className="section-head"><div><h2>Notifications</h2><p>Doctor availability, appointment updates and reminders.</p></div><button className="ghost-btn" onClick={markAllRead}>Mark all read</button></div>
    {notifications.length===0?<p className="muted-text">No notifications yet.</p>:notifications.slice(0,8).map(n=><div className={`notification-item ${n.read?"":"unread"}`} key={n._id}><span>{n.type==="AVAILABILITY"?"🟢":n.type==="APPOINTMENT"?"📅":"🔔"}</span><div><b>{n.title}</b><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString()}</small></div></div>)}
  </section>}

  <section className="dashboard">
   <div className="hero-row"><div><div className="eyebrow">Your care command center</div><h1>Hey, {name.split(" ")[0]} <span>👋</span></h1><p>Track requests, confirmations and doctor availability without the chaos.</p></div><button className="primary-btn" onClick={()=>nav("/book")}>+ Find a doctor</button></div>

   {nextAppointment&&<div className="upcoming-banner"><div><span>UPCOMING APPOINTMENT</span><strong>📅 {nextAppointment.appointmentDate} · ⏰ {nextAppointment.appointmentTime}</strong><p>Confirmed with {nextAppointment.doctorName}. Please arrive a little early.</p></div><button className="ghost-btn" onClick={()=>document.getElementById("appointments")?.scrollIntoView({behavior:"smooth"})}>View</button></div>}

   <div className="stats">
    <div className="stat"><div className="stat-top"><span>Total</span><span className="stat-icon">📅</span></div><strong>{stats.total}</strong><small>All appointment requests</small></div>
    <div className="stat"><div className="stat-top"><span>Pending</span><span className="stat-icon">⏳</span></div><strong>{stats.pending}</strong><small>Waiting for doctor</small></div>
    <div className="stat"><div className="stat-top"><span>Confirmed</span><span className="stat-icon">✓</span></div><strong>{stats.confirmed}</strong><small>Ready to go</small></div>
    <div className="stat"><div className="stat-top"><span>Completed</span><span className="stat-icon">✨</span></div><strong>{stats.completed}</strong><small>Care history</small></div>
   </div>

   {waitlist.length>0&&<><div className="section-head"><div><h2>Doctor availability alerts</h2><p>You will be notified when a doctor on your list becomes available.</p></div><span>{waitlist.length} waiting</span></div>
   <div className="waitlist-grid">{waitlist.map(w=><article className="wait-card" key={w._id}><div><strong>{w.doctorName}</strong><span>{w.specialization}</span><small>{w.status==="Notified"?"🟢 Doctor is available now":"⏳ Waiting for availability"}</small></div><button className="danger-btn" onClick={()=>leaveWaitlist(w._id)}>Remove</button></article>)}</div></>}

   <div className="section-head" id="appointments"><div><h2>Your appointments</h2><p>Every request has a clear status.</p></div><span>{data.length} record{data.length===1?"":"s"}</span></div>
   {loading?<div className="loading-card">Loading your care timeline...</div>:data.length===0?<div className="empty"><div className="empty-icon">🩺</div><h3>Your care timeline is empty</h3><p>Start by choosing a doctor and sending an appointment request.</p><button className="secondary-btn" onClick={()=>nav("/book")}>Find a doctor →</button></div>:<div className="appointments">{data.map(a=><article className="appointment" key={a._id}><div className="appt-top"><div><h3 className="doctor">{a.doctorName}</h3><span className="specialization">{a.specialization}</span></div><span className={`status ${badge(a.status)}`}>{a.status}</span></div><div className="date-chip">📅 {a.appointmentDate} · ⏰ {a.appointmentTime}</div><p className="problem">{a.problem}</p>{a.doctorNote&&<div className="doctor-note"><b>Doctor note</b><span>{a.doctorNote}</span></div>}<div className="appt-actions">{["Pending","Confirmed"].includes(a.status)&&<button className="danger-btn" onClick={()=>cancel(a._id)}>Cancel</button>}</div></article>)}</div>}
  </section>
 </main>;
}
