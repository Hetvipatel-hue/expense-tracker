import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Create Account</h1>
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
        <label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
        <label>Password<input type="password" minLength="6" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
        <button>Create Account</button>
        <p>Already registered? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
