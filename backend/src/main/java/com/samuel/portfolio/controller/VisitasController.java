package com.samuel.portfolio.controller;

import com.samuel.portfolio.service.VisitasService;
import com.samuel.portfolio.util.Cliente;
import com.samuel.portfolio.util.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
public class VisitasController {
    private final VisitasService service;
    private final RateLimiter limiter;

    public VisitasController(VisitasService service, RateLimiter limiter) {
        this.service = service;
        this.limiter = limiter;
    }

    @GetMapping("/api/visitas")
    public Map<String, Long> total() {
        return Map.of("total", service.total());
    }

    @PostMapping("/api/visitas")
    public Map<String, Long> registrar(HttpServletRequest request) {
        if (!limiter.allow("visita:" + Cliente.ip(request), 20, Duration.ofHours(1))) {
            return Map.of("total", service.total());
        }
        return Map.of("total", service.registrar());
    }
}
