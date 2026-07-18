import { requestJson } from '@app/api/client'
import { API_V1_PREFIX } from '@app/api/constants'

export type Customer = {
  address: string | null
  created_at: string
  email: string | null
  id: number
  mobile_number: string
  name: string
  notes: string | null
  updated_at: string
}

export type CreateCustomerRequest = {
  address: string | null
  email: string | null
  mobile_number: string
  name: string
  notes: string | null
}

export const customerQueryKey = (customerId: string | number) =>
  ['customer', String(customerId)] as const

export function createCustomer(
  accessToken: string,
  payload: CreateCustomerRequest,
): Promise<Customer> {
  return requestJson<Customer>(`${API_V1_PREFIX}/customers`, {
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
}

export function getCustomer(
  accessToken: string,
  customerId: string,
): Promise<Customer> {
  return requestJson<Customer>(
    `${API_V1_PREFIX}/customers/${encodeURIComponent(customerId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
}
