package com.samuel.portfolio.service;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VisitasService {
    private final JdbcClient jdbc;

    public VisitasService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public long total() {
        return jdbc.sql("select total from contador_visitas where id = 1")
                .query(Long.class)
                .optional()
                .orElse(0L);
    }

    @Transactional
    public long registrar() {
        int linhas = jdbc.sql("update contador_visitas set total = total + 1 where id = 1").update();
        if (linhas == 0) {
            jdbc.sql("insert into contador_visitas (id, total) values (1, 1)").update();
        }
        return total();
    }
}
