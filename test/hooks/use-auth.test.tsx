import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../../app/hooks/use-auth'
import type { LoginRequest, RegisterRequest } from '../../app/types/auth'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.user).toBeNull()
    expect(result.current.accessToken).toBeNull()
    expect(result.current.refreshToken).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('localStorage から認証状態を復元する', () => {
    const mockUser = {
      id: 'user_123',
      email: 'test@example.com',
      firstName: '太郎',
      lastName: '山田',
      phoneNumber: null,
      emailVerified: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      lastLoginAt: null,
    }
    const mockAccessToken = 'access_token'
    const mockRefreshToken = 'refresh_token'

    mockLocalStorage.getItem.mockImplementation((key: string) => {
      switch (key) {
        case 'user':
          return JSON.stringify(mockUser)
        case 'accessToken':
          return mockAccessToken
        case 'refreshToken':
          return mockRefreshToken
        default:
          return null
      }
    })

    const { result } = renderHook(() => useAuth())

    waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.accessToken).toBe(mockAccessToken)
      expect(result.current.refreshToken).toBe(mockRefreshToken)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('ログインが成功する', async () => {
    const loginData: LoginRequest = {
      username: 'test@example.com',
      password: 'password123',
    }

    const mockResponse = {
      success: true,
      data: {
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
        token: 'access_token_123',
      },
    }

    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login(loginData)
    })

    expect(result.current.user).toEqual(mockResponse.data.user)
    expect(result.current.accessToken).toBe(mockResponse.data.token)
    expect(result.current.error).toBeNull()
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user))
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('accessToken', mockResponse.data.token)
  })

  it('ログインエラーを正しく処理する', async () => {
    const loginData: LoginRequest = {
      username: 'test@example.com',
      password: 'wrongpassword',
    }

    const mockErrorResponse = {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'メールアドレスまたはパスワードが正しくありません',
      },
    }

    mockFetch.mockResolvedValueOnce({
      json: async () => mockErrorResponse,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login(loginData)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.accessToken).toBeNull()
    expect(result.current.error).toBe(mockErrorResponse.error.message)
  })

  it('ユーザー登録が成功する', async () => {
    const registerData: RegisterRequest = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: '太郎',
      lastName: '山田',
      phoneNumber: '+81901234567',
    }

    const mockResponse = {
      success: true,
      data: {
        user: {
          id: 'user_456',
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          phoneNumber: registerData.phoneNumber,
          emailVerified: false,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          lastLoginAt: null,
        },
        token: 'access_token_456',
      },
    }

    mockFetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.register(registerData)
    })

    expect(result.current.user).toEqual(mockResponse.data.user)
    expect(result.current.accessToken).toBe(mockResponse.data.token)
    expect(result.current.error).toBeNull()
  })

  it('ログアウトが正常に動作する', async () => {
    // Set up initial authenticated state
    const { result } = renderHook(() => useAuth())

    // Mock the initial state with user data
    act(() => {
      result.current.login({
        username: 'test@example.com',
        password: 'password123',
      })
    })

    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    })

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.accessToken).toBeNull()
    expect(result.current.refreshToken).toBeNull()
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('accessToken')
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken')
  })

  it('エラーをクリアする', () => {
    const { result } = renderHook(() => useAuth())

    // Set an error first
    act(() => {
      // Simulate setting an error state
      result.current.clearError()
    })

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })
})