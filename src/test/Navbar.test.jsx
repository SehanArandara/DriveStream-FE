import { render, screen } from '@testing-library/react'
import Navbar from '../components/Navbar'

const mockUserWithAvatar = {
    name: 'John Doe',
    role: 'Admin',
    avatar: 'https://example.com/avatar.jpg',
}

const mockUserWithoutAvatar = {
    name: 'Jane Smith',
    role: 'Driver',
    avatar: null,
}

describe('Navbar', () => {

    // ─── Rendering ───────────────────────────────────────────

    it('renders without crashing', () => {
        render(<Navbar />)
        expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('renders empty portal label when user is undefined', () => {
        render(<Navbar />)
        expect(screen.getByText(/Portal/i)).toBeInTheDocument()
        expect(screen.queryByText('undefined Portal')).not.toBeInTheDocument()
    })

    // ─── User Info ────────────────────────────────────────────

    it('displays the user name', () => {
        render(<Navbar user={mockUserWithAvatar} />)
        expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('displays the user role with Portal suffix', () => {
        render(<Navbar user={mockUserWithAvatar} />)
        expect(screen.getByText('Admin Portal')).toBeInTheDocument()
    })

    it('displays role in uppercase', () => {
        render(<Navbar user={mockUserWithAvatar} />)
        const roleEl = screen.getByText('Admin Portal')
        expect(roleEl).toHaveClass('uppercase')
    })

    // ─── Avatar ───────────────────────────────────────────────

    it('renders avatar image when user has avatar', () => {
        render(<Navbar user={mockUserWithAvatar} />)
        const img = screen.getByAltText('avatar')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('renders first letter of name when no avatar', () => {
        render(<Navbar user={mockUserWithoutAvatar} />)
        expect(screen.getByText('J')).toBeInTheDocument()
    })

    it('renders uppercased first letter of name', () => {
        render(<Navbar user={{ ...mockUserWithoutAvatar, name: 'alice' }} />)
        expect(screen.getByText('A')).toBeInTheDocument()
    })

    // ─── Different Roles ──────────────────────────────────────

    it('displays correct portal label for Driver role', () => {
        render(<Navbar user={mockUserWithoutAvatar} />)
        expect(screen.getByText('Driver Portal')).toBeInTheDocument()
    })

    it('displays correct portal label for Admin role', () => {
        render(<Navbar user={mockUserWithAvatar} />)
        expect(screen.getByText('Admin Portal')).toBeInTheDocument()
    })
})