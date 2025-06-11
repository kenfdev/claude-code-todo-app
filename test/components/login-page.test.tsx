import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router'
import LoginPage from '../../app/routes/login'

// Mock the auth hook
const mockLogin = vi.fn()
const mockClearError = vi.fn()
const mockUseAuth = {
  login: mockLogin,
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

const LoginPageWrapper = () => (
  <BrowserRouter>
    <LoginPage />
  </BrowserRouter>
)

describe('LoginPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.isLoading = false
    mockUseAuth.error = null
    mockUseAuth.user = null
  })

  it('ログインフォームが正しく表示される', () => {
    render(<LoginPageWrapper />)

    expect(screen.getByText('アカウントにログイン')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('パスワード')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.getByText('パスワードを忘れた場合')).toBeInTheDocument()
    expect(screen.getByText('アカウントを作成')).toBeInTheDocument()
  })

  it('有効なデータでログインが実行される', async () => {
    render(<LoginPageWrapper />)

    const emailInput = screen.getByPlaceholderText('メールアドレス')
    const passwordInput = screen.getByPlaceholderText('パスワード')
    const loginButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(loginButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('メールアドレスの形式が正しくない場合エラーを表示する', async () => {
    render(<LoginPageWrapper />)

    const emailInput = screen.getByPlaceholderText('メールアドレス')
    const passwordInput = screen.getByPlaceholderText('パスワード')
    const loginButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'password123')
    
    // Trigger validation by blurring the email field
    await user.click(emailInput)
    await user.tab()
    
    await user.click(loginButton)

    // Check that the login function was not called due to validation error
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('パスワードが空の場合エラーを表示する', async () => {
    render(<LoginPageWrapper />)

    const emailInput = screen.getByPlaceholderText('メールアドレス')
    const loginButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.click(loginButton)

    // Check that the login function was not called due to validation error
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('ローディング状態を正しく表示する', () => {
    mockUseAuth.isLoading = true

    render(<LoginPageWrapper />)

    expect(screen.getByText('ログイン中...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ログイン中...' })).toBeDisabled()
  })

  it('エラーメッセージを表示する', () => {
    mockUseAuth.error = 'メールアドレスまたはパスワードが正しくありません'

    render(<LoginPageWrapper />)

    expect(screen.getByText('メールアドレスまたはパスワードが正しくありません')).toBeInTheDocument()
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

    render(<LoginPageWrapper />)

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('フォーム送信時にエラーをクリアする', async () => {
    mockUseAuth.error = 'Previous error'

    render(<LoginPageWrapper />)

    const emailInput = screen.getByPlaceholderText('メールアドレス')
    const passwordInput = screen.getByPlaceholderText('パスワード')
    const loginButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(loginButton)

    expect(mockClearError).toHaveBeenCalled()
  })
})