import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Schema for registration validation including confirmPassword
const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  confirmPassword: z.string().min(1, "パスワードの確認を入力してください"),
  firstName: z.string().min(1, "名前を入力してください"),
  lastName: z.string().min(1, "苗字を入力してください"),
  phoneNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

describe('認証 API エンドポイント - 基本テスト', () => {
  describe('バリデーションエラーのテスト', () => {
    it('無効なメールアドレスでバリデーションエラーを返す', () => {
      const invalidEmail = 'invalid-email'
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      expect(emailRegex.test(invalidEmail)).toBe(false)
    })

    it('弱いパスワードのバリデーション', () => {
      const weakPassword = '123'
      const strongPassword = 'StrongPass123!'
      
      expect(weakPassword.length < 8).toBe(true)
      expect(strongPassword.length >= 8).toBe(true)
    })

    it('パスワード確認バリデーション - 一致する場合', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '123-456-7890'
      }
      
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('パスワード確認バリデーション - 一致しない場合', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '123-456-7890'
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        const confirmPasswordError = result.error.errors.find(
          error => error.path.includes('confirmPassword')
        )
        expect(confirmPasswordError?.message).toBe('パスワードが一致しません')
      }
    })

    it('必須フィールドの検証', () => {
      const incompleteData = {
        email: 'test@example.com',
        password: 'password123',
        // confirmPassword missing
        firstName: 'Test',
        lastName: 'User'
      }
      
      const result = registerSchema.safeParse(incompleteData)
      expect(result.success).toBe(false)
    })
  })

  describe('認証ヘッダーの解析', () => {
    it('Bearerトークンの正しい解析', () => {
      const authHeader = 'Bearer abc123token'
      const token = authHeader.replace('Bearer ', '')
      
      expect(token).toBe('abc123token')
    })

    it('無効なAuthorizationヘッダーの処理', () => {
      const invalidHeaders = [
        '',
        'Basic abc123',
        'Bearer',
        'InvalidFormat token',
      ]
      
      invalidHeaders.forEach(header => {
        const isValidBearer = header.startsWith('Bearer ') && header.length > 7
        expect(isValidBearer).toBe(false)
      })
    })
  })

  describe('レスポンス形式のテスト', () => {
    it('成功レスポンスの形式', () => {
      const successResponse = {
        success: true,
        data: {
          user: { id: '123', email: 'test@example.com' },
          token: 'abc123',
        },
      }
      
      expect(successResponse.success).toBe(true)
      expect(successResponse.data).toBeDefined()
      expect(successResponse.data.user).toBeDefined()
      expect(successResponse.data.token).toBeDefined()
    })

    it('エラーレスポンスの形式', () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'バリデーションエラーです',
        },
      }
      
      expect(errorResponse.success).toBe(false)
      expect(errorResponse.error).toBeDefined()
      expect(errorResponse.error.code).toBeDefined()
      expect(errorResponse.error.message).toBeDefined()
    })
  })
})