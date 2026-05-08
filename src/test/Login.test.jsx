import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

// ─── Mocks ────────────────────────────────────────────────

const mockNavigate = vi.fn()
const mockLogin = vi.fn()
const mockGoogleLogin = vi.fn()
const mockToastError = vi.fn()
const mockToastSuccess = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    googleLogin: mockGoogleLogin,
  }),
}))

vi.mock('react-hot-toast', () => ({
  toast: {
    success: (...args) => mockToastSuccess(...args),
    error: (...args) => mockToastError(...args),
  },
}))

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess }) => (
    <button onClick={() => onSuccess({ credential: 'mock-token' })}>
      Google Login
    </button>
  ),
}))

// ─── Helper ───────────────────────────────────────────────

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

// ─── Tests ────────────────────────────────────────────────

describe('Login Component', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Rendering ──────────────────────────────────────────

  it('renders login form', () => {
    renderLogin()
    expect(screen.getByText('Customer Login')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login to Account' })).toBeInTheDocument()
  })

  // ─── Input ──────────────────────────────────────────────

  it('updates inputs', () => {
    renderLogin()

    const email = screen.getByPlaceholderText('name@example.com')
    const password = screen.getByPlaceholderText('••••••••')

    fireEvent.change(email, { target: { value: 'test@gmail.com' } })
    fireEvent.change(password, { target: { value: '123456' } })

    expect(email.value).toBe('test@gmail.com')
    expect(password.value).toBe('123456')
  })

  // ─── SUCCESS LOGIN ───────────────────────────────────────

  it('calls login and navigates for customer', async () => {
    mockLogin.mockResolvedValue({ role: 'customer' })

    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'test@gmail.com' },
    })

    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '123456' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Login to Account' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('navigates to staff-login for non customer', async () => {
    mockLogin.mockResolvedValue({ role: 'admin' })

    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'staff@gmail.com' },
    })

    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '123456' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Login to Account' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/staff-login')
    })
  })

  // ─── ERROR LOGIN FIX ─────────────────────────────────────

  it('shows toast error on login failure', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    })

    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'wrong@gmail.com' },
    })

    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpass' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Login to Account' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Invalid credentials')
    })
  })

  // ─── GOOGLE LOGIN FIX ────────────────────────────────────

  it('handles google login success and navigates', async () => {
    mockGoogleLogin.mockResolvedValue({ user: { role: 'customer' } })

    renderLogin()

    fireEvent.click(screen.getByText('Google Login'))

    await waitFor(() => {
      expect(mockGoogleLogin).toHaveBeenCalledWith('mock-token')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })
})