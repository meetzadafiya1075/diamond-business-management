export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

// Simple helper to fetch with auth token (stub for now until login page is built)
// We will assume login will store the token in localStorage
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // In a real scenario, you'd get this from a proper state manager or secure cookie
  // For now, we mock the token or just pass it if exists.
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  
  const headers = new Headers(options.headers || {})
  
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'API request failed')
  }

  return response.json()
}

export const coreApi = {
  getSuppliers: () => fetchWithAuth('/core/suppliers/'),
  createSupplier: (data: any) => fetchWithAuth('/core/suppliers/', { method: 'POST', body: JSON.stringify(data) }),
  deleteSupplier: (id: number) => fetchWithAuth(`/core/suppliers/${id}/`, { method: 'DELETE' }),
  
  getRoughParcels: () => fetchWithAuth('/core/rough-parcels/'),
  createRoughParcel: (data: any) => fetchWithAuth('/core/rough-parcels/', { method: 'POST', body: JSON.stringify(data) }),
  deleteRoughParcel: (id: number) => fetchWithAuth(`/core/rough-parcels/${id}/`, { method: 'DELETE' }),
  
  getParcelTracking: () => fetchWithAuth('/core/parcel-tracking/'),
  
  getPlanningRecords: () => fetchWithAuth('/core/planning-records/'),
  createPlanningRecord: (data: any) => fetchWithAuth('/core/planning-records/', { method: 'POST', body: JSON.stringify(data) }),
  deletePlanningRecord: (id: number) => fetchWithAuth(`/core/planning-records/${id}/`, { method: 'DELETE' }),

  getProductionJobs: () => fetchWithAuth('/core/production-jobs/'),
  createProductionJob: (data: any) => fetchWithAuth('/core/production-jobs/', { method: 'POST', body: JSON.stringify(data) }),
  updateProductionJob: (id: number, data: any) => fetchWithAuth(`/core/production-jobs/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Phase 2
  getYieldReports: () => fetchWithAuth('/core/yield-reports/'),
  getPolishedStones: () => fetchWithAuth('/core/polished-stones/'),
}

export const businessApi = {
  getBrokers: () => fetchWithAuth('/business/brokers/'),
  getBuyers: () => fetchWithAuth('/business/buyers/'),
  createBuyer: (data: any) => fetchWithAuth('/business/buyers/', { method: 'POST', body: JSON.stringify(data) }),
  deleteBuyer: (id: number) => fetchWithAuth(`/business/buyers/${id}/`, { method: 'DELETE' }),
  getInquiries: () => fetchWithAuth('/business/inquiries/'),
  getQuotations: () => fetchWithAuth('/business/quotations/'),
  getTransactions: () => fetchWithAuth('/business/transactions/'),
  getExpenses: () => fetchWithAuth('/business/expenses/'),
  getDocuments: () => fetchWithAuth('/business/documents/'),
  createDocument: (formData: FormData) => fetchWithAuth('/business/documents/', {
    method: 'POST',
    body: formData,
  }),
  deleteDocument: (id: number) => fetchWithAuth(`/business/documents/${id}/`, { method: 'DELETE' }),
  
  // Phase 4
  getAnalytics: () => fetchWithAuth('/business/dashboard/analytics/'),
  getAlerts: () => fetchWithAuth('/business/dashboard/alerts/'),
}

export const authApi = {
  getUsers: () => fetchWithAuth('/auth/users/'),
  getCurrentUser: () => fetchWithAuth('/auth/users/me/'),
  createUser: (data: any) => fetchWithAuth('/auth/users/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}
