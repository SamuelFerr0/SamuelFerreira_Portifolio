create table if not exists public.contador_visitas (
  id int primary key check (id = 1),
  total bigint not null default 0
);

insert into public.contador_visitas (id, total)
values (1, 0)
on conflict (id) do nothing;

alter table public.contador_visitas enable row level security;
