import { useEffect, useMemo, useState, useCallback } from "react";
import { Download, Plus, Search, Filter, Wallet, Clock3, RefreshCcw, ReceiptText, FileText, X, Eye, Printer, Check, ShieldCheck, CircleAlert, Loader2 } from "lucide-react";
import "./PaymentsPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const TODAY = new Date().toISOString().slice(0, 10);
const METHODS = ["UPI", "Cash", "Bank transfer", "Card", "Cheque", "Other"];
const STATUSES = ["Completed", "Pending", "Failed", "Cancelled", "Refunded"];

const money = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(n || 0));
const dateLabel = d => {
  if (!d) return "—";
  try {
    const s = typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
    return new Date(`${s}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
};
const dateTime = d => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
};

const refunded = p => (p.refunds || []).filter(r => r.status === "Completed").reduce((s, r) => s + Number(r.amount || 0), 0);
const netPaid = p => ["Completed", "Refunded"].includes(p.status) ? Math.max(0, Number(p.amount || 0) - refunded(p)) : 0;

function Badge({ status }) {
  const norm = (status || "Pending").toLowerCase();
  return <span className={`pp-status pp-${norm}`}><i/>{status || "Pending"}</span>;
}

function Field({ label, children, hint }) {
  return <label className="pp-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [method, setMethod] = useState("All methods");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tab, setTab] = useState("All payments");
  const [modal, setModal] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ invoiceId: "", amount: "", date: TODAY, method: "UPI", reference: "", notes: "" });
  const [refundForm, setRefundForm] = useState({ amount: "", date: TODAY, reason: "" });

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('proofpay_token');
    if (!token) {
      setFetchError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      setLoading(true);
      setFetchError("");
      const [invRes, payRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/invoices`, { headers }),
        fetch(`${API_BASE_URL}/api/payments`, { headers }),
      ]);

      if (invRes.status === 401 || payRes.status === 401) {
        setFetchError("Session expired. Please log in again.");
        return;
      }

      const invData = await invRes.json().catch(() => ({}));
      const payData = await payRes.json().catch(() => ({}));

      if (invData.success && Array.isArray(invData.data)) {
        setInvoices(invData.data);
      } else {
        setInvoices([]);
      }

      if (payData.success && Array.isArray(payData.data)) {
        setPayments(payData.data);
      } else {
        setPayments([]);
      }
    } catch {
      setFetchError("Unable to load payments from the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selected = payments.find(p => (p._id || p.id) === selectedId);

  const balances = useMemo(() => Object.fromEntries(invoices.map(inv => {
    const invId = inv.invoiceNumber || inv.id || inv._id;
    const invTotal = inv.totalAmount ?? inv.total ?? 0;
    const invPaid = inv.amountPaid ?? inv.paid ?? 0;
    const invBalance = inv.balanceDue ?? inv.balance ?? Math.max(0, invTotal - invPaid);
    const customer = inv.customerName || inv.customerId?.name || "Customer";

    return [invId, {
      ...inv,
      id: invId,
      customer,
      total: invTotal,
      paid: invPaid,
      balance: invBalance,
      due: inv.dueDate ? inv.dueDate.slice(0, 10) : "",
    }];
  })), [invoices]);

  const totals = useMemo(() => ({
    collected: payments.reduce((s, p) => s + netPaid(p), 0),
    pending: payments.filter(p => p.status === "Pending").reduce((s, p) => s + Number(p.amount || 0), 0),
    refunds: payments.reduce((s, p) => s + refunded(p), 0),
    failed: payments.filter(p => p.status === "Failed").reduce((s, p) => s + Number(p.amount || 0), 0),
  }), [payments]);

  const filtered = useMemo(() => payments.filter(p => {
    const q = search.trim().toLowerCase();
    const pDate = p.date ? p.date.slice(0, 10) : "";
    const pId = p.invoiceNumber || p.invoiceId?.invoiceNumber || p.invoiceId || "";

    return [p.id, p._id, p.customer, p.customerName, pId, p.method, p.reference].join(" ").toLowerCase().includes(q)
      && (status === "All statuses" || p.status === status)
      && (method === "All methods" || p.method === method)
      && (!from || pDate >= from) && (!to || pDate <= to)
      && (tab === "All payments" || (tab === "Pending" && p.status === "Pending") || (tab === "Refunds" && (p.refunds || []).length > 0));
  }).sort((a, b) => {
    const d1 = a.date || a.createdAt || "";
    const d2 = b.date || b.createdAt || "";
    return d2.localeCompare(d1);
  }), [payments, search, status, method, from, to, tab]);

  async function recordPayment(e) {
    e.preventDefault();
    setError("");

    const inv = balances[form.invoiceId];
    const amount = Number(form.amount);

    if (!inv) return setError("Select an invoice.");
    if (!Number.isFinite(amount) || amount <= 0) return setError("Amount must be greater than ₹0.");
    if (amount > inv.balance) return setError(`Amount exceeds outstanding balance (${money(inv.balance)}).`);
    if (!form.date || form.date > TODAY) return setError("Choose a valid date that is not in the future.");

    const token = localStorage.getItem('proofpay_token');
    if (!token) return setError("You must be logged in.");

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceId: inv._id || inv.id,
          amount,
          date: form.date,
          method: form.method,
          reference: form.reference.trim(),
          notes: form.notes.trim(),
          status: "Completed",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Failed to record payment.");
        return;
      }

      setModal("");
      fetchData();
      if (result.data) {
        setSelectedId(result.data.id || result.data._id);
        setModal("details");
      }
    } catch {
      setError("Network error. Unable to record payment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function recordRefund(e) {
    e.preventDefault();
    setError("");
    if (!selected) return;

    const amount = Number(refundForm.amount);
    const available = netPaid(selected);

    if (!Number.isFinite(amount) || amount <= 0) return setError("Refund must be greater than ₹0.");
    if (amount > available) return setError(`Refund exceeds refundable balance (${money(available)}).`);
    if (!refundForm.reason.trim()) return setError("Refund reason is required.");

    const token = localStorage.getItem('proofpay_token');
    if (!token) return;

    setSubmitting(true);
    try {
      const paymentId = selected._id || selected.id;
      const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          date: refundForm.date,
          reason: refundForm.reason.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Failed to process refund.");
        return;
      }

      fetchData();
      setModal("details");
    } catch {
      setError("Network error while processing refund.");
    } finally {
      setSubmitting(false);
    }
  }

  function csvExport() {
    const rows = [
      ["Payment ID", "Customer", "Invoice", "Date", "Method", "Amount INR", "Status", "Reference", "Refunded INR", "Net paid INR"],
      ...filtered.map(p => [
        p.id || p._id,
        p.customer || p.customerName || "Customer",
        p.invoiceNumber || p.invoiceId?.invoiceNumber || p.invoiceId || "—",
        dateLabel(p.date),
        p.method,
        p.amount,
        p.status,
        p.reference || "",
        refunded(p),
        netPaid(p),
      ])
    ];

    const csv = rows.map(row => row.map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `proofpay-payments-${TODAY}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function receipt(p) {
    const w = window.open("", "_blank", "width=720,height=800");
    if (!w) {
      window.alert("Allow pop-ups to print a receipt.");
      return;
    }

    const rows = [
      ["Payment ID", p.id || p._id],
      ["Customer", p.customer || p.customerName || "Customer"],
      ["Invoice", p.invoiceNumber || p.invoiceId?.invoiceNumber || p.invoiceId || "—"],
      ["Date", dateLabel(p.date)],
      ["Method", p.method],
      ["Status", p.status],
      ["Reference", p.reference || "—"],
    ];

    w.document.write(`<!doctype html><html><head><title>ProofPay Receipt</title><style>body{font:14px Arial,sans-serif;padding:36px;color:#172033;max-width:650px;margin:auto}.brand{font-size:24px;color:#315ee8;font-weight:bold}.line{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ddd}.total{font-size:28px;font-weight:bold;margin:25px 0}.muted{color:#64748b;font-size:12px}.btn{margin-top:20px;padding:8px 16px;background:#315ee8;color:#fff;border:none;border-radius:6px;cursor:pointer}@media print{.btn{display:none}}</style></head><body><div class="brand">ProofPay</div><p class="muted">OFFICIAL PAYMENT RECEIPT</p><div class="total">${money(p.amount)}</div>${rows.map(([k, v]) => `<div class="line"><span>${k}</span><strong>${String(v).replace(/[<>&"]/g, "")}</strong></div>`).join("")}<button class="btn" onclick="window.print()">Print Receipt</button></body></html>`);
    w.document.close();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <span className="ml-3 text-sm text-slate-500">Loading payments…</span>
      </div>
    );
  }

  return (
    <section className="pp-page">
      {fetchError && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <CircleAlert size={18} className="shrink-0 text-red-500" />
          <span>{fetchError}</span>
        </div>
      )}

      <header className="pp-header">
        <div>
          <div className="pp-breadcrumb">Workspace <span>/</span> Payments</div>
          <h1>Payments</h1>
          <p>Track collections, invoice balances, transactions, and refunds.</p>
        </div>
        <div className="pp-actions">
          <button className="pp-btn pp-secondary" onClick={csvExport}>
            <Download size={16}/> Export CSV
          </button>
          <button
            className="pp-btn pp-primary"
            onClick={() => {
              setForm({ invoiceId: "", amount: "", date: TODAY, method: "UPI", reference: "", notes: "" });
              setError("");
              setModal("record");
            }}
          >
            <Plus size={17}/> Record payment
          </button>
        </div>
      </header>

      <div className="pp-stats">
        <article>
          <div>Net collected <span className="pp-icon green"><Wallet size={18}/></span></div>
          <strong>{money(totals.collected)}</strong>
          <small>Completed payments less refunds</small>
        </article>
        <article>
          <div>Pending confirmation <span className="pp-icon amber"><Clock3 size={18}/></span></div>
          <strong>{money(totals.pending)}</strong>
          <small>Awaiting confirmation</small>
        </article>
        <article>
          <div>Refunded <span className="pp-icon violet"><RefreshCcw size={18}/></span></div>
          <strong>{money(totals.refunds)}</strong>
          <small>Completed refund records</small>
        </article>
        <article>
          <div>Transactions <span className="pp-icon blue"><ReceiptText size={18}/></span></div>
          <strong>{payments.length}</strong>
          <small>{money(totals.failed)} in failed attempts</small>
        </article>
      </div>

      <section className="pp-card pp-invoices">
        <div className="pp-card-heading">
          <div>
            <h2>Invoice balances</h2>
            <p>Active invoices and their payment status.</p>
          </div>
          <FileText size={20}/>
        </div>
        {Object.keys(balances).length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No active invoices found. Create an invoice to track balances.
          </div>
        ) : (
          <div className="pp-invoice-grid">
            {Object.values(balances).map(i => {
              const pct = Math.min(100, i.total ? (i.paid / i.total) * 100 : 0);
              return (
                <article key={i.id}>
                  <div className="pp-inv-top">
                    <b>{i.id}</b>
                    <span>{Math.round(pct)}% paid</span>
                  </div>
                  <strong>{i.customer}</strong>
                  <div className="pp-progress"><span style={{ width: `${pct}%` }}/></div>
                  <div className="pp-balances">
                    <span>Paid<b>{money(i.paid)}</b></span>
                    <span>Remaining<b>{money(i.balance)}</b></span>
                  </div>
                  <small>Total {money(i.total)} {i.due ? `· Due ${dateLabel(i.due)}` : ''}</small>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="pp-card pp-history">
        <div className="pp-card-heading">
          <div>
            <h2>Transaction history</h2>
            <p>Search, filter, inspect, and export payment records.</p>
          </div>
          <span className="pp-count">{filtered.length} records</span>
        </div>

        <div className="pp-tabs">
          {["All payments", "Pending", "Refunds"].map(t => (
            <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="pp-filters">
          <label className="pp-search">
            <Search size={16}/>
            <input
              aria-label="Search"
              placeholder="Search payment, customer, invoice..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </label>
          <label className="pp-select">
            <Filter size={14}/>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option>All statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="pp-select">
            <select aria-label="Payment method" value={method} onChange={e => setMethod(e.target.value)}>
              <option>All methods</option>
              {METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label className="pp-date">
            From<input aria-label="From date" type="date" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)}/>
          </label>
          <label className="pp-date">
            To<input aria-label="To date" type="date" value={to} min={from || undefined} onChange={e => setTo(e.target.value)}/>
          </label>
          <button
            className="pp-reset"
            onClick={() => {
              setSearch("");
              setStatus("All statuses");
              setMethod("All methods");
              setFrom("");
              setTo("");
              setTab("All payments");
            }}
          >
            Reset
          </button>
        </div>

        <div className="pp-table-wrap">
          <table className="pp-table">
            <thead>
              <tr>
                <th>Payment</th>
                <th>Customer / Invoice</th>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const pId = p._id || p.id;
                const invNum = p.invoiceNumber || p.invoiceId?.invoiceNumber || p.invoiceId || "—";
                const customer = p.customer || p.customerName || "Customer";

                return (
                  <tr key={pId}>
                    <td>
                      <button className="pp-link" onClick={() => { setSelectedId(pId); setModal("details"); }}>
                        {p.id || pId.slice(-8).toUpperCase()}
                      </button>
                      {(p.refunds || []).length > 0 && (
                        <small className="pp-sub">{p.refunds.length} refund(s)</small>
                      )}
                    </td>
                    <td>
                      <b>{customer}</b>
                      <small className="pp-sub">{invNum}</small>
                    </td>
                    <td>{dateLabel(p.date || p.createdAt)}</td>
                    <td>{p.method}</td>
                    <td className="pp-amount">
                      {money(p.amount)}
                      {refunded(p) > 0 && <small className="pp-sub">Net {money(netPaid(p))}</small>}
                    </td>
                    <td><Badge status={p.status}/></td>
                    <td>
                      <button className="pp-view" aria-label={`View ${pId}`} onClick={() => { setSelectedId(pId); setModal("details"); }}>
                        <Eye size={16}/>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!filtered.length && (
                <tr>
                  <td colSpan="7">
                    <div className="pp-empty">
                      <Search size={24}/>
                      <b>No payments found</b>
                      <span>{payments.length === 0 ? "Record your first payment above." : "Try changing your filters."}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="pp-footer">
          <span>Showing {filtered.length} of {payments.length} records</span>
          <span>Currency: INR</span>
        </footer>
      </section>

      {modal === "record" && (
        <div className="pp-backdrop" onMouseDown={e => e.target === e.currentTarget && setModal("")}>
          <section className="pp-modal" role="dialog" aria-modal="true" aria-labelledby="record-title">
            <div className="pp-modal-head">
              <div>
                <h2 id="record-title">Record payment</h2>
                <p>Record a manual payment against an invoice.</p>
              </div>
              <button className="pp-close" onClick={() => setModal("")} aria-label="Close"><X size={18}/></button>
            </div>

            <form className="pp-form" onSubmit={recordPayment}>
              <Field label="Invoice *">
                <select
                  required
                  value={form.invoiceId}
                  onChange={e => setForm({ ...form, invoiceId: e.target.value })}
                >
                  <option value="">Select invoice</option>
                  {Object.values(balances).filter(i => i.balance > 0).map(i => (
                    <option key={i.id} value={i.id}>
                      {i.id} · {i.customer} · Balance {money(i.balance)}
                    </option>
                  ))}
                </select>
              </Field>

              {form.invoiceId && (
                <div className="pp-callout">
                  Outstanding balance <b>{money(balances[form.invoiceId]?.balance)}</b>
                </div>
              )}

              <div className="pp-two">
                <Field label="Amount (₹) *">
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </Field>
                <Field label="Payment date *">
                  <input
                    required
                    type="date"
                    max={TODAY}
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Payment method *">
                <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
                  {METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>

              <Field label="Reference / transaction ID" hint="Optional reference number">
                <input
                  maxLength="120"
                  value={form.reference}
                  onChange={e => setForm({ ...form, reference: e.target.value })}
                  placeholder="UPI reference, cheque number, etc."
                />
              </Field>

              <Field label="Notes" hint="Optional internal memo">
                <textarea
                  rows="2"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Add any additional context..."
                />
              </Field>

              {error && <div className="pp-error"><CircleAlert size={14}/><span>{error}</span></div>}

              <div className="pp-modal-actions">
                <button type="button" className="pp-btn pp-secondary" onClick={() => setModal("")}>Cancel</button>
                <button type="submit" disabled={submitting} className="pp-btn pp-primary">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Confirm payment
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modal === "refund" && selected && (
        <div className="pp-backdrop" onMouseDown={e => e.target === e.currentTarget && setModal("")}>
          <section className="pp-modal" role="dialog" aria-modal="true" aria-labelledby="refund-title">
            <div className="pp-modal-head">
              <div>
                <h2 id="refund-title">Issue refund</h2>
                <p>Payment {selected.id || selected._id} · {selected.customer || selected.customerName}</p>
              </div>
              <button className="pp-close" onClick={() => setModal("")} aria-label="Close"><X size={18}/></button>
            </div>

            <form className="pp-form" onSubmit={recordRefund}>
              <div className="pp-callout">
                Available to refund <b>{money(netPaid(selected))}</b>
              </div>

              <div className="pp-two">
                <Field label="Refund amount (₹) *">
                  <input
                    required
                    type="number"
                    min="0.01"
                    max={netPaid(selected)}
                    step="0.01"
                    value={refundForm.amount}
                    onChange={e => setRefundForm({ ...refundForm, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </Field>
                <Field label="Refund date *">
                  <input
                    required
                    type="date"
                    max={TODAY}
                    value={refundForm.date}
                    onChange={e => setRefundForm({ ...refundForm, date: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Reason *">
                <textarea
                  required
                  rows="3"
                  value={refundForm.reason}
                  onChange={e => setRefundForm({ ...refundForm, reason: e.target.value })}
                  placeholder="Reason for issuing refund..."
                />
              </Field>

              {error && <div className="pp-error"><CircleAlert size={14}/><span>{error}</span></div>}

              <div className="pp-modal-actions">
                <button type="button" className="pp-btn pp-secondary" onClick={() => setModal("details")}>Cancel</button>
                <button type="submit" disabled={submitting} className="pp-btn pp-primary">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Process refund
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modal === "details" && selected && (
        <div className="pp-backdrop" onMouseDown={e => e.target === e.currentTarget && setModal("")}>
          <section className="pp-modal pp-modal-wide" role="dialog" aria-modal="true" aria-labelledby="details-title">
            <div className="pp-modal-head">
              <div>
                <span className="pp-overline">Payment Record</span>
                <h2 id="details-title">{selected.id || selected._id}</h2>
                <p>Recorded {dateTime(selected.createdAt || selected.date)}</p>
              </div>
              <button className="pp-close" onClick={() => setModal("")} aria-label="Close"><X size={18}/></button>
            </div>

            <div className="pp-detail-hero">
              <div>
                <small>Amount received</small>
                <strong>{money(selected.amount)}</strong>
                {refunded(selected) > 0 && <span className="pp-sub">Net retained: {money(netPaid(selected))}</span>}
              </div>
              <Badge status={selected.status}/>
            </div>

            <div className="pp-detail-grid">
              <div><span>Customer</span><b>{selected.customer || selected.customerName || "Customer"}</b></div>
              <div><span>Invoice</span><b>{selected.invoiceNumber || selected.invoiceId?.invoiceNumber || selected.invoiceId || "—"}</b></div>
              <div><span>Payment date</span><b>{dateLabel(selected.date)}</b></div>
              <div><span>Method</span><b>{selected.method}</b></div>
              <div><span>Reference</span><b>{selected.reference || "—"}</b></div>
              <div><span>Recorded by</span><b>{selected.createdBy || "Business User"}</b></div>
            </div>

            {selected.notes && (
              <div className="pp-notes">
                <span>Notes:</span>
                <p>{selected.notes}</p>
              </div>
            )}

            <div className="pp-subhead">
              <h3>Refunds ({(selected.refunds || []).length})</h3>
              {netPaid(selected) > 0 && (
                <button
                  className="pp-btn pp-secondary pp-small"
                  onClick={() => {
                    setRefundForm({ amount: "", date: TODAY, reason: "" });
                    setError("");
                    setModal("refund");
                  }}
                >
                  <RefreshCcw size={13}/> Issue refund
                </button>
              )}
            </div>

            {(selected.refunds || []).length === 0 ? (
              <div className="pp-muted">No refunds issued on this payment.</div>
            ) : (
              (selected.refunds || []).map(r => (
                <div key={r._id || r.id} className="pp-refund">
                  <div>
                    <b>{money(r.amount)}</b>
                    <span>{r.reason || "Refund"}</span>
                    <small>{dateLabel(r.date)} · by {r.createdBy || "User"}</small>
                  </div>
                  <Badge status={r.status}/>
                </div>
              ))
            )}

            <div className="pp-modal-actions" style={{ marginTop: 20 }}>
              <button className="pp-btn pp-secondary" onClick={() => receipt(selected)}>
                <Printer size={15}/> Print receipt
              </button>
              <button className="pp-btn pp-primary" onClick={() => setModal("")}>
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
