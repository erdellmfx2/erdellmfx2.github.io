create extension if not exists pgcrypto;

create table if not exists public.tutoring_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  parent_name text not null check (char_length(parent_name) between 2 and 120),
  email text check (email is null or char_length(email) between 5 and 320),
  phone text,
  student_level text not null check (student_level in ('Middle school', 'High school', 'College', 'Adult learner')),
  course text not null check (char_length(course) between 2 and 160),
  preferred_format text check (
    preferred_format is null or
    preferred_format in ('Online', 'In person in Tallahassee', 'Open to either')
  ),
  goal text not null check (char_length(goal) between 3 and 2000),
  details text,
  source text not null default 'website' check (source in ('website', 'manual')),
  status text not null default 'new' check (status in ('new', 'contacted', 'scheduled', 'active', 'closed')),
  honeypot text not null default '',
  check (email is not null or phone is not null)
);

alter table public.tutoring_inquiries enable row level security;

revoke all on public.tutoring_inquiries from anon;
revoke all on public.tutoring_inquiries from authenticated;

grant insert on public.tutoring_inquiries to anon;
grant select, insert, update on public.tutoring_inquiries to authenticated;

drop policy if exists "anon can insert tutoring inquiries" on public.tutoring_inquiries;
create policy "anon can insert tutoring inquiries"
on public.tutoring_inquiries
for insert
to anon
with check (
  source = 'website'
  and status = 'new'
  and honeypot = ''
);

drop policy if exists "authenticated can manage tutoring inquiries" on public.tutoring_inquiries;
create policy "authenticated can manage tutoring inquiries"
on public.tutoring_inquiries
for all
to authenticated
using (true)
with check (true);


create table if not exists public.site_pageviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  page_path text not null check (char_length(page_path) between 1 and 2048),
  page_title text check (page_title is null or char_length(page_title) <= 512),
  page_url text not null check (char_length(page_url) between 1 and 4096),
  referrer_host text check (referrer_host is null or char_length(referrer_host) <= 255),
  client_id text check (client_id is null or char_length(client_id) <= 255),
  utm_source text check (utm_source is null or char_length(utm_source) <= 255),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 255),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 255)
);

alter table public.site_pageviews enable row level security;

revoke all on public.site_pageviews from anon;
revoke all on public.site_pageviews from authenticated;

grant insert on public.site_pageviews to anon;
grant select, insert, update, delete on public.site_pageviews to authenticated;

drop policy if exists "public can insert site pageviews" on public.site_pageviews;
create policy "public can insert site pageviews"
on public.site_pageviews
for insert
to public
with check (true);

drop policy if exists "service role can read site pageviews" on public.site_pageviews;
create policy "service role can read site pageviews"
on public.site_pageviews
for select
to service_role
using (true);

drop policy if exists "authenticated can manage site pageviews" on public.site_pageviews;
create policy "authenticated can manage site pageviews"
on public.site_pageviews
for all
to authenticated
using (true)
with check (true);
