export default function TransactionTable({ data, loading, error, page, pages, onPage, onEdit, onDelete }) {
  if (loading) return <div className="panel empty">Loading transactions...</div>;
  if (error) return <div className="panel error">{error}</div>;
  if (!data.length) return <div className="panel empty">No transactions found.</div>;

  return (
    <div className="panel">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Type</th><th>Amount</th><th>Receipt</th><th>Action</th></tr></thead>
          <tbody>
            {data.map(t => (
              <tr key={t._id}>
                <td>{t.date}</td>
                <td>{t.title}</td>
                <td>{t.category}</td>
                <td><span className={`badge ${t.type}`}>{t.type}</span></td>
                <td className={t.type === "income" ? "income" : "expense"}>₹{Number(t.amount).toLocaleString("en-IN")}</td>
                <td>{t.receipt ? <a href={t.receipt} target="_blank" rel="noreferrer">View</a> : "—"}</td>
                <td className="actions small">
                  <button className="secondary" onClick={()=>onEdit(t)}>Edit</button>
                  <button className="danger" onClick={()=>onDelete(t._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button className="secondary" disabled={page<=1} onClick={()=>onPage(page-1)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button className="secondary" disabled={page>=pages} onClick={()=>onPage(page+1)}>Next</button>
      </div>
    </div>
  );
}
