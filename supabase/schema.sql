-- Esquema base. Ejecutar en Supabase > SQL Editor.
create type app_role as enum ('admin','reclutador','candidato');
create type doc_status as enum ('pendiente','aprobado','rechazado');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role app_role not null default 'candidato',
  full_name text
);

create sequence folio_seq start 1;

create table candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  full_name text not null,
  birth_date date not null,
  phone text, email text,
  created_at timestamptz default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  folio text unique not null default ('RN-' || extract(year from now())::int || '-' || lpad(nextval('folio_seq')::text, 6, '0')),
  candidate_id uuid not null references candidates on delete cascade,
  job_title text,
  stage text not null default 'registro',
  created_at timestamptz default now()
);

create table application_status_history (
  id bigserial primary key,
  application_id uuid not null references applications on delete cascade,
  stage text not null,
  changed_by uuid references auth.users,
  note text,
  changed_at timestamptz default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications on delete cascade,
  doc_type text not null,
  file_path text,                 -- ruta en Storage (bucket privado 'documentos')
  status doc_status not null default 'pendiente',
  reject_reason text,
  reviewed_by uuid references auth.users,
  updated_at timestamptz default now()
);

create table flights (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications on delete cascade,
  route text, flight_date date, airline text
);

create function is_staff() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','reclutador'))
$$;

alter table profiles enable row level security;
alter table candidates enable row level security;
alter table applications enable row level security;
alter table application_status_history enable row level security;
alter table documents enable row level security;
alter table flights enable row level security;

create policy "propio perfil" on profiles for select using (id = auth.uid() or is_staff());
create policy "staff candidatos" on candidates for all using (is_staff()) with check (is_staff());
create policy "candidato ve lo suyo" on candidates for select using (user_id = auth.uid());
create policy "staff solicitudes" on applications for all using (is_staff()) with check (is_staff());
create policy "candidato ve su solicitud" on applications for select
  using (candidate_id in (select id from candidates where user_id = auth.uid()));
create policy "staff historial" on application_status_history for all using (is_staff()) with check (is_staff());
create policy "staff documentos" on documents for all using (is_staff()) with check (is_staff());
create policy "candidato ve sus documentos" on documents for select
  using (application_id in (select a.id from applications a join candidates c on c.id = a.candidate_id where c.user_id = auth.uid()));
create policy "staff vuelos" on flights for all using (is_staff()) with check (is_staff());

-- Consulta pública: folio + fecha de nacimiento. Solo devuelve lo mínimo.
create function consultar_folio(p_folio text, p_nacimiento date)
returns json language sql security definer set search_path = public as $$
  select json_build_object(
    'folio', a.folio, 'nombre', c.full_name, 'vacante', a.job_title, 'stage', a.stage,
    'documents', coalesce((select json_agg(json_build_object('tipo', d.doc_type, 'estado', d.status, 'motivo', d.reject_reason))
                           from documents d where d.application_id = a.id), '[]'::json),
    'flight', (select json_build_object('ruta', f.route, 'fecha', f.flight_date, 'aerolinea', f.airline)
               from flights f where f.application_id = a.id limit 1)
  )
  from applications a join candidates c on c.id = a.candidate_id
  where a.folio = upper(p_folio) and c.birth_date = p_nacimiento
$$;
grant execute on function consultar_folio to anon, authenticated;
-- Pendiente: limitar intentos (rate limit) para evitar adivinar folios.
