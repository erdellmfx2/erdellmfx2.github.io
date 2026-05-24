# Supabase Setup For Tutoring Capital

Use this checklist to connect the tutoring intake form to Supabase.

## 1. Create or open your project

1. Sign in to your Supabase dashboard.
2. Open the project you want to use for Tutoring Capital.

## 2. Create the intake table

1. In Supabase, open `SQL Editor`.
2. Create a new query.
3. Paste the contents of `supabase-schema.sql`.
4. Run the query.

This creates:
- the `tutoring_inquiries` table
- Row Level Security
- an `anon` insert policy for the website

## 3. Get your project URL and anon key

1. Open `Project Settings`.
2. Open `API`.
3. Copy:
   - `Project URL`
   - `anon public` key

Important:
- use the `anon` key
- do not use the `service_role` key on the website

## 4. Add the project details to the website

Open `supabase-config.js` and replace the empty values:

```js
window.TUTORING_CAPITAL_SUPABASE = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_ANON_KEY'
};
```

## 5. Publish the site

Commit and push the updated files to GitHub Pages.

## 6. Test the form

1. Open `tutoring-intake.html`
2. Fill out the form
3. Submit it
4. In Supabase, open `Table Editor`
5. Confirm the row appears in `tutoring_inquiries`

## Notes

- The form still keeps an email fallback if the database is not configured or the request fails.
- Since this is a public website, the `anon` key is expected to be public. Security comes from RLS, not from hiding the anon key.
- You can manage and update inquiries inside the Supabase dashboard after they are submitted.
