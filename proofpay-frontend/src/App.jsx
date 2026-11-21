import NotificationsPage from './components/NotificationsPage'
import ProfilePage from './components/ProfilePage'
import SettingsPage from './components/SettingsPage'
import CustomersPage from './components/CustomersPage'
import InvoicesPage from './components/InvoicesPage'
import DocumentsPage from './components/DocumentsPage'
import GeneralSettingsPage from './components/GeneralSettingsPage'
import ProfileSettingsPage from './components/ProfileSettingsPage'
import PaymentsPage from './components/PaymentsPage'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Bell,
  Search,
  Users,
  FileText,
  Wallet,
  TrendingUp,
  Plus,
  ArrowUpRight,
  CalendarDays,
  ArrowDownRight,
  Download,
  Menu,
  X,
  Loader2,
  AlertCircle,
  Inbox,
  UserRound,
  Settings,
  LogOut,
} from 'lucide-react'

import Sidebar from './components/Sidebar'
import StatCard from './components/StatCard'
import AccountSettingsPage from './components/AccountSettingsPage'
import { useProfile } from './context/ProfileContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount ?? 0)

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function Dashboard({ onNavigate }) {
  const [summary, setSummary] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchDashboard() {
      const token = localStorage.getItem('proofpay_token')
      if (!token) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      const headers = { Authorization: `Bearer ${token}` }

      try {
        const [summaryRes, invoicesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/summary`, { headers }),
          fetch(`${API_BASE_URL}/api/dashboard/recent-invoices`, { headers }),
        ])

        // Handle 401 for either
        if (summaryRes.status === 401 || invoicesRes.status === 401) {
          localStorage.removeItem('proofpay_token')
          localStorage.removeItem('proofpay_user')
          if (!cancelled) {
            onNavigate('Login')
          }
          return
        }

        const summaryData = await summaryRes.json().catch(() => ({}))
        const invoicesData = await invoicesRes.json().catch(() => ({}))

        if (!cancelled) {
          if (summaryData.success && summaryData.data) {
            setSummary(summaryData.data)
          } else {
            setSummary({
              totalInvoiced: 0,
              totalReceived: 0,
              outstanding: 0,
              invoiceCount: 0,
              overdueCount: 0,
            })
          }

          if (invoicesData.success && Array.isArray(invoicesData.data)) {
            setInvoices(invoicesData.data)
          } else {
            setInvoices([])
          }
        }
      } catch {
        if (!cancelled) setError('Unable to load dashboard data. Check that the backend is running.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDashboard()
    return () => { cancelled = true }
  }, [onNavigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <span className="ml-3 text-sm text-slate-500">Loading dashboard…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle size={28} className="mx-auto text-red-500" />
        <p className="mt-3 text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const totalInvoiced = summary?.totalInvoiced ?? 0
  const totalReceived = summary?.totalReceived ?? 0
  const outstanding = summary?.outstanding ?? 0
  const overdueCount = summary?.overdueCount ?? 0

  return (
    <>
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Invoiced"
          amount={formatCurrency(totalInvoiced)}
          subtitle="All recorded invoices"
          icon={FileText}
          color="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Payments Received"
          amount={formatCurrency(totalReceived)}
          subtitle="Recorded payments"
          icon={Wallet}
          color="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Outstanding"
          amount={formatCurrency(outstanding)}
          subtitle="Balance yet to be collected"
          icon={TrendingUp}
          color="bg-orange-50 text-orange-600"
        />

        <StatCard
          title="Overdue Invoices"
          amount={String(overdueCount)}
          subtitle="Require payment follow-up"
          icon={Users}
          color="bg-rose-50 text-rose-600"
        />
      </section>

      <section className="mb-8 grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold text-slate-900">
                Recent Invoices
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Track your latest customer invoices.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('Invoices')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Create Invoice
            </button>
          </div>

          <InvoiceTable invoices={invoices} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-[18px] font-semibold text-slate-900">Quick Actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Common business operations.
          </p>

          <div className="mt-5 space-y-3">
            <QuickAction
              icon={Users}
              label="Add Customer"
              color="text-blue-600"
              onClick={() => onNavigate('Customers')}
            />

            <QuickAction
              icon={FileText}
              label="Create Invoice"
              color="text-violet-600"
              onClick={() => onNavigate('Invoices')}
            />

            <QuickAction
              icon={Wallet}
              label="Record Payment"
              color="text-emerald-600"
              onClick={() => onNavigate('Payments')}
            />
          </div>

          <div className="mt-6 rounded-xl bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <CalendarDays size={18} />
              <span className="text-sm font-semibold">
                Outstanding Overview
              </span>
            </div>

            <p className="mt-3 text-[26px] font-bold tracking-tight text-slate-900">
              {formatCurrency(outstanding)}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Total outstanding balance
            </p>

            <div className="mt-4 flex items-start gap-2 text-sm text-slate-600">
              <ArrowDownRight
                size={17}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              <span>Keep payment records up to date.</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="pb-4 text-center text-xs text-slate-400">
        ProofPay · Invoice and payment tracking for your business
      </footer>
    </>
  )
}

function QuickAction({ icon: Icon, label, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
    >
      <span className="flex items-center gap-3">
        <Icon size={19} className={color} />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </span>

      <ArrowUpRight size={17} className="text-slate-400" />
    </button>
  )
}

function InvoiceTable({ invoices }) {
  const statusStyles = {
    paid: 'bg-emerald-50 text-emerald-700',
    Paid: 'bg-emerald-50 text-emerald-700',
    partially_paid: 'bg-blue-50 text-blue-700',
    'Partially Paid': 'bg-blue-50 text-blue-700',
    overdue: 'bg-red-50 text-red-700',
    Overdue: 'bg-red-50 text-red-700',
    sent: 'bg-orange-50 text-orange-700',
    Unpaid: 'bg-orange-50 text-orange-700',
    draft: 'bg-slate-100 text-slate-600',
    Draft: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-gray-100 text-gray-500',
  }

  function formatStatus(status) {
    if (!status) return 'Unknown'
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-500">
            <th className="px-3 py-3 text-[13px] font-medium">Invoice</th>
            <th className="px-3 py-3 text-[13px] font-medium">Customer</th>
            <th className="px-3 py-3 text-[13px] font-medium">Due Date</th>
            <th className="px-3 py-3 text-[13px] font-medium">Amount</th>
            <th className="px-3 py-3 text-[13px] font-medium">Balance</th>
            <th className="px-3 py-3 text-[13px] font-medium">Status</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => {
            const balance = invoice.balanceDue ?? (invoice.totalAmount ?? 0) - (invoice.amountPaid ?? 0)

            return (
              <tr
                key={invoice._id || invoice.invoiceNumber}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-3 py-4 font-medium text-blue-700">
                  {invoice.invoiceNumber}
                </td>

                <td className="px-3 py-4 text-slate-700">
                  {invoice.customerName || invoice.customerId || '—'}
                </td>

                <td className="whitespace-nowrap px-3 py-4 text-slate-500">
                  {formatDate(invoice.dueDate)}
                </td>

                <td className="whitespace-nowrap px-3 py-4 text-slate-700">
                  {formatCurrency(invoice.totalAmount)}
                </td>

                <td className="whitespace-nowrap px-3 py-4 font-medium text-slate-900">
                  {formatCurrency(balance)}
                </td>

                <td className="px-3 py-4">
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium ${
                      statusStyles[invoice.status] ||
                      'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {formatStatus(invoice.status)}
                  </span>
                </td>
              </tr>
            )
          })}

          {invoices.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-3 py-10 text-center text-slate-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <Inbox size={28} className="text-slate-300" />
                  <span>No invoices yet. Create your first invoice to get started.</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function PlaceholderPage({ page, onNavigate }) {
  const descriptions = {
    Customers: 'Manage retailer and business customer information.',
    Invoices: 'Create and manage customer invoices.',
    Payments: 'Record payments and track outstanding balances.',
    Documents: 'Organize invoice documents and delivery evidence.',
    Settings: 'Manage your business profile and preferences.',
  }

  const icons = {
    Customers: Users,
    Invoices: FileText,
    Payments: Wallet,
    Documents: FileText,
    Settings: Users,
  }

  const Icon = icons[page] || FileText

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="rounded-2xl bg-blue-50 p-4 text-blue-600">
          <Icon size={30} />
        </div>

        <h2 className="mt-5 text-[24px] font-bold tracking-tight text-slate-900">{page}</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {descriptions[page] ||
            'This section will be available as we build the application.'}
        </p>

        <p className="mt-4 rounded-full bg-amber-50 px-3 py-1.5 text-[12px] font-medium text-amber-700">
          UI module — functionality not connected yet
        </p>

        <button
          type="button"
          onClick={() => onNavigate('Dashboard')}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

function App() {
  const getPageFromUrl = () => {
    const pathname = window.location.pathname
    if (pathname === '/profile') return 'View Profile'
    const params = new URLSearchParams(window.location.search)
    const p = params.get('page')
    if (p === 'Profile' || p === 'View Profile') return 'View Profile'
    return p || 'Landing'
  }

  const [activePage, setActivePage] = useState(getPageFromUrl)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [topDropdownOpen, setTopDropdownOpen] = useState(false)

  const { profile, fetchProfile } = useProfile()
  const userName = profile.fullName || 'User'
  const userInitials = getInitials(userName)
  const roleName = profile.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : 'Owner'

  function navigate(page) {
    const url = new URL(window.location.href)

    if (page === 'Landing') {
      url.pathname = '/'
      url.searchParams.delete('page')
      url.hash = ''
    } else if (page === 'View Profile' || page === 'Profile') {
      url.pathname = '/profile'
      url.searchParams.delete('page')
      url.hash = ''
    } else {
      url.pathname = '/'
      url.searchParams.set('page', page)
      url.hash = ''
    }

    window.history.pushState({ page }, '', url)
    setActivePage(page)
    setSidebarOpen(false)
    setTopDropdownOpen(false)

    // Re-fetch profile when navigating to dashboard (e.g. after login)
    if (page === 'Dashboard') {
      fetchProfile()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('proofpay_token')
    localStorage.removeItem('proofpay_user')
    localStorage.removeItem('proofpay-profile')
    localStorage.removeItem('proofpay-preferences')
    setTopDropdownOpen(false)
    navigate('Landing')
  }

  useEffect(() => {
    function handlePopState() {
      setActivePage(getPageFromUrl())
      setSidebarOpen(false)
      setTopDropdownOpen(false)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('#top-profile-dropdown')) {
        setTopDropdownOpen(false)
      }
    }
    if (topDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [topDropdownOpen])

  // Auth guard — redirect to Login for protected pages if no token exists
  const publicPages = ['Landing', 'Login', 'Signup']
  useEffect(() => {
    if (!publicPages.includes(activePage)) {
      const token = localStorage.getItem('proofpay_token')
      if (!token) {
        navigate('Login')
      }
    }
  }, [activePage])

  if (activePage === 'Landing') {
    return <LandingPage onNavigate={navigate} />
  }

  if (activePage === 'Login') {
    return (
      <LoginPage
        onNavigate={navigate}
        onSwitchPage={navigate}
      />
    )
  }

  if (activePage === 'Signup') {
    return (
      <SignupPage
        onNavigate={navigate}
        onSwitchPage={navigate}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:flex text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          <Sidebar
            activePage={activePage}
            onNavigate={navigate}
            onLogout={handleLogout}
          />

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="absolute right-3 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {/* 2. Top Navigation Bar */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm md:hidden hover:bg-slate-50"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Fintech SaaS Workspace
              </p>

              <h1 className="text-[22px] sm:text-[26px] font-bold text-slate-900 tracking-tight">
                {activePage === 'Dashboard'
                  ? `${getGreeting()}, ${userName.split(' ')[0]}`
                  : activePage === 'View Profile'
                  ? 'My Profile'
                  : activePage}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input for Invoices & Customers */}
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
              <Search size={16} className="shrink-0 text-slate-400" />

              <input
                aria-label="Search invoices and customers"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search invoices, customers..."
                className="w-36 bg-transparent text-sm outline-none sm:w-52 placeholder:text-slate-400"
              />
            </label>

            {/* Notification Button */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => navigate('Notifications')}
              className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {/* User Avatar, Name, and Dropdown */}
            <div className="relative" id="top-profile-dropdown">
              <button
                type="button"
                onClick={() => setTopDropdownOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-1.5 pr-3 shadow-xs hover:bg-slate-50 transition"
                aria-haspopup="true"
                aria-expanded={topDropdownOpen}
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={userName}
                    className="h-8 w-8 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white">
                    {userInitials}
                  </div>
                )}

                <div className="hidden text-left sm:block">
                  <p className="text-[13px] font-semibold leading-tight text-slate-900 max-w-[120px] truncate">
                    {userName}
                  </p>
                  <p className="text-[12px] leading-tight text-slate-400 max-w-[120px] truncate">
                    {profile.businessName || roleName}
                  </p>
                </div>
              </button>

              {/* Top Navigation Dropdown Menu */}
              {topDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 text-slate-800 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="text-[13px] font-semibold text-slate-900 truncate">{userName}</p>
                    <p className="text-[12px] text-slate-500 truncate">{profile.email || 'user@proofpay.com'}</p>
                    <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {roleName}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => navigate('View Profile')}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <UserRound size={15} className="text-blue-600" />
                      <span>My Profile</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('Account Settings')}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Settings size={15} className="text-slate-500" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {activePage === 'Dashboard' ? (
          <Dashboard onNavigate={navigate} />
        ) : activePage === 'Customers' ? (
          <CustomersPage />
        ) : activePage === 'Invoices' ? (
          <InvoicesPage />
        ) : activePage === 'Documents' ? (
          <DocumentsPage />
        ) : activePage === 'Payments' ? (
          <PaymentsPage />
        ) : activePage === 'View Profile' || activePage === 'Profile' ? (
          <ProfilePage onNavigate={navigate} />
        ) : activePage === 'Settings' ? (
          <SettingsPage onNavigate={navigate} />
        ) : activePage === 'Profile Settings' ||
          activePage === 'Profile Information' ? (
          <ProfileSettingsPage />
        ) : activePage === 'General Settings' ? (
          <GeneralSettingsPage />
        ) : activePage === 'Notifications' ? (
          <NotificationsPage />
        ) : activePage === 'Account Settings' ? (
          <AccountSettingsPage />
        ) : (
          <PlaceholderPage page={activePage} onNavigate={navigate} />
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400">
          <span>ProofPay · Premium B2B Payment & Invoice Management</span>

          <span className="flex items-center gap-1 font-medium text-slate-500">
            <Download size={13} />
            {profile.businessName || 'Workspace'}
          </span>
        </div>
      </main>
    </div>
  )
}

export default App