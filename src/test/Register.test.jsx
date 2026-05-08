import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

// ─────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────
const mockNavigate = vi.fn();
const mockGoogleLogin = vi.fn();

vi.mock('../lib/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    googleLogin: mockGoogleLogin,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess }) => (
    <button
      onClick={() =>
        onSuccess({
          credential: 'mock-google-token',
        })
      }
    >
      Google Login
    </button>
  ),
}));

// ─────────────────────────────────────────────
// RENDER HELPER
// ─────────────────────────────────────────────
const renderComponent = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

// ─────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────
describe('Register Component', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // RENDER TEST
  // ─────────────────────────────────────────────
  test('renders registration form correctly', () => {

    renderComponent();

    expect(
      screen.getByRole('heading', {
        name: /create account/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('John Doe')
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('name@example.com')
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('+94 7X XXX XXXX')
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('••••••••')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /create account/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Google Login')
    ).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // INPUT CHANGE TEST
  // ─────────────────────────────────────────────
  test('updates form fields correctly', () => {

    renderComponent();

    const nameInput = screen.getByPlaceholderText('John Doe');
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const phoneInput = screen.getByPlaceholderText('+94 7X XXX XXXX');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(nameInput, {
      target: { value: 'Nadun' },
    });

    fireEvent.change(emailInput, {
      target: { value: 'nadun@gmail.com' },
    });

    fireEvent.change(phoneInput, {
      target: { value: '+94771234567' },
    });

    fireEvent.change(passwordInput, {
      target: { value: 'Password123' },
    });

    expect(nameInput.value).toBe('Nadun');
    expect(emailInput.value).toBe('nadun@gmail.com');
    expect(phoneInput.value).toBe('+94771234567');
    expect(passwordInput.value).toBe('Password123');
  });

  // ─────────────────────────────────────────────
  // SUCCESSFUL REGISTER
  // ─────────────────────────────────────────────
  test('submits registration form successfully', async () => {

    api.post.mockResolvedValue({
      data: {
        message: 'Registration successful',
        userId: '123',
        phone: '+94771234567',
      },
    });

    renderComponent();

    fireEvent.change(
      screen.getByPlaceholderText('John Doe'),
      {
        target: { value: 'Nadun' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText('name@example.com'),
      {
        target: { value: 'nadun@gmail.com' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText('+94 7X XXX XXXX'),
      {
        target: { value: '+94771234567' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText('••••••••'),
      {
        target: { value: 'Password123' },
      }
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /create account/i,
      })
    );

    await waitFor(() => {

      expect(api.post).toHaveBeenCalledWith(
        '/auth/register',
        {
          name: 'Nadun',
          email: 'nadun@gmail.com',
          password: 'Password123',
          phone: '+94771234567',
        }
      );

      expect(toast.success).toHaveBeenCalledWith(
        'Registration successful'
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/verify-otp',
        {
          state: {
            userId: '123',
            phone: '+94771234567',
          },
        }
      );
    });
  });

  // ─────────────────────────────────────────────
  // REGISTER FAILURE
  // ─────────────────────────────────────────────
  test('shows error toast when registration fails', async () => {

    api.post.mockRejectedValue({
      response: {
        data: {
          message: 'Registration failed',
        },
      },
    });

    renderComponent();

    fireEvent.change(
      screen.getByPlaceholderText('John Doe'),
      {
        target: { value: 'Nadun' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText('name@example.com'),
      {
        target: { value: 'nadun@gmail.com' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText('+94 7X XXX XXXX'),
      {
        target: { value: '+94771234567' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText('••••••••'),
      {
        target: { value: 'Password123' },
      }
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /create account/i,
      })
    );

    await waitFor(() => {

      expect(toast.error).toHaveBeenCalledWith(
        'Registration failed'
      );

    });
  });

  // ─────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────
  test('disables button while loading', async () => {

    api.post.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: {
                  message: 'Success',
                  userId: '123',
                  phone: '+94771234567',
                },
              }),
            100
          )
        )
    );

    renderComponent();

    fireEvent.change(
      screen.getByPlaceholderText('John Doe'),
      {
        target: { value: 'Nadun' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText('name@example.com'),
      {
        target: { value: 'nadun@gmail.com' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText('+94 7X XXX XXXX'),
      {
        target: { value: '+94771234567' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText('••••••••'),
      {
        target: { value: 'Password123' },
      }
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /create account/i,
      })
    );

    expect(
      screen.getByRole('button', {
        name: /creating account/i,
      })
    ).toBeDisabled();
  });

  // ─────────────────────────────────────────────
  // GOOGLE LOGIN SUCCESS
  // ─────────────────────────────────────────────
  test('handles google login success', async () => {

    mockGoogleLogin.mockResolvedValue({
      user: {
        role: 'customer',
      },
    });

    renderComponent();

    fireEvent.click(
      screen.getByText('Google Login')
    );

    await waitFor(() => {

      expect(mockGoogleLogin).toHaveBeenCalled();

      expect(toast.success).toHaveBeenCalledWith(
        'Welcome to DriveStream!'
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/dashboard'
      );

    });
  });

  // ─────────────────────────────────────────────
  // GOOGLE LOGIN FAILURE
  // ─────────────────────────────────────────────
  test('handles google login failure', async () => {

    mockGoogleLogin.mockRejectedValue({
      response: {
        data: {
          message: 'Google Registration failed',
        },
      },
    });

    renderComponent();

    fireEvent.click(
      screen.getByText('Google Login')
    );

    await waitFor(() => {

      expect(toast.error).toHaveBeenCalledWith(
        'Google Registration failed'
      );

    });
  });

});