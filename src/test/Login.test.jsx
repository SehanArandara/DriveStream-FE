import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

// ─── Mocks ────────────────────────────────────────────────

const mockNavigate = vi.fn()
const mockLogin = vi.fn()
const mockGoogleLogin = vi.fn()

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
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }) => (
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

describe('Login', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Rendering ──────────────────────────────────────────

  it('renders the login form', () => {
    renderLogin()
    expect(screen.getByText('Customer Login')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login to Account' })).toBeInTheDocument()
  })

  it('renders DriveStream brand', () => {
    renderLogin()
    expect(screen.getByText('DriveStream')).toBeInTheDocument()
  })

  it('renders forgot password link', () => {
    renderLogin()
    expect(screen.getByText('Forgot password?')).toBeInTheDocument()
  })

  it('renders register link', () => {
    renderLogin()
    expect(screen.getByText('Create one for free')).toBeInTheDocument()
  })

  it('renders Google login button', () => {
    renderLogin()
    expect(screen.getByText('Google Login')).toBeInTheDocument()
  })

  // ─── Input ──────────────────────────────────────────────

  it('updates email input on change', () => {
    renderLogin()
    const emailInput = screen.getByPlaceholderText('name@example.com')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    expect(emailInput.value).toBe('test@example.com')
  })

  it('updates password input on change', () => {
    renderLogin()
    const passwordInput = screen.getByPlaceholderText('••••••••')
    fireEvent.change(passwordInput, { target: { value: 'secret123' } })
    expect(passwordInput.value).toBe('secret123')
  })

  // ─── Submit ─────────────────────────────────────────────

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValue({ role: 'customer' })
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Login to Account' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('shows loading state while logging in', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve =>
      setTimeout(() => resolve({ role: 'customer' }), 500)
    ))
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Login to Account' }))

    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled()
  })

  // ─── Post Login Role Routing ─────────────────────────────

  it('navigates to / for customer role', async () => {
    mockLogin.mockResolvedValue({ role: 'customer' })
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Login to Account' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('navigates to /staff-login for non-customer role', async () => {
    mockLogin.mockResolvedValue({ role: 'admin' })
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'staff@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Login to Account' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/staff-login')
    })
  })

  // ─── Error Handling ──────────────────────────────────────

  it('shows toast error on login failure', async () => {
    const { toast } = await import('react-hot-toast')
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    })
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'wrong@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Login to Account' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })

  it('redirects to verify-otp when needsVerification is true', async () => {
    mockLogin.mockRejectedValue({
      response: {
        data: {
          needsVerification: true,
          userId: 'user-123',
          phone: '0771234567',
        },
      },
    })
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Login to Account' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/verify-otp', {
        state: { userId: 'user-123', phone: '0771234567' },
      })
    })
  })

  // ─── Google Login ────────────────────────────────────────

  it('calls googleLogin with credential on Google login success', async () => {
    mockGoogleLogin.mockResolvedValue({ role: 'customer' })
    renderLogin()

    fireEvent.click(screen.getByText('Google Login'))

    await waitFor(() => {
      expect(mockGoogleLogin).toHaveBeenCalledWith('mock-token')
    })
  })

  it('navigates to / after successful Google login as customer', async () => {
    mockGoogleLogin.mockResolvedValue({ role: 'customer' })
    renderLogin()

    fireEvent.click(screen.getByText('Google Login'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('shows error toast on Google login failure', async () => {
    const { toast } = await import('react-hot-toast')
    mockGoogleLogin.mockRejectedValue({
      response: { data: { message: 'Google auth failed' } },
    })
    renderLogin()

    fireEvent.click(screen.getByText('Google Login'))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Google auth failed')
    })
  })
})