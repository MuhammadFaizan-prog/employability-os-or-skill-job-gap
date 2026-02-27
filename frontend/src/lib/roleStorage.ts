const ROLE_KEY = 'employabilityos_role'
const DEFAULT_ROLE = 'Frontend Developer'

const ROLE_MAP: Record<string, string> = {
  'Frontend Engineer': 'Frontend Developer',
  'Backend Engineer': 'Backend Developer',
  'Product Designer': 'Frontend Developer',
  'frontend': 'Frontend Developer',
  'backend': 'Backend Developer',
  'designer': 'Frontend Developer',
}

export function getStoredRole(): string {
  try {
    return localStorage.getItem(ROLE_KEY) || DEFAULT_ROLE
  } catch {
    return DEFAULT_ROLE
  }
}

export function setStoredRole(role: string) {
  const mapped = ROLE_MAP[role] || role
  localStorage.setItem(ROLE_KEY, mapped)
}
