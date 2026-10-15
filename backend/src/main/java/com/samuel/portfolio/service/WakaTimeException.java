package com.samuel.portfolio.service;

public class WakaTimeException extends RuntimeException {

    public enum Reason {
        NOT_CONFIGURED,
        UNAUTHORIZED,
        FORBIDDEN,
        PENDING,
        UNAVAILABLE
    }

    private final Reason reason;

    public WakaTimeException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    public WakaTimeException(Reason reason, String message, Throwable cause) {
        super(message, cause);
        this.reason = reason;
    }

    public Reason reason() {
        return reason;
    }
}
