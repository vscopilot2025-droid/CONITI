function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

export const apiConfig = {
  authApiUrl: trimTrailingSlash(import.meta.env.VITE_AUTH_API_URL || 'http://127.0.0.1:3003'),
  paymentsApiUrl: trimTrailingSlash(import.meta.env.VITE_PAYMENTS_API_URL || import.meta.env.VITE_AUTH_API_URL || 'http://127.0.0.1:3003'),
  conferencesApiUrl: trimTrailingSlash(import.meta.env.VITE_CONFERENCES_API_URL || 'http://127.0.0.1:3004'),
  speakersApiUrl: trimTrailingSlash(import.meta.env.VITE_SPEAKERS_API_URL || 'http://127.0.0.1:3005'),
  datesApiUrl: trimTrailingSlash(import.meta.env.VITE_DATES_API_URL || 'http://127.0.0.1:3006')
}

export function buildApiUrl(baseUrl, path) {
  return `${trimTrailingSlash(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`
}
