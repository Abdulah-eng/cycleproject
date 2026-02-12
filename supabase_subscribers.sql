-- Create the subscribers table
create table public.subscribers (
  id uuid not null default gen_random_uuid (),
  email text not null,
  created_at timestamp with time zone not null default now(),
  constraint subscribers_pkey primary key (id),
  constraint subscribers_email_key unique (email)
);

-- Set up Row Level Security (RLS)
-- Enable RLS
alter table public.subscribers enable row level security;

-- Allow public access to insert (subscribe)
create policy "Enable insert for all users" on public.subscribers
  for insert
  with check (true);

-- Allow authenticated users (admins) to view all subscribers
create policy "Enable read for authenticated users only" on public.subscribers
  for select
  to authenticated
  using (true);

-- Optional: Allow admins to delete
create policy "Enable delete for authenticated users only" on public.subscribers
  for delete
  to authenticated
  using (true);
