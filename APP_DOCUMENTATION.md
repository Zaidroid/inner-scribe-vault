# Inner Scribe Vault - Application Documentation

## Overview
Inner Scribe Vault is a personal productivity and journaling application designed to integrate with Obsidian vaults. The application provides a modern interface for managing tasks, habits, journaling, and financial tracking while maintaining synchronization with local Obsidian vaults.

## Core Features

### 1. Authentication & User Management
- User authentication system
- Protected routes for authenticated users
- User settings and preferences management
- Theme customization (light/dark mode)

### 2. Dashboard
- Overview of key metrics and statistics
- Quick actions for common tasks
- AI-powered insights
- Recent activities and updates

### 3. Task Management
- Kanban-style task board
- Customizable columns
- Task analytics and tracking
- Task editing and creation modals
- Export functionality

### 4. Habit Tracking
- Habit creation and management
- Progress tracking
- Habit cards with visual feedback
- Habit analytics

### 5. Journaling
- Journal entry creation
- Mood tracking
- Meditation timer integration
- Journal analytics

### 6. Financial Management
- Financial tracking and analytics
- Budget management
- Expense tracking
- Financial insights

### 7. Settings & Configuration
- User preferences
- AI provider configuration
- Theme settings
- Integration settings

## Technical Architecture

### Frontend
- Built with React and TypeScript
- Uses Vite as the build tool
- Implements Tailwind CSS for styling
- Component-based architecture

### Components Structure
- UI Components (`/components/ui`)
- Feature-specific components
- Modal components for various actions
- Layout components
- Analytics and visualization components

### Pages
- Dashboard
- Tasks
- Habits
- Journal
- Finance
- Settings
- Authentication
- 404 Not Found

### Integrations
- Supabase integration for backend services
- Obsidian vault integration (pending implementation)

## Current Status

### Implemented Features
- User authentication system
- Task management system
- Habit tracking
- Journaling functionality
- Financial tracking
- Theme customization
- Basic analytics
- Export functionality

### Pending Features
1. Obsidian Vault Integration
   - Local vault connection
   - File synchronization
   - Markdown rendering
   - Bidirectional sync

2. Enhanced Analytics
   - More detailed insights
   - Custom report generation
   - Data visualization improvements

3. Collaboration Features
   - Shared workspaces
   - Team features
   - Real-time updates

4. Mobile Responsiveness
   - Optimize for mobile devices
   - Touch-friendly interface
   - Mobile-specific features

## Security Considerations
- Protected routes implementation
- Secure authentication
- Data encryption
- Local storage security

## Performance Considerations
- Lazy loading of components
- Optimized data fetching
- Caching strategies
- Error boundary implementation 