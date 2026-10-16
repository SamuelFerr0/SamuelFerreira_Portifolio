package com.samuel.portfolio.util;

import jakarta.servlet.http.HttpServletRequest;

public final class Cliente {
    private Cliente() {
    }

    public static String ip(HttpServletRequest request) {
        String encaminhado = request.getHeader("X-Forwarded-For");
        if (encaminhado != null && !encaminhado.isBlank()) {
            String[] ips = encaminhado.split(",");
            return ips[ips.length - 1].trim();
        }
        return request.getRemoteAddr();
    }
}
