import { getJson, postJson } from './client'
import {
  createCustomer,
  customerListQueryKey,
  customerQueryKey,
  getCustomer,
  getCustomers,
} from './customers'

jest.mock('./client', () => ({ getJson: jest.fn(), postJson: jest.fn() }))

it('builds a stable customer query key', () => {
  expect(customerQueryKey('44')).toEqual(['customer', '44'])
  expect(customerListQueryKey('Asha')).toEqual(['customers', 'list', 'Asha'])
})

it('gets customers with an optional search value', async () => {
  jest.mocked(getJson).mockResolvedValue([])

  await getCustomers('token', 'Asha Rao')
  expect(getJson).toHaveBeenCalledWith('/api/v1/customers?search=Asha+Rao', {
    accessToken: 'token',
  })

  await getCustomers('token')
  expect(getJson).toHaveBeenLastCalledWith('/api/v1/customers', {
    accessToken: 'token',
  })
})

it('gets and creates customers with authentication', async () => {
  jest.mocked(getJson).mockResolvedValue({ id: 44 } as never)
  jest.mocked(postJson).mockResolvedValue({ id: 44 } as never)
  await getCustomer('token', '44')
  expect(getJson).toHaveBeenCalledWith('/api/v1/customers/44', {
    accessToken: 'token',
  })
  await createCustomer('token', {
    address: null,
    email: null,
    mobile_number: '123',
    name: 'John',
    notes: null,
  })
  expect(postJson).toHaveBeenLastCalledWith(
    '/api/v1/customers',
    expect.objectContaining({ name: 'John' }),
    { accessToken: 'token' },
  )
})
