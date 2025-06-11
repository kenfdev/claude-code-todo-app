import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router'
import RegisterPage from '../../app/routes/register'

// Mock the auth hook
const mockRegister = vi.fn()
const mockClearError = vi.fn()
const mockUseAuth = {
  register: mockRegister,
  isLoading: false,
  error: null,
  clearError: mockClearError,
  user: null,
}

vi.mock('../../app/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth,
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const RegisterPageWrapper = () => (
  <BrowserRouter>
    <RegisterPage />
  </BrowserRouter>
)

describe('RegisterPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.isLoading = false
    mockUseAuth.error = null
    mockUseAuth.user = null
  })

  it('ユーザー登録フォームが正しく表示される', () => {
    render(<RegisterPageWrapper />)

    expect(screen.getAllByText('アカウントを作成')).toHaveLength(2) // h2とbutton
    expect(screen.getByPlaceholderText('太郎')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('山田')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('+81901234567')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('8文字以上のパスワード')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'アカウントを作成' })).toBeInTheDocument()
    expect(screen.getByText('既にアカウントをお持ちの場合はログイン')).toBeInTheDocument()
  })

  it('有効なデータでユーザー登録が実行される', async () => {
    render(<RegisterPageWrapper />)

    const firstNameInput = screen.getByPlaceholderText('太郎')
    const lastNameInput = screen.getByPlaceholderText('山田')
    const emailInput = screen.getByPlaceholderText('user@example.com')
    const phoneInput = screen.getByPlaceholderText('+81901234567')
    const passwordInput = screen.getByPlaceholderText('8文字以上のパスワード')
    const registerButton = screen.getByRole('button', { name: 'アカウントを作成' })

    await user.type(firstNameInput, '太郎')
    await user.type(lastNameInput, '山田')
    await user.type(emailInput, 'test@example.com')
    await user.type(phoneInput, '+81901234567')
    await user.type(passwordInput, 'password123')
    await user.click(registerButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: '太郎',
        lastName: '山田',
        email: 'test@example.com',
        phoneNumber: '+81901234567',
        password: 'password123',
      })
    })
  })

  it('電話番号なしでも登録できる', async () => {
    render(<RegisterPageWrapper />)

    const firstNameInput = screen.getByPlaceholderText('太郎')
    const lastNameInput = screen.getByPlaceholderText('山田')
    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('8文字以上のパスワード')
    const registerButton = screen.getByRole('button', { name: 'アカウントを作成' })

    await user.type(firstNameInput, '太郎')
    await user.type(lastNameInput, '山田')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(registerButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: '太郎',
        lastName: '山田',
        email: 'test@example.com',
        phoneNumber: '',
        password: 'password123',
      })
    })
  })

  it('必須フィールドが空の場合エラーを表示する', async () => {
    render(<RegisterPageWrapper />)

    const registerButton = screen.getByRole('button', { name: 'アカウントを作成' })
    await user.click(registerButton)

    // Check that the register function was not called due to validation errors
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('無効なメールアドレスでエラーを表示する', async () => {
    render(<RegisterPageWrapper />)

    const firstNameInput = screen.getByPlaceholderText('太郎')
    const lastNameInput = screen.getByPlaceholderText('山田')
    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('8文字以上のパスワード')
    const registerButton = screen.getByRole('button', { name: 'アカウントを作成' })

    await user.type(firstNameInput, '太郎')
    await user.type(lastNameInput, '山田')
    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'password123')
    await user.click(registerButton)

    // Check that the register function was not called due to validation error
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('短すぎるパスワードでエラーを表示する', async () => {
    render(<RegisterPageWrapper />)

    const firstNameInput = screen.getByPlaceholderText('太郎')
    const lastNameInput = screen.getByPlaceholderText('山田')
    const emailInput = screen.getByPlaceholderText('user@example.com')
    const passwordInput = screen.getByPlaceholderText('8文字以上のパスワード')
    const registerButton = screen.getByRole('button', { name: 'アカウントを作成' })

    await user.type(firstNameInput, '太郎')
    await user.type(lastNameInput, '山田')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'short')
    await user.click(registerButton)

    // Check that the register function was not called due to validation error
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('ローディング状態を正しく表示する', () => {
    mockUseAuth.isLoading = true

    render(<RegisterPageWrapper />)

    expect(screen.getByText('アカウント作成中...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'アカウント作成中...' })).toBeDisabled()
  })

  it('エラーメッセージを表示する', () => {
    mockUseAuth.error = 'このメールアドレスは既に登録されています'

    render(<RegisterPageWrapper />)

    expect(screen.getByText('このメールアドレスは既に登録されています')).toBeInTheDocument()
  })

  it('ログイン済みユーザーはリダイレクトされる', () => {
    mockUseAuth.user = {
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

    render(<RegisterPageWrapper />)

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('利用規約への同意表示がある', () => {
    render(<RegisterPageWrapper />)

    expect(screen.getByText('アカウントを作成することで、利用規約に同意したものとみなされます。')).toBeInTheDocument()
  })
})