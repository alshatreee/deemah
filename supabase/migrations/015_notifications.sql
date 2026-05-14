create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in (
    'order_placed','order_paid','order_shipped','order_delivered',
    'message_received','review_received','dispute_opened','listing_sold'
  )),
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id) where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "Users see own notifications" on public.notifications;
create policy "Users see own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users mark own notifications read" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Realtime publication
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.notifications'; exception when others then null; end;
end $$;

-- Trigger to create notification on new message
create or replace function public.trg_notify_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.receiver_id,
    'message_received',
    'رسالة جديدة',
    substring(new.body from 1 for 100),
    '/messages/' || new.sender_id
  );
  return null;
end;
$$;

drop trigger if exists trg_notification_on_message on public.messages;
create trigger trg_notification_on_message
  after insert on public.messages
  for each row execute function public.trg_notify_message();

-- Trigger to create notification on order paid (for seller)
create or replace function public.trg_notify_order_paid()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seller_id uuid;
  listing_title text;
begin
  if tg_op = 'UPDATE' and new.status = 'paid' and old.status <> 'paid' then
    select owner_id, title into seller_id, listing_title
      from public.listings where id = new.listing_id;
    if seller_id is not null then
      insert into public.notifications (user_id, type, title, body, link)
      values (
        seller_id,
        'order_paid',
        'تم بيع منتج',
        'تم دفع طلب على: ' || coalesce(listing_title, 'منتج'),
        '/orders/' || new.id
      );
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_notification_on_order_paid on public.orders;
create trigger trg_notification_on_order_paid
  after update on public.orders
  for each row execute function public.trg_notify_order_paid();
