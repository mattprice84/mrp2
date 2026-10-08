-- MRP² Milestone 1: profiles, the couple, pairing.
--
-- Rules enforced here (not just in the app):
--   * Row-level security on every table. The app can only read rows that
--     belong to its own couple, and can never write couple data directly.
--   * All pairing goes through the security-definer functions below.
--   * A couple has at most two members. Once both have joined, the couple is
--     sealed and no invite can be created or redeemed for it.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 40),
  -- 'H' (husband, lavender avatar) or 'W' (wife, coral avatar)
  role         text check (role in ('H', 'W')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.couples (
  id           uuid primary key default gen_random_uuid(),
  wedding_date date,
  sealed_at    timestamptz,           -- set when the second member joins
  created_at   timestamptz not null default now()
);

create table public.couple_members (
  couple_id  uuid not null references public.couples (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('H', 'W')),
  joined_at  timestamptz not null default now(),
  primary key (couple_id, user_id),
  unique (user_id),                   -- a person belongs to one couple only
  unique (couple_id, role)            -- one H and one W per couple
);

create table public.couple_invites (
  code        text primary key check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  couple_id   uuid not null references public.couples (id) on delete cascade,
  created_by  uuid not null references auth.users (id) on delete cascade,
  expires_at  timestamptz not null default now() + interval '24 hours',
  used_at     timestamptz
);

-- Failed code entries, for rate limiting guesses.
create table public.pairing_attempts (
  user_id      uuid not null references auth.users (id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index pairing_attempts_user_idx on public.pairing_attempts (user_id, attempted_at);

create index couple_invites_couple_id_idx on public.couple_invites (couple_id);
create index couple_invites_created_by_idx on public.couple_invites (created_by);

alter table public.profiles       enable row level security;
alter table public.couples        enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invites enable row level security;
alter table public.pairing_attempts enable row level security;  -- no policies: functions only

-- ---------------------------------------------------------------------------
-- Hard cap: never more than two members, even if a function has a bug.
-- ---------------------------------------------------------------------------

create or replace function public.enforce_two_members()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Serialise inserts for the same couple.
  perform 1 from public.couples where id = new.couple_id for update;
  if (select count(*) from public.couple_members where couple_id = new.couple_id) >= 2 then
    raise exception 'This couple already has two members.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.couples where id = new.couple_id and sealed_at is not null) then
    raise exception 'This couple is sealed.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger couple_members_max_two
  before insert or update of couple_id on public.couple_members
  for each row execute function public.enforce_two_members();

-- ---------------------------------------------------------------------------
-- Profile row for every new auth user.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helper used by policies. Security definer so policies on couple_members
-- don't recurse into themselves.
-- ---------------------------------------------------------------------------

create or replace function public.my_couple_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select couple_id from public.couple_members where user_id = (select auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Policies (read-only for the app; writes go through functions)
-- ---------------------------------------------------------------------------

create policy "Read my own profile and my spouse's"
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or id in (select user_id from public.couple_members where couple_id = (select public.my_couple_id()))
  );

create policy "Update my own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Read my couple"
  on public.couples for select to authenticated
  using (id = (select public.my_couple_id()));

create policy "Read my couple's members"
  on public.couple_members for select to authenticated
  using (couple_id = (select public.my_couple_id()));

create policy "Read invites I created"
  on public.couple_invites for select to authenticated
  using (created_by = (select auth.uid()));

-- Profiles: only the name is editable directly. Role is set by pairing.
revoke update on public.profiles from authenticated, anon;
grant update (display_name, updated_at) on public.profiles to authenticated;

-- Nothing else is writable from the app.
revoke insert, update, delete on public.couples, public.couple_members, public.couple_invites from authenticated, anon;
revoke all on public.profiles, public.couples, public.couple_members, public.couple_invites, public.pairing_attempts from anon;
revoke all on public.pairing_attempts from authenticated;

-- ---------------------------------------------------------------------------
-- Pairing functions
-- ---------------------------------------------------------------------------

create or replace function public.new_invite_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  -- No 0/O/1/I so codes are easy to read aloud.
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea := extensions.gen_random_bytes(6);
  result text := '';
begin
  for i in 0..5 loop
    result := result || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return result;
end;
$$;

-- Phone A: start a couple and get a code to show.
create or replace function public.create_couple(p_display_name text, p_role text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  cid uuid;
  invite text;
begin
  if uid is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;
  if p_role not in ('H', 'W') then
    raise exception 'Role must be H or W.' using errcode = '22023';
  end if;

  select couple_id into cid from public.couple_members where user_id = uid;

  if cid is null then
    insert into public.couples default values returning id into cid;
    insert into public.couple_members (couple_id, user_id, role) values (cid, uid, p_role);
  elsif exists (select 1 from public.couples where id = cid and sealed_at is not null) then
    raise exception 'You are already paired.' using errcode = 'P0001';
  end if;

  update public.profiles
     set display_name = nullif(trim(p_display_name), ''),
         role = (select role from public.couple_members where user_id = uid),
         updated_at = now()
   where id = uid;

  -- One live code at a time: retire older ones.
  update public.couple_invites set expires_at = now()
   where couple_id = cid and used_at is null and expires_at > now();

  loop
    invite := public.new_invite_code();
    exit when not exists (select 1 from public.couple_invites where code = invite);
  end loop;
  insert into public.couple_invites (code, couple_id, created_by) values (invite, cid, uid);

  return invite;
end;
$$;

-- Phone B: enter the code.
-- Returns 'ok', 'invalid', 'too_many_attempts' or 'already_paired'. Wrong codes
-- return instead of raising so the failed attempt is recorded (a raise would
-- roll it back). Five wrong codes in an hour locks pairing for that account.
create or replace function public.join_couple(p_code text, p_display_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  inv public.couple_invites;
  partner_role text;
  my_role text;
begin
  if uid is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;
  if exists (select 1 from public.couple_members m join public.couples c on c.id = m.couple_id
              where m.user_id = uid and c.sealed_at is not null) then
    return 'already_paired';
  end if;
  if (select count(*) from public.pairing_attempts
       where user_id = uid and attempted_at > now() - interval '1 hour') >= 5 then
    return 'too_many_attempts';
  end if;

  select * into inv from public.couple_invites
   where code = upper(trim(p_code))
   for update;

  if inv.code is null or inv.used_at is not null or inv.expires_at <= now() or inv.created_by = uid then
    insert into public.pairing_attempts (user_id) values (uid);
    return 'invalid';
  end if;

  -- Lock the couple and confirm it still has room.
  perform 1 from public.couples where id = inv.couple_id and sealed_at is null for update;
  if not found then
    insert into public.pairing_attempts (user_id) values (uid);
    return 'invalid';
  end if;

  -- The person who made the code must still be waiting in that couple.
  select role into partner_role from public.couple_members
   where couple_id = inv.couple_id and user_id = inv.created_by;
  if partner_role is null then
    insert into public.pairing_attempts (user_id) values (uid);
    return 'invalid';
  end if;
  my_role := case partner_role when 'H' then 'W' else 'H' end;

  if exists (select 1 from public.couple_members where user_id = uid) then
    -- Both phones tapped "Show a code": move this phone into the other couple
    -- and retire the code it was showing.
    update public.couple_members set couple_id = inv.couple_id, role = my_role where user_id = uid;
    update public.couple_invites set expires_at = now() where created_by = uid and used_at is null;
  else
    insert into public.couple_members (couple_id, user_id, role) values (inv.couple_id, uid, my_role);
  end if;

  update public.profiles
     set display_name = nullif(trim(p_display_name), ''), role = my_role, updated_at = now()
   where id = uid;

  update public.couple_invites set used_at = now() where code = inv.code;
  -- Two members: seal the couple and retire any other codes.
  update public.couple_invites set expires_at = now()
   where couple_id = inv.couple_id and used_at is null and expires_at > now();
  update public.couples set sealed_at = now() where id = inv.couple_id;

  return 'ok';
end;
$$;

-- Either spouse can set the wedding date shown on the welcome screen.
create or replace function public.set_wedding_date(p_date date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_date > current_date or p_date < date '1950-01-01' then
    raise exception 'That date does not look right.' using errcode = '22023';
  end if;
  update public.couples set wedding_date = p_date where id = public.my_couple_id();
end;
$$;

revoke execute on function public.create_couple(text, text) from public, anon;
revoke execute on function public.join_couple(text, text) from public, anon;
revoke execute on function public.new_invite_code() from public, anon, authenticated;
revoke execute on function public.enforce_two_members() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.create_couple(text, text) to authenticated;
grant execute on function public.join_couple(text, text) to authenticated;
revoke execute on function public.set_wedding_date(date) from public, anon;
grant execute on function public.set_wedding_date(date) to authenticated;
revoke execute on function public.my_couple_id() from public, anon;
grant execute on function public.my_couple_id() to authenticated;

-- ---------------------------------------------------------------------------
-- Welcome-screen photos (private bucket, couple members only).
-- Files live at <couple_id>/<file name>.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('welcome-photos', 'welcome-photos', false, 10485760, array['image/jpeg', 'image/png', 'image/heic', 'image/webp'])
on conflict (id) do nothing;

create policy "Couple reads its welcome photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'welcome-photos'
         and (storage.foldername(name))[1] = (select public.my_couple_id())::text);

create policy "Couple adds welcome photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'welcome-photos'
              and (storage.foldername(name))[1] = (select public.my_couple_id())::text);

create policy "Couple removes welcome photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'welcome-photos'
         and (storage.foldername(name))[1] = (select public.my_couple_id())::text);
