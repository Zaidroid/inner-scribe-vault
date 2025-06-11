# Backup Strategy

This document outlines the backup strategy for the Inner Scribe Vault application data, which includes data stored in Supabase and the local Obsidian vault.

## Supabase Data

Supabase provides automated daily backups for projects on paid plans. For projects on the free plan, a manual backup strategy is required.

### Automated Backups (Paid Plan)

- Supabase automatically performs daily backups of the database.
- These backups can be restored directly from the Supabase dashboard.
- Point-in-time recovery is also available.

### Manual Backups (Free Plan)

1.  **Using the Supabase Dashboard:**
    - Navigate to the "Database" -> "Backups" section in your Supabase project dashboard.
    - You can trigger a manual backup at any time.

2.  **Using `pg_dump`:**
    - The database can be backed up using the `pg_dump` command-line utility.
    - The connection string can be found in your project's database settings.
    ```bash
    pg_dump -h <db_host> -U postgres -d postgres > backup.sql
    ```
    - It is recommended to automate this process using a cron job or a similar scheduler to run daily.

## Local Obsidian Vault

The user's local Obsidian vault is their responsibility to back up. However, the application can provide guidance and recommendations.

### User-Managed Backups

- Users should be encouraged to use their preferred backup solution for their local files (e.g., Time Machine, Windows Backup, cloud storage sync like Dropbox or Google Drive).
- The application could include a reminder or a setting to encourage users to set up backups for their vault.

### Application-Assisted Backups

- A future feature could be to add a "Backup Vault" button within the application that creates a zip archive of the user's vault and saves it to a location of their choice.

## Recovery

- **Supabase:** Restore from the automated or manual backups.
- **Obsidian Vault:** Restore from the user's backup solution. 