import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

function mockHealthResponse(status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({
      status: 'ok',
      service: 'torque-api',
    }),
  } as Response
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('displays loading state before rendering backend health success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockHealthResponse()))

    render(<App />)

    expect(screen.getByText('Checking backend health...')).toBeTruthy()
    expect(await screen.findByText('Backend API is reachable.')).toBeTruthy()
    expect(screen.getByText('status: ok')).toBeTruthy()
    expect(screen.getByText('service: torque-api')).toBeTruthy()
    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/v1/health')
  })

  it('displays controlled error state when backend health cannot be reached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network error')),
    )

    render(<App />)

    expect(await screen.findByText(/Backend API is unavailable/)).toBeTruthy()
  })

  it('displays controlled error state when backend health returns an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockHealthResponse(503)))

    render(<App />)

    expect(await screen.findByText(/Backend API is unavailable/)).toBeTruthy()
  })

  it('refreshes backend health when the refresh button is selected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockHealthResponse()))

    render(<App />)

    await screen.findByText('Backend API is reachable.')
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })
})
