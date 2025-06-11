# Troubleshooting Guide

This guide helps you resolve common issues you might encounter while using Inner Scribe Vault.

## Table of Contents
1.  [Obsidian Sync Issues](#obsidian-sync-issues)
2.  [Data Management Errors](#data-management-errors)
3.  [AI Provider Problems](#ai-provider-problems)
4.  [Performance Issues](#performance-issues)
5.  [General Application Errors](#general-application-errors)

---

### Obsidian Sync Issues

#### **Problem: Journal entries are not appearing in my Obsidian vault.**

*   **Solution 1: Check if Sync is Enabled.**
    1.  Go to `Settings` -> `Obsidian Integration`.
    2.  Ensure the "Enable Vault Sync" switch is turned on.

*   **Solution 2: Verify the Vault Path.**
    1.  In `Settings` -> `Obsidian Integration`, double-check the "Vault Path".
    2.  Make sure it is the correct, full path to your local Obsidian vault directory.
    3.  The path should be absolute (e.g., `C:\\Users\\YourUser\\Documents\\ObsidianVault` on Windows or `/Users/YourUser/Documents/ObsidianVault` on macOS/Linux).

*   **Solution 3: Check File Permissions.**
    1.  Ensure that the application has the necessary read and write permissions for the specified vault directory. This is a common issue on macOS and Windows.

---

### Data Management Errors

#### **Problem: I can't import my data from a backup file.**

*   **Solution 1: Verify the File Format.**
    1.  Ensure you are trying to import a `.json` file that was previously exported from this application.
    2.  The file should not be manually edited, as this can corrupt the structure and encryption.

*   **Solution 2: Check for Errors during Import.**
    1.  Open the developer console (`Ctrl+Shift+I` on Windows/Linux, `Cmd+Option+I` on macOS) before importing.
    2.  Look for any red error messages in the "Console" tab when the import fails. This can provide more details about the problem.

#### **Problem: Clearing my data failed.**

*   **Solution 1: Restart the Application.**
    1.  Close and reopen the application, then try clearing the data again.

---

### AI Provider Problems

#### **Problem: The AI features are not working.**

*   **Solution 1: Check your API Key.**
    1.  Go to `Settings` -> `AI Provider`.
    2.  Make sure you have selected the correct provider and entered a valid API key.

*   **Solution 2: Check your Internet Connection.**
    1.  AI features that use external providers require an active internet connection.

---

### Performance Issues

#### **Problem: The application feels slow or is lagging.**

*   **Solution 1: Restart the Application.**
    1.  A simple restart can often resolve temporary performance hiccups.

*   **Solution 2: Reduce the Amount of Data.**
    1.  If you have a very large number of journal entries or tasks, it might impact performance. Consider archiving or deleting old items if they are no longer needed.

---

### General Application Errors

#### **Problem: I'm seeing a blank screen or the app won't start.**

*   **Solution 1: Reset Application Data.**
    *   **Warning:** This is a last resort and will delete all your data if you don't have a backup.
    1.  Locate the application's data directory. This varies by operating system:
        *   **Windows:** `C:\\Users\\YourUser\\AppData\\Roaming\\InnerScribeVault`
        *   **macOS:** `/Users/YourUser/Library/Application Support/InnerScribeVault`
        *   **Linux:** `~/.config/InnerScribeVault`
    2.  Delete the contents of this directory.
    3.  Restart the application. It will start as if it were brand new. You can then import your data from a backup. 