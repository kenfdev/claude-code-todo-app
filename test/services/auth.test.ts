import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '../../app/services/auth'
import type { RegisterRequest, LoginRequest } from '../../app/types/auth'

// Mock drizzle
const mockSelectQuery = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  get: vi.fn(),
}

const mockInsertQuery = {
  values: vi.fn(),
}

const mockUpdateQuery = {
  set: vi.fn().mockReturnThis(),
  where: vi.fn(),
}

const mockDeleteQuery = {
  where: vi.fn(),
}

const mockDb = {
  select: vi.fn().mockReturnValue(mockSelectQuery),
  insert: vi.fn().mockReturnValue(mockInsertQuery),
  update: vi.fn().mockReturnValue(mockUpdateQuery),
  delete: vi.fn().mockReturnValue(mockDeleteQuery),
  query: {
    users: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}

// Mock the drizzle function
vi.mock('drizzle-orm/d1', () => ({
  drizzle: () => mockDb,
}))

const mockD1Database = {} as any

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService(mockD1Database)
    vi.clearAllMocks()
  })

  describe('パスワードハッシュ化', () => {
    it('パスワードを正しくハッシュ化する', async () => {
      const password = 'testPassword123'
      const hash = await authService.hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).toContain(':')
      expect(hash.split(':').length).toBe(2)
    })

    it('同じパスワードでも異なるハッシュを生成する（ソルト使用）', async () => {
      const password = 'testPassword123'
      const hash1 = await authService.hashPassword(password)
      const hash2 = await authService.hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
    })

    it('パスワード検証が正常に動作する', async () => {
      const password = 'testPassword123'
      const hash = await authService.hashPassword(password)
      
      const isValid = await authService.comparePassword(password, hash)
      const isInvalid = await authService.comparePassword('wrongPassword', hash)
      
      expect(isValid).toBe(true)
      expect(isInvalid).toBe(false)
    })
  })

  describe('JWT トークン', () => {
    it('アクセストークンを生成する', async () => {
      const payload = {
        userId: 'user_123',
        email: 'test@example.com',
      }
      
      const token = await authService.generateAccessToken(payload)
      
      expect(token).toBeDefined()
      expect(token.split('.').length).toBe(3) // JWT format: header.payload.signature
    })

    it('リフレッシュトークンを生成する', () => {
      const token = authService.generateRefreshToken()
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('トークンを検証する', async () => {
      const payload = {
        userId: 'user_123',
        email: 'test@example.com',
      }
      
      const token = await authService.generateAccessToken(payload)
      const verified = await authService.verifyAccessToken(token)
      
      expect(verified).toBeDefined()
      expect(verified?.userId).toBe(payload.userId)
      expect(verified?.email).toBe(payload.email)
    })

    it('無効なトークンを拒否する', async () => {
      const invalidToken = 'invalid.token.here'
      const verified = await authService.verifyAccessToken(invalidToken)
      
      expect(verified).toBeNull()
    })
  })

  describe('ユーザー登録', () => {
    it('新しいユーザーを正常に登録する', async () => {
      const registerData: RegisterRequest = {
        email: 'test@example.com',
        password: 'password123',
        firstName: '太郎',
        lastName: '山田',
        phoneNumber: '+81901234567',
      }

      // Mock existing user check (not found)
      mockSelectQuery.get.mockResolvedValueOnce(null)
      
      // Mock user creation
      mockInsertQuery.values.mockResolvedValueOnce(undefined)
      
      // Mock user retrieval after creation
      const mockUser = {
        id: 'user_123',
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phoneNumber: registerData.phoneNumber,
        emailVerified: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        lastLoginAt: null,
      }
      mockSelectQuery.get.mockResolvedValueOnce(mockUser)

      const user = await authService.register(registerData)

      expect(user).toBeDefined()
      expect(user.email).toBe(registerData.email)
      expect(user.firstName).toBe(registerData.firstName)
      expect(user.lastName).toBe(registerData.lastName)
    })

    it('既存ユーザーの登録を拒否する', async () => {
      const registerData: RegisterRequest = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: '太郎',
        lastName: '山田',
      }

      // Mock existing user found
      mockSelectQuery.get.mockResolvedValueOnce({ id: 'existing_user' })

      await expect(authService.register(registerData)).rejects.toThrow('USER_ALREADY_EXISTS')
    })
  })

  describe('ログイン', () => {
    it('正しい認証情報でログインする', async () => {
      const loginData: LoginRequest = {
        username: 'test@example.com',
        password: 'password123',
      }

      const hashedPassword = await authService.hashPassword(loginData.password)
      const mockUser = {
        id: 'user_123',
        email: loginData.username,
        passwordHash: hashedPassword,
        firstName: '太郎',
        lastName: '山田',
        phoneNumber: null,
        emailVerified: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        lastLoginAt: null,
      }

      // Mock user lookup
      mockSelectQuery.get.mockResolvedValueOnce(mockUser)
      
      // Mock user update
      mockUpdateQuery.where.mockResolvedValueOnce(undefined)
      
      // Mock session creation
      mockInsertQuery.values.mockResolvedValueOnce(undefined)

      const result = await authService.login(loginData)

      expect(result).toBeDefined()
      expect(result.user.email).toBe(loginData.username)
      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
    })

    it('存在しないユーザーのログインを拒否する', async () => {
      const loginData: LoginRequest = {
        username: 'nonexistent@example.com',
        password: 'password123',
      }

      // Mock user not found
      mockSelectQuery.get.mockResolvedValueOnce(null)

      await expect(authService.login(loginData)).rejects.toThrow('INVALID_CREDENTIALS')
    })

    it('間違ったパスワードでのログインを拒否する', async () => {
      const loginData: LoginRequest = {
        username: 'test@example.com',
        password: 'wrongPassword',
      }

      const correctPassword = 'correctPassword'
      const hashedPassword = await authService.hashPassword(correctPassword)
      const mockUser = {
        id: 'user_123',
        email: loginData.username,
        passwordHash: hashedPassword,
        firstName: '太郎',
        lastName: '山田',
        phoneNumber: null,
        emailVerified: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        lastLoginAt: null,
      }

      // Mock user lookup
      mockSelectQuery.get.mockResolvedValueOnce(mockUser)

      await expect(authService.login(loginData)).rejects.toThrow('INVALID_CREDENTIALS')
    })
  })

  describe('セッション管理', () => {
    it('有効なセッションを検証する', async () => {
      const payload = {
        userId: 'user_123',
        email: 'test@example.com',
      }
      
      const token = await authService.generateAccessToken(payload)
      
      const mockUser = {
        id: payload.userId,
        email: payload.email,
        firstName: '太郎',
        lastName: '山田',
        phoneNumber: null,
        emailVerified: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        lastLoginAt: null,
      }

      // Mock user lookup
      mockSelectQuery.get.mockResolvedValueOnce(mockUser)

      const user = await authService.validateSession(token)

      expect(user).toBeDefined()
      expect(user?.id).toBe(payload.userId)
      expect(user?.email).toBe(payload.email)
    })

    it('無効なセッションを拒否する', async () => {
      const invalidToken = 'invalid.token.here'
      
      const user = await authService.validateSession(invalidToken)

      expect(user).toBeNull()
    })
  })
})