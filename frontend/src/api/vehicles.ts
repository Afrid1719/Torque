import { postJson } from '@app/api/client'
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
  customer?: VehicleCustomer | null
  id: number
}

export type VehicleCustomer = {
  id: number
  mobile_number: string
  name: string
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
