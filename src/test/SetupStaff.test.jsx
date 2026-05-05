import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SetupStaff from '../pages/SetupStaff'

// ─── Mocks ────────────────────────────────────────────────

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../lib/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// ─── Helper ───────────────────────────────────────────────

const renderSetupStaff = () =>
  render(
    <MemoryRouter>
      <SetupStaff />
    </MemoryRouter>
  )

const fillForm = ({ email, token, password, confirm } = {}) => {
  if (email)    fireEvent.change(screen.getByPlaceholderText('name@drivestream.lk'), { target: { value: email } })
  if (token)    fireEvent.change(screen.getByPlaceholderText('TOKEN'),               { target: { value: token } })

  // Two password fields share same placeholder — get by index
  const passwordFields = screen.getAllByPlaceholderText('••••••••')
  if (password) fireEvent.change(passwordFields[0], { target: { value: password } })
  if (confirm)  fireEvent.change(passwordFields[1], { target: { value: confirm } })
}

// ─── Tests ────────────────────────────────────────────────

describe('SetupStaff', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Rendering ──────────────────────────────────────────

  it('renders the setup form', () => {
    renderSetupStaff()
    expect(screen.getByText('Staff Setup')).toBeInTheDocument()
    expect(screen.getByText('Complete your account activation')).toBeInTheDocument()
  })

  it('renders all input fields', () => {
    renderSetupStaff()
    expect(screen.getByPlaceholderText('name@drivestream.lk')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('TOKEN')).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2)
  })

  it('renders the submit button', () => {
    renderSetupStaff()
    expect(screen.getByRole('button', { name: 'Complete Activation' })).toBeInTheDocument()
  })

  it('submit button is enabled by default', () => {
    renderSetupStaff()
    expect(screen.getByRole('button', { name: 'Complete Activation' })).not.toBeDisabled()
  })

  // ─── Input ──────────────────────────────────────────────

  it('updates email input on change', () => {
    renderSetupStaff()
    const input = screen.getByPlaceholderText('name@drivestream.lk')
    fireEvent.change(input, { target: { value: 'staff@drivestream.lk' } })
    expect(input.value).toBe('staff@drivestream.lk')
  })

  it('converts setup token to uppercase', () => {
    renderSetupStaff()
    const input = screen.getByPlaceholderText('TOKEN')
    fireEvent.change(input, { target: { value: 'abc123' } })
    expect(input.value).toBe('ABC123')
  })

  it('updates new password input on change', () => {
    renderSetupStaff()
    const passwordFields = screen.getAllByPlaceholderText('••••••••')
    fireEvent.change(passwordFields[0], { target: { value: 'newpass123' } })
    expect(passwordFields[0].value).toBe('newpass123')
  })

  it('updates confirm password input on change', () => {
    renderSetupStaff()
    const passwordFields = screen.getAllByPlaceholderText('••••••••')
    fireEvent.change(passwordFields[1], { target: { value: 'newpass123' } })
    expect(passwordFields[1].value).toBe('newpass123')
  })

  // ─── Password Mismatch ───────────────────────────────────

  it('shows error toast when passwords do not match', async () => {
    const { toast } = await import('react-hot-toast')
    renderSetupStaff()

    fillForm({
      email: 'staff@drivestream.lk',
      token: 'TOKEN123',
      password: 'password123',
      confirm: 'differentpass',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Complete Activation' }))

    expect(toast.error).toHaveBeenCalledWith('Passwords do not match')
  })

  it('does not call api when passwords do not match', async () => {
    const { default: api } = await import('../lib/api')
    renderSetupStaff()

    fillForm({
      email: 'staff@drivestream.lk',
      token: 'TOKEN123',
      password: 'password123',
      confirm: 'differentpass',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Complete Activation' }))

    expect(api.post).not.toHaveBeenCalled()
  })

  // ─── Submit ─────────────────────────────────────────────

  it('calls api.post with correct payload on submit', async () => {
    const { default: api } = await import('../lib/api')
    api.post.mockResolvedValue({ data: { message: 'Account activated' } })

    renderSetupStaff()
    fillForm({
      email: 'staff@drivestream.lk',
      token: 'SETUP123',
      password: 'newpass123',
      confirm: 'newpass123',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Complete Activation' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/setup-staff-password', {
        email: 'staff@drivestream.lk',
        setupToken: 'SETUP123',
        newPassword: 'newpass123',
      })
    })
  })

  it('shows loading state while submitting', async () => {
    const { default: api } = await import('../lib/api')
    api.post.mockImplementation(() => new Promise(resolve =>
      setTimeout(() => resolve({ data: { message: 'Done' } }), 500)
    ))

    renderSetupStaff()
    fillForm({
      email: 'staff@drivestream.lk',
      token: 'SETUP123',
      password: 'newpass123',
      confirm: 'newpass123',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Complete Activation' }))

    expect(screen.getByRole('button', { name: 'Setting up...' })).toBeDisabled()
  })

  it('shows success toast after activation', async () => {
    const { default: api } = await import('../lib/api')
    const { toast } = await import('react-hot-toast')
    api.post.mockResolvedValue({ data: { message: 'Account activated successfully' } })

    renderSetupStaff()
    fillForm({
      email: 'staff@drivestream.lk',
      token: 'SETUP123',
      password: 'newpass123',
      confirm: 'newpass123',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Complete Activation' }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Account activated successfully')
    })
  })

  it('navigates to /login after successful activation', async () => {
    const { default: api } = await import('../lib/api')
    api.post.mockResolvedValue({ data: { message: 'Done' } })

    renderSetupStaff()
    fillForm({
      email: 'staff@drivestream.lk',
      token: 'SETUP123',
      password: 'newpass123',
      confirm: 'newpass123',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Complete Activation' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  // ─── Error Handling ──────────────────────────────────────

  it('shows error toast on API failure', async () => {
    const { default: api } = await import('../lib/api')
    const { toast } = await import('react-hot-toast')
    api.post.mockRejectedValue({
      response: { data: { message: 'Invalid token' } },
    })

    renderSetupStaff()
    fillForm({
      email: 'staff@drivestream.lk',
      token: 'BADTOKEN',
      password: 'newpass123',
      confirm: 'newpass123',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Complete Activation' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid token')
    })
  })

  it('shows fallback error toast when no message in response', async () => {
    const { default: api } = await import('../lib/api')
    const { toast } = await import('react-hot-toast')
    api.post.mockRejectedValue({})

    renderSetupStaff()
    fillForm({
      email: 'staff@drivestream.lk',
      token: 'BADTOKEN',
      password: 'newpass123',
      confirm: 'newpass123',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Complete Activation' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Setup failed')
    })
  })

  it('re-enables submit button after failure', async () => {
    const { default: api } = await import('../lib/api')
    api.post.mockRejectedValue({ response: { data: { message: 'Failed' } } })

    renderSetupStaff()
    fillForm({
      email: 'staff@drivestream.lk',
      token: 'BADTOKEN',
      password: 'newpass123',
      confirm: 'newpass123',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Complete Activation' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Complete Activation' })).not.toBeDisabled()
    })
  })
})