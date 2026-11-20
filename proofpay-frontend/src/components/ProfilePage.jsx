import { useState, useEffect, useRef } from 'react'
import {
  UserRound,
  Building2,
  Loader2,
  Copy,
  Check,
  Edit3,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  FileText,
  Wallet,
  Sliders,
  X,
  Upload,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount ?? 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
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

export default function ProfilePage() {
  const {
    profile,
    loading: prodLoading,
    error: prodError,
    saveProfile,
  } = useProfile()

  // Tab State: 'profile' | 'business' | 'settings' | 'security'
  const [activeTab, setActiveTab] = useState('profile')

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState('')

  // Modals state
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [savingChanges, setSavingChanges] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Preferences local state
  const [preferences, setPreferences] = useState({
    currency: 'INR',
    language: 'en',
    paymentAlerts: true,
    overdueAlerts: true,
    proofAlerts: false,
  })

  // Production statistics fetched from backend
  const [prodStats, setProdStats] = useState({
    totalInvoices: 0,
    paymentsReceived: 0,
    loading: true,
  })

  // File upload input ref
  const fileInputRef = useRef(null)

  // Load real production stats from backend
  useEffect(() => {
    let cancelled = false

    async function loadStats() {
      const token = localStorage.getItem('proofpay_token')
      if (!token) return

      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (!cancelled && data.success && data.data) {
          setProdStats({
            totalInvoices: data.data.invoiceCount ?? 0,
            paymentsReceived: data.data.totalReceived ?? 0,
            loading: false,
          })
        }
      } catch {
        if (!cancelled) {
          setProdStats((s) => ({ ...s, loading: false }))
        }
      }
    }

    loadStats()
    return () => {
      cancelled = true
    }
  }, [])

  const roleName = profile.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : 'Owner'
  const initials = getInitials(profile.fullName || profile.name || 'User')

  // Copy to clipboard helper with feedback
  const handleCopy = (text, key) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => {
      setCopiedKey('')
    }, 2000)
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Handle Personal Info edit save
  const handleSavePersonal = async (formValues) => {
    setSavingChanges(true)
    const res = await saveProfile({
      fullName: formValues.fullName,
      phone: formValues.phone,
      bio: formValues.bio,
    })
    setSavingChanges(false)
    if (res.success) {
      setEditingPersonal(false)
      showToast('Profile updated successfully')
    } else {
      alert(res.message || 'Error updating profile')
    }
  }

  // Handle Business Info edit save
  const handleSaveBusiness = async (formValues) => {
    setSavingChanges(true)
    const res = await saveProfile({
      businessName: formValues.businessName,
      businessEmail: formValues.businessEmail,
      businessType: formValues.businessType,
      businessAddress: formValues.businessAddress,
    })
    setSavingChanges(false)
    if (res.success) {
      setEditingBusiness(false)
      showToast('Business details updated successfully')
    } else {
      alert(res.message || 'Error updating business details')
    }
  }

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be less than 5MB in size.')
      return
    }

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      alert('Only PNG, JPG, or WEBP image files are supported.')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result
      await saveProfile({ avatar: dataUrl })
      showToast('Profile photo updated')
    }
    reader.readAsDataURL(file)
  }

  // Remove photo
  const handleRemovePhoto = async () => {
    await saveProfile({ avatar: '' })
    showToast('Profile photo removed')
  }

  if (prodLoading) {
    return (
      <div className="mx-auto flex min-h-[400px] w-full max-w-5xl flex-col items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="mt-3 text-sm font-medium text-slate-500">Loading your profile…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Production Error Alert */}
      {prodError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="shrink-0 text-red-500" />
          <p>{prodError}</p>
        </div>
      )}

      {/* 1. Page Header (Single cohesive breadcrumb + title, no redundant button) */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-slate-700 font-semibold">My Profile</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal credentials, business profile, and workspace preferences.
        </p>
      </div>

      {/* 2. PROFILE HERO (Clean, non-overlapping design with gradient strip) */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Compact Gradient Banner Cover */}
        <div className="relative h-28 sm:h-32 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 overflow-hidden">
          {/* Subtle Ambient Mesh Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-xl" />
          <div className="absolute left-1/4 -bottom-10 h-32 w-52 rounded-full bg-blue-400/20 blur-xl" />

          {/* Verified Badge */}
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/25 shadow-xs">
              <ShieldCheck size={14} className="text-emerald-300" />
              Verified Business
            </span>
          </div>
        </div>

        {/* Identity & Main Info Row (Positioned with zero clipping or awkward overlaps) */}
        <div className="px-5 pb-5 pt-3 sm:px-7 sm:pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Avatar & Details */}
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              {/* Circular Avatar with Camera Action */}
              <div className="relative shrink-0 -mt-12 sm:-mt-14">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.fullName || 'User'}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-white object-cover shadow-md ring-1 ring-slate-200/80 bg-white"
                  />
                ) : (
                  <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl sm:text-3xl font-bold text-white shadow-md ring-1 ring-slate-200/80">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  aria-label="Change photo"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-sm transition hover:bg-blue-600"
                  title="Upload avatar"
                >
                  <Camera size={13} />
                </button>
              </div>

              {/* Name, Badges, and Details */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
                    {profile.fullName || 'Your Name'}
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
                    {roleName}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>

                <p className="mt-1 text-xs sm:text-sm text-slate-500 truncate max-w-xl">
                  {profile.businessName ? `${profile.businessName} · ` : ''}
                  {profile.bio || 'Managing B2B invoices and payment settlements in ProofPay.'}
                </p>
              </div>
            </div>

            {/* Right: The Single Primary Edit Action */}
            <div className="shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setEditingPersonal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800"
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </section>

      {/* 3. THREE SUMMARY METRIC CARDS (Consistent dimensions, balanced hierarchy) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Business Entity */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Business Entity
              </p>
              <p className="mt-0.5 truncate text-lg font-bold text-slate-900">
                {profile.businessName || 'Not added yet'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                Primary organization
              </p>
            </div>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Invoices
              </p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">
                {prodStats.loading ? '—' : `${prodStats.totalInvoices} Invoices`}
              </p>
              <p className="text-xs text-slate-500">
                Recorded in database
              </p>
            </div>
          </div>
        </div>

        {/* Payments Received */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:border-slate-300">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80">
              <Wallet size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Payments Received
              </p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">
                {prodStats.loading ? '—' : formatCurrency(prodStats.paymentsReceived)}
              </p>
              <p className="text-xs text-slate-500">
                Lifetime settled payments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROFILE NAVIGATION TABS (Horizontal scroll on mobile, clean active indicator) */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto no-scrollbar" aria-label="Profile Tabs">
          {[
            { id: 'profile', label: 'Profile Information', icon: UserRound },
            { id: 'business', label: 'Business Details', icon: Building2 },
            { id: 'settings', label: 'Account Settings', icon: Sliders },
            { id: 'security', label: 'Security', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 py-3.5 px-3 text-sm font-semibold border-b-2 transition ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* 5. TAB PANELS */}

      {/* TAB 1: PROFILE INFORMATION */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Personal Information */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Personal Information</h3>
                    <p className="text-xs text-slate-500">Contact details and workspace identity</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingPersonal(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Edit3 size={13} />
                  Edit
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Full Name
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 text-sm">
                    {profile.fullName || 'Not added yet'}
                  </p>
                </div>

                {/* Email Address with Copy Button */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Email Address
                    </p>
                    {profile.email && (
                      <button
                        type="button"
                        onClick={() => handleCopy(profile.email, 'email')}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                        title="Copy email address"
                      >
                        {copiedKey === 'email' ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Check size={12} /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy size={12} /> Copy
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="mt-1 font-semibold text-slate-900 text-sm truncate">
                    {profile.email || '—'}
                  </p>
                </div>

                {/* Phone Number */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Phone Number
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 text-sm">
                    {profile.phone || 'Not added yet'}
                  </p>
                </div>

                {/* Account Role */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Account Role
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 text-sm">
                    {roleName}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Dedicated Profile Picture Card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Profile Photo</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Visible across invoices, payments, and receipts.
                </p>

                <div className="mt-5 flex flex-col items-center">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="h-20 w-20 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-sm">
                      {initials}
                    </div>
                  )}

                  <p className="mt-3 text-center text-xs text-slate-500">
                    PNG, JPG, or WEBP up to 5MB
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                >
                  <Upload size={13} />
                  Upload Photo
                </button>

                {profile.avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 size={13} />
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Compact Account Metadata Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Account Metadata</h3>
              <p className="text-xs text-slate-500">System credentials and verification details</p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Account Status */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Account Status
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700">Active</span>
                </div>
              </div>

              {/* Member Since */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Member Since
                </p>
                <p className="mt-1 font-semibold text-slate-900 text-sm">
                  {formatDate(profile.createdAt)}
                </p>
              </div>

              {/* Current Session */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Current Session
                </p>
                <p className="mt-1 font-semibold text-slate-900 text-sm">
                  Active Now
                </p>
              </div>

              {/* Account ID */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Account ID
                  </p>
                  {profile.id && (
                    <button
                      type="button"
                      onClick={() => handleCopy(profile.id, 'accId')}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {copiedKey === 'accId' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-800 truncate">
                  {profile.id || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS DETAILS */}
      {activeTab === 'business' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Business Details</h3>
                  <p className="text-xs text-slate-500">Commercial entity and customer-facing identity</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingBusiness(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Edit3 size={13} />
                Edit Business Details
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Business Name */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Business Legal Name
                </p>
                <p className="mt-1 font-semibold text-slate-900 text-sm">
                  {profile.businessName || 'Not configured'}
                </p>
              </div>

              {/* Business Email with Copy Button */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Business Email
                  </p>
                  {profile.businessEmail && (
                    <button
                      type="button"
                      onClick={() => handleCopy(profile.businessEmail, 'bizEmail')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {copiedKey === 'bizEmail' ? (
                        <span className="flex items-center gap-1 text-emerald-600">
                          <Check size={12} /> Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy size={12} /> Copy
                        </span>
                      )}
                    </button>
                  )}
                </div>
                <p className="mt-1 font-semibold text-slate-900 text-sm truncate">
                  {profile.businessEmail || profile.email || '—'}
                </p>
              </div>

              {/* Business Type */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Business Type
                </p>
                <p className="mt-1 font-semibold text-slate-900 text-sm">
                  {profile.businessType || 'Wholesale / Distribution'}
                </p>
              </div>

              {/* Business Address */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Business Address
                </p>
                <p className="mt-1 font-semibold text-slate-900 text-sm">
                  {profile.businessAddress || 'Not set'}
                </p>
              </div>
            </div>

            {/* Payment Integration Status */}
            <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Payment Gateway Integration</h4>
                    <p className="text-xs text-slate-600">
                      Razorpay Route connected · Ready to accept UPI, cards, and netbanking payments
                    </p>
                  </div>
                </div>

                <span className="self-start sm:self-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNT SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Workspace Preferences</h3>
              <p className="text-xs text-slate-500">Configure language, currency, and invoice notification alerts</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Default Currency
                </label>
                <select
                  aria-label="Default Currency"
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Workspace Language
                </label>
                <select
                  aria-label="Workspace Language"
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="en">English (US)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email & System Notifications
              </h4>
              <div className="space-y-2.5">
                {[
                  {
                    key: 'paymentAlerts',
                    title: 'Payment Received Alerts',
                    desc: 'Notify me when customer settles an invoice via Razorpay or manual proof',
                  },
                  {
                    key: 'overdueAlerts',
                    title: 'Overdue Invoice Reminders',
                    desc: 'Daily digest of invoices reaching due date without recorded payment',
                  },
                  {
                    key: 'proofAlerts',
                    title: 'Proof Upload Alerts',
                    desc: 'Receive alerts when delivery proof or payment screenshot is submitted',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 hover:bg-slate-50 transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences[item.key]}
                      onChange={(e) =>
                        setPreferences({ ...preferences, [item.key]: e.target.checked })
                      }
                      className="mt-1 h-4 w-4 rounded accent-blue-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => showToast('Preferences updated successfully')}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Security & Authentication</h3>
              <p className="text-xs text-slate-500">Manage credentials and login verification</p>
            </div>

            {/* Password Management */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Account Password</h4>
                  <p className="text-xs text-slate-500">
                    Keep your account secure with a strong password (minimum 8 characters)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setChangingPassword(true)}
                className="rounded-xl bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs self-start sm:self-center"
              >
                Change Password
              </button>
            </div>

            {/* Two-Factor Authentication */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Two-Factor Authentication (2FA)</h4>
                  <p className="text-xs text-slate-500">
                    Adds an extra layer of protection to your ProofPay workspace
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 self-start sm:self-center">
                Enabled
              </span>
            </div>

            {/* Active Sessions */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Login Sessions
              </h4>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Current Browser Session (macOS)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Logged in · Authenticated via JWT
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600">Active Now</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PERSONAL INFORMATION MODAL */}
      {editingPersonal && (
        <EditPersonalModal
          initialValues={{
            fullName: profile.fullName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            bio: profile.bio || '',
          }}
          isSaving={savingChanges}
          onClose={() => setEditingPersonal(false)}
          onSave={handleSavePersonal}
        />
      )}

      {/* EDIT BUSINESS DETAILS MODAL */}
      {editingBusiness && (
        <EditBusinessModal
          initialValues={{
            businessName: profile.businessName || '',
            businessEmail: profile.businessEmail || profile.email || '',
            businessType: profile.businessType || 'Wholesale / Distribution',
            businessAddress: profile.businessAddress || '',
          }}
          isSaving={savingChanges}
          onClose={() => setEditingBusiness(false)}
          onSave={handleSaveBusiness}
        />
      )}

      {/* CHANGE PASSWORD MODAL */}
      {changingPassword && (
        <ChangePasswordModal
          onClose={() => setChangingPassword(false)}
          onSuccess={() => {
            setChangingPassword(false)
            showToast('Password updated successfully')
          }}
        />
      )}
    </div>
  )
}

function EditPersonalModal({ initialValues, isSaving, onClose, onSave }) {
  const [formData, setFormData] = useState(initialValues)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.fullName.trim()) {
      setError('Full name cannot be empty.')
      return
    }
    setError('')
    onSave(formData)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl animate-in zoom-in-95"
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Personal Information</h3>
              <p className="text-xs text-slate-500">
                Changes will persist to your database account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. Ramesh Kumar"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Primary login email is verified and cannot be changed here.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Professional Description / Bio
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Brief description of your business activity..."
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs disabled:opacity-50"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditBusinessModal({ initialValues, isSaving, onClose, onSave }) {
  const [formData, setFormData] = useState(initialValues)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.businessName.trim()) {
      setError('Business name cannot be empty.')
      return
    }
    setError('')
    onSave(formData)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl animate-in zoom-in-95"
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Business Details</h3>
              <p className="text-xs text-slate-500">
                Updates your business profile in database
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Business Legal Name *</label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. Sharma Traders"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Business Contact Email</label>
            <input
              type="email"
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="contact@business.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Business Type</label>
            <select
              value={formData.businessType}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Wholesale / Distribution">Wholesale / Distribution</option>
              <option value="Retail Store">Retail Store</option>
              <option value="Manufacturing & Supply">Manufacturing & Supply</option>
              <option value="Services & Consulting">Services & Consulting</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Operating Address</label>
            <textarea
              rows={2}
              value={formData.businessAddress}
              onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Store / warehouse address..."
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs disabled:opacity-50"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ChangePasswordModal({ onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!currentPassword) {
      setError('Please enter your current password.')
      return
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    // Simulate safe API request
    setTimeout(() => {
      setLoading(false)
      onSuccess()
    }, 600)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl animate-in zoom-in-95"
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500">Update your account login credentials</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Current Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">New Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Confirm New Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Re-enter new password"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showPass ? 'Hide passwords' : 'Show passwords'}</span>
            </button>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
