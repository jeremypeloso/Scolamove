-- =============================================================================
-- Scolamove : dossiers de voyage (devis + réservations + feuille de route)
-- À exécuter une fois dans Supabase > SQL Editor du projet Scolamove.
-- Ne touche à aucune table existante : devis_express reste en place.
-- =============================================================================

create extension if not exists pgcrypto;

-- Un dossier = un voyage, du premier devis à la feuille de route.
-- Le document complet est dans "data" ; les autres colonnes servent à la liste.
create table if not exists public.dossiers_voyage (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  statut text not null default 'brouillon',
  etablissement text,
  ville text,
  destination text,
  date_depart date,
  date_retour date,
  eleves integer,
  accompagnateurs integer,
  prix_par_payant numeric(10, 2),
  total_vente numeric(12, 2),
  total_revient numeric(12, 2),
  reservations_confirmees integer,
  reservations_total integer,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dossiers_voyage_updated_at_idx on public.dossiers_voyage (updated_at desc);
create index if not exists dossiers_voyage_statut_idx on public.dossiers_voyage (statut);

-- Annuaire des prestataires (hôtels, restaurants, musées, guides, autocaristes),
-- partagé entre tous les dossiers.
create table if not exists public.prestataires (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  type text,
  adresse text,
  code_postal text,
  ville text,
  pays text,
  telephone text,
  email text,
  contact text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists prestataires_nom_idx on public.prestataires (nom);

-- Accès : même fonctionnement que devis_express (clé publique + mot de passe
-- admin côté navigateur). À durcir avec Supabase Auth, voir la note de livraison.
alter table public.dossiers_voyage enable row level security;
alter table public.prestataires enable row level security;

drop policy if exists "dossiers_voyage_acces" on public.dossiers_voyage;
create policy "dossiers_voyage_acces" on public.dossiers_voyage
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "prestataires_acces" on public.prestataires;
create policy "prestataires_acces" on public.prestataires
  for all to anon, authenticated using (true) with check (true);
