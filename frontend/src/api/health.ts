import { getJson } from './client'

export type BackendHealthResponse = {
  status: string
  service: string
}

let pendingHealthRequest: Promise<BackendHealthResponse> | null = null

export function getBackendHealth(): Promise<BackendHealthResponse> {
  if (pendingHealthRequest) {
    return pendingHealthRequest
  }

  pendingHealthRequest = getJson<BackendHealthResponse>(
    '/api/v1/health',
  ).finally(() => {
    pendingHealthRequest = null
  })

  return pendingHealthRequest
}
