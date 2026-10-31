import { getJson, postJson } from '@app/api/client'
import {
  createCustomerVehicle,
  getCustomerVehicles,
  getVehicles,
} from './vehicles'

jest.mock('@app/api/client', () => ({
  getJson: jest.fn(),
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

it('gets vehicles registered to a customer with authentication', async () => {
  const vehicles = [{ ...payload, id: 91 }]
  jest.mocked(getJson).mockResolvedValue(vehicles)

  await expect(getCustomerVehicles('token', 44)).resolves.toEqual(vehicles)
  expect(getJson).toHaveBeenCalledWith('/api/v1/customers/44/vehicles', {
    accessToken: 'token',
  })
})

it('gets the vehicle list and encodes a search query', async () => {
  const vehicles = [{ ...payload, id: 91 }]
  jest.mocked(getJson).mockResolvedValue(vehicles)

  await expect(getVehicles('token', 'BMW M4')).resolves.toEqual(vehicles)
  expect(getJson).toHaveBeenCalledWith(
    '/api/v1/vehicles?query=BMW+M4',
    { accessToken: 'token' },
  )
})

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
