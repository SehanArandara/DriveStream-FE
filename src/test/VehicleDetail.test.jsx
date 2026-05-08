import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import VehicleDetail from '../pages/VehicleDetail'

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
        get: vi.fn(),
    },
}))

vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}))

// ─── Mock Data ────────────────────────────────────────────

const mockVehicle = {
    brand: 'Toyota',
    model: 'Corolla',
    category: 'Sedan',
    registrationNumber: 'CAB-1234',
    manufactureYear: 2020,
    fuelType: 'Petrol',
    engineCapacity: 1800,
    chassisNumber: 'CH123456789',
}

const mockVehicleMinimal = {
    brand: 'Honda',
    model: 'Fit',
    category: 'Hatchback',
    registrationNumber: 'WP-5678',
    manufactureYear: 2018,
    fuelType: 'Hybrid',
    engineCapacity: null,
    chassisNumber: null,
}

// ─── Helper ───────────────────────────────────────────────

const renderVehicleDetail = (id = 'vehicle-1') =>
    render(
        <MemoryRouter initialEntries={[`/vehicles/${id}`]}>
            <Routes>
                <Route path="/vehicles/:id" element={<VehicleDetail />} />
            </Routes>
        </MemoryRouter>
    )

// ─── Tests ────────────────────────────────────────────────

describe('VehicleDetail', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ─── Loading State ───────────────────────────────────────

    it('shows loading screen initially', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockImplementation(() => new Promise(() => { })) // never resolves

        renderVehicleDetail()

        expect(screen.getByText('Loading Profile...')).toBeInTheDocument()
    })

    // ─── Vehicle Info ────────────────────────────────────────

    it('renders vehicle brand and model', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail()

        await waitFor(() => {
            expect(screen.getByText('Toyota Corolla')).toBeInTheDocument()
        })
    })

    it('renders vehicle category badge', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail()

        await waitFor(() => {
            expect(screen.getByText('Sedan')).toBeInTheDocument()
        })
    })

    it('renders registration number', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail()

        await waitFor(() => {
            expect(screen.getByText('CAB-1234')).toBeInTheDocument()
        })
    })

    it('renders manufacture year', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail()

        await waitFor(() => {
            expect(screen.getByText('2020')).toBeInTheDocument()
        })
    })

    it('renders fuel type', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail()

        await waitFor(() => {
            expect(screen.getByText('Petrol')).toBeInTheDocument()
        })
    })

    it('renders engine capacity with CC unit', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail()

        await waitFor(() => {
            expect(screen.getByText('1800 CC')).toBeInTheDocument()
        })
    })

    it('renders chassis number', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail()

        await waitFor(() => {
            expect(screen.getByText('CH123456789')).toBeInTheDocument()
        })
    })

    // ─── Fallback Values ─────────────────────────────────────

    it('shows Not Specified when engine capacity is null', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicleMinimal })

        renderVehicleDetail()

        await waitFor(() => {
            expect(screen.getAllByText('Not Specified').length).toBeGreaterThanOrEqual(1)
        })
    })

    it('shows Not Specified when chassis number is null', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicleMinimal })

        renderVehicleDetail()

        await waitFor(() => {
            expect(screen.getAllByText('Not Specified').length).toBeGreaterThanOrEqual(2)
        })
    })

    // ─── Service History ─────────────────────────────────────

    it('renders service history section', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail()

        await waitFor(() => {
            expect(screen.getByText('Service History')).toBeInTheDocument()
        })
    })

    it('shows empty service history message', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail()

        await waitFor(() => {
            expect(screen.getByText('No service history found for this vehicle.')).toBeInTheDocument()
            expect(screen.getByText('History will appear here after your first service job.')).toBeInTheDocument()
        })
    })

    // ─── API Call ────────────────────────────────────────────

    it('calls api.get with correct vehicle id', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail('vehicle-99')

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/vehicles/vehicle-99')
        })
    })

    // ─── Error Handling ──────────────────────────────────────

    it('shows error toast when API fails', async () => {
        const { default: api } = await import('../lib/api')
        const { toast } = await import('react-hot-toast')
        api.get.mockRejectedValue(new Error('Network Error'))

        renderVehicleDetail()

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Could not load vehicle profile')
        })
    })

    it('navigates to /vehicles on API failure', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockRejectedValue(new Error('Network Error'))

        renderVehicleDetail()

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/vehicles')
        })
    })

    // ─── Navigation ──────────────────────────────────────────

    it('navigates back to /vehicles when Back to Garage is clicked', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail()

        await waitFor(() => screen.getByText('Back to Garage'))
        await userEvent.click(screen.getByText('Back to Garage'))

        expect(mockNavigate).toHaveBeenCalledWith('/vehicles')
    })

    it('navigates to /bookings when Book Service is clicked', async () => {
        const { default: api } = await import('../lib/api')
        api.get.mockResolvedValue({ data: mockVehicle })

        renderVehicleDetail()

        await waitFor(() => screen.getByText('Book Service'))
        await userEvent.click(screen.getByText('Book Service'))

        expect(mockNavigate).toHaveBeenCalledWith('/bookings')
    })
})