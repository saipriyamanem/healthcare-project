import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import Book from "./pages/book";

function HomeRedirect() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/" replace />;
  return <Navigate to={role === "doctor" ? "/doctor" : "/dashboard"} replace />;
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/home" element={<HomeRedirect />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/doctor" element={<DoctorDashboard />} />
    <Route path="/book" element={<Book />} />
    <Route path="*" element={<HomeRedirect />} />
  </Routes></BrowserRouter>;
}
