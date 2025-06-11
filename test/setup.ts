import '@testing-library/jest-dom'
import React from 'react'

// Make React available globally for JSX
global.React = React

// Mock crypto API for tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      digest: async (algorithm: string, data: ArrayBuffer) => {
        // Simple mock for testing - not cryptographically secure
        const encoder = new TextEncoder()
        const decoder = new TextDecoder()
        const input = decoder.decode(data)
        const hash = Array.from(input).reduce((acc, char) => acc + char.charCodeAt(0), 0)
        return new TextEncoder().encode(hash.toString()).buffer
      },
      importKey: async () => ({ type: 'secret' }),
      sign: async () => new ArrayBuffer(32),
      verify: async () => true,
    },
    getRandomValues: (array: Uint8Array) => {
      // Simple mock for testing
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
      return array
    },
  },
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
})

// Mock fetch
global.fetch = vi.fn()

// Mock btoa/atob
global.btoa = (str: string) => Buffer.from(str).toString('base64')
global.atob = (str: string) => Buffer.from(str, 'base64').toString()