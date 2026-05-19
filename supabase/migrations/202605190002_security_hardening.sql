create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.plans(id),
  amount integer not null,
  currency text not null default 'INR',
  status text not null default 'created',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payment_orders enable row level security;

drop policy if exists "Users can read own payment orders" on public.payment_orders;
create policy "Users can read own payment orders"
  on public.payment_orders for select
  using (auth.uid() = user_id);

drop policy if exists "Admins can manage plans" on public.plans;
create policy "Admins can manage plans"
  on public.plans for all
  using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('user_pdfs', 'user_pdfs', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can read own pdf storage" on storage.objects;
create policy "Users can read own pdf storage"
  on storage.objects for select
  using (
    bucket_id = 'user_pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can insert own pdf storage" on storage.objects;
create policy "Users can insert own pdf storage"
  on storage.objects for insert
  with check (
    bucket_id = 'user_pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own pdf storage" on storage.objects;
create policy "Users can update own pdf storage"
  on storage.objects for update
  using (
    bucket_id = 'user_pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'user_pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own pdf storage" on storage.objects;
create policy "Users can delete own pdf storage"
  on storage.objects for delete
  using (
    bucket_id = 'user_pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
