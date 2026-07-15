import { getJson } from './client'

export type BackendHealthResponse = {
  status: string
  service: string
}

export function getBackendHealth(): Promise<BackendHealthResponse> {
  return getJson<BackendHealthResponse>('/api/v1/health')
}
