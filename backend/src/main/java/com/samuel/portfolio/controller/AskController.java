package com.samuel.portfolio.controller;

import com.samuel.portfolio.dto.AskRequest;
import com.samuel.portfolio.service.AskException;
import com.samuel.portfolio.service.AskService;
import com.samuel.portfolio.util.Cliente;
import com.samuel.portfolio.util.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class AskController {

    static final String PROXY_HEADER = "X-Ask-Proxy";

    private final AskService service;
    private final RateLimiter limiter;
    private final Set<String> origins;
    private final int maxQuestion;
    private final int perMinute;
    private final int perDay;

    public AskController(AskService service,
                         RateLimiter limiter,
                         @Value("${app.cors.origins}") String origins,
                         @Value("${ask.max-question}") int maxQuestion,
                         @Value("${ask.limit.per-minute}") int perMinute,
                         @Value("${ask.limit.per-day}") int perDay) {
        this.service = service;
        this.limiter = limiter;
        this.origins = Arrays.stream(origins.split(","))
                .map(origin -> origin.trim().replaceAll("/+$", ""))
                .filter(origin -> !origin.isEmpty())
                .collect(Collectors.toSet());
        this.maxQuestion = maxQuestion;
        this.perMinute = perMinute;
        this.perDay = perDay;
    }

    @PostMapping("/api/ask")
    public ResponseEntity<StreamingResponseBody> ask(@RequestBody AskRequest body, HttpServletRequest request) {
        checkOrigin(request);

        String pergunta = body.pergunta() == null ? "" : body.pergunta().trim();
        if (pergunta.isEmpty()) {
            throw new AskException(HttpStatus.BAD_REQUEST, "pergunta_vazia");
        }
        if (pergunta.length() > maxQuestion) {
            throw new AskException(HttpStatus.BAD_REQUEST, "pergunta_longa");
        }

        String ip = Cliente.ip(request);
        checkLimit("ask:min:" + ip, perMinute, Duration.ofMinutes(1));
        checkLimit("ask:dia:" + ip, perDay, Duration.ofDays(1));

        StreamingResponseBody stream = service.answer(pergunta, body.idioma(), body.historico());
        return ResponseEntity.ok()
                .header(PROXY_HEADER, "1")
                .header("Cache-Control", "no-store")
                .header("X-Accel-Buffering", "no")
                .contentType(new MediaType("text", "plain", StandardCharsets.UTF_8))
                .body(stream);
    }

    private void checkOrigin(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        if (origin != null && !origins.contains(origin.replaceAll("/+$", ""))) {
            throw new AskException(HttpStatus.FORBIDDEN, "origem");
        }
    }

    private void checkLimit(String key, int limit, Duration window) {
        long wait = limiter.waitSeconds(key, limit, window);
        if (wait > 0) {
            throw new AskException(HttpStatus.TOO_MANY_REQUESTS, "limite", wait);
        }
    }
}
