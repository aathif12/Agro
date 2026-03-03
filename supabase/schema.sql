-- ===========================================
-- ExpenseWise - Supabase Database Schema
-- Run this in your Supabase SQL editor
-- ===========================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Create expenses table
create table if not exists public.expenses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  amount      numeric(12, 2) not null check (amount > 0),
  category    text not null,
  description text,
  date        date not null,
  created_at  timestamptz not null default now()
);

-- Indexes for performance
create index if not exists expenses_user_id_idx on public.expenses(user_id);
create index if not exists expenses_date_idx on public.expenses(date desc);
create index if not exists expenses_category_idx on public.expenses(category);

-- Enable Row Level Security
alter table public.expenses enable row level security;

-- RLS Policies: users can only access their own data
create policy "Users can view their own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);
