import { render, screen, waitFor } from '../test-utils';
import { describe, it, expect, vi } from 'vitest';
import Settings from './Settings';

// Mock the encryption library to avoid worker errors
vi.mock('@/lib/encryption', () => ({
  encrypt: vi.fn((data) => Promise.resolve(JSON.stringify(data))),
  decrypt: vi.fn((data) => Promise.resolve(JSON.parse(data))),
  deriveKey: vi.fn(() => 'mock-key'),
  setSessionKey: vi.fn(),
  generateSalt: vi.fn(() => 'mock-salt'),
  decryptWithKey: vi.fn((data) => data),
}));

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => {
    const mockAuth = {
        onAuthStateChange: vi.fn((callback) => {
            setTimeout(() => {
                callback('SIGNED_IN', { user: { id: '123', email: 'test@test.com', user_metadata: { full_name: 'Test User' } } });
            }, 0);
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        }),
        getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '123', email: 'test@test.com', user_metadata: { full_name: 'Test User' } } } } }),
        updateUser: vi.fn().mockResolvedValue({ error: null }),
    };

    const mockStorage = {
        from: vi.fn().mockReturnThis(),
        upload: vi.fn().mockResolvedValue({ data: { path: 'new-avatar.png' }, error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: '/new-avatar.png' } })),
    };

    const mockDb = {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({ data: { id: '123', full_name: 'Test User', avatar_url: '' }, error: null })
                }))
            }))
        })),
    };

    return {
        supabase: {
            auth: mockAuth,
            storage: mockStorage,
            ...mockDb,
        }
    };
});

vi.mock('@/hooks/useAuditLog', () => ({
  useAuditLog: () => ({
    addAuditLog: vi.fn(),
  }),
}));

describe('Settings Page Rendering', () => {
  it('should render the settings heading', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /settings/i, level: 1 })).toBeInTheDocument();
    });
  });
}); 