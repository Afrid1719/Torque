import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'node:util'

globalThis.fetch = undefined as unknown as typeof fetch
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder
globalThis.TextEncoder = TextEncoder

afterEach(() => {
  jest.restoreAllMocks()
})
