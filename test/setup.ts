import '@testing-library/jest-dom'
import React from 'react'
import { beforeAll, afterAll, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

// Make React available globally for JSX
global.React = React

// Global test database instance
let testDb: Database.Database
let drizzleDb: BetterSQLite3Database

// Make database available globally for tests
global.testDb = testDb
global.drizzleDb = drizzleDb

beforeAll(() => {
  // Create in-memory SQLite database
  testDb = new Database(':memory:')
  
  // Create tables
  testDb.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone_number TEXT,
      email_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      last_login_at TEXT
    );
    
    CREATE UNIQUE INDEX users_email_unique ON users (email);
    
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      refresh_token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      last_used_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE UNIQUE INDEX sessions_token_hash_unique ON sessions (token_hash);
    CREATE UNIQUE INDEX sessions_refresh_token_hash_unique ON sessions (refresh_token_hash);
    
    CREATE TABLE password_reset_tokens (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE UNIQUE INDEX password_reset_tokens_token_hash_unique ON password_reset_tokens (token_hash);
  `)
  
  // Create Drizzle instance
  drizzleDb = drizzle(testDb)
  
  // Make database instances globally available
  global.testDb = testDb
  global.drizzleDb = drizzleDb
})

beforeEach(() => {
  // Clear all tables before each test
  testDb.exec(`
    DELETE FROM password_reset_tokens;
    DELETE FROM sessions;
    DELETE FROM users;
  `)
})

afterAll(() => {
  // Close database connection
  testDb.close()
})

// Mock crypto API with real implementation for tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      digest: async (algorithm: string, data: ArrayBuffer) => {
        // Use Node's crypto for actual hashing in tests
        const crypto = await import('crypto')
        const hash = crypto.createHash(algorithm.toLowerCase().replace('-', ''))
        hash.update(Buffer.from(data))
        return hash.digest().buffer
      },
      importKey: async (
        format: string,
        keyData: ArrayBuffer,
        algorithm: any,
        extractable: boolean,
        keyUsages: string[]
      ) => {
        return {
          type: 'secret',
          algorithm,
          extractable,
          usages: keyUsages,
          _keyData: keyData
        }
      },
      sign: async (algorithm: any, key: any, data: ArrayBuffer) => {
        const crypto = await import('crypto')
        const algorithmName = algorithm?.hash?.name || algorithm?.name || 'sha256'
        const hmac = crypto.createHmac(algorithmName.toLowerCase().replace('-', ''), Buffer.from(key._keyData))
        hmac.update(Buffer.from(data))
        return hmac.digest().buffer
      },
      verify: async (algorithm: any, key: any, signature: ArrayBuffer, data: ArrayBuffer) => {
        const crypto = await import('crypto')
        const algorithmName = algorithm?.hash?.name || algorithm?.name || 'sha256'
        const hmac = crypto.createHmac(algorithmName.toLowerCase().replace('-', ''), Buffer.from(key._keyData))
        hmac.update(Buffer.from(data))
        const expectedSignature = hmac.digest()
        return Buffer.from(signature).equals(expectedSignature)
      },
    },
    getRandomValues: (array: Uint8Array) => {
      // Use Node's crypto for actual random values
      const crypto = require('crypto')
      const randomBytes = crypto.randomBytes(array.length)
      array.set(randomBytes)
      return array
    },
  },
})

// Mock localStorage with actual implementation
const localStorageData: Record<string, string> = {}

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => localStorageData[key] || null,
    setItem: (key: string, value: string) => {
      localStorageData[key] = value
    },
    removeItem: (key: string) => {
      delete localStorageData[key]
    },
    clear: () => {
      Object.keys(localStorageData).forEach(key => delete localStorageData[key])
    },
  },
})

// Clear localStorage before each test
beforeEach(() => {
  window.localStorage.clear()
})

// Mock fetch - will be overridden in specific tests
global.fetch = vi.fn()

// Mock btoa/atob with real implementation
global.btoa = (str: string) => Buffer.from(str).toString('base64')
global.atob = (str: string) => Buffer.from(str, 'base64').toString()

// Add type declarations
declare global {
  var testDb: Database.Database
  var drizzleDb: BetterSQLite3Database
}