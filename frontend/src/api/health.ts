import { getJson } from '@app/api/client'
import { API_V1_PREFIX } from '@app/api/constants'

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
    `${API_V1_PREFIX}/health`,
  ).finally(() => {
    pendingHealthRequest = null
  })

  return pendingHealthRequest
}
