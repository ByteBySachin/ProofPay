import { UserRound, Settings2, Bell, ChevronRight } from 'lucide-react'

const items = [
  { title: 'Profile Settings', description: 'Update your name, email address, and contact details.', page: 'Profile Settings', icon: UserRound, color: 'bg-blue-50 text-blue-600' },
  { title: 'General Settings', description: 'Choose language, time zone, date format, and appearance.', page: 'General Settings', icon: Settings2, color: 'bg-violet-50 text-violet-600' },
  { title: 'Notifications', description: 'Control invoice alerts, payment updates, and email notifications.', page: 'Notifications', icon: Bell, color: 'bg-amber-50 text-amber-600' },
]

export default function SettingsPage({ onNavigate }) {
  return (
    <section className="mx-auto w-full max-w-[1000px] space-y-6 pb-8">
      <header>
        <p className="mb-2 text-xs font-medium text-slate-400">Workspace / Settings</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">Settings</h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">Choose what you want to configure in your ProofPay workspace.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(({ title, description, page, icon: Icon, color }) => (
          <button key={page} type="button" onClick={() => onNavigate(page)} className="group flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon size={21} /></span>
            <span className="mt-5 flex w-full items-center justify-between gap-2 font-semibold text-slate-900">{title}<ChevronRight size={18} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" /></span>
            <span className="mt-2 text-sm leading-6 text-slate-500">{description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
