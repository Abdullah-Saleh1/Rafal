-- نفّذ الملف كاملًا مرة واحدة في Supabase SQL Editor.
create table if not exists public.after_sales_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  property_id uuid references public.properties(id) on delete set null,
  unit_number text not null,
  service_type text not null,
  details text not null,
  image_url text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'completed', 'closed')),
  created_at timestamptz not null default now()
);

-- في حال أنشأت الجدول بالنسخة السابقة، أضف العمود الجديد.
alter table public.after_sales_requests add column if not exists image_url text;
update public.after_sales_requests set unit_number = '' where unit_number is null;
update public.after_sales_requests set image_url = '' where image_url is null;
alter table public.after_sales_requests alter column unit_number set not null;
alter table public.after_sales_requests alter column image_url set not null;
alter table public.after_sales_requests enable row level security;

-- مساحة مستقلة لصور طلبات ما بعد البيع.
insert into storage.buckets (id, name, public)
values ('after-sales', 'after-sales', true)
on conflict (id) do update set public = true;

drop policy if exists "Anyone can upload after-sales images" on storage.objects;
create policy "Anyone can upload after-sales images"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'after-sales');

drop policy if exists "Anyone can create after-sales requests" on public.after_sales_requests;
drop policy if exists "Admins can view after-sales requests" on public.after_sales_requests;
drop policy if exists "Admins can update after-sales requests" on public.after_sales_requests;

create policy "Anyone can create after-sales requests"
on public.after_sales_requests for insert to anon, authenticated
with check (true);

-- التحويل إلى text للطرفين يجعل المقارنة صحيحة سواء كان profiles.id من UUID أو text.
create policy "Admins can view after-sales requests"
on public.after_sales_requests for select to authenticated
using (exists (select 1 from public.profiles where profiles.id::text = auth.uid()::text and profiles.role = 'admin'));

create policy "Admins can update after-sales requests"
on public.after_sales_requests for update to authenticated
using (exists (select 1 from public.profiles where profiles.id::text = auth.uid()::text and profiles.role = 'admin'))
with check (exists (select 1 from public.profiles where profiles.id::text = auth.uid()::text and profiles.role = 'admin'));

create index if not exists after_sales_requests_status_created_at_idx
on public.after_sales_requests (status, created_at desc);
