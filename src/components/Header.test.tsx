import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';
import { MemoryRouter } from 'react-router-dom'; // Use MemoryRouter for components with Links/UserMenu

describe('Header', () => {
  it('renders the header with global search', () => {
    // Mock the useModalStore as it's used in UserMenu
    vi.mock('@/hooks/useModalStore', () => ({
      useModalStore: () => ({
        openModal: vi.fn(),
      }),
    }));

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Check if an element with role "combobox" is present, which is what cmdk renders
    const searchInput = screen.getByRole('combobox');
    expect(searchInput).toBeInTheDocument();

    // You can also check for placeholder text
    expect(screen.getByPlaceholderText(/Search tasks, teams.../i)).toBeInTheDocument();
  });
}); 