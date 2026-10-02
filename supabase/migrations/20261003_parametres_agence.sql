-- =============================================================================
-- Scolamove : paramètres de l'agence modifiables depuis l'administration.
-- Sert à enregistrer le texte des conditions de vente jointes aux devis.
-- À exécuter une fois dans Supabase > SQL Editor du projet Scolamove.
-- =============================================================================

create table if not exists public.parametres_agence (
  cle text primary key,
  valeur text not null,
  updated_at timestamptz not null default now()
);

alter table public.parametres_agence enable row level security;

drop policy if exists "parametres_agence_acces" on public.parametres_agence;
create policy "parametres_agence_acces" on public.parametres_agence
  for all to anon, authenticated using (true) with check (true);
