import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Plus,
  Search,
  X,
  Trash2,
  Printer,
  Eye,
  FileText,
  IndianRupee,
  CalendarDays,
  ChevronDown,
  Loader2,
  AlertCircle,
  Inbox,
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

const today = () => new Date().toISOString().slice(0, 10)

const addDays = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const currency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0)

const money = (amount) =>
  Math.round((Number(amount || 0) + Number.EPSILON) * 100) / 100

const invoiceSubtotal = (invoice) => {
  if (invoice.subtotal !== undefined) return money(invoice.subtotal)
  if (!invoice.items || !Array.isArray(invoice.items)) return 0
  return money(
    invoice.items.reduce(
      (total, item) => total + Number(item.quantity || 1) * Number(item.unitPrice || item.price || 0),
      0,
    ),
  )
}

const invoiceTotal = (invoice) => {
  if (invoice.totalAmount !== undefined) return money(invoice.totalAmount)
  if (invoice.total !== undefined) return money(invoice.total)
  return invoiceSubtotal(invoice)
}

const invoicePaid = (invoice) => {
  if (invoice.amountPaid !== undefined) return money(invoice.amountPaid)
  if (invoice.paid !== undefined) return money(invoice.paid)
  return 0
}

const invoiceBalance = (invoice) => {
  if (invoice.balanceDue !== undefined) return money(invoice.balanceDue)
  if (invoice.balance !== undefined) return money(invoice.balance)
  return money(Math.max(0, invoiceTotal(invoice) - invoicePaid(invoice)))
}

function invoiceStatus(invoice) {
  const balance = invoiceBalance(invoice)
  const paid = invoicePaid(invoice)
  if (balance <= 0) return 'Paid'
  if (paid > 0) return 'Partially Paid'
  const due = invoice.dueDate ? invoice.dueDate.slice(0, 10) : ''
  if (due && due < today()) return 'Overdue'
  return 'Unpaid'
}

function StatusBadge({ status }) {
  const styles = {
    Paid: 'bg-emerald-50 text-emerald-700',
    paid: 'bg-emerald-50 text-emerald-700',
    'Partially Paid': 'bg-blue-50 text-blue-700',
    partially_paid: 'bg-blue-50 text-blue-700',
    Overdue: 'bg-red-50 text-red-700',
    overdue: 'bg-red-50 text-red-700',
    Unpaid: 'bg-orange-50 text-orange-700',
    sent: 'bg-orange-50 text-orange-700',
    draft: 'bg-slate-100 text-slate-700',
    Draft: 'bg-slate-100 text-slate-700',
  }

  const label = status ? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unpaid'

  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium ${styles[status] || styles[label] || 'bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  )
}

const emptyItem = () => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  price: 0,
})

export default function InvoicesPage() {
  const [customers, setCustomers] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  const [form, setForm] = useState({
    customerId: '',
    issueDate: today(),
    dueDate: addDays(7),
    taxRate: 0,
    items: [emptyItem()],
  })

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('proofpay_token')
    if (!token) {
      setFetchError('Authentication required. Please log in.')
      setLoading(false)
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    try {
      setLoading(true)
      setFetchError('')
      const [cusRes, invRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customers`, { headers }),
        fetch(`${API_BASE_URL}/api/invoices`, { headers }),
      ])

      if (cusRes.status === 401 || invRes.status === 401) {
        setFetchError('Session expired. Please log in again.')
        return
      }

      const cusData = await cusRes.json().catch(() => ({}))
      const invData = await invRes.json().catch(() => ({}))

      if (cusData.success && Array.isArray(cusData.data)) {
        setCustomers(cusData.data)
      } else {
        setCustomers([])
      }

      if (invData.success && Array.isArray(invData.data)) {
        setInvoices(invData.data)
      } else {
        setInvoices([])
      }
    } catch {
      setFetchError('Unable to load invoices. Check that the backend server is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase()

    return invoices.filter((invoice) => {
      const invId = invoice.invoiceNumber || invoice.id || ''
      const custName = invoice.customerName || invoice.customerId?.name || ''
      const statusText = invoiceStatus(invoice)

      return [invId, custName, statusText].join(' ').toLowerCase().includes(query)
    })
  }, [invoices, search])

  const totalInvoiced = invoices.reduce(
    (total, invoice) => total + invoiceTotal(invoice),
    0,
  )

  const totalPaid = invoices.reduce(
    (total, invoice) => total + invoicePaid(invoice),
    0,
  )

  const totalOutstanding = invoices.reduce(
    (total, invoice) => total + invoiceBalance(invoice),
    0,
  )

  const formSubtotal = money(
    form.items.reduce(
      (total, item) => total + Number(item.quantity || 0) * Number(item.price || 0),
      0,
    ),
  )

  const formTotal = money(formSubtotal * (1 + Number(form.taxRate || 0) / 100))

  function openCreateModal() {
    setForm({
      customerId: customers[0]?._id || customers[0]?.id || '',
      issueDate: today(),
      dueDate: addDays(7),
      taxRate: 0,
      items: [emptyItem()],
    })
    setError('')
    setModalOpen(true)
  }

  function updateItem(itemId, field, value) {
    setForm((previous) => ({
      ...previous,
      items: previous.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    }))
  }

  function addItem() {
    setForm((previous) => ({
      ...previous,
      items: [...previous.items, emptyItem()],
    }))
  }

  function removeItem(itemId) {
    setForm((previous) => ({
      ...previous,
      items: previous.items.filter((item) => item.id !== itemId),
    }))
  }

  async function createInvoice(event) {
    event.preventDefault()
    setError('')

    const selectedCustomer = customers.find(
      (c) => (c._id || c.id) === form.customerId,
    )

    if (!selectedCustomer) {
      setError('Please select a customer for this invoice.')
      return
    }

    if (form.dueDate < form.issueDate) {
      setError('The due date cannot be earlier than the issue date.')
      return
    }

    if (
      form.items.some(
        (item) =>
          !item.description.trim() ||
          !Number.isFinite(Number(item.quantity)) ||
          !Number.isFinite(Number(item.price)) ||
          Number(item.quantity) <= 0 ||
          Number(item.price) < 0,
      )
    ) {
      setError('Enter a description, a positive quantity, and a valid price for every item.')
      return
    }

    const token = localStorage.getItem('proofpay_token')
    if (!token) {
      setError('Authentication required.')
      return
    }

    setCreating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: selectedCustomer._id || selectedCustomer.id,
          customerName: selectedCustomer.name,
          dueDate: form.dueDate,
          items: form.items.map((item) => ({
            description: item.description.trim(),
            quantity: Number(item.quantity),
            unitPrice: Number(item.price),
          })),
          taxRate: Number(form.taxRate || 0),
          status: 'sent',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Failed to create invoice.')
        return
      }

      setModalOpen(false)
      fetchData()
      if (data.data) {
        setSelectedInvoice(data.data)
      }
    } catch {
      setError('Network error. Unable to create invoice.')
    } finally {
      setCreating(false)
    }
  }

  async function deleteInvoice(invoice) {
    const invId = invoice._id || invoice.id || invoice.invoiceNumber
    const displayNum = invoice.invoiceNumber || invoice.id || 'this invoice'
    if (!window.confirm(`Delete invoice ${displayNum}?`)) return

    const token = localStorage.getItem('proofpay_token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setInvoices((prev) => prev.filter((i) => (i._id || i.id || i.invoiceNumber) !== invId))
        if (selectedInvoice && (selectedInvoice._id === invId || selectedInvoice.id === invId)) {
          setSelectedInvoice(null)
        }
      } else {
        const data = await response.json()
        window.alert(data.message || 'Unable to delete invoice.')
      }
    } catch {
      window.alert('Network error while deleting invoice.')
    }
  }

  function printInvoice(invoice) {
    setSelectedInvoice(invoice)
    window.setTimeout(() => window.print(), 100)
  }

  const dateFormat = (value) => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return '—'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <span className="ml-3 text-sm text-slate-500">Loading invoices…</span>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      {fetchError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <span>{fetchError}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Invoiced', value: currency(totalInvoiced), color: 'text-blue-600' },
          { label: 'Payments Received', value: currency(totalPaid), color: 'text-emerald-600' },
          { label: 'Outstanding', value: currency(totalOutstanding), color: 'text-orange-600' },
          { label: 'Total Invoices', value: String(invoices.length), color: 'text-violet-600' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`mt-3 break-words text-[26px] font-bold tracking-tight ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">All Invoices</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create invoices and track payments due from customers.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Invoice
          </button>
        </div>

        <div className="relative mt-6 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoice or customer..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-3 py-3 text-[13px] font-medium">Invoice</th>
                <th className="px-3 py-3 text-[13px] font-medium">Customer</th>
                <th className="px-3 py-3 text-[13px] font-medium">Issue Date</th>
                <th className="px-3 py-3 text-[13px] font-medium">Due Date</th>
                <th className="px-3 py-3 text-[13px] font-medium">Total</th>
                <th className="px-3 py-3 text-[13px] font-medium">Balance</th>
                <th className="px-3 py-3 text-[13px] font-medium">Status</th>
                <th className="px-3 py-3 text-[13px] text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((invoice) => {
                const invId = invoice.invoiceNumber || invoice.id
                const custName = invoice.customerName || invoice.customerId?.name || 'Customer'
                const createdAt = invoice.createdAt || invoice.issueDate

                return (
                  <tr key={invoice._id || invId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="whitespace-nowrap px-3 py-4 font-medium text-blue-700">{invId}</td>
                    <td className="px-3 py-4 text-slate-700">{custName}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-slate-500">{dateFormat(createdAt)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-slate-500">{dateFormat(invoice.dueDate)}</td>
                    <td className="whitespace-nowrap px-3 py-4 font-medium">{currency(invoiceTotal(invoice))}</td>
                    <td className="whitespace-nowrap px-3 py-4 font-medium">{currency(invoiceBalance(invoice))}</td>
                    <td className="px-3 py-4"><StatusBadge status={invoice.status || invoiceStatus(invoice)} /></td>
                    <td className="px-3 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" title="View invoice" onClick={() => setSelectedInvoice(invoice)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50">
                          <Eye size={16} />
                        </button>
                        <button type="button" title="Delete invoice" onClick={() => deleteInvoice(invoice)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-14 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Inbox size={40} className="text-slate-300" strokeWidth={1.5} />
                      <p className="mt-3 text-[15px] font-medium text-slate-700">
                        {search ? 'No matching invoices found' : 'No invoices yet'}
                      </p>
                      <p className="mt-1 text-[13px] text-slate-400">
                        {search
                          ? 'Try modifying your search term.'
                          : 'Click "Create Invoice" to issue your first invoice.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[12px] text-slate-400">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </p>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="create-invoice-title" className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 id="create-invoice-title" className="text-[20px] font-semibold tracking-tight text-slate-900">Create Invoice</h2>
                <p className="mt-1 text-sm text-slate-500">Enter customer and billing details.</p>
              </div>
              <button type="button" aria-label="Close form" onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={19} />
              </button>
            </div>

            {customers.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-slate-600 font-medium">No customers found</p>
                <p className="mt-1 text-sm text-slate-400">You need to add at least one customer before creating an invoice.</p>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={createInvoice} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="text-sm font-medium text-slate-700 sm:col-span-1">
                    Customer *
                    <select
                      required
                      value={form.customerId}
                      onChange={(event) => setForm((previous) => ({ ...previous, customerId: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal outline-none focus:border-blue-500"
                    >
                      <option value="">Select customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id || customer.id} value={customer._id || customer.id}>
                          {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-medium text-slate-700">
                    Issue Date *
                    <input
                      type="date"
                      required
                      value={form.issueDate}
                      onChange={(event) => setForm((previous) => ({ ...previous, issueDate: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-blue-500"
                    />
                  </label>

                  <label className="text-sm font-medium text-slate-700">
                    Due Date *
                    <input
                      type="date"
                      required
                      min={form.issueDate}
                      value={form.dueDate}
                      onChange={(event) => setForm((previous) => ({ ...previous, dueDate: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-blue-500"
                    />
                  </label>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">Items / Services</h3>
                    <button type="button" onClick={addItem} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">
                      <Plus size={16} /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.items.map((item, index) => (
                      <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_100px_140px_40px]">
                        <label className="text-xs font-medium text-slate-500">
                          Description
                          <input required maxLength={150} value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} placeholder="Product or service name" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-blue-500" />
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                          Quantity
                          <input required type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-blue-500" />
                        </label>

                        <label className="text-xs font-medium text-slate-500">
                          Unit Price (₹)
                          <input required type="number" min="0" step="0.01" value={item.price} onChange={(event) => updateItem(item.id, 'price', event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-blue-500" />
                        </label>

                        <div className="flex items-end">
                          <button type="button" disabled={form.items.length === 1} onClick={() => removeItem(item.id)} title={`Remove item ${index + 1}`} className="rounded-lg p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30">
                            <Trash2 size={17} />
                          </button>
                        </div>

                        <p className="text-xs text-slate-500 sm:col-span-4">
                          Line total: <span className="font-semibold text-slate-800">{currency(Number(item.quantity) * Number(item.price))}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="block max-w-xs text-sm font-medium text-slate-700">
                  Tax Rate (%) — Optional
                  <input type="number" min="0" max="100" step="0.01" value={form.taxRate} onChange={(event) => setForm((previous) => ({ ...previous, taxRate: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-blue-500" />
                </label>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex justify-between py-1.5 text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>{currency(formSubtotal)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-sm text-slate-600">
                    <span>Tax ({Number(form.taxRate) || 0}%)</span>
                    <span>{currency(formTotal - formSubtotal)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
                    <span>Invoice Total</span>
                    <span>{currency(formTotal)}</span>
                  </div>
                </div>

                {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={creating} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {creating && <Loader2 size={16} className="animate-spin" />}
                    <Plus size={17} /> Create Invoice
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl print:!static print:!max-h-none print:!max-w-none print:!overflow-visible print:!rounded-none print:!shadow-none">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">Invoice Details</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => printInvoice(selectedInvoice)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Printer size={16} /> Print / PDF
                </button>
                <button type="button" aria-label="Close invoice details" onClick={() => setSelectedInvoice(null)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div id="printable-invoice">
              <div className="flex flex-wrap justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-[24px] font-bold tracking-tight text-blue-600">ProofPay</h2>
                  <p className="mt-1 text-sm text-slate-500">Invoice and payment tracking</p>
                </div>
                <div className="text-right">
                  <h3 className="text-[18px] font-bold text-slate-900">INVOICE</h3>
                  <p className="mt-1 text-sm text-slate-600">{selectedInvoice.invoiceNumber || selectedInvoice.id}</p>
                  <div className="mt-2"><StatusBadge status={selectedInvoice.status || invoiceStatus(selectedInvoice)} /></div>
                </div>
              </div>

              <div className="grid gap-5 py-6 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Bill To</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedInvoice.customerName || selectedInvoice.customerId?.name || 'Customer'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedInvoice.customerId?.phone || customers.find((c) => (c._id || c.id) === (selectedInvoice.customerId?._id || selectedInvoice.customerId))?.phone || ''}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-slate-500">Issue Date: <span className="font-medium text-slate-800">{dateFormat(selectedInvoice.createdAt || selectedInvoice.issueDate)}</span></p>
                  <p className="mt-2 text-slate-500">Due Date: <span className="font-medium text-slate-800">{dateFormat(selectedInvoice.dueDate)}</span></p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[360px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 font-medium">Description</th>
                      <th className="px-2 py-3 text-right font-medium">Qty</th>
                      <th className="px-2 py-3 text-right font-medium">Price</th>
                      <th className="py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedInvoice.items || []).map((item, idx) => (
                      <tr key={item.id || item._id || idx} className="border-b border-slate-100">
                        <td className="py-3 text-slate-800">{item.description}</td>
                        <td className="px-2 py-3 text-right">{item.quantity}</td>
                        <td className="px-2 py-3 text-right">{currency(item.unitPrice ?? item.price)}</td>
                        <td className="py-3 text-right font-medium">{currency(Number(item.quantity) * Number(item.unitPrice ?? item.price))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ml-auto mt-6 max-w-xs space-y-3 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{currency(invoiceSubtotal(selectedInvoice))}</span></div>
                <div className="flex justify-between text-slate-600"><span>Tax</span><span>{currency(selectedInvoice.taxAmount || (invoiceTotal(selectedInvoice) - invoiceSubtotal(selectedInvoice)))}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900"><span>Total</span><span>{currency(invoiceTotal(selectedInvoice))}</span></div>
                <div className="flex justify-between text-emerald-700"><span>Paid</span><span>{currency(invoicePaid(selectedInvoice))}</span></div>
                <div className="flex justify-between rounded-lg bg-blue-50 p-3 font-bold text-blue-800"><span>Balance Due</span><span>{currency(invoiceBalance(selectedInvoice))}</span></div>
              </div>

              <p className="mt-10 border-t border-slate-200 pt-4 text-center text-[12px] text-slate-400">
                Thank you for your business.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-invoice, #printable-invoice * { visibility: visible !important; }
          #printable-invoice { position: absolute; inset: 0; width: 100%; padding: 24px; }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>
    </section>
  )
}
