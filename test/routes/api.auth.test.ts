import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock AuthService
const mockAuthService = {
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  createPasswordResetToken: vi.fn(),
  generateAccessToken: vi.fn(),
}

vi.mock('../../app/services/auth', () => ({
  AuthService: vi.fn().mockImplementation(() => mockAuthService),
}))

// Mock context for Cloudflare environment
const mockContext = {
  cloudflare: {
    env: {
      DB: 'mock_db',
    },
  },
}

describe('認証 API エンドポイント', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('有効なデータでユーザー登録が成功する', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: '太郎',
        lastName: '山田',
        phoneNumber: '+81901234567',
      }

      const mockUser = {
        id: 'user_123',
        ...registerData,
        phoneNumber: registerData.phoneNumber,
        emailVerified: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        lastLoginAt: null,
      }

      mockAuthService.register.mockResolvedValue(mockUser)
      mockAuthService.generateAccessToken.mockResolvedValue('access_token_123')

      const { action } = await import('../../app/routes/api.auth.register')

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      })

      const response = await action({ request, context: mockContext } as any)
      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.success).toBe(true)
      expect(result.data.user.email).toBe(registerData.email)
      expect(result.data.token).toBe('access_token_123')
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData)
    })

    it('無効なメールアドレスでエラーを返す', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: '太郎',
        lastName: '山田',
      }

      const { action } = await import('../../app/routes/api.auth.register')

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      })

      const response = await action({ request, context: mockContext } as any)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.success).toBe(false)
      expect(result.error.code).toBe('VALIDATION_ERROR')
    })

    it('既存ユーザーでエラーを返す', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: '太郎',
        lastName: '山田',
      }

      mockAuthService.register.mockRejectedValue(new Error('USER_ALREADY_EXISTS'))

      const { action } = await import('../../app/routes/api.auth.register')

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      })

      const response = await action({ request, context: mockContext } as any)
      const result = await response.json()

      expect(response.status).toBe(409)
      expect(result.success).toBe(false)
      expect(result.error.code).toBe('USER_ALREADY_EXISTS')
    })
  })

  describe('POST /api/auth/login', () => {
    it('有効な認証情報でログインが成功する', async () => {
      const loginData = {
        username: 'test@example.com',
        password: 'password123',
      }

      const mockLoginResult = {
        user: {
          id: 'user_123',
          email: loginData.username,
          firstName: '太郎',
          lastName: '山田',
          phoneNumber: null,
          emailVerified: false,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          lastLoginAt: '2025-01-01T00:00:00.000Z',
        },
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123',
      }

      mockAuthService.login.mockResolvedValue(mockLoginResult)

      const { action } = await import('../../app/routes/api.auth.login')

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      const response = await action({ request, context: mockContext } as any)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.user.email).toBe(loginData.username)
      expect(result.data.token).toBe('access_token_123')
    })

    it('無効な認証情報でエラーを返す', async () => {
      const loginData = {
        username: 'test@example.com',
        password: 'wrongpassword',
      }

      mockAuthService.login.mockRejectedValue(new Error('INVALID_CREDENTIALS'))

      const { action } = await import('../../app/routes/api.auth.login')

      const request = new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })

      const response = await action({ request, context: mockContext } as any)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.success).toBe(false)
      expect(result.error.code).toBe('INVALID_CREDENTIALS')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('有効なトークンでログアウトが成功する', async () => {
      mockAuthService.logout.mockResolvedValue(undefined)

      const { action } = await import('../../app/routes/api.auth.logout')

      const request = new Request('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer valid_token_123',
          'Content-Type': 'application/json',
        },
      })

      const response = await action({ request, context: mockContext } as any)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.message).toBe('ログアウトしました')
      expect(mockAuthService.logout).toHaveBeenCalledWith('valid_token_123')
    })

    it('Authorizationヘッダーがない場合エラーを返す', async () => {
      const { action } = await import('../../app/routes/api.auth.logout')

      const request = new Request('http://localhost/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await action({ request, context: mockContext } as any)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.success).toBe(false)
      expect(result.error.code).toBe('MISSING_TOKEN')
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('有効なリフレッシュトークンで新しいトークンを取得する', async () => {
      const refreshData = {
        refreshToken: 'valid_refresh_token',
      }

      const mockTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      }

      mockAuthService.refreshToken.mockResolvedValue(mockTokens)

      const { action } = await import('../../app/routes/api.auth.refresh')

      const request = new Request('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refreshData),
      })

      const response = await action({ request, context: mockContext } as any)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.accessToken).toBe('new_access_token')
      expect(result.data.refreshToken).toBe('new_refresh_token')
    })

    it('無効なリフレッシュトークンでエラーを返す', async () => {
      const refreshData = {
        refreshToken: 'invalid_refresh_token',
      }

      mockAuthService.refreshToken.mockRejectedValue(new Error('INVALID_REFRESH_TOKEN'))

      const { action } = await import('../../app/routes/api.auth.refresh')

      const request = new Request('http://localhost/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refreshData),
      })

      const response = await action({ request, context: mockContext } as any)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.success).toBe(false)
      expect(result.error.code).toBe('INVALID_REFRESH_TOKEN')
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    it('有効なメールアドレスでパスワードリセット要求が成功する', async () => {
      const resetData = {
        email: 'test@example.com',
      }

      mockAuthService.createPasswordResetToken.mockResolvedValue('reset_token_123')

      const { action } = await import('../../app/routes/api.auth.forgot-password')

      const request = new Request('http://localhost/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      })

      const response = await action({ request, context: mockContext } as any)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.message).toBe('パスワードリセットのメールを送信しました')
    })

    it('存在しないメールアドレスでも成功レスポンスを返す（セキュリティ対策）', async () => {
      const resetData = {
        email: 'nonexistent@example.com',
      }

      mockAuthService.createPasswordResetToken.mockRejectedValue(new Error('USER_NOT_FOUND'))

      const { action } = await import('../../app/routes/api.auth.forgot-password')

      const request = new Request('http://localhost/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetData),
      })

      const response = await action({ request, context: mockContext } as any)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.message).toBe('パスワードリセットのメールを送信しました')
    })
  })
})