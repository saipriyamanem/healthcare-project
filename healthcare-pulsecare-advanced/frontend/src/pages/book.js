import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Toast from "../components/Toast";

export default function Book(){
  const nav = useNavigate();
  const [doctors,setDoctors] = useState([]);
  const [selected,setSelected] = useState(null);
  const [specialization,setSpecialization] = useState("All specialties");
  const [search,setSearch] = useState("");
  const [form,setForm] = useState({appointmentDate:"",appointmentTime:"",problem:""});
  const [loading,setLoading] = useState(true);
  const [booking,setBooking] = useState(false);
  const [toast,setToast] = useState(null);
  const [joining,setJoining] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  const loadDoctors = async () => {
    try{
      setLoading(true);
      const r = await API.get("/api/appointments/doctors");
      setDoctors(r.data || []);
    }catch(e){
      setToast({type:"error",message:e.response?.data?.message || "Could not load doctors"});
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ loadDoctors(); },[]);

  const specialties = useMemo(() => [
    "All specialties",
    ...Array.from(new Set(doctors.map(d=>d.specialization).filter(Boolean))).sort()
  ],[doctors]);

  const filtered = doctors.filter(d => {
    const matchesSpecialty = specialization === "All specialties" || d.specialization === specialization;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q);
    return matchesSpecialty && matchesSearch;
  });



  const joinWaitlist = async (doctor) => {
    try {
      setJoining(doctor._id);
      await API.post("/api/waitlist/join", { doctorId: doctor._id });
      setToast({type:"success",message:`You're on ${doctor.name}'s waitlist. We'll alert you when the doctor becomes available.`});
    } catch (err) {
      setToast({type:"error",message:err.response?.data?.message || "Could not join waitlist"});
    } finally {
      setJoining(null);
    }
  };

  const chooseDoctor = (doctor) => {
    setSelected(doctor);
    setForm({appointmentDate:"",appointmentTime:"",problem:""});
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const submit = async(e) => {
    e.preventDefault();
    if(!selected || !form.appointmentDate || !form.appointmentTime || !form.problem.trim()){
      return setToast({type:"error",message:"Choose a doctor, date, time and describe your problem."});
    }
    try{
      setBooking(true);
      await API.post("/api/appointments/add",{doctorId:selected._id,...form});
      nav("/dashboard",{state:{toast:`Appointment request sent to ${selected.name} ✨`}});
    }catch(err){
      setToast({type:"error",message:err.response?.data?.message || "Could not book appointment"});
    }finally{setBooking(false);}
  };

  return <main className="book-shell">
    <Toast toast={toast} onClose={()=>setToast(null)}/>
    <section className="doctor-directory">
      <div className="directory-top">
        <div className="brand"><div className="brand-mark">✚</div><div className="brand-name">PulseCare</div></div>
        <button className="ghost-btn" onClick={()=>nav("/dashboard")}>← Dashboard</button>
      </div>

      <div className="directory-hero">
        <div>
          <div className="eyebrow">Find your doctor</div>
          <h1>Meet the care team. <span>🩺</span></h1>
          <p>Browse doctors by specialization, check their availability and working hours, then book directly from their card.</p>
        </div>
        <div className="doctor-count"><strong>{doctors.filter(d=>d.availability==="Available").length}</strong><span>doctors available now</span></div>
      </div>

      <div className="directory-tools">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search doctor or specialization..." />
        <select value={specialization} onChange={e=>setSpecialization(e.target.value)}>
          {specialties.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      {selected && <section className="booking-panel">
        <div className="booking-selected">
          <div className="avatar large">{selected.name.replace("Dr. ","").slice(0,1).toUpperCase()}</div>
          <div><strong>{selected.name}</strong><span>{selected.specialization}</span><small>🟢 {selected.availability} · {selected.workingHours}</small></div>
          <button className="ghost-btn" onClick={()=>setSelected(null)}>Change doctor</button>
        </div>
        <form onSubmit={submit} className="booking-form">
          <div className="field"><label>Appointment date *</label><input type="date" min={today} value={form.appointmentDate} onChange={e=>setForm({...form,appointmentDate:e.target.value})}/></div>
          <div className="field"><label>Available time *</label><select value={form.appointmentTime} onChange={e=>setForm({...form,appointmentTime:e.target.value})}><option value="">Choose a time</option>{(selected.availableTimes || []).map(t=><option key={t} value={t}>{t}</option>)}</select></div>
          <div className="field wide"><label>What do you need help with? *</label><textarea rows="3" placeholder="e.g. fever, routine check-up, follow-up..." value={form.problem} onChange={e=>setForm({...form,problem:e.target.value})}/></div>
          <div className="book-actions"><button type="button" className="ghost-btn" onClick={()=>setSelected(null)}>Cancel</button><button className="primary-btn" disabled={booking}>{booking?"Sending request...":"Book appointment ✨"}</button></div>
        </form>
      </section>}

      {loading ? <div className="loading-card">Loading doctors...</div> : filtered.length === 0 ? <div className="empty"><div className="empty-icon">🔎</div><h3>No doctors found</h3><p>Try another name or specialization.</p></div> : <div className="doctor-directory-grid">
        {filtered.map(d=><article className="doctor-directory-card" key={d._id}>
          <div className="directory-card-head"><div className="avatar">{d.name.replace("Dr. ","").slice(0,1).toUpperCase()}</div><span className={`availability-tag ${d.availability === "Available" ? "on" : "off"}`}>● {d.availability}</span></div>
          <h2>{d.name}</h2>
          <div className="directory-specialty">{d.specialization}</div>
          <div className="doctor-meta"><div><span>WORKING HOURS</span><b>🕐 {d.workingHours}</b></div><div><span>WORKING DAYS</span><b>📅 {(d.workingDays || []).map(x=>x.slice(0,3)).join(" · ")}</b></div><div><span>AVAILABLE SLOTS</span><b>⚡ {(d.availableTimes || []).join(" · ")}</b></div></div>
          {d.availability === "Available"
            ? <button className="primary-btn full" onClick={()=>chooseDoctor(d)}>Book appointment →</button>
            : <button className="secondary-btn full" disabled={joining===d._id} onClick={()=>joinWaitlist(d)}>{joining===d._id ? "Joining waitlist..." : "🔔 Notify me when available"}</button>}
        </article>)}
      </div>}
    </section>
  </main>;
}
