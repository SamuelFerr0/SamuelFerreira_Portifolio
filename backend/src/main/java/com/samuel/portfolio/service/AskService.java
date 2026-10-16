package com.samuel.portfolio.service;

import com.samuel.portfolio.dto.AskRequest;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class AskService {

    private static final Logger log = LoggerFactory.getLogger(AskService.class);
    private static final JsonParser PARSER = JsonParserFactory.getJsonParser();
    private static final DateTimeFormatter DATE =
            DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", Locale.of("pt", "BR"));
    private static final int MAX_HISTORY = 6;
    private static final int MAX_HISTORY_TEXT = 1500;
    private static final int MAX_PERIOD = 10;

    private final HttpClient http;
    private final URI endpoint;
    private final String apiKey;
    private final String model;
    private final int maxTokens;
    private final String effort;
    private final Duration timeout;
    private final boolean configured;
    private final String assistant;
    private final String profile;
    private final YearMonth courseStart;
    private final ZoneId zone;
    private final ScheduledThreadPoolExecutor watchdog;

    public AskService(@Value("${ask.api-url}") String apiUrl,
                      @Value("${ask.model}") String model,
                      @Value("${ask.api-key}") String apiKey,
                      @Value("${ask.max-tokens}") int maxTokens,
                      @Value("${ask.reasoning-effort}") String effort,
                      @Value("${ask.timeout-seconds}") int timeoutSeconds,
                      @Value("${ask.course-start}") String courseStart,
                      @Value("${ask.timezone}") String timezone) {
        this.configured = !apiKey.isBlank();
        this.apiKey = apiKey;
        this.model = model;
        this.maxTokens = maxTokens;
        this.effort = effort.trim();
        this.timeout = Duration.ofSeconds(timeoutSeconds);
        this.endpoint = URI.create(apiUrl.replaceAll("/+$", "") + "/chat/completions");
        this.http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        this.assistant = read("assistente.md");
        this.profile = read("perfil.md");
        this.courseStart = YearMonth.parse(courseStart);
        this.zone = ZoneId.of(timezone);
        this.watchdog = new ScheduledThreadPoolExecutor(1, runnable -> {
            Thread thread = new Thread(runnable, "ask-watchdog");
            thread.setDaemon(true);
            return thread;
        });
        this.watchdog.setRemoveOnCancelPolicy(true);
    }

    @PreDestroy
    void shutdown() {
        watchdog.shutdownNow();
    }

    public StreamingResponseBody answer(String pergunta, String idioma, List<AskRequest.Mensagem> historico) {
        if (!configured) {
            throw new AskException(HttpStatus.SERVICE_UNAVAILABLE, "sem_chave");
        }

        List<String[]> messages = new ArrayList<>();
        messages.add(new String[] {"system", system(idioma)});
        for (AskRequest.Mensagem mensagem : recent(historico)) {
            String role = "ia".equals(mensagem.papel()) ? "assistant" : "user";
            messages.add(new String[] {role, limit(mensagem.texto(), MAX_HISTORY_TEXT)});
        }
        messages.add(new String[] {"user", pergunta});

        HttpResponse<InputStream> response = open(messages, true);
        if (response.statusCode() == 400 && !effort.isBlank()) {
            snippet(response.body());
            response = open(messages, false);
        }

        int status = response.statusCode();
        InputStream body = response.body();
        if (status != 200) {
            log.error("Provedor de IA respondeu {}: {}", status, snippet(body));
            if (status == 429) {
                throw new AskException(HttpStatus.TOO_MANY_REQUESTS, "limite_ia", 60);
            }
            throw new AskException(HttpStatus.BAD_GATEWAY, "falha_ia");
        }
        return out -> relay(body, out);
    }

    private HttpResponse<InputStream> open(List<String[]> messages, boolean withEffort) {
        HttpRequest request = HttpRequest.newBuilder(endpoint)
                .timeout(timeout)
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload(messages, withEffort), StandardCharsets.UTF_8))
                .build();
        try {
            return http.send(request, HttpResponse.BodyHandlers.ofInputStream());
        } catch (HttpTimeoutException exception) {
            throw new AskException(HttpStatus.GATEWAY_TIMEOUT, "tempo", "Provedor de IA demorou demais", exception);
        } catch (IOException exception) {
            throw new AskException(HttpStatus.BAD_GATEWAY, "falha_ia", "Falha ao consultar o provedor de IA", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new AskException(HttpStatus.BAD_GATEWAY, "falha_ia", "Consulta ao provedor interrompida", exception);
        }
    }

    private void relay(InputStream body, OutputStream out) throws IOException {
        AtomicBoolean expired = new AtomicBoolean();
        ScheduledFuture<?> deadline = watchdog.schedule(() -> {
            expired.set(true);
            close(body);
        }, timeout.toMillis(), TimeUnit.MILLISECONDS);
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(body, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.startsWith("data:")) {
                    continue;
                }
                String data = line.substring(5).trim();
                if (data.equals("[DONE]")) {
                    break;
                }
                forward(data, out);
            }
        } catch (IOException exception) {
            if (!expired.get()) {
                throw exception;
            }
            log.warn("Resposta da IA interrompida por tempo");
        } finally {
            deadline.cancel(false);
        }
    }

    private static void forward(String data, OutputStream out) throws IOException {
        Map<String, Object> parsed;
        try {
            parsed = PARSER.parseMap(data);
        } catch (RuntimeException exception) {
            return;
        }
        if (!(parsed.get("choices") instanceof List<?> choices) || choices.isEmpty()
                || !(choices.get(0) instanceof Map<?, ?> choice)) {
            return;
        }
        if (choice.get("delta") instanceof Map<?, ?> delta
                && delta.get("content") instanceof String text && !text.isEmpty()) {
            emit(out, text);
        }
        if ("length".equals(choice.get("finish_reason"))) {
            emit(out, "…");
        }
    }

    private static void emit(OutputStream out, String text) throws IOException {
        out.write(text.getBytes(StandardCharsets.UTF_8));
        out.flush();
    }

    private String system(String idioma) {
        LocalDate today = LocalDate.now(zone);
        int months = (int) ChronoUnit.MONTHS.between(courseStart, YearMonth.from(today));
        int period = Math.max(1, Math.min(MAX_PERIOD, months / 6 + 1));
        String language = "en".equals(idioma) ? "English" : "português do Brasil";
        return assistant
                + "\n\n<base>\n"
                + profile.replace("{{periodo}}", String.valueOf(period))
                + "\n</base>\n\nHoje é " + DATE.format(today) + ". Idioma da resposta: " + language + ".";
    }

    private String payload(List<String[]> messages, boolean withEffort) {
        StringBuilder json = new StringBuilder("{\"model\":").append(quote(model))
                .append(",\"stream\":true,\"max_tokens\":").append(maxTokens)
                .append(",\"temperature\":0.3");
        if (withEffort && !effort.isBlank()) {
            json.append(",\"reasoning_effort\":").append(quote(effort));
        }
        json.append(",\"messages\":[");
        for (int i = 0; i < messages.size(); i++) {
            if (i > 0) {
                json.append(',');
            }
            json.append("{\"role\":").append(quote(messages.get(i)[0]))
                    .append(",\"content\":").append(quote(messages.get(i)[1])).append('}');
        }
        return json.append("]}").toString();
    }

    private static String quote(String value) {
        StringBuilder out = new StringBuilder("\"");
        for (char c : value.toCharArray()) {
            switch (c) {
                case '"' -> out.append("\\\"");
                case '\\' -> out.append("\\\\");
                case '\n' -> out.append("\\n");
                case '\r' -> out.append("\\r");
                case '\t' -> out.append("\\t");
                default -> {
                    if (c < 0x20) {
                        out.append(String.format("\\u%04x", (int) c));
                    } else {
                        out.append(c);
                    }
                }
            }
        }
        return out.append('"').toString();
    }

    private static List<AskRequest.Mensagem> recent(List<AskRequest.Mensagem> historico) {
        if (historico == null) {
            return List.of();
        }
        List<AskRequest.Mensagem> valid = historico.stream()
                .filter(mensagem -> mensagem != null && mensagem.texto() != null && !mensagem.texto().isBlank())
                .toList();
        return valid.subList(Math.max(0, valid.size() - MAX_HISTORY), valid.size());
    }

    private static String limit(String text, int max) {
        return text.length() > max ? text.substring(0, max) : text;
    }

    private static String snippet(InputStream body) {
        try {
            return new String(body.readNBytes(500), StandardCharsets.UTF_8);
        } catch (IOException exception) {
            return "";
        } finally {
            close(body);
        }
    }

    private static void close(InputStream body) {
        try {
            body.close();
        } catch (IOException exception) {
            log.debug("Falha ao fechar a resposta da IA", exception);
        }
    }

    private static String read(String name) {
        try {
            return new String(new ClassPathResource(name).getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new UncheckedIOException(exception);
        }
    }
}
