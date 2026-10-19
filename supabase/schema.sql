-- ==============================================================================
-- SUPABASE SQL MIGRATION / SETUP SCRIPT
-- Run this complete script in your Supabase Dashboard: SQL Editor -> New Query
-- ==============================================================================

-- 1. Create the `profiles` table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. RLS Policies
-- Allow authenticated users to view their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Allow authenticated users to update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow profile creation (via trigger or direct client insert)
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- 4. Trigger Function: automatically create or sync profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url, created_at, updated_at)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      split_part(new.email, '@', 1)
    ),
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'avatar_url', ''),
      nullif(new.raw_user_meta_data->>'picture', '')
    ),
    now(),
    now()
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

-- 5. Attach the trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Trigger to auto-update the updated_at column on profiles modification
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_current_timestamp_updated_at();

-- Verification notice:
comment on table public.profiles is 'Public user profile table linked to auth.users with RLS enabled.';

-- ==============================================================================
-- 7. Assessment Results Table (`results`)
-- ==============================================================================
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  holland_code text not null,
  trait_scores jsonb not null default '[]'::jsonb,
  top_careers jsonb not null default '[]'::jsonb,
  llm_insights text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on results
alter table public.results enable row level security;

-- RLS: Authenticated users can view only their own assessment results
drop policy if exists "Users can view own results" on public.results;
create policy "Users can view own results"
  on public.results
  for select
  to authenticated
  using (auth.uid() = user_id);

-- RLS: Authenticated users can insert their own assessment results
drop policy if exists "Users can insert own results" on public.results;
create policy "Users can insert own results"
  on public.results
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- RLS: Authenticated users can delete their own results
drop policy if exists "Users can delete own results" on public.results;
create policy "Users can delete own results"
  on public.results
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Performance Indexes
create index if not exists idx_results_user_id on public.results(user_id);
create index if not exists idx_results_created_at on public.results(created_at desc);

comment on table public.results is 'Student Holland RIASEC assessment evaluations, trait vector scores, and recommended career paths.';
