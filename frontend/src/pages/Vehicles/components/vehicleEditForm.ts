import type { CreateVehicleRequest, Vehicle } from '@app/api/vehicles'

export type VehicleEditValues = Record<keyof CreateVehicleRequest, string>

export type VehicleEditField = keyof VehicleEditValues

function normalizeEnumValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

export function vehicleToEditValues(vehicle: Vehicle): VehicleEditValues {
  return {
    color: vehicle.color,
    engine_capacity: vehicle.engine_capacity
      ? String(vehicle.engine_capacity)
      : '',
    fuel_type: normalizeEnumValue(vehicle.fuel_type),
    is_active: String(vehicle.is_active),
    make: vehicle.make,
    manufacture_year: vehicle.manufacture_year
      ? String(vehicle.manufacture_year)
      : '',
    model: vehicle.model,
    odometer: String(vehicle.odometer),
    registration_number: vehicle.registration_number,
    transmission: normalizeEnumValue(vehicle.transmission),
    variant: vehicle.variant,
    vehicle_type: normalizeEnumValue(vehicle.vehicle_type),
    vin: vehicle.vin,
  }
}
