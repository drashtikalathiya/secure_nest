# SecureNest

SecureNest is a full‑stack family security vault with authentication, documents, contacts, passwords, and member management.

**Stack**

- Frontend: React + React Router + Tailwind
- Backend: NestJS + TypeORM + PostgreSQL
- Auth: Firebase (client + Admin SDK)
- Email: SMTP (Nodemailer)
- Payments: Stripe

**Repo Structure**

- `ui/` React frontend
- `backend/` NestJS API

**Requirements**

- Node.js (LTS recommended)
- npm
- PostgreSQL
- Firebase project (client + Admin SDK)
- SMTP provider (email)
- Stripe account (billing)

**Quick Start**

1. Install dependencies

```bash
cd backend && npm install
cd ../ui && npm install
```

2. Configure environment variables (see below)

3. Run both apps

```bash
# backend
cd backend && npm run start:dev

# frontend
cd ../ui && npm run start
```

## Environment Variables

**Frontend (`ui/.env`)**

```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

**Backend (`backend/.env`)**

```bash
# App
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=secure_nest

# Firebase Admin
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email (Gmail OAuth2)
MAIL_USER=your_gmail_address
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-google-refresh-token
MAIL_FROM=your_gmail_address
MAIL_FROM_NAME=SecureNest
SUPPORT_EMAIL=support@securenest.app

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_SMALL_PLAN_PRICE_ID=...
STRIPE_FAMILY_PLAN_PRICE_ID=...

# Neon (recommended)
# Use DATABASE_URL with sslmode=verify-full to avoid SSL warnings.
# DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=verify-full
```

## Build

```bash
# backend
cd backend && npm run build

# frontend
cd ../ui && npm run build
```

## Security Notes

- Ensure all private endpoints are protected with FirebaseAuthGuard.
- Use a secrets manager in production (avoid committing `.env`).

## Troubleshooting

- **Firebase errors:** verify all `REACT_APP_FIREBASE_*` and Admin SDK keys.
- **DB connection failed:** verify `DB_*` and that PostgreSQL is running.
- **Email not sending:** verify `MAIL_*` and SMTP access/credentials.
