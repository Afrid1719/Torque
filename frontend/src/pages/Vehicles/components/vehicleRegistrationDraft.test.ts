import {
  createDefaultVehicleRegistrationDraft,
  parseVehicleRegistrationDraft,
} from './vehicleRegistrationDraft'

it('provides the initial registration form values and intake defaults', () => {
  const draft = createDefaultVehicleRegistrationDraft()

  expect(draft.values.vehicle_type).toBe('private')
  expect(draft.values.transmission).toBe('automatic')
  expect(draft.fuelTankLevel).toBe(75)
  expect(draft.handoverItems).toContain(
    'Original RC / Registration Card Verified',
  )
  expect(draft.intakeNotes).toContain('Customer reports')
})

it('restores a serialized registration draft', () => {
  const draft = createDefaultVehicleRegistrationDraft()
  draft.values.vehicle_type = 'commercial'
  draft.values.transmission = 'manual'
  draft.fuelTankLevel = 42
  draft.handoverItems = ['Physical Spare Key Handed Over']
  draft.intakeNotes = 'Customer reports a vibration.'

  expect(parseVehicleRegistrationDraft(JSON.stringify(draft))).toEqual(draft)
})

it.each([
  ['not JSON', '{'],
  [
    'an incomplete field set',
    JSON.stringify({ ...createDefaultVehicleRegistrationDraft(), values: {} }),
  ],
  [
    'an out-of-range tank level',
    JSON.stringify({
      ...createDefaultVehicleRegistrationDraft(),
      fuelTankLevel: 101,
    }),
  ],
  [
    'non-text checklist values',
    JSON.stringify({
      ...createDefaultVehicleRegistrationDraft(),
      handoverItems: [1],
    }),
  ],
])('rejects invalid saved draft data: %s', (_, serialized) => {
  expect(() => parseVehicleRegistrationDraft(serialized)).toThrow()
})
