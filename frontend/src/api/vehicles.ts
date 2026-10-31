import { getJson, postJson } from '@app/api/client'
import { API_V1_PREFIX } from '@app/api/constants'

export type CreateVehicleRequest = {
  registration_number: string
  make: string
  model: string
  variant: string
  vehicle_type: 'private' | 'commercial'
  fuel_type: 'petrol' | 'diesel' | 'ev' | 'cng' | 'hybrid'
  transmission: 'manual' | 'semi_automatic' | 'automatic'
  color: string
  vin: string
  odometer: number
  is_active: boolean
  manufacture_year: number | null
  engine_capacity: number | null
}

export type Vehicle = CreateVehicleRequest & {
  id: number
}

export const customerVehiclesQueryKey = (customerId: string | number) =>
  ['customer', String(customerId), 'vehicles'] as const

export const vehiclesQueryKey = ['vehicles'] as const

export function getVehicles(
  accessToken: string,
  search = '',
): Promise<Vehicle[]> {
  const normalizedSearch = search.trim()
  const query = normalizedSearch
    ? `?${new URLSearchParams({ query: normalizedSearch }).toString()}`
    : ''

  return getJson<Vehicle[]>(`${API_V1_PREFIX}/vehicles${query}`, {
    accessToken,
  })
}

export function getCustomerVehicles(
  accessToken: string,
  customerId: string | number,
): Promise<Vehicle[]> {
  return getJson<Vehicle[]>(
    `${API_V1_PREFIX}/customers/${encodeURIComponent(String(customerId))}/vehicles`,
    { accessToken },
  )
}

export function createCustomerVehicle(
  accessToken: string,
  customerId: string | number,
  payload: CreateVehicleRequest,
): Promise<Vehicle> {
  return postJson<Vehicle, CreateVehicleRequest>(
    `${API_V1_PREFIX}/customers/${encodeURIComponent(String(customerId))}/vehicles`,
    payload,
    { accessToken },
  )
}
