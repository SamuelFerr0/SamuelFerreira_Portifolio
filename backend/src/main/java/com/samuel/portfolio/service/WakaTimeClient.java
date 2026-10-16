package com.samuel.portfolio.service;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Component
public class WakaTimeClient {

    private static final Logger log = LoggerFactory.getLogger(WakaTimeClient.class);
    private static final ObjectMapper JSON = new ObjectMapper();

    private final RestClient api;
    private final RestClient auth;
    private final String appId;
    private final String appSecret;
    private final String redirectUri;
    private final String tokenUrl;

    private String accessToken;
    private String refreshToken;

    public WakaTimeClient(@Value("${wakatime.oauth.access-token}") String accessToken,
                          @Value("${wakatime.oauth.refresh-token}") String refreshToken,
                          @Value("${wakatime.oauth.app-id}") String appId,
                          @Value("${wakatime.oauth.app-secret}") String appSecret,
                          @Value("${wakatime.oauth.redirect-uri}") String redirectUri,
                          @Value("${wakatime.oauth.token-url}") String tokenUrl) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.appId = appId;
        this.appSecret = appSecret;
        this.redirectUri = redirectUri;
        this.tokenUrl = tokenUrl;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(15));
        this.api = RestClient.builder()
                .baseUrl("https://wakatime.com/api/v1")
                .requestFactory(factory)
                .defaultHeader("Accept", "application/json")
                .build();
        this.auth = RestClient.builder().requestFactory(factory).build();
    }

    public boolean configured() {
        return !accessToken().isBlank() || !refreshToken().isBlank();
    }

    public <T> T get(String path, Class<T> type, Object... vars) {
        if (!configured()) {
            throw new WakaTimeException(WakaTimeException.Reason.NOT_CONFIGURED, "WakaTime nao configurado");
        }
        String used = accessToken();
        if (used.isBlank()) {
            used = refresh(used);
        }
        try {
            return send(path, type, used, vars);
        } catch (WakaTimeException exception) {
            if (exception.reason() != WakaTimeException.Reason.UNAUTHORIZED) {
                throw exception;
            }
        }
        return send(path, type, refresh(used), vars);
    }

    private <T> T send(String path, Class<T> type, String token, Object... vars) {
        try {
            T body = api.get()
                    .uri(path, vars)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .body(type);
            if (body == null) {
                throw new WakaTimeException(WakaTimeException.Reason.UNAVAILABLE, "Resposta vazia do WakaTime");
            }
            return body;
        } catch (HttpClientErrorException.Unauthorized exception) {
            throw new WakaTimeException(WakaTimeException.Reason.UNAUTHORIZED, "WakaTime recusou o token", exception);
        } catch (HttpClientErrorException.Forbidden exception) {
            throw new WakaTimeException(WakaTimeException.Reason.FORBIDDEN, "Sem permissao no WakaTime", exception);
        } catch (RestClientException exception) {
            throw new WakaTimeException(WakaTimeException.Reason.UNAVAILABLE, "Falha ao consultar o WakaTime", exception);
        }
    }

    private synchronized String refresh(String used) {
        if (!used.isBlank() && !used.equals(accessToken)) {
            return accessToken;
        }
        if (refreshToken.isBlank() || appId.isBlank() || appSecret.isBlank()) {
            throw new WakaTimeException(WakaTimeException.Reason.UNAUTHORIZED, "Sem refresh token para renovar");
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", appId);
        form.add("client_secret", appSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "refresh_token");
        form.add("refresh_token", refreshToken);

        Map<String, String> response;
        try {
            String body = auth.post()
                    .uri(tokenUrl)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(String.class);
            response = parse(body);
        } catch (RestClientException exception) {
            throw new WakaTimeException(WakaTimeException.Reason.UNAUTHORIZED, "Falha ao renovar o token", exception);
        }

        String novo = response.get("access_token");
        if (novo == null || novo.isBlank()) {
            throw new WakaTimeException(WakaTimeException.Reason.UNAUTHORIZED, "Renovacao sem access_token");
        }
        accessToken = novo;

        String novoRefresh = response.get("refresh_token");
        if (novoRefresh != null && !novoRefresh.isBlank()) {
            if (!novoRefresh.equals(refreshToken)) {
                log.warn("WakaTime trocou o refresh token. Se o servico reiniciar, atualize WAKATIME_REFRESH_TOKEN");
            }
            refreshToken = novoRefresh;
        }
        return accessToken;
    }

    private synchronized String accessToken() {
        return accessToken;
    }

    private synchronized String refreshToken() {
        return refreshToken;
    }

    private static Map<String, String> parse(String body) {
        Map<String, String> result = new HashMap<>();
        if (body == null || body.isBlank()) {
            return result;
        }
        String text = body.trim();
        if (text.startsWith("{")) {
            try {
                JsonNode node = JSON.readTree(text);
                node.properties().forEach(entry -> result.put(entry.getKey(), entry.getValue().asText()));
            } catch (JacksonException exception) {
                throw new WakaTimeException(WakaTimeException.Reason.UNAUTHORIZED, "Resposta de token invalida", exception);
            }
            return result;
        }
        for (String pair : text.split("&")) {
            int i = pair.indexOf('=');
            if (i > 0) {
                result.put(URLDecoder.decode(pair.substring(0, i), StandardCharsets.UTF_8),
                        URLDecoder.decode(pair.substring(i + 1), StandardCharsets.UTF_8));
            }
        }
        return result;
    }
}
