create table if not exists public.plans (
  id text primary key,
  name text not null,
  price_inr integer not null default 0,
  billing_interval text not null default 'free',
  limits jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null references public.plans(id),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_subscription_id text,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  action_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Anyone can read active plans" on public.plans;
create policy "Anyone can read active plans"
  on public.plans for select
  using (is_active = true);

drop policy if exists "Users can read own subscription" on public.subscriptions;
create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own usage events" on public.usage_events;
create policy "Users can insert own usage events"
  on public.usage_events for insert
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Users can read own usage events" on public.usage_events;
create policy "Users can read own usage events"
  on public.usage_events for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
  on public.admin_users for select
  using (auth.uid() = user_id);

insert into public.plans (id, name, price_inr, billing_interval, limits)
values
  ('free', 'Free', 0, 'free', '{"maxFileMb":10,"maxFiles":5,"savedHistory":false,"ads":true}'::jsonb),
  ('pro-monthly', 'Pro Monthly', 299, 'month', '{"maxFileMb":100,"maxFiles":50,"savedHistory":true,"ads":false}'::jsonb),
  ('pro-yearly', 'Pro Yearly', 2499, 'year', '{"maxFileMb":100,"maxFiles":50,"savedHistory":true,"ads":false}'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  price_inr = excluded.price_inr,
  billing_interval = excluded.billing_interval,
  limits = excluded.limits,
  updated_at = now();
