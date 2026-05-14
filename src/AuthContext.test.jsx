import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Simple test component to consume AuthContext
const TestComponent = () => {
  const { user } = useAuth();
  return <div>{user ? 'Logged In' : 'Logged Out'}</div>;
};

describe('AuthContext', () => {
  it('provides authentication state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText('Logged Out')).toBeInTheDocument();
  });
});
