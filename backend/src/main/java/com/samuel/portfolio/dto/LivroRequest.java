package com.samuel.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LivroRequest(
        @NotBlank @Size(max = 40) String nome,
        @NotBlank @Size(max = 300) String mensagem,
        String site) {
}
