package com.samuel.portfolio.controller;

import com.samuel.portfolio.service.WakaTimeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class WakaTimeExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(WakaTimeExceptionHandler.class);

    @ExceptionHandler(WakaTimeException.class)
    public ResponseEntity<Map<String, String>> wakatime(WakaTimeException exception) {
        log.error("WakaTime: {} ({})", exception.getMessage(), exception.reason(), exception);
        return switch (exception.reason()) {
            case NOT_CONFIGURED -> resposta(HttpStatus.SERVICE_UNAVAILABLE, "nao_configurado");
            case PENDING -> resposta(HttpStatus.SERVICE_UNAVAILABLE, "calculando");
            case UNAVAILABLE -> resposta(HttpStatus.SERVICE_UNAVAILABLE, "indisponivel");
            case UNAUTHORIZED -> resposta(HttpStatus.UNAUTHORIZED, "nao_autorizado");
            case FORBIDDEN -> resposta(HttpStatus.FORBIDDEN, "sem_permissao");
        };
    }

    private static ResponseEntity<Map<String, String>> resposta(HttpStatus status, String erro) {
        return ResponseEntity.status(status).body(Map.of("erro", erro));
    }
}
