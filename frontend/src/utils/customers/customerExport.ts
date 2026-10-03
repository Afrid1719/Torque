import type { Customer } from '@app/api/customers'

const csvHeaders = [
  'Customer ID',
  'Name',
  'Mobile Number',
  'Email',
  'Address',
  'Notes',
]

function escapeCsvValue(value: string | number | null): string {
  const normalizedValue = String(value ?? '')
  return `"${normalizedValue.replaceAll('"', '""')}"`
}

export function buildCustomerCsv(customers: Customer[]): string {
  const rows = customers.map((customer) =>
    [
      `CUST-${customer.id}`,
      customer.name,
      customer.mobile_number,
      customer.email,
      customer.address,
      customer.notes,
    ]
      .map(escapeCsvValue)
      .join(','),
  )

  return [csvHeaders.map(escapeCsvValue).join(','), ...rows].join('\n')
}
