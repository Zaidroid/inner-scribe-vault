# Inner Scribe Vault - Developer Guide

This guide is for developers who want to contribute to the Inner Scribe Vault project. It covers how to set up your local development environment, understand the project structure, and follow our development practices.

## 1. Project Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Installation
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd inner-scribe-vault
    ```

2.  **Install npm dependencies:**
    ```bash
    npm install
    ```

3.  **Set up local Supabase environment:**
    - First, start the Supabase services (this will download the necessary Docker images):
      ```bash
      npx supabase start
      ```
    - This command will output your local Supabase credentials (API URL, anon key, etc.).

4.  **Configure environment variables:**
    - Create a new file named `.env.local` in the root of the project.
    - Copy the Supabase credentials from the `npx supabase start` output into this file:
      ```
      VITE_SUPABASE_URL=http://127.0.0.1:54321
      VITE_SUPABASE_ANON_KEY=your-local-anon-key
      ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173`.

## 2. Project Structure

```
/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # Third-party service integrations (Supabase, etc.)
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components for each route
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main application component with routing
│   └── main.tsx           # Application entry point
├── supabase/
│   ├── functions/         # Supabase Edge Functions
│   ├── migrations/        # Database schema migrations
│   └── config.toml        # Supabase project configuration
├── .env.local             # Local environment variables (untracked)
├── package.json
└── TODO.md                # Development task list
```

## 3. Database Migrations

This project uses the Supabase CLI to manage database schema changes.

- **Creating a new migration:**
  - To make a change to the database schema (e.g., add a table or a column), create a new SQL file in the `supabase/migrations` directory.
  - The file name must follow the format `<timestamp>_<description>.sql`. For example: `20240802_add_user_prefs.sql`.

- **Applying migrations:**
  - To apply new migrations to your local database, you can either restart the Supabase services or run the reset command:
    ```bash
    # This will wipe your local database and re-apply all migrations from the beginning.
    npx supabase db reset
    ```

- **Generating types from schema:**
  - After making changes to the database schema, you must regenerate the TypeScript types for the Supabase client. This ensures type safety and autocompletion.
    ```bash
    npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
    ```
    (Note: Replace `<your-project-id>` with the actual ID from your `config.toml` if needed, although it's often not required for local type generation.)

## 4. Supabase Edge Functions

- **Creating a new function:**
  ```bash
  npx supabase functions new <function-name>
  ```
- **Deploying a function:**
  ```bash
  npx supabase functions deploy <function-name>
  ```
- **Local development:** The `npx supabase start` command also serves functions locally for testing.

## 5. Coding Conventions

- **State Management**: We use `@tanstack/react-query` (React Query) for server state management (fetching, caching, updating data) and standard React hooks (`useState`, `useContext`) for UI state.
- **Styling**: We use [shadcn/ui](https://ui.shadcn.com/), which is built on top of Tailwind CSS. Create new components using the shadcn CLI where possible.
- **Linting & Formatting**: The project is set up with ESLint and Prettier. Please ensure your code adheres to the established rules.
- **Commits**: Follow conventional commit standards (e.g., `feat:`, `fix:`, `docs:`).

---
Thank you for contributing! 