import { useState } from 'react'
import { Bell, Mail, FileText, Wallet, CalendarClock, Megaphone, Save, CheckCircle2 } from 'lucide-react'

const defaults = { emailNotifications: true, invoiceDue: true, invoiceOverdue: true, paymentReceived: true, productNews: false }
const choices = [
  { name: 'emailNotifications', title: 'Email notifications', description: 'Allow ProofPay to send selected alerts by email.', icon: Mail },
  { name: 'invoiceDue', title: 'Invoice due reminders', description: 'Get a reminder when an invoice is approaching its due date.', icon: CalendarClock },
  { name: 'invoiceOverdue', title: 'Overdue invoice alerts', description: 'Highlight invoices that have passed their due date.', icon: FileText },
  { name: 'paymentReceived', title: 'Payment received', description: 'Notify you when a customer payment is recorded.', icon: Wallet },
  { name: 'productNews', title: 'Product news and tips', description: 'Receive optional announcements about new ProofPay features.', icon: Megaphone },
]

export default function NotificationsPage() {
  const [form, setForm] = useState(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem('proofpay-notification-settings') || '{}') } }
    catch { return defaults }
  })
  const [saved, setSaved] = useState(false)
  function update(event) { setForm(current => ({ ...current, [event.target.name]: event.target.checked })); setSaved(false) }
  function submit(event) { event.preventDefault(); localStorage.setItem('proofpay-notification-settings', JSON.stringify(form)); setSaved(true) }
  return (
    <section className="mx-auto w-full max-w-[1000px] space-y-6 pb-8">
      <header><p className="mb-2 text-xs font-medium text-slate-400">Workspace / Settings / Notifications</p><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">Notifications</h1><p className="mt-1.5 text-sm leading-6 text-slate-500">Choose which business events should generate alerts. No profile or security details appear here.</p></header>
      <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:px-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Bell size={20} /></span><div><h2 className="font-semibold text-slate-900">Alert preferences</h2><p className="mt-1 text-sm text-slate-500">Turn each type of notification on or off.</p></div></div>
        <div className="divide-y divide-slate-100 px-5 sm:px-6">
          {choices.map(({ name, title, description, icon: Icon }) => <label key={name} className="flex cursor-pointer items-start justify-between gap-4 py-5"><span className="flex gap-3"><span className="mt-0.5 text-slate-400"><Icon size={18} /></span><span><span className="block text-sm font-medium text-slate-800">{title}</span><span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span></span></span><input type="checkbox" name={name} checked={form[name]} onChange={update} className="mt-1 h-4 w-4 shrink-0 accent-blue-600" /></label>)}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs text-slate-400">Preferences are saved locally; email delivery is not connected in this demo.</p><button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700" type="submit">{saved ? <CheckCircle2 size={17} /> : <Save size={17} />}{saved ? 'Notifications saved' : 'Save notification settings'}</button></div>
      </form>
    </section>
  )
}
