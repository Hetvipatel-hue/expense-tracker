import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Expense Tracker</h1>
        <p className="muted">Sign in to manage your finances</p>
        {error && <div className="error">{error}</div>}
        <label>Email<input type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})}/></label>
        <label>Password<input type="password" required value={form.password} onChange={e => setForm({...form,password:e.target.value})}/></label>
        <button disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
        <p>New user? <Link to="/register">Create account</Link></p>
      </form>
    </div>
  );
}
