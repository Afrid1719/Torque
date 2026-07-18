import { getJson } from './client'
import { getBackendHealth } from './health'

jest.mock('./client', () => ({ getJson: jest.fn() }))

it('deduplicates an in-flight health request', async () => {
  jest
    .mocked(getJson)
    .mockResolvedValue({ status: 'ok', service: 'torque-api' })
  const first = getBackendHealth()
  const second = getBackendHealth()
  expect(first).toBe(second)
  await expect(first).resolves.toEqual({ status: 'ok', service: 'torque-api' })
  expect(getJson).toHaveBeenCalledWith('/api/v1/health')
})
