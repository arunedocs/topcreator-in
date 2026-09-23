# TopCreator.in

A gamified, viral micro-SaaS for the Indian creator economy — a live pay-to-rank leaderboard where YouTubers bid via UPI/Razorpay to claim #1 in niche categories.

Inspired by [outbid.lol](https://outbid.lol/).

## Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, Lucide React
- **Backend:** Server Actions + API routes
- **Database:** Prisma + SQLite (swap to PostgreSQL/Supabase for production)
- **Payments:** Razorpay placeholder (mock flow in dev)

## Getting started

```bash
npm install
npm run db:setup   # generate client, push schema, seed demo data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env` and set:

```env
DATABASE_URL="file:./dev.db"
RAZORPAY_KEY_ID="your_key"
RAZORPAY_KEY_SECRET="your_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Without real Razorpay keys, the app uses a **mock payment flow** so you can test bids end-to-end.

## Features

- Dark-mode landing page with hero CTA
- Category tabs: Tech, Gaming, Vlogs, Comedy, Finance
- Live leaderboard cards with rank, avatar, subs, bid amount
- Outbid modal with ₹20 minimum increment rule
- Share/flex modal for #1 holders (X + Instagram caption copy)

## Project structure

```
src/
  app/                 # Routes & API
  actions/bids.ts      # Server actions for orders + confirmation
  components/          # UI modules
  lib/                 # Prisma, Razorpay, utils, constants
prisma/
  schema.prisma        # CreatorBid model
  seed.ts              # Demo Indian creator data
```

## Bid rules

- First bid in a category: **₹49** minimum
- Outbid #1: current top bid **+ ₹20**
- Rank = bid amount (higher wins)

## Deploy

1. Switch `DATABASE_URL` to PostgreSQL (Supabase connection string)
2. Add Razorpay live keys
3. Deploy to Vercel

```bash
npm run build
```
