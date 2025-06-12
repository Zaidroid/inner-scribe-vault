import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAuditLog } from './useAuditLog';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

// Mock useAuth
vi.mock('./useAuth', () => ({
    useAuth: () => ({
        user: { id: '123' },
    }),
}));

// Mock the supabase client
const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: mockInsert,
        })),
    }
}));

describe('useAuditLog Hook', () => {
  it('should call supabase.insert with the correct log data', async () => {
    const { result } = renderHook(() => useAuditLog());

    await result.current.addAuditLog('test_action', { foo: 'bar' });

    expect(supabase.from).toHaveBeenCalledWith('audit_logs');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: '123',
          event_type: 'test_action',
          metadata: { foo: 'bar' },
        })
      ])
    );
  });
}); 