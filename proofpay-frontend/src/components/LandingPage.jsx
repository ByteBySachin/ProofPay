import { useState } from 'react'
import {
  ArrowRight, Check, ChevronDown, CircleHelp, FileText, Menu, ShieldCheck,
  Wallet, Users, TrendingUp, Bell, Search, Plus, Download, MoreHorizontal,
  ArrowUpRight, Clock3, X, Play, Sparkles, ReceiptText, PackageCheck,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Customer accounts, made clear',
    description: 'See every customer, their invoices, payments, and outstanding balance in one easy-to-scan place.',
    tone: 'blue',
  },
  {
    icon: ReceiptText,
    title: 'Invoices without the busywork',
    description: 'Create, organize, and follow up on invoices with a workflow your whole team can understand.',
    tone: 'violet',
  },
  {
    icon: Wallet,
    title: 'Know what has been paid',
    description: 'Record full or partial payments and get a clearer picture of what is still due.',
    tone: 'green',
  },
  {
    icon: PackageCheck,
    title: 'Keep documents connected',
    description: 'Keep delivery proofs and business documents close to the customer or invoice they belong to.',
    tone: 'orange',
  },
]

const customers = [
  { initials: 'ST', name: 'Sharma Traders', sub: 'INV-2026-014', amount: '₹20,000', status: 'Partially paid', tone: 'blue' },
  { initials: 'GR', name: 'Gupta Retailers', sub: 'INV-2026-013', amount: '₹32,000', status: 'Paid', tone: 'green' },
  { initials: 'VS', name: 'Verma Stores', sub: 'INV-2026-012', amount: '₹15,000', status: 'Overdue', tone: 'red' },
]

function Brand({ light = false }) {
  return (
    <a href="#top" className={`inline-flex items-center gap-2.5 ${light ? 'text-white' : 'text-slate-950'}`} aria-label="ProofPay home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path d="M5 12.5 9.2 16.5 19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 3.5h6.5A2.5 2.5 0 0 1 21 6v12a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18V6a2.5 2.5 0 0 1 2.5-2.5H12Z" stroke="currentColor" strokeWidth="1.4" opacity=".7" />
        </svg>
      </span>
      <span className="text-[20px] font-bold tracking-tight">ProofPay</span>
    </a>
  )
}

function Button({ children, href = '#get-started', secondary = false, onClick, navigateTo, className = '' }) {
  const styles = secondary
    ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
    : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700'
  const buttonClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 ${styles} ${className}`

  if (navigateTo) {
    return (
      <button
        type="button"
        onClick={() => onClick ? onClick() : undefined}
        className={buttonClass}
      >
        {children}
      </button>
    )
  }

  return (
    <a href={href} onClick={onClick} className={buttonClass}>
      {children}
    </a>
  )
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      <div className="absolute -inset-5 rounded-[2.5rem] bg-blue-400/15 blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.4rem] border border-slate-200/90 bg-white shadow-[0_32px_100px_-35px_rgba(15,23,42,0.35)]">
        <div className="flex min-h-12 items-center justify-between border-b border-slate-100 px-4 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="hidden text-[11px] font-medium text-slate-400 sm:block">app.proofpay.in / overview</span>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live overview</span>
        </div>
        <div className="grid min-h-[365px] grid-cols-[62px_1fr] sm:grid-cols-[154px_1fr]">
          <aside className="border-r border-slate-100 bg-slate-50/80 p-2.5 sm:p-3.5">
            <div className="mb-5 hidden items-center gap-2 sm:flex"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white"><Check size={15} /></span><span className="text-xs font-bold text-slate-800">ProofPay</span></div>
            <div className="space-y-1">
              {[['Overview', TrendingUp], ['Customers', Users], ['Invoices', FileText], ['Payments', Wallet], ['Documents', ShieldCheck]].map(([label, Icon], i) => (
                <div key={label} className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-[11px] font-medium sm:justify-start ${i === 0 ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}>
                  <Icon size={15} /><span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 hidden rounded-xl border border-blue-100 bg-white p-3 sm:block">
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Sparkles size={15} /></div>
              <p className="text-[10px] font-semibold text-slate-700">Less chasing.</p>
              <p className="mt-1 text-[9px] leading-4 text-slate-400">More clarity for every payment.</p>
            </div>
          </aside>
          <div className="min-w-0 p-3 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><p className="text-[10px] text-slate-400 sm:text-xs">Tuesday, 20 October 2026</p><h3 className="mt-1 text-sm font-bold text-slate-900 sm:text-lg">Good morning</h3><p className="mt-1 text-[10px] text-slate-500 sm:text-xs">Here is your business at a glance.</p></div>
              <button className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-2 text-[10px] font-semibold text-white sm:px-3 sm:text-xs"><Plus size={13} /> New invoice</button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
              {[['Total invoiced', '₹5.0L', 'All invoices'], ['Collected', '₹3.2L', '+12.8%'], ['Outstanding', '₹1.8L', '8 invoices']].map(([label, value, sub], i) => (
                <div key={label} className="rounded-xl border border-slate-100 p-2.5 sm:p-3.5">
                  <p className="text-[9px] leading-3 text-slate-500 sm:text-[11px]">{label}</p>
                  <p className="mt-2 text-sm font-bold tracking-tight text-slate-900 sm:text-xl">{value}</p>
                  <p className={`mt-1 hidden text-[9px] sm:block ${i === 1 ? 'text-emerald-600' : 'text-slate-400'}`}>{sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-slate-100 sm:mt-5">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3 sm:px-4"><div><p className="text-[11px] font-bold text-slate-800 sm:text-xs">Recent invoices</p><p className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">Keep track of the latest activity</p></div><span className="text-[9px] font-semibold text-blue-600 sm:text-[10px]">View all <ArrowUpRight size={11} className="inline" /></span></div>
              <div className="px-2 sm:px-3">
                {customers.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 border-b border-slate-50 py-3 last:border-0 sm:gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold sm:h-8 sm:w-8 ${c.tone === 'blue' ? 'bg-blue-50 text-blue-700' : c.tone === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{c.initials}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-slate-800 sm:text-xs">{c.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{c.sub}</p></div>
                    <div className="text-right"><p className="text-[10px] font-semibold text-slate-800 sm:text-xs">{c.amount}</p><span className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold sm:text-[10px] ${c.tone === 'blue' ? 'bg-blue-50 text-blue-700' : c.tone === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{c.status}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50/80 px-3 py-2.5"><Bell size={13} className="shrink-0 text-blue-600" /><p className="text-[9px] leading-4 text-blue-800 sm:text-[10px]">3 invoices need your attention this week.</p><ArrowRight size={12} className="ml-auto shrink-0 text-blue-600" /></div>
          </div>
        </div>
      </div>
      <div className="absolute -right-2 top-[22%] hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-xl sm:block sm:-right-7">
        <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Check size={16} /></span><div><p className="text-[10px] font-semibold text-slate-800">Payment recorded</p><p className="mt-0.5 text-[9px] text-slate-400">Sharma Traders · just now</p></div></div>
      </div>
      <div className="absolute -bottom-5 -left-2 hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-xl sm:block sm:-left-7">
        <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Clock3 size={16} /></span><div><p className="text-[10px] font-semibold text-slate-800">Outstanding balance</p><p className="mt-0.5 text-sm font-bold text-slate-900">₹1,80,000</p></div></div>
      </div>
    </div>
  )
}

export default function LandingPage({ onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
  }

  return (
    <div id="top" className="min-h-screen overflow-hidden bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <div className="bg-[#0b1630] px-4 py-2.5 text-center text-xs font-medium text-blue-100 sm:text-sm">
        Built for the way growing businesses work. <a href="#features" className="ml-1 inline-flex items-center gap-1 font-semibold text-white underline decoration-blue-400 underline-offset-4">Meet ProofPay <ArrowRight size={13} /></a>
      </div>
      <nav className="relative z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Brand />
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600">How it works</a>
            <a href="#why-proofpay" className="text-sm font-medium text-slate-600 hover:text-blue-600">Why ProofPay</a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button type="button" onClick={() => onNavigate?.('Login')} className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600">Sign in</button>
            <Button navigateTo="Signup" onClick={() => onNavigate?.('Signup')} className="min-h-10 px-4 py-2.5">Get started <ArrowRight size={16} /></Button>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden" onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {mobileOpen && <div className="border-t border-slate-100 bg-white px-5 py-4 md:hidden"><div className="flex flex-col gap-4"><a onClick={() => setMobileOpen(false)} href="#features" className="text-sm font-medium text-slate-700">Features</a><a onClick={() => setMobileOpen(false)} href="#how-it-works" className="text-sm font-medium text-slate-700">How it works</a><a onClick={() => setMobileOpen(false)} href="#why-proofpay" className="text-sm font-medium text-slate-700">Why ProofPay</a><button type="button" onClick={() => { setMobileOpen(false); onNavigate?.('Login') }} className="text-left text-sm font-semibold text-slate-700">Sign in</button><Button navigateTo="Signup" onClick={() => { setMobileOpen(false); onNavigate?.('Signup') }}>Get started <ArrowRight size={16} /></Button></div></div>}
      </nav>

      <main>
        <section className="relative isolate">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_30%,rgba(219,234,254,0.7),transparent_42%),linear-gradient(to_bottom,#fff,#f8fbff)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:pb-28 lg:pt-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-sm"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white"><Sparkles size={11} /></span> A clearer way to run your business</div>
              <h1 className="mt-7 text-[2.75rem] font-semibold leading-[1.08] tracking-[-0.055em] text-[#0b1630] sm:text-6xl lg:text-[4.1rem]">Know what’s owed.<br /><span className="text-blue-600">Know what’s next.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Invoices, customer balances, payments, and business documents—connected in one calm, clear workspace built for growing businesses.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button navigateTo="Signup" onClick={() => onNavigate?.('Signup')} className="min-h-12 px-6">Start with ProofPay <ArrowRight size={17} /></Button>
                <Button href="#how-it-works" secondary className="min-h-12 px-6"><Play size={15} className="fill-current" /> See how it works</Button>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 sm:text-sm"><span className="inline-flex items-center gap-1.5"><Check size={15} className="text-emerald-600" /> Easy to get started</span><span className="inline-flex items-center gap-1.5"><Check size={15} className="text-emerald-600" /> Built for everyday workflows</span></div>
              <div className="mt-10 flex items-center gap-4 border-t border-slate-200/80 pt-6">
                <div className="flex -space-x-2">{['bg-blue-200 text-blue-800','bg-violet-200 text-violet-800','bg-emerald-200 text-emerald-800','bg-amber-200 text-amber-800'].map((c,i)=><span key={i} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold ${c}`}>{['RK','AS','MP','SJ'][i]}</span>)}</div>
                <p className="text-xs leading-5 text-slate-500 sm:text-sm"><span className="font-semibold text-slate-800">Made for business owners</span><br />who want fewer loose ends.</p>
              </div>
            </div>
            <div className="px-1 py-4 sm:px-4 lg:py-8"><DashboardPreview /></div>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-7 sm:px-8 md:grid-cols-4">
            {[['01','Customer clarity'],['02','Invoice tracking'],['03','Payment visibility'],['04','Connected documents']].map(([n,label])=><div key={n} className="flex items-center gap-3"><span className="text-xs font-bold text-blue-600">{n}</span><span className="text-xs font-semibold text-slate-600 sm:text-sm">{label}</span></div>)}
          </div>
        </section>

        <section id="features" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">One connected workspace</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0b1630] sm:text-5xl">The details that keep business moving.</h2>
              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">Spend less time piecing together records and more time knowing where things stand.</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description, tone }, i) => <article key={title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone === 'blue' ? 'bg-blue-50 text-blue-600' : tone === 'violet' ? 'bg-violet-50 text-violet-600' : tone === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}><Icon size={22} /></div>
                <p className="mt-6 text-xs font-bold text-slate-300">0{i+1}</p>
                <h3 className="mt-2 text-lg font-semibold leading-6 text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
              </article>)}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 bg-[#0b1630] px-5 py-20 text-white sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">A workflow that makes sense</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">From sale to settled.<br /><span className="text-blue-300">Stay in the loop.</span></h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">Keep the important steps connected so your team can see what happened, what is due, and what needs attention next.</p>
              <Button navigateTo="Signup" onClick={() => onNavigate?.('Signup')} className="mt-8 bg-white text-[#0b1630] shadow-none hover:bg-blue-50">Explore ProofPay <ArrowRight size={16} /></Button>
            </div>
            <div className="space-y-3">
              {[
                ['01','Add a customer','Keep customer details and their business activity together.'],
                ['02','Create and track an invoice','See amounts, due dates, and payment status at a glance.'],
                ['03','Record payments and attach proof','Keep payment history and supporting documents easy to find.'],
                ['04','Follow up with confidence','Use a clear outstanding view to decide what needs attention.'],
              ].map(([n,title,desc],i)=><div key={n} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.07] sm:p-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-300/20 bg-blue-400/10 text-sm font-bold text-blue-200">{n}</span><div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-400">{desc}</p></div><Check size={18} className="ml-auto mt-1 hidden shrink-0 text-emerald-300 sm:block" /></div>)}
            </div>
          </div>
        </section>

        <section id="why-proofpay" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 p-6 sm:p-10">
              <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-blue-200/40 blur-3xl" />
              <div className="relative rounded-2xl border border-white bg-white p-5 shadow-xl shadow-blue-900/5 sm:p-6">
                <div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Outstanding overview</p><p className="mt-2 text-3xl font-bold tracking-tight text-[#0b1630]">₹1,80,000</p></div><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Wallet size={21} /></span></div>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[64%] rounded-full bg-blue-600" /></div>
                <div className="mt-3 flex justify-between text-xs text-slate-500"><span>₹3,20,000 collected</span><span>64% of total</span></div>
                <div className="mt-6 space-y-3">
                  {[['Paid invoices','24','text-emerald-600'],['Awaiting payment','8','text-blue-600'],['Overdue','3','text-rose-600']].map(([label,value,color])=><div key={label} className="flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-sm text-slate-600">{label}</span><span className={`text-sm font-bold ${color}`}>{value}</span></div>)}
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Clarity over clutter</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0b1630] sm:text-5xl">A business view that feels like yours.</h2>
              <p className="mt-5 text-base leading-7 text-slate-600">ProofPay is designed around the everyday questions business owners ask: who owes me, what has arrived, and which document do I need?</p>
              <ul className="mt-7 space-y-4">
                {['One view of customer balances and invoice status','A simple record of full and partial payments','Documents connected to the work they support','A focused workspace for your next follow-up'].map(item=><li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={13} /></span>{item}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section id="get-started" className="scroll-mt-20 px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-700 to-indigo-800 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10"><Sparkles size={23} /></div>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">Make the next business decision with clarity.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base sm:leading-7">Bring customer records, invoices, payments, and documents into one place.</p>
            <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-lg flex-col gap-3 rounded-2xl bg-white p-2 sm:flex-row">
              <label className="flex min-h-11 flex-1 items-center px-3"><span className="sr-only">Work email</span><input type="email" required value={email} onChange={e => { setEmail(e.target.value); setSubmitted(false) }} placeholder="Enter your work email" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" /></label>
              <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b1630] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Get early access <ArrowRight size={16} /></button>
            </form>
            {submitted && <p role="status" className="mt-4 text-sm font-medium text-white">Thanks! Your email has been entered for this demo. No signup request was sent.</p>}
            <p className="mt-4 text-xs text-blue-100/80">Demo landing page · Email submission is not connected to a backend.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><Brand /><p className="mt-3 text-[13px] text-slate-500">A clearer way to manage the money and records behind your business.</p></div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[13px] font-medium text-slate-500"><a href="#features" className="hover:text-blue-600">Features</a><a href="#how-it-works" className="hover:text-blue-600">How it works</a><a href="#get-started" className="hover:text-blue-600">Get started</a><a href="mailto:hello@proofpay.example" className="hover:text-blue-600">Contact</a></div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} ProofPay. Demo concept.</p>
        </div>
      </footer>
    </div>
  )
}
