package com.samuel.portfolio.service;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class LivroService {
    private final JdbcClient jdbc;

    public LivroService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Mensagem> listar() {
        return jdbc.sql("""
                        select id, nome, mensagem, criada_em
                        from livro_visitas
                        where visivel = true
                        order by criada_em desc
                        limit 50
                        """)
                .query((rs, linha) -> new Mensagem(
                        rs.getString("id"),
                        rs.getString("nome"),
                        rs.getString("mensagem"),
                        rs.getTimestamp("criada_em").toInstant().toString()))
                .list();
    }

    public Mensagem criar(String nome, String mensagem) {
        String id = UUID.randomUUID().toString();
        Instant agora = Instant.now();
        jdbc.sql("insert into livro_visitas (id, nome, mensagem, criada_em) "
                        + "values (:id, :nome, :mensagem, :criada)")
                .param("id", id)
                .param("nome", nome)
                .param("mensagem", mensagem)
                .param("criada", Timestamp.from(agora))
                .update();
        return new Mensagem(id, nome, mensagem, agora.toString());
    }

    public record Mensagem(String id, String nome, String mensagem, String data) {
    }
}
