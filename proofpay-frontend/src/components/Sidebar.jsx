import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  FolderOpen,
  Settings,
  LogOut,
  X,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import { useProfile } from '../context/ProfileContext'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Customers', icon: Users },
  { label: 'Invoices', icon: FileText },
  { label: 'Payments', icon: Wallet },
  { label: 'Documents', icon: FolderOpen },
]

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

export default function Sidebar({ activePage, onNavigate }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const { profile } = useProfile()
  const userName = profile.fullName || 'User'
  const initials = getInitials(userName)
  const roleName = profile.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : 'Owner'

  const handleNavigate = (page) => {
    onNavigate(page)
  }

  const handleLogout = () => {
    localStorage.removeItem('proofpay_token')
    localStorage.removeItem('proofpay_user')
    localStorage.removeItem('proofpay-profile')
    localStorage.removeItem('proofpay-preferences')
    setShowLogoutModal(false)
    onNavigate('Landing')
  }

  const isProfileActive =
    activePage === 'View Profile' || activePage === 'Profile'

  return (
    <>
      <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-slate-950 p-5 text-white border-r border-slate-800 shadow-2xl">
        {/* ProofPay Brand Logo */}
        <button
          type="button"
          onClick={() => handleNavigate('Dashboard')}
          className="mb-8 self-start text-left focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-600/30">
              P
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Proof<span className="text-blue-400">Pay</span>
            </span>
          </div>
        </button>

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </p>

        {/* Core Navigation Items */}
        <nav className="flex-1 space-y-1.5">
          {navigation.map(({ label, icon: Icon }) => {
            const isActive = activePage === label

            return (
              <button
                key={label}
                type="button"
                onClick={() => handleNavigate(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 font-medium text-white shadow-lg shadow-blue-950/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={19} />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom Section: Profile, Profile Settings, Settings, and Logout */}
        <div className="mt-auto border-t border-slate-800 pt-5 space-y-2">
          {/* User Profile Card */}
          <button
            type="button"
            onClick={() => handleNavigate('View Profile')}
            className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isProfileActive
                ? 'bg-slate-800 text-white ring-1 ring-blue-500/50'
                : 'bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={userName}
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-blue-500/30"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {userName}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-400">
                {profile.businessName ? `${roleName} · ${profile.businessName}` : roleName}
              </p>
            </div>

            <ChevronRight size={16} className="text-slate-500 shrink-0" />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => handleNavigate('Settings')}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              activePage === 'Settings'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogoutModal(false)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={24} />
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                aria-label="Close logout confirmation"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <h2 id="logout-title" className="mt-5 text-lg font-semibold">
              Log out of ProofPay?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to log out? Your business workspace and recorded transactions
              will remain securely stored.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-red-700"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
