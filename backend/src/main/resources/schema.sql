create table if not exists contador_visitas (
    id integer primary key,
    total bigint not null default 0
);

create table if not exists livro_visitas (
    id varchar(36) primary key,
    nome varchar(40) not null,
    mensagem varchar(300) not null,
    visivel boolean not null default true,
    criada_em timestamp with time zone not null default current_timestamp
);
