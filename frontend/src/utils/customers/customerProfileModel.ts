import type { Customer } from '@app/api/customers'

export type CustomerProfileState = {
  address?: string
  createdAt?: string
  email?: string
  id?: number
  mobileNumber: string
  name: string
  notes?: string
}

export const fallbackCustomer: CustomerProfileState = {
  mobileNumber: '—',
  name: 'Customer Profile',
}

export function toProfileState(customer: Customer): CustomerProfileState {
  return {
    address: customer.address ?? '',
    createdAt: customer.created_at,
    email: customer.email ?? '',
    id: customer.id,
    mobileNumber: customer.mobile_number,
    name: customer.name,
    notes: customer.notes ?? '',
  }
}

export function customerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
