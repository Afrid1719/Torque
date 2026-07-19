import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import { useAddCustomer } from './useAddCustomer'

jest.mock('@app/hooks/useAuth', () => ({
  useAuth: () => ({ accessToken: 'token' }),
}))

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

it('provides the initial customer creation state', () => {
  const { result } = renderHook(() => useAddCustomer(), { wrapper: Wrapper })
  expect(result.current.flowState).toBe('form')
  expect(result.current.isCreating).toBe(false)
  expect(result.current.fieldErrors).toEqual({})
})
