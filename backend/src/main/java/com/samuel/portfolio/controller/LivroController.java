package com.samuel.portfolio.controller;

import com.samuel.portfolio.dto.LivroRequest;
import com.samuel.portfolio.service.LivroService;
import com.samuel.portfolio.util.Cliente;
import com.samuel.portfolio.util.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/livro")
public class LivroController {
    private final LivroService service;
    private final RateLimiter limiter;

    public LivroController(LivroService service, RateLimiter limiter) {
        this.service = service;
        this.limiter = limiter;
    }

    @GetMapping
    public List<LivroService.Mensagem> listar() {
        return service.listar();
    }

    @PostMapping
    public ResponseEntity<LivroService.Mensagem> assinar(@Valid @RequestBody LivroRequest corpo,
                                                         HttpServletRequest request) {
        if (corpo.site() != null && !corpo.site().isBlank()) {
            return ResponseEntity.ok(new LivroService.Mensagem(
                    "isca", corpo.nome(), corpo.mensagem(), Instant.now().toString()));
        }

        if (!limiter.allow("livro:" + Cliente.ip(request), 3, Duration.ofHours(1))) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
        String nome = corpo.nome().trim();
        String mensagem = corpo.mensagem().trim();
        if (nome.length() < 2 || mensagem.length() < 3) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.criar(nome, mensagem));
    }
}
