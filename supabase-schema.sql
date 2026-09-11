-- ---------------------------------------------------------------------------
-- Datenbankschema fuer die Aktienanalysen-Seite (Supabase / PostgreSQL)
--
-- Einmalig im Supabase-Projekt unter  SQL Editor  ausfuehren.
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- --------------------------------- Analysen --------------------------------
create table if not exists public.analyses (
  id                  uuid primary key default gen_random_uuid(),
  title               text        not null,
  ticker              text        not null default '',
  price               numeric(14,4),
  currency            text        not null default 'EUR',
  target_price        numeric(14,4),
  reason              text        not null default '',
  signal              smallint    not null check (signal between 1 and 5),
  horizon             text        not null default '',
  author              text        not null default '',
  conflict_disclosure text        not null default '',
  published_at        timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists analyses_published_at_idx
  on public.analyses (published_at desc);

-- --------------------------------- Nutzer ----------------------------------
create table if not exists public.users (
  id                  uuid primary key default gen_random_uuid(),
  email               text        not null unique,
  password_hash       text,
  stripe_customer_id  text unique,
  subscription_id     text,
  plan                text check (plan in ('basic','black','platin')),
  subscription_status text        not null default 'none',
  current_period_end  timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists users_stripe_customer_idx
  on public.users (stripe_customer_id);

-- ------------------------------ Zugriffsschutz -----------------------------
-- Die Anwendung greift ausschliesslich serverseitig mit dem Service-Role-Key
-- zu. Row Level Security bleibt aktiviert und ohne Policies, damit der
-- oeffentliche anon-Key keinerlei Daten lesen oder schreiben kann.
alter table public.analyses enable row level security;
alter table public.users    enable row level security;
