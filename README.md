# SecureNest

> Full-stack SecureNest family vault with a NestJS backend and a React UI.

**Repo Structure**

- `backend/` NestJS API, TypeORM, PostgreSQL, Stripe
- `ui/` React + React Router frontend, Firebase Auth, Cloudinary

## Prerequisites

- Node.js + npm
- PostgreSQL (local) or Neon (hosted)
- Firebase project (Auth enabled)
- Cloudinary account (uploads)
- SMTP provider (email)
- Stripe account (billing)

## Clone or download

```terminal
git clone https://github.com/The-Flex-Team/secure-nest.git
```

## Backend Setup

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure environment variables in `backend/.env`

```bash
# App
FRONTEND_URL=http://localhost:3000
PORT=3001

# Database (local / hosted)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/secure_nest
# Example (Neon)
# DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=verify-full

# Firebase Admin
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email (SMTP)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your_smtp_username
MAIL_PASS=your_smtp_password
MAIL_FROM=no-reply@securenest.app
MAIL_FROM_NAME=SecureNest
SUPPORT_EMAIL=support@securenest.app

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_SMALL_PLAN_PRICE_ID=...
STRIPE_FAMILY_PLAN_PRICE_ID=...

# Cloudinary (backend uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

3. Run the backend

```bash
npm run start:dev
```

Backend defaults to `http://localhost:3001`.

## UI Setup

1. Install dependencies

```bash
cd ui
npm install
```

2. Configure environment variables in `ui/.env`

```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

3. Run the UI

```bash
npm run start
```

UI defaults to `http://localhost:3000`.

## Firebase Notes

1. Enable Email/Password in Firebase Console → Authentication → Sign-in method.
2. Add your frontend domain to Authorized domains for password reset links.

## Stripe Notes

1. Create a webhook endpoint in Stripe and use its signing secret in `STRIPE_WEBHOOK_SECRET`.
2. Ensure your success/cancel URLs match the UI domain.

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
- **DB connection failed:** verify `DB_*` or `DATABASE_URL`.
- **Email not sending:** verify `MAIL_*` and SMTP access/credentials.
