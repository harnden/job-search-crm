import { useCallback, useEffect, useMemo, useState } from 'react'
import { createApplication, createCompany, deleteApplication, fetchApplications, fetchCompanies, updateStatus } from './api'
import type { Application, Company, Status } from './types'
import { STATUSES } from './types'

type View = 'Pipeline' | 'Companies & Contacts' | 'Activity Log'
const icons = { pipeline: '⌘', companies: '◫', activity: '↗', plus: '+', search: '⌕', close: '×', arrow: '↗' }

const sample: Application[] = [
  { id: 'sample-1', title: 'Staff Product Designer', company: { id: 's1', name: 'Linear' }, discoveredDate: '2026-10-10', appliedDate: '2026-10-22', salaryTarget: 185000, status: 'Applied', lastContactDate: '2026-10-24', location: 'Remote' },
  { id: 'sample-2', title: 'Director of Product', company: { id: 's2', name: 'Arc' }, discoveredDate: '2026-10-04', appliedDate: '2026-10-18', salaryTarget: 210000, status: 'Screening', lastContactDate: '2026-10-23', location: 'New York, NY' },
  { id: 'sample-3', title: 'Head of Design', company: { id: 's3', name: 'Vercel' }, discoveredDate: '2026-09-28', appliedDate: '2026-10-12', salaryTarget: 225000, status: 'Technical', lastContactDate: '2026-10-19', location: 'Remote' },
  { id: 'sample-4', title: 'Product Lead', company: { id: 's4', name: 'Notion' }, discoveredDate: '2026-09-18', appliedDate: '2026-09-28', salaryTarget: 195000, status: 'Offer', lastContactDate: '2026-10-21', location: 'San Francisco, CA' },
  { id: 'sample-5', title: 'Senior Product Manager', company: { id: 's5', name: 'Figma' }, discoveredDate: '2026-10-24', salaryTarget: 175000, status: 'Identified', location: 'San Francisco, CA' },
  { id: 'sample-6', title: 'Design Systems Lead', company: { id: 's6', name: 'Dropbox' }, discoveredDate: '2026-08-29', appliedDate: '2026-09-11', salaryTarget: 168000, status: 'Ghosted', lastContactDate: '2026-09-26', location: 'Remote' },
]

function initials(name: string) { return name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() }
function formatSalary(value: Application['salaryTarget']) { const number = Number(value); return Number.isFinite(number) && number ? `$${Math.round(number / 1000)}k` : '—' }
function daysSince(date?: string | null) { if (!date) return null; const then = new Date(date).getTime(); if (Number.isNaN(then)) return null; return Math.max(0, Math.floor((Date.now() - then) / 86400000)) }
function formatDate(date?: string | null) { if (!date) return 'Not applied'; const parsed = new Date(date); return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }

export default function App() {
  const [view, setView] = useState<View>('Pipeline')
  const [applications, setApplications] = useState<Application[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [serverError, setServerError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { const [apps, orgs] = await Promise.all([fetchApplications(), fetchCompanies()]); setApplications(apps); setCompanies(orgs); setServerError(false) }
    catch { setApplications(sample); setCompanies(sample.map(app => app.company)); setServerError(true) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(''), 2800); return () => window.clearTimeout(timeout) }, [toast])

  async function changeStatus(id: string | number, status: Status) {
    const previous = applications.find(app => app.id === id)
    const appliedDate = previous?.status === 'Identified' && status !== 'Identified' && !previous.appliedDate ? new Date().toISOString() : previous?.appliedDate || undefined
    setApplications(current => current.map(app => app.id === id ? { ...app, status, ...(appliedDate ? { appliedDate } : {}) } : app))
    try { await updateStatus(id, status, appliedDate); setToast('Application moved') } catch { setApplications(current => current.map(app => app.id === id ? { ...app, status: previous?.status || 'Identified', appliedDate: previous?.appliedDate } : app)); setToast('Could not update — is the API running?') }
  }
  async function addApplication(payload: Record<string, unknown>) {
    try { const created = await createApplication(payload); setApplications(current => [...current, created]); setShowModal(false); setToast('Application added') }
    catch { setToast('Could not save — is the API running?') }
  }
  async function removeApplication(id: string | number) {
    const application = applications.find(app => app.id === id)
    if (!application || !window.confirm(`Delete ${application.title} at ${application.company.name}?`)) return

    const index = applications.findIndex(app => app.id === id)
    setApplications(current => current.filter(app => app.id !== id))
    try {
      await deleteApplication(id)
      setToast('Application deleted')
    } catch {
      setApplications(current => {
        if (current.some(app => app.id === id)) return current
        const restored = [...current]
        restored.splice(Math.min(index, restored.length), 0, application)
        return restored
      })
      setToast('Could not delete — is the API running?')
    }
  }

  const visible = applications.filter(app => `${app.title} ${app.company.name}`.toLowerCase().includes(search.toLowerCase()))
  return <div className="min-h-screen grain text-ink">
    <header className="border-b border-line/80 bg-parchment/90 px-5 backdrop-blur-md md:px-10">
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between gap-8">
        <button className="flex items-center gap-3" onClick={() => setView('Pipeline')} aria-label="Go to pipeline">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-sage text-lg font-bold text-white shadow-sm">N</span>
          <span className="font-display text-[17px] font-bold tracking-[-.03em]">northstar<span className="text-sage">.</span></span>
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          {([['Pipeline', icons.pipeline], ['Companies & Contacts', icons.companies], ['Activity Log', icons.activity]] as [View, string][]).map(([label, icon]) => <button key={label} onClick={() => setView(label)} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition ${view === label ? 'bg-[#e8ece6] text-sage' : 'text-[#6b756e] hover:bg-[#edf0eb] hover:text-ink'}`}><span className="text-[17px] leading-none opacity-80">{icon}</span>{label}</button>)}
        </nav>
        <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><div className="text-[13px] font-semibold">Joshua Harnden</div><div className="font-mono text-[10px] uppercase tracking-[.12em] text-[#8c958e]">Candidate workspace</div></div><div className="grid h-9 w-9 place-items-center rounded-full bg-[#dbe7dd] text-xs font-bold text-sage">JH</div></div>
      </div>
      <div className="mx-auto flex max-w-[1600px] gap-1 overflow-auto pb-3 md:hidden">{(['Pipeline', 'Companies & Contacts', 'Activity Log'] as View[]).map(label => <button key={label} onClick={() => setView(label)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs ${view === label ? 'bg-[#e8ece6] text-sage' : 'text-[#6b756e]'}`}>{label}</button>)}</div>
    </header>
    <main className="mx-auto max-w-[1600px] px-5 py-9 md:px-10 md:py-12">
      {view === 'Pipeline' && <Pipeline applications={visible} allCount={applications.length} loading={loading} search={search} onSearch={setSearch} onAdd={() => setShowModal(true)} onStatus={changeStatus} onDelete={removeApplication} serverError={serverError} />}
      {view === 'Companies & Contacts' && <Companies companies={companies} applications={applications} onAdd={() => setShowModal(true)} />}
      {view === 'Activity Log' && <Activity applications={applications} />}
    </main>
    {showModal && <AddModal companies={companies} onClose={() => setShowModal(false)} onCreateCompany={async payload => { const company = await createCompany(payload); setCompanies(current => [...current, company]); return company }} onSubmit={addApplication} />}
    {toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-xs font-medium text-white shadow-xl">{toast}</div>}
  </div>
}

function Pipeline({ applications, allCount, loading, search, onSearch, onAdd, onStatus, onDelete, serverError }: { applications: Application[]; allCount: number; loading: boolean; search: string; onSearch: (s: string) => void; onAdd: () => void; onStatus: (id: string | number, status: Status) => void; onDelete: (id: string | number) => void; serverError: boolean }) {
  return <>
    <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-sage"><span className="h-1.5 w-1.5 rounded-full bg-[#df9962]" /> October 2026 · Week 43</div><h1 className="font-display text-4xl font-bold tracking-[-.055em] md:text-[48px]">Your pipeline<span className="text-sage">.</span></h1><p className="mt-3 max-w-[480px] text-sm leading-6 text-[#7a837c]">A clear view of every opportunity, from first signal to signed offer.</p></div><div className="flex items-center gap-3"><label className="flex h-11 w-full min-w-0 items-center gap-2 rounded-lg border border-line bg-white/60 px-3 text-[#8d958f] shadow-sm sm:w-52"><span className="text-xl leading-none">{icons.search}</span><input value={search} onChange={e => onSearch(e.target.value)} className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-[#9ca49d]" placeholder="Search pipeline" /></label><button onClick={onAdd} className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-sage px-4 text-xs font-semibold text-white shadow-[0_3px_0_#345144] transition hover:bg-[#3e5a4e] active:translate-y-px active:shadow-none"><span className="text-lg leading-none">{icons.plus}</span> Add application</button></div></div>
    {serverError && <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-[#ead9c6] bg-[#fffaf2] px-4 py-3 text-xs text-[#866a48]"><span><strong>Demo data:</strong> the API is unavailable, so you’re viewing sample opportunities.</span><button onClick={() => window.location.reload()} className="font-semibold underline">Retry</button></div>}
    <div className="mb-6 flex items-center justify-between"><div className="flex items-baseline gap-3"><span className="font-display text-lg font-bold">Active opportunities</span><span className="rounded-full bg-[#e8ece6] px-2 py-1 font-mono text-[10px] text-sage">{allCount} total</span></div><span className="hidden font-mono text-[10px] uppercase tracking-[.13em] text-[#a0a8a1] sm:block">Drag-free by design · update status on card</span></div>
    <div className="scrollbar flex gap-4 overflow-x-auto pb-6">{STATUSES.map(status => <Column key={status} status={status} applications={applications.filter(app => app.status === status)} loading={loading} onStatus={onStatus} onDelete={onDelete} />)}</div>
  </>
}

function Column({ status, applications, loading, onStatus, onDelete }: { status: Status; applications: Application[]; loading: boolean; onStatus: (id: string | number, status: Status) => void; onDelete: (id: string | number) => void }) {
  const countClass: Record<Status, string> = { Identified: 'bg-[#eceeea] text-[#778079]', Applied: 'bg-[#dfeae3] text-sage', Screening: 'bg-[#f3e8d7] text-[#a57445]', Technical: 'bg-[#e8e1ee] text-[#755e84]', Offer: 'bg-[#dcebe2] text-[#3e7655]', Rejected: 'bg-[#eee4e2] text-[#98706a]', Ghosted: 'bg-[#e9e9e6] text-[#888d87]' }
  return <section className="w-[278px] shrink-0"><div className="mb-3 flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className="text-[13px] font-semibold">{status}</span><span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${countClass[status]}`}>{applications.length}</span></div><span className="text-[#b0b5b0]">•••</span></div><div className="min-h-[290px] rounded-xl border border-dashed border-[#d5dbd4] bg-[#f1f2ed]/60 p-2">{loading ? <div className="space-y-2 p-1"><div className="h-36 animate-pulse rounded-lg bg-[#e7eae5]" /><div className="h-36 animate-pulse rounded-lg bg-[#e7eae5]" /></div> : applications.length ? applications.map(app => <ApplicationCard key={app.id} application={app} onStatus={onStatus} onDelete={onDelete} />) : <div className="grid min-h-[270px] place-items-center text-center"><div><div className="mx-auto mb-2 text-lg text-[#bcc4bc]">○</div><p className="text-[11px] text-[#a2aba3]">No opportunities here</p></div></div>}</div></section>
}

function ApplicationCard({ application, onStatus, onDelete }: { application: Application; onStatus: (id: string | number, status: Status) => void; onDelete: (id: string | number) => void }) {
  const since = daysSince(application.lastContactDate || application.appliedDate || application.discoveredDate)
  const dateLabel = application.status === 'Identified' ? 'Found' : 'Applied'
  const displayDate = application.status === 'Identified' ? application.discoveredDate : application.appliedDate
  return <article className="group mb-2 rounded-lg border border-[#e0e4de] bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-[#c5d3c7]"><div className="mb-4 flex items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-2.5"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#e8eee9] font-display text-[11px] font-bold text-sage">{initials(application.company.name)}</div><div className="min-w-0"><h3 className="truncate text-[13px] font-semibold leading-5">{application.title}</h3><p className="truncate text-[11px] text-[#7e8780]">{application.company.name}</p></div></div><div className="flex shrink-0 items-center gap-1"><button type="button" onClick={event => { event.stopPropagation(); onDelete(application.id) }} className="grid h-7 w-7 place-items-center rounded text-[#b6bdb7] opacity-0 transition hover:bg-[#f7eeeb] hover:text-[#9c655d] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c58b80] group-hover:opacity-100" aria-label={`Delete ${application.title}`} title="Delete application"><svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2.75 4.25h10.5M6 4.25V2.75h4v1.5m1.75 0-.55 8.25H4.8l-.55-8.25M6.5 6.5v4M9.5 6.5v4" /></svg></button><button className="text-[#b6bdb7] opacity-0 transition hover:text-ink group-hover:opacity-100" aria-label="Open application">{icons.arrow}</button></div></div><div className="grid grid-cols-2 gap-3 border-t border-[#eef0ec] pt-3"><div><div className="mb-1 font-mono text-[9px] uppercase tracking-[.1em] text-[#a4aca5]">{dateLabel}</div><div className="text-[11px] font-medium text-[#58625b]">{formatDate(displayDate)}</div></div><div><div className="mb-1 font-mono text-[9px] uppercase tracking-[.1em] text-[#a4aca5]">Target</div><div className="text-[11px] font-medium text-[#58625b]">{formatSalary(application.salaryTarget)}</div></div></div><div className="mt-3 flex items-center justify-between gap-2"><span className="font-mono text-[10px] text-[#9aa39b]">{since === null ? 'No contact logged' : `${since}d since contact`}</span><select aria-label={`Change status for ${application.title}`} value={application.status} onChange={e => onStatus(application.id, e.target.value as Status)} className="max-w-[105px] cursor-pointer rounded border-0 bg-[#f0f3ee] py-1 pl-2 pr-1 text-[10px] font-semibold text-sage outline-none focus:ring-2 focus:ring-sage/30">{STATUSES.map(status => <option key={status}>{status}</option>)}</select></div></article>
}

function Companies({ companies, applications, onAdd }: { companies: Company[]; applications: Application[]; onAdd: () => void }) { return <><div className="mb-10 flex items-end justify-between gap-4"><div><div className="mb-3 font-mono text-[10px] uppercase tracking-[.18em] text-sage">Relationship map</div><h1 className="font-display text-4xl font-bold tracking-[-.055em]">Companies & contacts<span className="text-sage">.</span></h1><p className="mt-3 text-sm text-[#7a837c]">The people and teams behind your opportunities.</p></div><button onClick={onAdd} className="flex h-11 items-center gap-2 rounded-lg bg-sage px-4 text-xs font-semibold text-white shadow-[0_3px_0_#345144]"><span className="text-lg">+</span> Add company</button></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{companies.map(company => <div key={company.id} className="rounded-xl border border-line bg-white p-5 shadow-card"><div className="mb-8 flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-lg bg-[#e8eee9] font-display font-bold text-sage">{initials(company.name)}</div><span className="font-mono text-[10px] text-[#a1aaa2]">{applications.filter(app => String(app.company.id) === String(company.id) || app.company.name === company.name).length} roles</span></div><h2 className="font-display text-base font-bold">{company.name}</h2><p className="mt-1 text-xs text-[#89928b]">{company.industry || company.location || 'Company'}</p></div>)}</div>{!companies.length && <EmptyState title="No companies yet" detail="Add an application to start building your network." />}</> }
function Activity({ applications }: { applications: Application[] }) { const events = applications.filter(app => app.lastContactDate || app.appliedDate || app.discoveredDate).sort((a, b) => new Date(b.lastContactDate || b.appliedDate || b.discoveredDate || 0).getTime() - new Date(a.lastContactDate || a.appliedDate || a.discoveredDate || 0).getTime()); return <><div className="mb-10"><div className="mb-3 font-mono text-[10px] uppercase tracking-[.18em] text-sage">A running record</div><h1 className="font-display text-4xl font-bold tracking-[-.055em]">Activity log<span className="text-sage">.</span></h1><p className="mt-3 text-sm text-[#7a837c]">A quiet record of momentum across the search.</p></div><div className="max-w-3xl divide-y divide-line rounded-xl border border-line bg-white px-5 shadow-card">{events.map(app => <div key={app.id} className="flex items-center gap-4 py-5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8eee9] font-display text-xs font-bold text-sage">{initials(app.company.name)}</div><div className="min-w-0 flex-1"><p className="text-sm"><strong>{app.company.name}</strong> · {app.title}</p><p className="mt-1 text-xs text-[#89928b]">{app.lastContactDate ? 'Last contact logged' : app.status === 'Identified' ? 'Discovered' : 'Application added'} · {formatDate(app.lastContactDate || app.appliedDate || app.discoveredDate)}</p></div><span className="rounded-full bg-[#edf2ed] px-2.5 py-1 text-[10px] font-semibold text-sage">{app.status}</span></div>)}</div>{!events.length && <EmptyState title="Nothing logged yet" detail="Your next update will show up here." />}</> }
function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="rounded-xl border border-dashed border-[#cfd7cf] p-12 text-center"><div className="mb-2 text-2xl text-[#b7c2b8]">⌁</div><h2 className="font-display font-bold">{title}</h2><p className="mt-1 text-sm text-[#89928b]">{detail}</p></div> }

function AddModal({ companies, onClose, onCreateCompany, onSubmit }: { companies: Company[]; onClose: () => void; onCreateCompany: (payload: Record<string, unknown>) => Promise<Company>; onSubmit: (payload: Record<string, unknown>) => Promise<void> }) {
  const [newCompany, setNewCompany] = useState(false); const [saving, setSaving] = useState(false); const [form, setForm] = useState({ title: '', companyId: '', companyName: '', discoveredDate: new Date().toISOString().slice(0, 10), appliedDate: '', salaryTarget: '', status: 'Identified' as Status, location: '' })
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }))
  async function submit(event: React.FormEvent) { event.preventDefault(); setSaving(true); try { let companyId = form.companyId; if (newCompany) { const company = await onCreateCompany({ name: form.companyName }); companyId = String(company.id) } const payload: Record<string, unknown> = { title: form.title, jobTitle: form.title, companyId, companyName: form.companyName, discoveredDate: form.discoveredDate, salaryTarget: form.salaryTarget ? Number(form.salaryTarget) : null, status: form.status, location: form.location }; if (form.appliedDate) payload.appliedDate = form.appliedDate; await onSubmit(payload) } finally { setSaving(false) } }
  function handleStatusChange(status: Status) { update('status', status); update('appliedDate', status === 'Identified' ? '' : form.appliedDate || new Date().toISOString().slice(0, 10)) }
  return <div className="fixed inset-0 z-40 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="add-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/60 bg-parchment p-6 shadow-2xl md:p-8"><div className="mb-7 flex items-start justify-between"><div><div className="mb-2 font-mono text-[10px] uppercase tracking-[.18em] text-sage">New opportunity</div><h2 id="add-title" className="font-display text-2xl font-bold tracking-[-.04em]">Add application<span className="text-sage">.</span></h2></div><button onClick={onClose} className="text-2xl leading-none text-[#8b958d] hover:text-ink" aria-label="Close">×</button></div><form onSubmit={submit} className="space-y-5"><Field label="Job title" required><input required value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Senior Product Manager" className="field" /></Field><Field label="Company" required><div className="mb-2 flex gap-2"><button type="button" onClick={() => setNewCompany(false)} className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${!newCompany ? 'bg-[#dfeae3] text-sage' : 'text-[#89928b]'}`}>Existing company</button><button type="button" onClick={() => setNewCompany(true)} className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${newCompany ? 'bg-[#dfeae3] text-sage' : 'text-[#89928b]'}`}>Create new</button></div>{newCompany ? <input required value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Company name" className="field" /> : <select required value={form.companyId} onChange={e => { update('companyId', e.target.value); const company = companies.find(item => String(item.id) === e.target.value); update('companyName', company?.name || '') }} className="field"><option value="">Choose a company…</option>{companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select>}</Field><div className="grid gap-5 sm:grid-cols-2"><Field label="Status"><select value={form.status} onChange={e => handleStatusChange(e.target.value as Status)} className="field">{STATUSES.map(status => <option key={status}>{status}</option>)}</select></Field><Field label="Date discovered" required><input required type="date" value={form.discoveredDate} onChange={e => update('discoveredDate', e.target.value)} className="field" /></Field></div>{form.status !== 'Identified' && <Field label="Applied date"><input type="date" value={form.appliedDate} onChange={e => update('appliedDate', e.target.value)} className="field" /><span className="mt-1 block text-[10px] text-[#9aa39b]">Optional — defaults to today.</span></Field>}<div className="grid gap-5 sm:grid-cols-2"><Field label="Salary target"><div className="relative"><span className="absolute left-3 top-2.5 text-sm text-[#8d978f]">$</span><input type="number" min="0" value={form.salaryTarget} onChange={e => update('salaryTarget', e.target.value)} placeholder="180000" className="field pl-7" /></div></Field><Field label="Location"><input value={form.location} onChange={e => update('location', e.target.value)} placeholder="Remote or city" className="field" /></Field></div><div className="flex justify-end gap-3 border-t border-line pt-6"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-xs font-semibold text-[#7d877f] hover:bg-[#edf0eb]">Cancel</button><button disabled={saving} className="rounded-lg bg-sage px-5 py-2.5 text-xs font-semibold text-white shadow-[0_3px_0_#345144] disabled:cursor-wait disabled:opacity-60">{saving ? 'Saving…' : 'Save application'}</button></div></form></div></div>
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block font-mono text-[10px] uppercase tracking-[.13em] text-[#7d8980]">{label}{required && <span className="text-[#bf785d]"> *</span>}</span>{children}</label> }
