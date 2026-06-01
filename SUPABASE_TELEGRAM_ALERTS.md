# Supabase → Telegram Alerts for Tutoring Capital

This adds a Telegram alert whenever a new row is inserted into `public.tutoring_inquiries`.

## What this solves

Your website already saves intake form submissions into Supabase through `tutoring-intake.html`.

This new step sends you a Telegram message as soon as someone submits the form, so you do not have to keep checking the database manually.

## Files added

- `supabase/functions/tutoring-telegram-alert/index.ts`

## How it works

1. A visitor submits `tutoring-intake.html`
2. The page inserts a row into `public.tutoring_inquiries`
3. A Supabase Database Webhook fires on `INSERT`
4. The webhook calls a Supabase Edge Function
5. The Edge Function sends a Telegram message using your bot token

## Why use an Edge Function instead of calling Telegram directly from the database webhook?

This is the safer setup because:
- your Telegram bot token stays in Supabase secrets
- the database webhook only needs a shared secret header
- you can format the message cleanly before sending it
- you can later add filters, logging, spam checks, or multiple alerts

## 1. Deploy the Edge Function

From a machine with the Supabase CLI installed and authenticated:

```bash
supabase functions deploy tutoring-telegram-alert
```

## 2. Set the required secrets in Supabase

In Supabase, open:
- `Project Settings` → `Edge Functions` or `Secrets`

Add these secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `SUPABASE_WEBHOOK_SECRET`

Suggested values:

- `TELEGRAM_BOT_TOKEN` = your Telegram bot token
- `TELEGRAM_CHAT_ID` = the chat ID where you want alerts delivered
- `SUPABASE_WEBHOOK_SECRET` = a long random string you create just for this webhook

CLI version:

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... SUPABASE_WEBHOOK_SECRET=...
```

## 3. Create the Database Webhook

In Supabase dashboard:

1. Open `Database`
2. Open `Webhooks`
3. Click `Create a new webhook`
4. Set:
   - **Name:** `tutoring-inquiry-telegram-alert`
   - **Table:** `public.tutoring_inquiries`
   - **Events:** `Insert`
   - **Type:** `HTTP Request`
   - **URL:**

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/tutoring-telegram-alert
```

5. Add this header:

```text
x-webhook-secret: YOUR_SUPABASE_WEBHOOK_SECRET
```

6. Save the webhook

## 4. Test it

### Option A: test from the website

1. Open `tutoring-intake.html`
2. Submit a real test inquiry
3. Confirm:
   - the row appears in `tutoring_inquiries`
   - a Telegram message arrives

### Option B: test with SQL

Run this in Supabase SQL Editor:

```sql
insert into public.tutoring_inquiries (
  parent_name,
  email,
  student_level,
  course,
  preferred_format,
  goal,
  details,
  source,
  status,
  honeypot
) values (
  'Test Parent',
  'test@example.com',
  'High school',
  'Algebra II',
  'Online',
  'Prepare for the next exam',
  'Testing Telegram alert flow.',
  'website',
  'new',
  ''
);
```

## 5. Expected Telegram message

The alert includes:
- name
- student level
- course
- preferred format
- email
- phone
- goal
- details
- status
- source
- submission timestamp
- inquiry ID

## Notes

- The website code in `tutoring-intake.html` does **not** need to change for this step.
- The intake form already writes to Supabase.
- This step is only about reacting to new rows and sending Telegram alerts.
- If you want later, we can also add:
  - duplicate/spam filtering
  - alerts only for `status = 'new'`
  - a second alert target
  - a direct link into your Supabase dashboard workflow
