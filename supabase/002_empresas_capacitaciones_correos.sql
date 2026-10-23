-- Ejecutar después de schema.sql
alter table applications add column program text check (program in ('temporal','permanente'));
alter table applications add column company_id uuid;

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_info text,        -- datos de registro que pase el cliente
  domain text,                   -- dominio para correos
  contact_email text,
  active boolean default true
);
alter table applications add constraint app_company foreign key (company_id) references companies;

create table trainings (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications on delete cascade,
  company_id uuid references companies,
  start_date date, location text, details text,
  paid_by_company boolean default true
);

create table extra_document_requests (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications on delete cascade,
  doc_type text not null, note text, fulfilled boolean default false
);

create table email_log (
  id bigserial primary key,
  application_id uuid references applications,
  company_id uuid references companies,
  to_email text not null, subject text, body text,
  status text default 'enviado', sent_at timestamptz default now()
);

alter table companies enable row level security;
alter table trainings enable row level security;
alter table extra_document_requests enable row level security;
alter table email_log enable row level security;
create policy "staff empresas" on companies for all using (is_staff()) with check (is_staff());
create policy "staff capacitaciones" on trainings for all using (is_staff()) with check (is_staff());
create policy "staff extras" on extra_document_requests for all using (is_staff()) with check (is_staff());
create policy "staff correos" on email_log for all using (is_staff()) with check (is_staff());

-- Registro del candidato (autoservicio)
create policy "candidato crea su perfil" on candidates for insert with check (user_id = auth.uid());
create policy "candidato crea su solicitud" on applications for insert
  with check (candidate_id in (select id from candidates where user_id = auth.uid()));
create policy "candidato sube documentos" on documents for insert
  with check (application_id in (select a.id from applications a join candidates c on c.id = a.candidate_id where c.user_id = auth.uid()));

-- Storage: bucket privado 'documentos'; cada candidato solo en su carpeta, staff lee todo
create policy "subir a su carpeta" on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "leer propio o staff" on storage.objects for select to authenticated
  using (bucket_id = 'documentos' and ((storage.foldername(name))[1] = auth.uid()::text or is_staff()));
