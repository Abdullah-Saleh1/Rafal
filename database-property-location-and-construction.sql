-- نفّذ هذا الملف مرة واحدة من Supabase SQL Editor.
-- رابط Google Maps اختياري، ونسبة الإنجاز لا تُقبل إلا عند «قيد الإنشاء».

alter table public.properties
  add column if not exists google_maps_url text,
  add column if not exists construction_stage text not null default 'ready',
  add column if not exists construction_progress smallint;

alter table public.properties
  drop constraint if exists properties_construction_stage_check,
  drop constraint if exists properties_construction_progress_check;

alter table public.properties
  add constraint properties_construction_stage_check
    check (construction_stage in ('under_construction', 'ready', 'sold')),
  add constraint properties_construction_progress_check
    check (
      (construction_stage = 'under_construction'
        and construction_progress between 0 and 100)
      or
      (construction_stage <> 'under_construction'
        and construction_progress is null)
    );

-- يساعد فلتر مرحلة الإنشاء مع بقاء الاستعلام سريعًا مع زيادة العقارات.
create index if not exists properties_published_construction_stage_idx
  on public.properties (construction_stage)
  where is_published = true;

-- حماية فعلية: المستخدم العادي لا يستطيع تعديل أو حذف عقاره بعد إرساله.
-- نحذف سياسات UPDATE / DELETE الحالية للعقارات ونستبدلها بسياسات الأدمن فقط.
do $$
declare current_policy record;
begin
  for current_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'properties'
      and cmd in ('UPDATE', 'DELETE')
  loop
    execute format('drop policy if exists %I on public.properties', current_policy.policyname);
  end loop;
end $$;

create policy "Only admins can update properties"
on public.properties for update to authenticated
using (exists (
  select 1 from public.profiles
  where profiles.id = auth.uid()::text and profiles.role = 'admin'
))
with check (exists (
  select 1 from public.profiles
  where profiles.id = auth.uid()::text and profiles.role = 'admin'
));

create policy "Only admins can delete properties"
on public.properties for delete to authenticated
using (exists (
  select 1 from public.profiles
  where profiles.id = auth.uid()::text and profiles.role = 'admin'
));
