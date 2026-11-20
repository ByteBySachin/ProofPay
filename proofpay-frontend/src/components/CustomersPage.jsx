import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  X,
  Phone,
  Mail,
  MapPin,
  Loader2,
  AlertCircle,
  Inbox,
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  city: '',
}

const currency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCustomers = useCallback(async () => {
    const token = localStorage.getItem('proofpay_token')
    if (!token) {
      setFetchError('Authentication required. Please log in.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setFetchError('')
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        setFetchError('Session expired. Please log in again.')
        return
      }

      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setCustomers(result.data)
      } else {
        setCustomers([])
      }
    } catch {
      setFetchError('Unable to load customers from the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()

    return customers.filter((customer) =>
      [customer.name, customer.phone, customer.email, customer.city]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [customers, search])

  const totalOutstanding = customers.reduce(
    (total, customer) => total + (customer.outstanding || 0),
    0,
  )

  function openAddModal() {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEditModal(customer) {
    setEditingId(customer._id || customer.id)
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      city: customer.city || '',
    })
    setError('')
    setModalOpen(true)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const name = form.name.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()
    const city = form.city.trim()

    if (!name || !phone || !city) {
      setError('Please fill in the customer name, phone number, and city.')
      return
    }

    if (!/^[0-9+\s()-]{8,16}$/.test(phone)) {
      setError('Please enter a valid phone number.')
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    const token = localStorage.getItem('proofpay_token')
    if (!token) {
      setError('You must be logged in to manage customers.')
      return
    }

    setSaving(true)
    try {
      const url = editingId
        ? `${API_BASE_URL}/api/customers/${editingId}`
        : `${API_BASE_URL}/api/customers`
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, email, city }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.message || 'Failed to save customer.')
        return
      }

      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      fetchCustomers()
    } catch {
      setError('Network error. Unable to save customer.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(customer) {
    const customerId = customer._id || customer.id
    const confirmed = window.confirm(`Delete ${customer.name}?`)
    if (!confirmed) return

    const token = localStorage.getItem('proofpay_token')
    if (!token) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setCustomers((prev) => prev.filter((c) => (c._id || c.id) !== customerId))
      } else {
        const data = await response.json()
        window.alert(data.message || 'Unable to delete customer.')
      }
    } catch {
      window.alert('Network error while deleting customer.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <span className="ml-3 text-sm text-slate-500">Loading customers…</span>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Customers</p>
            <Users className="text-blue-600" size={21} />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {customers.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Registered business customers
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Outstanding Balance</p>
            <Users className="text-orange-600" size={21} />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {currency(totalOutstanding)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Across registered customers
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Customers With Dues</p>
            <Users className="text-rose-600" size={21} />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {customers.filter((customer) => (customer.outstanding || 0) > 0).length}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Customers with an outstanding balance
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              All Customers
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your retailers, shops, and business customers.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>

        <div className="relative mt-6 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, phone, email, or city..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Contact</th>
                <th className="px-3 py-3 font-medium">City</th>
                <th className="px-3 py-3 font-medium">Outstanding</th>
                <th className="px-3 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer._id || customer.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {customer.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone size={14} className="text-slate-400" />
                      {customer.phone}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Mail size={13} className="text-slate-400" />
                      {customer.email || 'No email added'}
                    </div>
                  </td>

                  <td className="px-3 py-4 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      {customer.city}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-800">
                    {currency(customer.outstanding)}
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${customer.name}`}
                        onClick={() => openEditModal(customer)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        aria-label={`Delete ${customer.name}`}
                        onClick={() => handleDelete(customer)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-14 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Inbox size={40} className="text-slate-300" strokeWidth={1.5} />
                      <p className="mt-3 font-medium text-slate-700">
                        {search ? 'No matching customers found' : 'No customers yet'}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {search
                          ? 'Try modifying your search query.'
                          : 'Click "Add Customer" to add your first business customer.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-form-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3
                  id="customer-form-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {editingId ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {editingId
                    ? 'Update customer details in the database.'
                    : 'Save customer details for invoice and payment tracking.'}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Customer Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Trading Co"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Phone Number *
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    City / Location *
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email Address <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. contact@business.com"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
