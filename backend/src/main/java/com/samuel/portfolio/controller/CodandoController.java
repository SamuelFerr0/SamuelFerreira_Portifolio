package com.samuel.portfolio.controller;

import com.samuel.portfolio.service.CodandoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CodandoController {

    private final CodandoService service;

    public CodandoController(CodandoService service) {
        this.service = service;
    }

    @GetMapping("/api/codando")
    public ResponseEntity<CodandoService.CodandoView> codando() {
        if (!service.enabled()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(service.state());
    }
}
