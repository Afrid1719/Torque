import { postJson } from '@app/api/client'
import { createCustomerVehicle } from './vehicles'

jest.mock('@app/api/client', () => ({
  postJson: jest.fn(),
}))

const payload = {
  color: 'White',
  engine_capacity: 1197,
  fuel_type: 'petrol' as const,
  is_active: true,
  make: 'Maruti',
  manufacture_year: 2022,
  model: 'Swift',
  odometer: 25000,
  registration_number: 'MH12AB1234',
  transmission: 'manual' as const,
  variant: 'VXI',
  vehicle_type: 'private' as const,
  vin: '1HGCM82633A004352',
}

it('posts vehicle data to the customer endpoint with authentication', async () => {
  const vehicle = { ...payload, id: 91 }
  jest.mocked(postJson).mockResolvedValue(vehicle)

  await expect(createCustomerVehicle('token', 44, payload)).resolves.toEqual(
    vehicle,
  )
  expect(postJson).toHaveBeenCalledWith(
    '/api/v1/customers/44/vehicles',
    payload,
    { accessToken: 'token' },
  )
})

it('URL-encodes the customer identifier', async () => {
  jest.mocked(postJson).mockResolvedValue({ ...payload, id: 91 })

  await createCustomerVehicle('token', 'customer/44', payload)

  expect(postJson).toHaveBeenCalledWith(
    '/api/v1/customers/customer%2F44/vehicles',
    payload,
    { accessToken: 'token' },
  )
})
