create table if not exists public.livro_visitas (
  id varchar(36) primary key,
  nome varchar(40) not null,
  mensagem varchar(300) not null,
  visivel boolean not null default true,
  criada_em timestamptz not null default now()
);

alter table public.livro_visitas enable row level security;
