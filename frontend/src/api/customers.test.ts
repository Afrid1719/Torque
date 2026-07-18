import { requestJson } from './client'
import { createCustomer, customerQueryKey, getCustomer } from './customers'

jest.mock('./client', () => ({ requestJson: jest.fn() }))

it('builds a stable customer query key', () => {
  expect(customerQueryKey('44')).toEqual(['customer', '44'])
})

it('gets and creates customers with authentication', async () => {
  jest.mocked(requestJson).mockResolvedValue({ id: 44 } as never)
  await getCustomer('token', '44')
  expect(requestJson).toHaveBeenCalledWith('/api/v1/customers/44', {
    headers: { Authorization: 'Bearer token' },
  })
  await createCustomer('token', {
    address: null,
    email: null,
    mobile_number: '123',
    name: 'John',
    notes: null,
  })
  expect(requestJson).toHaveBeenLastCalledWith(
    '/api/v1/customers',
    expect.objectContaining({ method: 'POST' }),
  )
})
