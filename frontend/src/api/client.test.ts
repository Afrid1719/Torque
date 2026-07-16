import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError, getJson, requestJson } from './client'

describe('API errors', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('organizes FastAPI validation details into one message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: vi.fn().mockResolvedValue({
          detail: [
            { msg: 'Username is required.' },
            { msg: 'Password is required.' },
          ],
        }),
      }),
    )

    await expect(getJson('/validation')).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      code: 'validation_failed',
      message: 'Username is required. Password is required.',
    })
  })

  it('uses a controlled fallback for non-JSON server errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('not json')),
      }),
    )

    await expect(getJson('/failure')).rejects.toEqual(
      new ApiError(
        'An unexpected server error occurred. Please try again.',
        500,
        'server_error',
      ),
    )
  })

  it('converts network failures into a central API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    await expect(getJson('/health')).rejects.toMatchObject({
      status: null,
      code: 'network_error',
      message: 'Unable to connect to the server. Please try again.',
    })
  })

  it('handles successful no-content responses without parsing JSON', async () => {
    const json = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json,
      }),
    )

    await expect(
      requestJson<void>('/auth/logout', { method: 'POST' }),
    ).resolves.toBeUndefined()
    expect(json).not.toHaveBeenCalled()
  })
})
