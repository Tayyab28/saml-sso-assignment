# SAML SSO Demo

A minimal SAML 2.0 Single Sign-On implementation using Auth0 as the Identity Provider (IdP) and a Node.js/TypeScript application as the Service Provider (SP).

The project demonstrates both supported authentication flows:

- SP-initiated login — authentication starts from the application.
- IdP-initiated login — authentication starts from Auth0.

After successful SAML authentication, the backend validates the assertion, creates an application session, and exposes the authenticated user's identity to the frontend.

---

## Architecture

The application consists of two parts:

- **Backend:** Node.js, TypeScript, Express, and `@node-saml/node-saml`
- **Frontend:** React and TypeScript

The backend acts as the SAML Service Provider (SP), while Auth0 acts as the Identity Provider (IdP).

```text
                    ┌──────────────┐
                    │    Auth0     │
                    │     IdP      │
                    └──────┬───────┘
                           │
                    SAML Response
                           │
                           ▼
┌──────────────┐     ┌──────────────┐
│   React UI   │────▶│ Node /       │
│              │     │ Express SP   │
└──────────────┘     └──────┬───────┘
                             │
                       Validate SAML
                             │
                       Create Session
                             │
                             ▼
                      Authenticated User
```

---

## Project Structure

```text
saml-sso-assignment/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.middleware.ts
│   │   │   └── session.service.ts
│   │   ├── saml/
│   │   │   ├── assertion-replay.store.ts
│   │   │   ├── saml.config.ts
│   │   │   └── saml.service.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example
├── .gitignore
├── DECISIONS.md
└── README.md
``` 


## Prerequisites

Before running the project locally, make sure you have:

- Node.js 20+
- npm
- An Auth0 account
- An Auth0 application configured as a SAML Web App

The application is intended for local development and demonstration.


## Installation

Clone the repository and install dependencies for both the backend and frontend.

### Backend

```bash
cd backend
npm install
```

### Frontend
```bash
cd ../frontend
npm install
```

## Environment Configuration

Create the backend environment file:

```bash
cd backend
cp ../.env.example .env
```
The required variables are:

```env
SAML_ISSUER=
SAML_CALLBACK_URL=
SAML_ENTRY_POINT=
SAML_IDP_CERT=
```

### Frontend Environment

Create `frontend/.env.local`:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_AUTH0_IDP_LOGIN_URL=
```
Set VITE_AUTH0_IDP_LOGIN_URL to the IdP Login URL provided by Auth0.

## Auth0 Configuration

Configure Auth0 as the SAML Identity Provider (IdP).

Create a Regular Web Application in Auth0 and enable the **SAML2 Web App** addon.

Configure the SAML application with:

### Application Callback URL

http://localhost:3000/auth/saml/callback

### Application Audience URL

http://localhost:3000/auth/saml/metadata



## Running the Application

Start the backend first:

```bash
cd backend
npm run dev
```

Then frontend:
```bash
cd frontend
npm run dev
```

## Demo Flows

### SP-Initiated Login

1. Open the application at `http://localhost:5173`.
2. Click **Login via Application**.
3. The browser is redirected to Auth0.
4. Authenticate with the configured Auth0 connection.
5. Auth0 sends the SAML response to the backend ACS endpoint.
6. The backend validates the SAML response and assertion.
7. The backend creates an application session.
8. The browser is redirected back to the frontend.
9. The frontend calls `/auth/me` and displays the authenticated user's identity.

### IdP-Initiated Login

1. Open the application at `http://localhost:5173`.
2. Click **Login via Auth0**.
3. Authentication starts directly from the Auth0 Identity Provider.
4. Auth0 sends the SAML response to the backend ACS endpoint.
5. The backend validates the SAML response and creates an application session.
6. The browser is redirected to the frontend.
7. The authenticated user's identity is displayed.

Both flows use the same SAML ACS endpoint and result in the same application session.


## Logout

The demo provides local application logout.

Clicking **Logout**:

1. Deletes the server-side application session.
2. Clears the session cookie.
3. Removes the authenticated user from the frontend.

Full SAML Single Logout (SLO) is not implemented in this demo. The design considerations for production SLO are documented in `DECISIONS.md`.


## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/auth/saml/metadata` | Exposes the SP metadata |
| `GET` | `/auth/saml/login` | Starts SP-initiated SAML login |
| `POST` | `/auth/saml/callback` | Receives and validates the SAML response |
| `GET` | `/auth/me` | Returns the currently authenticated user |
| `POST` | `/auth/logout` | Logs out the current application session |

The `/auth/me` endpoint requires a valid application session.