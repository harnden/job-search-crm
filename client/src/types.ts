export const STATUSES = ['Identified', 'Applied', 'Screening', 'Technical', 'Offer', 'Rejected', 'Ghosted'] as const
export type Status = typeof STATUSES[number]

export type Company = { id: string | number; name: string; logo?: string; industry?: string; location?: string }
export type Application = {
  id: string | number
  title: string
  company: Company
  discoveredDate?: string | null
  appliedDate?: string | null
  salaryTarget?: number | string | null
  status: Status
  lastContactDate?: string | null
  notes?: string
  location?: string
}
