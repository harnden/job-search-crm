import type { Application, Company, Status } from './types'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const unwrap = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    for (const key of ['applications', 'companies', 'data', 'items', 'results']) if (Array.isArray(record[key])) return record[key] as unknown[]
  }
  return []
}
const text = (value: unknown, fallback = '') => value === undefined || value === null ? fallback : String(value)
const idValue = (value: unknown, fallback: string): string | number => typeof value === 'string' || typeof value === 'number' ? value : fallback

export function normalizeCompany(raw: unknown): Company {
  const item = (raw || {}) as Record<string, unknown>
  return { id: idValue(item.id ?? item._id, text(item.name)), name: text(item.name || item.companyName, 'Untitled company'), logo: text(item.logo || item.logoUrl), industry: text(item.industry), location: text(item.location) }
}

export function normalizeApplication(raw: unknown): Application {
  const item = (raw || {}) as Record<string, unknown>
  const company = item.company && typeof item.company === 'object' ? normalizeCompany(item.company) : normalizeCompany({ id: item.companyId, name: item.companyName || item.company })
  const status = text(item.status || item.applicationStatus, 'Identified') as Status
  return { id: idValue(item.id ?? item._id, crypto.randomUUID()), title: text(item.title || item.jobTitle || item.position, 'Untitled role'), company, discoveredDate: text(item.discoveredDate || item.dateDiscovered || item.createdAt) || null, appliedDate: text(item.appliedDate || item.dateApplied) || null, salaryTarget: typeof (item.salaryTarget ?? item.salary ?? item.targetSalary) === 'string' || typeof (item.salaryTarget ?? item.salary ?? item.targetSalary) === 'number' ? item.salaryTarget as string | number : null, status, lastContactDate: text(item.lastContactDate || item.lastContact || item.contactedAt) || null, notes: text(item.notes), location: text(item.location) }
}

async function request(path: string, init?: RequestInit) {
  const url = `${API_BASE}${path}`
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, ...init })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.status === 204 ? null : response.json()
}

export async function fetchApplications() { return unwrap(await request('/api/applications')).map(normalizeApplication) }
export async function fetchCompanies() { return unwrap(await request('/api/companies')).map(normalizeCompany) }
export async function updateStatus(id: string | number, status: Status, appliedDate?: string) {
  await request(`/api/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(appliedDate ? { appliedDate } : {}) }),
  })
}
export async function createApplication(payload: Record<string, unknown>) { return normalizeApplication(await request('/api/applications', { method: 'POST', body: JSON.stringify(payload) })) }
export async function createCompany(payload: Record<string, unknown>) { return normalizeCompany(await request('/api/companies', { method: 'POST', body: JSON.stringify(payload) })) }
