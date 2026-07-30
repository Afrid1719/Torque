import { renderHook } from '@testing-library/react'
import { AuthContext, type AuthContextValue } from '../contexts/AuthContext'
import { useAuth } from './useAuth'

it('returns the current authentication context', () => {
  const value = { status: 'unauthenticated' } as AuthContextValue
  const { result } = renderHook(() => useAuth(), {
    wrapper: ({ children }) => (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    ),
  })
  expect(result.current).toBe(value)
})

it('requires an AuthProvider', () => {
  expect(() => renderHook(() => useAuth())).toThrow(
    'useAuth must be used within AuthProvider',
  )
})
