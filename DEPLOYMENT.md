# Deployment Documentation

This document provides instructions for deploying the Inner Scribe Vault application.

## Prerequisites

- Node.js (v20.x or later)
- npm
- Access to the production environment

## Deployment Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/inner-scribe-vault.git
    cd inner-scribe-vault
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the application:**
    ```bash
    npm run build
    ```

4.  **Run the application:**
    The method for running the application will depend on the target environment (e.g., running the Electron app, deploying a web version to a server).

    *For Electron:*
    The build process will generate distributable files in the `dist` or a similar directory.

    *For Web:*
    The contents of the `dist` folder can be served by a web server.

## Configuration

Environment variables and other configuration details should be managed according to the deployment environment's best practices. 