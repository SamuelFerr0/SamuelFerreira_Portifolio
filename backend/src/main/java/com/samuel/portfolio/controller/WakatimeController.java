package com.samuel.portfolio.controller;

import com.samuel.portfolio.service.WakatimeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WakatimeController {

    private final WakatimeService service;

    public WakatimeController(WakatimeService service) {
        this.service = service;
    }

    @GetMapping("/api/wakatime/stats")
    public WakatimeService.WakatimeView wakatime() {
        return service.stats(service.defaultRange());
    }

    @GetMapping("/api/wakatime/stats/{range}")
    public WakatimeService.WakatimeView wakatime(@PathVariable String range) {
        return service.stats(range);
    }
}
