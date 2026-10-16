package com.samuel.portfolio.controller;

import com.samuel.portfolio.service.AskException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice(assignableTypes = AskController.class)
public class AskExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(AskExceptionHandler.class);

    @ExceptionHandler(AskException.class)
    public ResponseEntity<Map<String, String>> ask(AskException exception) {
        if (exception.status().is5xxServerError()) {
            log.error("Ask: {} ({})", exception.getMessage(), exception.code(), exception);
        }
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(exception.status())
                .header(AskController.PROXY_HEADER, "1")
                .header("Cache-Control", "no-store");
        if (exception.retryAfter() > 0) {
            builder.header("Retry-After", String.valueOf(exception.retryAfter()));
        }
        return builder.body(Map.of("erro", exception.code()));
    }
}
