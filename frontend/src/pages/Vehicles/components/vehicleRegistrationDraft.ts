import type { VehicleEditValues } from '@app/pages/Vehicles/components/vehicleEditForm'

const vehicleFields: (keyof VehicleEditValues)[] = [
  'color',
  'engine_capacity',
  'fuel_type',
  'is_active',
  'make',
  'manufacture_year',
  'model',
  'odometer',
  'registration_number',
  'transmission',
  'variant',
  'vehicle_type',
  'vin',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isVehicleEditValues(value: unknown): value is VehicleEditValues {
  return (
    isRecord(value) &&
    vehicleFields.every(
      (field) => field in value && typeof value[field] === 'string',
    )
  )
}

export type VehicleRegistrationDraft = {
  fuelTankLevel: number
  handoverItems: string[]
  intakeNotes: string
  values: VehicleEditValues
}

export function createDefaultVehicleRegistrationDraft(): VehicleRegistrationDraft {
  return {
    fuelTankLevel: 75,
    handoverItems: [
      'Original RC / Registration Card Verified',
      'Physical Spare Key Handed Over',
      'Trunk Wheel Lock Nut Present',
    ],
    intakeNotes:
      'Customer reports slight intermittent squeak in front right suspension when traversing low-speed speed-bumps. Minor cosmetic scratch (~4cm) observed on rear passenger bumper lower valance prior to bay admission.',
    values: {
      color: 'Portimao Blue Metallic',
      engine_capacity: '1998',
      fuel_type: 'petrol',
      is_active: 'true',
      make: 'BMW',
      manufacture_year: '2022',
      model: '330i',
      odometer: '18450',
      registration_number: 'MH12AB1234',
      transmission: 'automatic',
      variant: 'M Sport LCI',
      vehicle_type: 'private',
      vin: 'WBA3N5C51FK289410',
    },
  }
}

export function parseVehicleRegistrationDraft(
  serialized: string,
): VehicleRegistrationDraft {
  const parsed: unknown = JSON.parse(serialized)
  if (
    !isRecord(parsed) ||
    !isVehicleEditValues(parsed.values) ||
    !('fuelTankLevel' in parsed) ||
    typeof parsed.fuelTankLevel !== 'number' ||
    parsed.fuelTankLevel < 0 ||
    parsed.fuelTankLevel > 100 ||
    !('handoverItems' in parsed) ||
    !Array.isArray(parsed.handoverItems) ||
    !parsed.handoverItems.every((item) => typeof item === 'string') ||
    !('intakeNotes' in parsed) ||
    typeof parsed.intakeNotes !== 'string'
  ) {
    throw new Error('The saved vehicle registration draft is invalid.')
  }

  return {
    fuelTankLevel: parsed.fuelTankLevel,
    handoverItems: parsed.handoverItems,
    intakeNotes: parsed.intakeNotes,
    values: parsed.values,
  }
}
