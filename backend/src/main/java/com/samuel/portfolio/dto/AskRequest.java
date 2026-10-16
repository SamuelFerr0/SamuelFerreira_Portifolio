package com.samuel.portfolio.dto;

import java.util.List;

public record AskRequest(String pergunta, String idioma, List<Mensagem> historico) {

    public record Mensagem(String papel, String texto) {
    }
}
