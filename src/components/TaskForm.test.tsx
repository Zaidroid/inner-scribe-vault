import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskForm from './TaskForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock UI components that cause issues in JSDOM
vi.mock('@/components/ui/dialog', async () => {
    return {
      Dialog: ({ children, open }) => (open ? <div data-testid="dialog">{children}</div> : null),
      DialogContent: ({ children }) => <div>{children}</div>,
      DialogHeader: ({ children }) => <div>{children}</div>,
      DialogTitle: ({ children }) => <h2>{children}</h2>,
      DialogFooter: ({ children }) => <footer>{children}</footer>,
    };
});

// Mock Select components as well
vi.mock('@/components/ui/select', async () => {
    return {
        Select: ({ children, onValueChange }) => <div onChange={(e) => onValueChange(e.target.value)}>{children}</div>,
        SelectContent: ({ children }) => <>{children}</>,
        SelectItem: ({ children, value }) => <option value={value}>{children}</option>,
        SelectTrigger: ({ children }) => <>{children}</>,
        SelectValue: () => null,
    };
});

// Mock the necessary hooks
const mockAddTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockOnClose = vi.fn();

vi.mock('@/hooks/useSupabaseTasks', () => ({
  useSupabaseTasks: () => ({
    tasks: [],
    addTask: mockAddTask,
    updateTask: mockUpdateTask,
  }),
}));

vi.mock('@/hooks/useTaskTemplates', () => ({
  useTaskTemplates: () => ({
    createTemplate: vi.fn(),
  }),
}));

vi.mock('@/hooks/useUsers', () => ({
  useUsers: () => ({
    data: [{ id: 'user-1', full_name: 'Test User' }],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
  }),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock child components that also fetch data
vi.mock('./Comments', () => ({
  CommentsList: () => <div data-testid="comments-list" />,
}));
vi.mock('./RemindersManager', () => ({
  RemindersManager: () => <div data-testid="reminders-manager" />,
}));


const renderComponent = (task) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <TaskForm isOpen={true} onClose={mockOnClose} task={task} />
    </QueryClientProvider>
  );
};

describe('TaskForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders in create mode and submits a new task', async () => {
    renderComponent(undefined);
    
    expect(screen.getByText('Create Task')).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/title \*/i);
    await userEvent.type(titleInput, 'A brand new test task');

    const submitButton = screen.getByRole('button', { name: /save task/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledTimes(1);
      expect(mockAddTask).toHaveBeenCalledWith(expect.objectContaining({
        title: 'A brand new test task',
      }));
    });
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
}); 