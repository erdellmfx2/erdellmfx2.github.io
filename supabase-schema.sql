create extension if not exists pgcrypto;

create table if not exists public.tutoring_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  parent_name text not null check (char_length(parent_name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 320),
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
  honeypot text not null default ''
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
