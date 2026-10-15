import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Toast from "../components/Toast";

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
export default function Register() {
  const nav = useNavigate();
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({ name:"", email:"", password:"", specialization:"", availability:"Available", workingHours:"09:00 AM - 05:00 PM", workingDays:days.slice(0,5) });
  const [loading,setLoading]=useState(false); const [toast,setToast]=useState(null);
  const update=(k,v)=>setForm({...form,[k]:v});
  const toggleDay=(day)=>setForm({...form,workingDays:form.workingDays.includes(day)?form.workingDays.filter(d=>d!==day):[...form.workingDays,day]});
  const submit=async(e)=>{e.preventDefault();
    if(!form.name.trim()||!form.email.trim()||!form.password) return setToast({type:"error",message:"Please fill all required fields."});
    if(form.password.length<6) return setToast({type:"error",message:"Password must be at least 6 characters."});
    if(role==="doctor"&&!form.specialization.trim()) return setToast({type:"error",message:"Add your specialization."});
    try{setLoading(true);const res=await API.post("/api/auth/register",{...form,role});const u=res.data.user;localStorage.setItem("token",res.data.token);localStorage.setItem("userName",u.name);localStorage.setItem("role",u.role);localStorage.setItem("userEmail",u.email);nav(role==="doctor"?"/doctor":"/dashboard");}catch(err){setToast({type:"error",message:err.response?.data?.message||"Registration failed"});}finally{setLoading(false);}
  };
  return <main className="auth-page"><Toast toast={toast} onClose={()=>setToast(null)}/><section className="register-card"><div className="brand"><div className="brand-mark">✚</div><div className="brand-name">PulseCare</div></div><div className="eyebrow">Create your workspace</div><h1>One account.<br/><span>Two experiences.</span></h1><p className="lead">Choose whether you are joining as a patient or doctor. Your dashboard will adapt automatically.</p><div className="role-switch"><button className={role==="patient"?"role active":"role"} onClick={()=>setRole("patient")}>🧑‍💻 Patient</button><button className={role==="doctor"?"role active":"role"} onClick={()=>setRole("doctor")}>🩺 Doctor</button></div>
    <form onSubmit={submit}><div className="form-grid"><div className="field"><label>Full name *</label><input placeholder="Your name" value={form.name} onChange={e=>update("name",e.target.value)}/></div><div className="field"><label>Email *</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>update("email",e.target.value)}/></div><div className="field"><label>Password *</label><input type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e=>update("password",e.target.value)}/></div>{role==="doctor"&&<><div className="field"><label>Specialization *</label><input placeholder="Cardiologist, Dermatologist..." value={form.specialization} onChange={e=>update("specialization",e.target.value)}/></div><div className="field"><label>Availability</label><select value={form.availability} onChange={e=>update("availability",e.target.value)}><option>Available</option><option>Unavailable</option></select></div><div className="field"><label>Working hours</label><input value={form.workingHours} onChange={e=>update("workingHours",e.target.value)}/></div><div className="field wide"><label>Working days</label><div className="day-row">{days.map(d=><button type="button" key={d} className={form.workingDays.includes(d)?"day active":"day"} onClick={()=>toggleDay(d)}>{d.slice(0,3)}</button>)}</div></div></>}</div><button className="primary-btn full" disabled={loading}>{loading?"Creating...":"Create account ✨"}</button></form><p className="auth-switch">Already registered? <button className="link-btn" onClick={()=>nav("/")}>Log in</button></p>
  </section></main>;
}
