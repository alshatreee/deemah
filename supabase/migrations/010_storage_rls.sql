-- Migration 010: Storage bucket RLS policies for listings + avatars
-- Without these, anyone could upload/delete images in the public buckets.

-- listings bucket
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do update set public = true;

-- avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Read: anyone can view (since buckets are public)
drop policy if exists "Storage: public read listings" on storage.objects;
create policy "Storage: public read listings"
  on storage.objects for select
  using (bucket_id in ('listings', 'avatars'));

-- Insert: only authenticated users, and they must own the path (path starts with their auth.uid())
drop policy if exists "Storage: authenticated upload to own folder" on storage.objects;
create policy "Storage: authenticated upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('listings', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update: only owner
drop policy if exists "Storage: owner update" on storage.objects;
create policy "Storage: owner update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('listings', 'avatars')
    and owner = auth.uid()
  );

-- Delete: only owner
drop policy if exists "Storage: owner delete" on storage.objects;
create policy "Storage: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('listings', 'avatars')
    and owner = auth.uid()
  );
