import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useProfile } from './useProfile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAuth } from './useAuth';

// Mock the encryption library
vi.mock('@/lib/encryption', () => ({
  // No need to implement, just mock the module
}));

// Mock useAuth
vi.mock('./useAuth', () => ({
    useAuth: () => ({
        user: { id: '123' },
    }),
}));

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => {
    const mockDb = {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({ data: { id: '123', full_name: 'Test User', avatar_url: 'test.png' }, error: null })
                }))
            }))
        })),
    };

    return {
        supabase: { ...mockDb }
    };
});

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useProfile Hook', () => {
  it('should fetch and return the user profile', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.profile).toEqual({
        id: '123',
        full_name: 'Test User',
        avatar_url: 'test.png',
      });
    });
  });
}); 