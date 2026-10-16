package com.samuel.portfolio.service;

import org.springframework.http.HttpStatus;

public class AskException extends RuntimeException {

    private final HttpStatus status;
    private final String code;
    private final long retryAfter;

    public AskException(HttpStatus status, String code) {
        this(status, code, 0, code, null);
    }

    public AskException(HttpStatus status, String code, long retryAfter) {
        this(status, code, retryAfter, code, null);
    }

    public AskException(HttpStatus status, String code, String detail, Throwable cause) {
        this(status, code, 0, detail, cause);
    }

    private AskException(HttpStatus status, String code, long retryAfter, String detail, Throwable cause) {
        super(detail, cause);
        this.status = status;
        this.code = code;
        this.retryAfter = retryAfter;
    }

    public HttpStatus status() {
        return status;
    }

    public String code() {
        return code;
    }

    public long retryAfter() {
        return retryAfter;
    }
}
