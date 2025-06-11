# Rollback Procedures

This document outlines the procedures for rolling back a deployment of the Inner Scribe Vault application in case of a critical issue with a new release.

## General Principles

- **Act Quickly:** The decision to roll back should be made quickly to minimize user impact.
- **Communication:** Inform team members and/or users about the issue and the rollback.
- **Post-mortem:** After a rollback, a post-mortem should be conducted to understand the root cause and prevent future occurrences.

## Rollback Strategy

The rollback strategy depends on the deployment environment and the nature of the change.

### Web Application

If the application is deployed as a web app (e.g., to Vercel, Netlify, or a custom server), rolling back is typically straightforward.

- **Using a Hosting Provider:** Platforms like Vercel and Netlify keep a history of deployments. You can roll back to a previous production deployment with a single click from their dashboard.
- **Manual Rollback:** If deployed manually, you can roll back by:
    1. Checking out the previous stable commit from Git.
    2. Rebuilding the application.
    3. Deploying the old version to the server.
    ```bash
    git checkout <previous_stable_commit_hash>
    npm install
    npm run build
    # ... deployment steps ...
    ```

### Electron Application

For the desktop application, a full rollback is more complex as users have already downloaded and installed the problematic version.

1.  **Release a Hotfix:** The primary strategy is to quickly release a new version that fixes the critical issue.
2.  **Communicate with Users:** Inform users about the issue and instruct them to upgrade to the new version as soon as possible. Use in-app notifications if available.
3.  **Pull the Release (if possible):** If the release is hosted on a platform like GitHub Releases, you can remove the problematic release to prevent further downloads.

### Database Changes

Database rollbacks are the most sensitive and require careful planning.

- **Backups:** Before any deployment that includes a database migration, ensure a fresh backup has been taken.
- **Reverting Migrations:** If a migration is causing issues, you may need to apply a "down" migration to revert the schema changes. This requires that you write down migrations for every up migration.
    ```sql
    -- Example of a down migration
    DROP TABLE IF EXISTS new_feature_table;
    ```
- **Restoring from Backup:** In a worst-case scenario, you may need to restore the database from the backup taken before the deployment. This will result in data loss for any transactions that occurred after the backup was made.

## Post-Rollback

1.  Analyze the cause of the failure.
2.  Create a ticket to fix the underlying issue.
3.  Improve testing and deployment processes to prevent similar issues in the future. 