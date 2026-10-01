import { useEffect, useState } from "react";
import api from "../api";

const empty = { title:"", amount:"", category:"Food", type:"expense", date:new Date().toISOString().slice(0,10), receipt:"" };

export default function TransactionForm({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm({
      title: editing.title,
      amount: editing.amount,
      category: editing.category,
      type: editing.type,
      date: editing.date,
      receipt: editing.receipt || ""
    });
    else setForm(empty);
  }, [editing]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      let receipt = form.receipt;
      if (file) {
        const fd = new FormData();
        fd.append("receipt", file);
        const up = await api.post("/upload", fd);
        receipt = up.data.file;
      }

      const payload = {...form, amount:Number(form.amount), receipt};
      if (editing) await api.put(`/transactions/${editing._id}`, payload);
      else await api.post("/transactions", payload);

      setForm(empty); setFile(null); onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save transaction");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <h2>{editing ? "Edit Transaction" : "Add Transaction"}</h2>
      {error && <div className="error">{error}</div>}
      <div className="grid">
        <label>Title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
        <label>Amount (₹)<input required type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label>
        <label>Category
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
            <option>Food</option><option>Education</option><option>Travel</option><option>Shopping</option><option>Salary</option><option>Other</option>
          </select>
        </label>
        <label>Type
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
            <option value="expense">Expense</option><option value="income">Income</option>
          </select>
        </label>
        <label>Date<input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label>
        <label>Receipt<input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0] || null)}/></label>
      </div>
      <div className="actions">
        <button disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Add Transaction"}</button>
        {editing && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
