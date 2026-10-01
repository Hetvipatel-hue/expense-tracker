import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import TransactionForm from "./TransactionForm";
import TransactionTable from "./TransactionTable";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [summary, setSummary] = useState({income:0,expense:0,balance:0,count:0});
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState({search:"",type:"all",category:"all",sort:"date-desc"});

  async function load() {
    setLoading(true); setError("");
    try {
      const [rows, sum] = await Promise.all([
        api.get("/transactions", {params:{...query,page,limit:5}}),
        api.get("/transactions/summary")
      ]);
      setData(rows.data.transactions);
      setPages(rows.data.pages);
      setSummary(sum.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load data");
      if (err.response?.status === 401) logout();
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [page, query.search, query.type, query.category, query.sort]);

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  async function remove(id) {
    if (!confirm("Delete this transaction?")) return;
    try { await api.delete(`/transactions/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || "Delete failed"); }
  }

  function saved() { setEditing(null); load(); }

  return (
    <div className="app">
      <header>
        <div><h1>Expense Tracker</h1><p>Welcome, {user.name || "User"}</p></div>
        <button className="secondary" onClick={logout}>Logout</button>
      </header>

      <main>
        <section className="summary">
          <div className="card"><span>Income</span><strong className="income">₹{summary.income.toLocaleString("en-IN")}</strong></div>
          <div className="card"><span>Expenses</span><strong className="expense">₹{summary.expense.toLocaleString("en-IN")}</strong></div>
          <div className="card"><span>Balance</span><strong>₹{summary.balance.toLocaleString("en-IN")}</strong></div>
          <div className="card"><span>Transactions</span><strong>{summary.count}</strong></div>
        </section>

        <TransactionForm editing={editing} onSaved={saved} onCancel={()=>setEditing(null)} />

        <section className="panel">
          <div className="toolbar">
            <input placeholder="Search title or category..." value={query.search} onChange={e=>{setPage(1);setQuery({...query,search:e.target.value})}}/>
            <select value={query.type} onChange={e=>{setPage(1);setQuery({...query,type:e.target.value})}}>
              <option value="all">All Types</option><option value="income">Income</option><option value="expense">Expense</option>
            </select>
            <select value={query.category} onChange={e=>{setPage(1);setQuery({...query,category:e.target.value})}}>
              <option value="all">All Categories</option><option>Food</option><option>Education</option><option>Travel</option><option>Shopping</option><option>Salary</option><option>Other</option>
            </select>
            <select value={query.sort} onChange={e=>{setPage(1);setQuery({...query,sort:e.target.value})}}>
              <option value="date-desc">Newest</option><option value="date-asc">Oldest</option><option value="amount-high">Amount High-Low</option><option value="amount-low">Amount Low-High</option><option value="title-az">Title A-Z</option><option value="title-za">Title Z-A</option>
            </select>
          </div>
        </section>

        <TransactionTable data={data} loading={loading} error={error} page={page} pages={pages} onPage={setPage} onEdit={setEditing} onDelete={remove}/>
      </main>
    </div>
  );
}
