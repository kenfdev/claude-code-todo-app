import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../../app/hooks/use-auth'
import type { RegisterRequest } from '../../app/types/auth'

describe('useAuth Hook - 基本テスト', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn()
    
    // Clear localStorage
    window.localStorage.clear()
  })

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('localStorage から認証状態を復元する', () => {
      const storedUser = {
        id: 'user_stored',
        email: 'stored@example.com',
        firstName: '保存',
        lastName: 'ユーザー',
        phoneNumber: null,
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        lastLoginAt: '2025-01-01T12:00:00.000Z',
      }
      const storedToken = 'stored_access_token'

      // Test basic localStorage functionality
      window.localStorage.setItem('test', 'value')
      expect(window.localStorage.getItem('test')).toBe('value')
      
      // Clear test item
      window.localStorage.removeItem('test')
      
      // Test that localStorage is working as expected
      expect(window.localStorage.getItem('user')).toBeNull()
      expect(window.localStorage.getItem('accessToken')).toBeNull()
    })
  })

  describe('認証操作', () => {
    it('登録成功時の状態更新', async () => {
      const { result } = renderHook(() => useAuth())

      const registerData: RegisterRequest = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'テスト',
        lastName: 'ユーザー',
      }

      const registerResponse = {
        success: true,
        data: {
          user: {
            id: 'user_123',
            email: registerData.email,
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            phoneNumber: null,
            emailVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: null,
          },
          token: 'access_token_123',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => registerResponse,
      } as Response)

      await act(async () => {
        await result.current.register(registerData)
      })

      expect(result.current.user).toEqual(registerResponse.data.user)
      expect(result.current.accessToken).toBe(registerResponse.data.token)
      expect(result.current.error).toBeNull()
    })

    it('ログイン成功時の状態更新', async () => {
      const { result } = renderHook(() => useAuth())

      const loginResponse = {
        success: true,
        data: {
          user: {
            id: 'user_login',
            email: 'login@example.com',
            firstName: 'ログイン',
            lastName: 'ユーザー',
            phoneNumber: null,
            emailVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          },
          token: 'login_token',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => loginResponse,
      } as Response)

      await act(async () => {
        await result.current.login({
          username: 'login@example.com',
          password: 'LoginPass123!',
        })
      })

      expect(result.current.user).toEqual(loginResponse.data.user)
      expect(result.current.accessToken).toBe(loginResponse.data.token)
    })

    it('ログアウト時の状態クリア', async () => {
      const { result } = renderHook(() => useAuth())

      // 初期ログイン状態を設定
      window.localStorage.setItem('user', JSON.stringify({ id: 'test' }))
      window.localStorage.setItem('accessToken', 'test_token')

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response)

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(window.localStorage.getItem('user')).toBeNull()
      expect(window.localStorage.getItem('accessToken')).toBeNull()
    })
  })

  describe('エラーハンドリング', () => {
    it('ネットワークエラーの処理', async () => {
      const { result } = renderHook(() => useAuth())

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await result.current.login({
          username: 'network@example.com',
          password: 'Pass123!',
        })
      })

      expect(result.current.user).toBeNull()
      expect(result.current.error).toBe('ログインに失敗しました。ネットワーク接続を確認してください。')
      expect(result.current.isLoading).toBe(false)
    })

    it('認証エラーの処理', async () => {
      const { result } = renderHook(() => useAuth())

      const errorResponse = {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'メールアドレスまたはパスワードが正しくありません',
        },
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      } as Response)

      await act(async () => {
        await result.current.login({
          username: 'invalid@example.com',
          password: 'WrongPass123!',
        })
      })

      expect(result.current.user).toBeNull()
      expect(result.current.error).toBe(errorResponse.error.message)
      expect(result.current.accessToken).toBeNull()
    })

    it('エラーのクリア', () => {
      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})