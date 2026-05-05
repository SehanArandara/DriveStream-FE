import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Register from '../pages/Register'

// ─── Mocks ────────────────────────────────────────────────

const mockNavigate = vi.fn()
const mockRegister = vi.fn()
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
        register: mockRegister,
        googleLogin: mockGoogleLogin,
    }),
}))

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

vi.mock('@react-oauth/google', () => ({
    GoogleLogin: ({ onSuccess, onError }) => (
        <button onClick={() => onSuccess({ credential: 'mock-google-token' })}>
            Google Register
        </button>
    ),
}))

// ─── Helper ───────────────────────────────────────────────

const renderRegister = () =>
    render(
        <MemoryRouter>
            <Register />
        </MemoryRouter>
    )

const fillForm = ({ name, email, phone, password } = {}) => {
    if (name) fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: name, name: 'name' } })
    if (email) fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: email, name: 'email' } })
    if (phone) fireEvent.change(screen.getByPlaceholderText('+94 7X XXX XXXX'), { target: { value: phone, name: 'phone' } })
    if (password) fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: password, name: 'password' } })
}

// ─── Tests ────────────────────────────────────────────────

describe('Register', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ─── Rendering ──────────────────────────────────────────

    it('renders the registration form', () => {
        renderRegister()
        // Use heading role to avoid matching the button text
        expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
        expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('+94 7X XXX XXXX')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    })
    
    it('renders DriveStream brand', () => {
        renderRegister()
        expect(screen.getByText('DriveStream')).toBeInTheDocument()
    })

    it('renders the submit button', () => {
        renderRegister()
        expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
    })

    it('renders Google register button', () => {
        renderRegister()
        expect(screen.getByText('Google Register')).toBeInTheDocument()
    })

    it('renders login link', () => {
        renderRegister()
        expect(screen.getByText('Login here')).toBeInTheDocument()
    })

    // ─── Input ──────────────────────────────────────────────

    it('updates name input on change', () => {
        renderRegister()
        const input = screen.getByPlaceholderText('John Doe')
        fireEvent.change(input, { target: { value: 'Alice', name: 'name' } })
        expect(input.value).toBe('Alice')
    })

    it('updates email input on change', () => {
        renderRegister()
        const input = screen.getByPlaceholderText('name@example.com')
        fireEvent.change(input, { target: { value: 'alice@example.com', name: 'email' } })
        expect(input.value).toBe('alice@example.com')
    })

    it('updates phone input on change', () => {
        renderRegister()
        const input = screen.getByPlaceholderText('+94 7X XXX XXXX')
        fireEvent.change(input, { target: { value: '+94771234567', name: 'phone' } })
        expect(input.value).toBe('+94771234567')
    })

    it('updates password input on change', () => {
        renderRegister()
        const input = screen.getByPlaceholderText('••••••••')
        fireEvent.change(input, { target: { value: 'secret123', name: 'password' } })
        expect(input.value).toBe('secret123')
    })

    // ─── Submit ─────────────────────────────────────────────

    it('calls api.post with correct form data on submit', async () => {
        const { default: api } = await import('../lib/api')
        api.post.mockResolvedValue({
            data: { message: 'OTP sent', userId: 'user-1', phone: '+94771234567' },
        })

        renderRegister()
        fillForm({
            name: 'Alice',
            email: 'alice@example.com',
            phone: '+94771234567',
            password: 'secret123',
        })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/register', {
                name: 'Alice',
                email: 'alice@example.com',
                phone: '+94771234567',
                password: 'secret123',
            })
        })
    })

    it('shows loading state while submitting', async () => {
        const { default: api } = await import('../lib/api')
        api.post.mockImplementation(() => new Promise(resolve =>
            setTimeout(() => resolve({
                data: { message: 'OTP sent', userId: 'u1', phone: '+94771234567' }
            }), 500)
        ))

        renderRegister()
        fillForm({ name: 'Alice', email: 'alice@example.com', phone: '+94771234567', password: 'pass' })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        expect(screen.getByRole('button', { name: 'Creating Account...' })).toBeDisabled()
    })

    it('shows success toast after registration', async () => {
        const { default: api } = await import('../lib/api')
        const { toast } = await import('react-hot-toast')
        api.post.mockResolvedValue({
            data: { message: 'OTP sent successfully', userId: 'u1', phone: '+94771234567' },
        })

        renderRegister()
        fillForm({ name: 'Alice', email: 'alice@example.com', phone: '+94771234567', password: 'pass' })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('OTP sent successfully')
        })
    })

    it('navigates to /verify-otp with userId and phone after registration', async () => {
        const { default: api } = await import('../lib/api')
        api.post.mockResolvedValue({
            data: { message: 'OTP sent', userId: 'user-42', phone: '+94771234567' },
        })

        renderRegister()
        fillForm({ name: 'Alice', email: 'alice@example.com', phone: '+94771234567', password: 'pass' })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/verify-otp', {
                state: { userId: 'user-42', phone: '+94771234567' },
            })
        })
    })

    // ─── Error Handling ──────────────────────────────────────

    it('shows error toast on registration failure', async () => {
        const { default: api } = await import('../lib/api')
        const { toast } = await import('react-hot-toast')
        api.post.mockRejectedValue({
            response: { data: { message: 'Email already exists' } },
        })

        renderRegister()
        fillForm({ name: 'Alice', email: 'alice@example.com', phone: '+94771234567', password: 'pass' })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Email already exists')
        })
    })

    it('shows fallback error toast when no message in response', async () => {
        const { default: api } = await import('../lib/api')
        const { toast } = await import('react-hot-toast')
        api.post.mockRejectedValue({})

        renderRegister()
        fillForm({ name: 'Alice', email: 'alice@example.com', phone: '+94771234567', password: 'pass' })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Registration failed')
        })
    })

    it('re-enables submit button after failure', async () => {
        const { default: api } = await import('../lib/api')
        api.post.mockRejectedValue({ response: { data: { message: 'Failed' } } })

        renderRegister()
        fillForm({ name: 'Alice', email: 'alice@example.com', phone: '+94771234567', password: 'pass' })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Create Account' })).not.toBeDisabled()
        })
    })

    // ─── Google Register ─────────────────────────────────────

    it('calls googleLogin with credential on Google register', async () => {
        mockGoogleLogin.mockResolvedValue({ role: 'customer' })
        renderRegister()

        fireEvent.click(screen.getByText('Google Register'))

        await waitFor(() => {
            expect(mockGoogleLogin).toHaveBeenCalledWith('mock-google-token')
        })
    })

    it('navigates to / for customer after Google register', async () => {
        mockGoogleLogin.mockResolvedValue({ role: 'customer' })
        renderRegister()

        fireEvent.click(screen.getByText('Google Register'))

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/')
        })
    })

    it('navigates to /staff-login for non-customer after Google register', async () => {
        mockGoogleLogin.mockResolvedValue({ role: 'admin' })
        renderRegister()

        fireEvent.click(screen.getByText('Google Register'))

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/staff-login')
        })
    })

    it('shows error toast on Google register failure', async () => {
        const { toast } = await import('react-hot-toast')
        mockGoogleLogin.mockRejectedValue({
            response: { data: { message: 'Google auth failed' } },
        })
        renderRegister()

        fireEvent.click(screen.getByText('Google Register'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Google auth failed')
        })
    })

    it('shows fallback error on Google register failure with no message', async () => {
        const { toast } = await import('react-hot-toast')
        mockGoogleLogin.mockRejectedValue({})
        renderRegister()

        fireEvent.click(screen.getByText('Google Register'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Google Registration failed')
        })
    })
})