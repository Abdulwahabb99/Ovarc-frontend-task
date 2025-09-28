import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider } from '../../contexts/AuthContext';
import AuthButton from '../AuthButton';

// Mock the API client
vi.mock('../../api/client', () => ({
  api: {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    },
  },
}));

const renderWithAuth = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthButton', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Mock getCurrentUser to resolve immediately (no user)
    const { api } = await import('../../api/client');
    api.auth.getCurrentUser.mockResolvedValue({ success: false });
  });

  it('renders sign in button when user is not authenticated', async () => {
    renderWithAuth(<AuthButton />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  it('shows login form when sign in button is clicked', async () => {
    renderWithAuth(<AuthButton />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Sign In'));
    
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls login API when form is submitted', async () => {
    const { api } = await import('../../api/client');
    api.auth.login.mockResolvedValue({ success: true, user: { name: 'Test User' } });

    renderWithAuth(<AuthButton />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Sign In'));
    
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'testpass' }
    });
    
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(api.auth.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass'
      });
    });
  });
});
