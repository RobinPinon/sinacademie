-- Install the moddatetime extension
create extension if not exists moddatetime;

-- Drop existing tables and their dependencies
drop table if exists builds cascade;
drop table if exists counter_teams cascade;
drop table if exists user_roles cascade;

-- Create user_roles table
create table if not exists user_roles (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null,
  role text not null check (role in ('user', 'maintainer', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, role)
);

-- Enable RLS for user_roles
alter table user_roles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Anyone can view user roles" on user_roles;
drop policy if exists "Only admins can manage user roles" on user_roles;

-- Create policies for user_roles
create policy "Anyone can view user roles"
  on user_roles for select
  using (true);

create policy "Only admins can manage user roles"
  on user_roles for all
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

-- Create trigger for user_roles updated_at
drop trigger if exists handle_user_roles_updated_at on user_roles;
create trigger handle_user_roles_updated_at before update on user_roles
  for each row execute procedure moddatetime (updated_at);

-- Drop existing tables if they exist
drop table if exists counters cascade;

-- Create counters table
create table if not exists counters (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for counters
alter table counters enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Anyone can view counters" on counters;
drop policy if exists "Maintainers can insert counters" on counters;
drop policy if exists "Maintainers can update counters" on counters;
drop policy if exists "Maintainers can delete counters" on counters;

-- Create policies for counters
create policy "Anyone can view counters"
  on counters for select
  using (true);

create policy "Maintainers can insert counters"
  on counters for insert
  with check (exists (
    select 1 from user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'maintainer'
  ));

create policy "Maintainers can update counters"
  on counters for update
  using (exists (
    select 1 from user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'maintainer'
  ));

create policy "Maintainers can delete counters"
  on counters for delete
  using (exists (
    select 1 from user_roles
    where user_roles.user_id = auth.uid()
    and user_roles.role = 'maintainer'
  ));

-- Create trigger for counters updated_at
drop trigger if exists handle_counters_updated_at on counters;
create trigger handle_counters_updated_at before update on counters
  for each row execute procedure moddatetime (updated_at);

-- Drop existing tables if they exist
drop view if exists counter_teams_view;
drop table if exists counter_teams cascade;

-- Create counter_teams table
create table if not exists counter_teams (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    defense_team_id uuid references defense_teams(id) on delete cascade not null,
    name text not null,
    monsters text[] not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS for counter_teams
alter table counter_teams enable row level security;

-- Create policies for counter_teams
create policy "Anyone can view counter_teams"
  on counter_teams for select
  using (true);

create policy "Users can manage their own counter_teams"
  on counter_teams for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create builds table
create table if not exists builds (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null,
  counter_team_id uuid references counter_teams(id) on delete cascade not null,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, counter_team_id)
);

-- Enable RLS for builds
alter table builds enable row level security;

-- Create policies for builds
create policy "Users can view their own builds"
  on builds for select
  using (auth.uid() = user_id);

create policy "Users can insert their own builds"
  on builds for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own builds"
  on builds for update
  using (auth.uid() = user_id);

create policy "Users can delete their own builds"
  on builds for delete
  using (auth.uid() = user_id);

-- Create trigger for updated_at
drop trigger if exists handle_updated_at on builds;
create trigger handle_updated_at before update on builds
  for each row execute procedure moddatetime (updated_at);

-- Drop existing function if it exists
drop function if exists delete_counter_with_builds(UUID);

-- Fonction pour supprimer un counter et ses builds associés
CREATE OR REPLACE FUNCTION delete_counter_with_builds(counter_id UUID)
RETURNS void AS $$
BEGIN
  -- Supprimer d'abord les builds
  DELETE FROM builds WHERE counter_team_id = counter_id;
  -- Puis supprimer le counter
  DELETE FROM counter_teams WHERE id = counter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION delete_counter_with_builds TO authenticated;

-- Supprimer la politique existante si elle existe
DROP POLICY IF EXISTS "Users can execute delete_counter_with_builds" ON counter_teams;

-- Créer une politique pour permettre l'exécution de la fonction
CREATE POLICY "Users can execute delete_counter_with_builds" ON counter_teams
    FOR ALL
    TO authenticated
    USING (true); 