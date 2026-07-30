const API_BASE_URL = (
  globalThis.__TORQUE_API_BASE_URL__ || 'http://localhost:8000'
).replace(/\/$/, '')

type FastApiValidationDetail = {
  msg?: unknown
}

type ErrorPayload = {
  detail?: unknown
}

const fallbackMessages: Record<number, string> = {
  400: 'The request could not be completed.',
  401: 'Invalid username or password.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  422: 'Please review the information you entered.',
}

export type ApiRequestOptions = Omit<RequestInit, 'headers'> & {
  accessToken?: string
  headers?: HeadersInit
}

function buildRequestHeaders(
  accessToken: string | undefined,
  requestHeaders: HeadersInit | undefined,
): Headers {
  const headers = new Headers({ Accept: 'application/json' })

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  new Headers(requestHeaders).forEach((value, key) => headers.set(key, value))

  return headers
}

function readDetailMessage(detail: unknown): string | null {
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (item as FastApiValidationDetail)?.msg)
      .filter((message): message is string => typeof message === 'string')

    return messages.length > 0 ? messages.join(' ') : null
  }

  return null
}

function errorCodeForStatus(status: number): string {
  if (status === 401) return 'authentication_failed'
  if (status === 403) return 'forbidden'
  if (status === 422) return 'validation_failed'
  if (status >= 500) return 'server_error'
  return 'request_failed'
}

export class ApiError extends Error {
  readonly status: number | null
  readonly code: string

  constructor(message: string, status: number | null, code: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }

  static network(): ApiError {
    return new ApiError(
      'Unable to connect to the server. Please try again.',
      null,
      'network_error',
    )
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let payload: ErrorPayload = {}

    try {
      payload = (await response.json()) as ErrorPayload
    } catch {
      // A status-based fallback keeps non-JSON failures controlled.
    }

    const message =
      readDetailMessage(payload.detail) ||
      fallbackMessages[response.status] ||
      'An unexpected server error occurred. Please try again.'

    return new ApiError(
      message,
      response.status,
      errorCodeForStatus(response.status),
    )
  }
}

export async function requestJson<TResponse>(
  path: string,
  { accessToken, headers: requestHeaders, ...init }: ApiRequestOptions = {},
): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: buildRequestHeaders(accessToken, requestHeaders),
    })
  } catch {
    throw ApiError.network()
  }

  if (!response.ok) {
    throw await ApiError.fromResponse(response)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

export function getJson<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  return requestJson<TResponse>(path, options)
}

export function postJson<TResponse, TRequest>(
  path: string,
  body: TRequest,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  return requestJson<TResponse>(path, {
    ...options,
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}
