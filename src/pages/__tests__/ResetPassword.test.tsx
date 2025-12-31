import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import ResetPasswordPage from '../ResetPassword'

const mockUseAuth = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReset()
    mockNavigate.mockReset()
  })

  it('shows an error when no user session is present', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      updatePassword: vi.fn(),
      signOut: vi.fn(),
    })

    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText(/reset link is invalid or has expired/i),
    ).toBeInTheDocument()
  })

  it('blocks submission when passwords do not match', async () => {
    const updatePassword = vi.fn()
    mockUseAuth.mockReturnValue({
      user: { id: '123' },
      loading: false,
      updatePassword,
      signOut: vi.fn(),
    })

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/new password/i), 'password-one')
    await user.type(screen.getByLabelText(/confirm password/i), 'password-two')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(screen.getByText(/passwords must match/i)).toBeInTheDocument()
    expect(updatePassword).not.toHaveBeenCalled()
  })

  it('updates password, signs out, and navigates to login on success', async () => {
    const updatePassword = vi.fn().mockResolvedValue({ error: null })
    const signOut = vi.fn().mockResolvedValue(undefined)

    mockUseAuth.mockReturnValue({
      user: { id: '123' },
      loading: false,
      updatePassword,
      signOut,
    })

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/new password/i), 'newpass123')
    await user.type(screen.getByLabelText(/confirm password/i), 'newpass123')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith('newpass123')
      expect(signOut).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })
})
