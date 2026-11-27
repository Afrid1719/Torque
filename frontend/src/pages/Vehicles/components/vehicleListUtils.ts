import type { Vehicle } from '@app/api/vehicles'

export function downloadVehicleCsv(vehicles: Vehicle[]) {
  const columns: Array<keyof Vehicle> = [
    'registration_number',
    'make',
    'model',
    'variant',
    'manufacture_year',
    'odometer',
    'fuel_type',
    'is_active',
    'vin',
  ]
  const escapeCsv = (value: unknown) =>
    `"${String(value ?? '').replaceAll('"', '""')}"`
  const rows = [
    columns.map(escapeCsv).join(','),
    ...vehicles.map((vehicle) =>
      columns.map((column) => escapeCsv(vehicle[column])).join(','),
    ),
  ]
  const file = new Blob([rows.join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = 'torque-vehicles.csv'
  link.click()
  URL.revokeObjectURL(url)
}
