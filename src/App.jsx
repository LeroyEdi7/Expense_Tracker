import { useState, useRef, useEffect } from "react";
import axios from "axios";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const API_URL = "http://localhost:5000/api/transactions";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');

  .ledger-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    background: #0d0f14;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .ledger-root {
    width: 100%;
    max-width: 1000px;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .ledger-header {
    text-align: center;
  }

  .ledger-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .ledger-logo-icon {
    font-size: 2rem;
    color: #c8b8ff;
  }

  .ledger-logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    color: #e8e6f0;
  }

  .ledger-tagline {
    margin: 0;
    color: #6b6880;
    font-size: 0.8rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }

  .summary-section {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 24px;
  }

  @media (max-width: 900px) {
    .summary-section {
      grid-template-columns: 1fr;
    }
  }

  .summary-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .mini-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  @media (max-width: 500px) {
    .mini-grid {
      grid-template-columns: 1fr;
    }
  }

  .ledger-card {
    background: #13151d;
    border: 1px solid #1e2230;
    border-radius: 16px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  }

  .balance-card {
    background: linear-gradient(135deg, #1a1c2e 0%, #13151d 100%);
    border: 1px solid rgba(200, 184, 255, 0.2);
  }

  .mini-card {
    padding: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .card-label {
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    color: #6b6880;
    font-weight: 700;
  }

  .card-amount {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
  }

  .balance-amount {
    font-size: 2.4rem;
  }

  .positive { color: #a3ffb0; }
  .negative { color: #ff8fa3; }
  .neutral { color: #6b6880; }

  .income-text { color: #a3ffb0; }
  .expense-text { color: #ff8fa3; }

  .chart-container {
    background: #13151d;
    border: 1px solid #1e2230;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .chart-title {
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    color: #6b6880;
    font-weight: 700;
    text-align: center;
  }

  .bar-area {
    flex: 1;
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    padding: 10px 0;
    min-height: 150px;
  }

  .bar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    height: 100%;
    justify-content: flex-end;
    width: 60px;
  }

  .bar {
    width: 100%;
    border-radius: 6px 6px 0 0;
    min-height: 4px;
    position: relative;
    display: flex;
    justify-content: center;
    transition: height 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .bar-label {
    position: absolute;
    top: -20px;
    font-size: 0.6rem;
    color: #6b6880;
  }

  .bar-name {
    font-size: 0.6rem;
    color: #6b6880;
    font-weight: 700;
  }

  .form-box {
    width: 100%;
  }

  .form-row {
    background: #13151d;
    border: 1px solid #1e2230;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    gap: 20px;
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    min-width: 180px;
  }

  @media (max-width: 600px) {
    .field-group {
      min-width: 100%;
    }
    .add-btn {
      width: 100%;
    }
  }

  .ledger-label {
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    color: #6b6880;
    font-weight: 700;
  }

  .ledger-input {
    background: #0d0f14;
    border: 1px solid #2a2d3e;
    border-radius: 10px;
    padding: 12px 16px;
    color: #e8e6f0;
    font-family: 'Space Mono', monospace;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .ledger-input:focus {
    outline: none;
    border-color: #c8b8ff;
    background: #1a1c2e;
  }

  .ledger-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b6880'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
  }

  .add-btn {
    background: #c8b8ff;
    color: #0d0f14;
    border: none;
    border-radius: 10px;
    padding: 12px 30px;
    font-family: 'Syne', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .add-btn:hover {
    background: #e0d6ff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(200, 184, 255, 0.3);
  }

  .ledger-error {
    color: #ff8fa3;
    font-size: 0.8rem;
    margin: 12px 0 0;
    font-weight: 700;
  }

  .list-box {
    width: 100%;
  }

  .list-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 0.8rem;
    letter-spacing: 0.3em;
    color: #6b6880;
    margin: 0;
    font-weight: 700;
  }

  .count-badge {
    background: #1e2230;
    color: #c8b8ff;
    border-radius: 12px;
    padding: 2px 10px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .ledger-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .list-item {
    background: #13151d;
    border: 1px solid #1e2230;
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    animation: slideIn 0.4s ease forwards;
  }

  .list-item:hover {
    border-color: #2a2d3e;
    transform: translateX(4px);
  }

  .list-item.deleting {
    opacity: 0;
    transform: translateX(20px);
  }

  .item-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .item-desc {
    font-size: 1rem;
    font-weight: 400;
    color: #e8e6f0;
  }

  .item-right {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .item-amount {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .delete-btn {
    background: #1e2230;
    border: none;
    border-radius: 8px;
    color: #6b6880;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .delete-btn:hover {
    background: #ff8fa3;
    color: #0d0f14;
    transform: scale(1.1);
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .empty-container {
    padding: 80px 0;
    text-align: center;
    background: #13151d;
    border-radius: 16px;
    border: 1px dashed #1e2230;
  }

  .empty-icon {
    font-size: 3rem;
    color: #1e2230;
    margin-bottom: 16px;
  }

  .empty-text {
    color: #e8e6f0;
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .empty-sub {
    color: #6b6880;
    font-size: 0.85rem;
  }

  .notification {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 1000;
    padding: 16px 24px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.9rem;
    color: #0d0f14;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    animation: slideInRight 0.3s ease forwards;
  }

  .notification.success { background-color: #c8b8ff; }
  .notification.error { background-color: #ff8fa3; }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 0h6"/></svg>
);
const UpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a3ffb0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5m-7 7l7-7 7 7"/></svg>
);
const DownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff8fa3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m7-7l-7 7-7-7"/></svg>
);

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification ${type === 'error' ? 'error' : 'success'}`}>
      {message}
    </div>
  );
};

const BarChart = ({ income, expense }) => {
  const max = Math.max(income, expense, 100);
  const incomeHeight = (income / max) * 100;
  const expenseHeight = (expense / max) * 100;

  return (
    <div className="chart-container">
      <div className="chart-title">VISUAL SUMMARY</div>
      <div className="bar-area">
        <div className="bar-wrapper">
          <div className="bar income-bar" style={{ height: `${incomeHeight}%`, backgroundColor: '#a3ffb0' }}>
            <span className="bar-label">{Math.round(incomeHeight)}%</span>
          </div>
          <span className="bar-name">INC</span>
        </div>
        <div className="bar-wrapper">
          <div className="bar expense-bar" style={{ height: `${expenseHeight}%`, backgroundColor: '#ff8fa3' }}>
            <span className="bar-label">{Math.round(expenseHeight)}%</span>
          </div>
          <span className="bar-name">EXP</span>
        </div>
      </div>
    </div>
  );
};

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    getTransactions();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const getTransactions = async () => {
    try {
      const res = await axios.get(API_URL);
      setTransactions(res.data.data);
    } catch (err) {
      setError("Error fetching transactions");
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const handleAdd = async () => {
    const trimmed = description.trim();
    const parsed = parseFloat(amount);
    if (!trimmed) return setError("Please enter a description.");
    if (!amount || isNaN(parsed) || parsed <= 0)
      return setError("Please enter a valid positive amount.");
    
    setError("");
    
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const res = await axios.post(API_URL, { description: trimmed, amount: parsed, type }, config);
      setTransactions((prev) => [res.data.data, ...prev]);
      setDescription("");
      setAmount("");
      showNotification("Transaction added successfully!");
    } catch (err) {
      const msg = err.response?.data?.error || "Error adding transaction";
      setError(msg);
      showNotification(msg, 'error');
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTimeout(() => {
        setTransactions((prev) => prev.filter((t) => t._id !== id));
        setDeletingId(null);
        showNotification("Transaction removed");
      }, 350);
    } catch (err) {
      showNotification("Error deleting transaction", 'error');
      setDeletingId(null);
    }
  };

  return (
    <div className="ledger-wrapper">
      <div className="ledger-root">
        <style>{css}</style>
        
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}

        <header className="ledger-header">
          <div className="ledger-logo">
            <span className="ledger-logo-icon">⬡</span>
            <span className="ledger-logo-text">LEDGER</span>
          </div>
          <p className="ledger-tagline">Your financial snapshot</p>
        </header>

        {/* Top Section: Summaries + Chart */}
        <div className="summary-section">
          <div className="summary-grid">
            <div className="ledger-card balance-card">
              <span className="card-label">NET BALANCE</span>
              <span className={`card-amount balance-amount ${balance > 0 ? "positive" : balance < 0 ? "negative" : "neutral"}`}>
                {formatCurrency(balance)}
              </span>
            </div>
            <div className="mini-grid">
              <div className="ledger-card mini-card">
                <div className="card-header">
                  <span className="card-label">INCOME</span>
                  <UpIcon />
                </div>
                <span className="card-amount income-text">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
              <div className="ledger-card mini-card">
                <div className="card-header">
                  <span className="card-label">EXPENSES</span>
                  <DownIcon />
                </div>
                <span className="card-amount expense-text">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>
          </div>
          
          <BarChart income={totalIncome} expense={totalExpenses} />
        </div>

        {/* Form */}
        <div className="form-box">
          <h2 className="section-title">NEW TRANSACTION</h2>
          <div className="form-row">
            <div className="field-group">
              <label className="ledger-label">DESCRIPTION</label>
              <input
                className="ledger-input"
                placeholder="e.g. Salary, Groceries…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="field-group">
              <label className="ledger-label">AMOUNT</label>
              <input
                className="ledger-input"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="field-group">
              <label className="ledger-label">TYPE</label>
              <select
                className="ledger-input ledger-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <button className="add-btn" onClick={handleAdd}>
              ADD ENTRY
            </button>
          </div>
          {error && <p className="ledger-error">{error}</p>}
        </div>

        {/* Transaction List */}
        <div className="list-box">
          <div className="list-header">
            <h2 className="section-title">HISTORY</h2>
            <span className="count-badge">{transactions.length}</span>
          </div>
          
          {transactions.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon">∅</div>
              <div className="empty-text">No financial data recorded.</div>
              <div className="empty-sub">Start by adding your first transaction above.</div>
            </div>
          ) : (
            <ul className="ledger-list" ref={listRef}>
              {transactions.map((t) => (
                <li
                  key={t._id}
                  className={`list-item ${deletingId === t._id ? 'deleting' : ''}`}
                  style={{
                    borderLeft: `4px solid ${t.type === "income" ? "#a3ffb0" : "#ff8fa3"}`,
                  }}
                >
                  <div className="item-left">
                    <div 
                      className="status-dot" 
                      style={{ backgroundColor: t.type === "income" ? "#a3ffb0" : "#ff8fa3" }} 
                    />
                    <span className="item-desc">{t.description}</span>
                  </div>
                  <div className="item-right">
                    <span className={`item-amount ${t.type === "income" ? "income-text" : "expense-text"}`}>
                      {t.type === "expense" ? "–" : "+"}
                      {formatCurrency(t.amount)}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(t._id)}
                      aria-label="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}