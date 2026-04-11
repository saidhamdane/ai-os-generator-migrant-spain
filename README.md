# MigrantCopilot Spain — مساعد المهاجر في إسبانيا

A personalized action planner for Arabic-speaking immigrants in Spain. Generates a step-by-step roadmap and document checklist based on your situation.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **i18n**: next-intl (Arabic RTL + Spanish)
- **Auth**: Supabase Auth (email + password)
- **Database**: PostgreSQL via Prisma (hosted on Supabase)
- **Payments**: Stripe
- **Email**: Resend
- **Deployment**: Vercel

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- Stripe account (test keys)
- Resend account (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/saidhamdane/ai-os-generator-migrant-spain.git
cd ai-os-generator-migrant-spain
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in all values in `.env`. See `.env.example` for descriptions.

Key variables:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project settings
- `DATABASE_URL` — Supabase Transaction Pooler connection string
- `DIRECT_URL` — Supabase Direct connection string (for migrations)
- `STRIPE_SECRET_KEY` + `STRIPE_PRO_PRICE_ID` — from Stripe dashboard
- `RESEND_API_KEY` — from Resend dashboard

### 3. Set up database

```bash
# Push schema to database
npm run db:push

# Seed procedure guides
npm run db:seed
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## VPS Deployment

### 1. Install dependencies

```bash
sudo apt update && sudo apt install -y nodejs npm git
node -v  # should be 18+
```

### 2. Clone repo and install

```bash
git clone https://github.com/saidhamdane/ai-os-generator-migrant-spain.git
cd ai-os-generator-migrant-spain
npm install
```

### 3. Set up environment

```bash
cp .env.example .env
nano .env  # fill in all values
```

### 4. Build and run with PM2

```bash
npm run build
npm install -g pm2
pm2 start npm --name "migrantcopilot" -- start
pm2 save
pm2 startup
```

### 5. Set up Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Configure Stripe webhook

In Stripe dashboard, add webhook endpoint:
`https://yourdomain.com/api/stripe/webhook`

Events to listen to:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### 7. Weekly reminders cron

Set up a cron job (or use Vercel Cron / GitHub Actions) to call:
```
POST https://yourdomain.com/api/cron/weekly-reminders
Authorization: Bearer YOUR_CRON_SECRET
```

Every Monday at 9:00 AM.

## Project Structure

```
app/
  [locale]/          # next-intl locale routing (ar, es)
    page.tsx         # Landing page
    (auth)/          # Login + Signup
    (app)/           # Authenticated app pages
  api/               # API route handlers
components/          # React components
lib/                 # Shared utilities
prisma/              # Database schema + seed
messages/            # i18n translation files (ar.json, es.json)
emails/              # React Email templates
types/               # TypeScript type definitions
```

## Free vs Pro

| Feature | Free | Pro (€9.99/mo) |
|---|---|---|
| Onboarding | ✅ | ✅ |
| Roadmap | First 2 steps | All steps |
| Checklist | First 3 items | Full + status update |
| Procedure guides | All 8 | All 8 + PDF |
| Reminders | ❌ | ✅ Email reminders |

## License

MIT
