import com.sun.net.httpserver.HttpServer;

import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class WakaTimeOAuth {

    private static final int PORT = 8787;
    private static final String REDIRECT = "http://localhost:" + PORT + "/callback";
    private static final String SCOPE = "read_stats,read_summaries,read_heartbeats";

    public static void main(String[] args) throws Exception {
        String appId = System.getenv("WAKATIME_APP_ID");
        String appSecret = System.getenv("WAKATIME_APP_SECRET");
        if (appId == null || appId.isBlank() || appSecret == null || appSecret.isBlank()) {
            System.err.println("Defina WAKATIME_APP_ID e WAKATIME_APP_SECRET antes de rodar.");
            System.exit(1);
        }

        String state = UUID.randomUUID().toString();
        CompletableFuture<String> code = new CompletableFuture<>();

        HttpServer server = HttpServer.create(new InetSocketAddress("localhost", PORT), 0);
        server.createContext("/callback", exchange -> {
            Map<String, String> query = parse(exchange.getRequestURI().getRawQuery());
            String message;
            if (!state.equals(query.get("state"))) {
                message = "State invalido. Rode o script de novo.";
                code.completeExceptionally(new IllegalStateException("state invalido"));
            } else if (query.get("code") == null) {
                message = "O WakaTime nao devolveu o codigo: " + query.getOrDefault("error", "erro desconhecido");
                code.completeExceptionally(new IllegalStateException(message));
            } else {
                message = "Pronto! Pode fechar esta aba e voltar ao terminal.";
                code.complete(query.get("code"));
            }
            byte[] body = message.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=utf-8");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();

        String url = "https://wakatime.com/oauth/authorize"
                + "?client_id=" + encode(appId)
                + "&response_type=code"
                + "&redirect_uri=" + encode(REDIRECT)
                + "&scope=" + encode(SCOPE)
                + "&state=" + encode(state);
        System.out.println("Abra este link no navegador e autorize:\n\n" + url + "\n");

        try {
            String authCode = code.get(5, TimeUnit.MINUTES);
            String form = "client_id=" + encode(appId)
                    + "&client_secret=" + encode(appSecret)
                    + "&redirect_uri=" + encode(REDIRECT)
                    + "&grant_type=authorization_code"
                    + "&code=" + encode(authCode);
            HttpResponse<String> response = HttpClient.newHttpClient().send(
                    HttpRequest.newBuilder(URI.create("https://wakatime.com/oauth/token"))
                            .header("Content-Type", "application/x-www-form-urlencoded")
                            .POST(HttpRequest.BodyPublishers.ofString(form))
                            .build(),
                    HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                System.err.println("Falha ao trocar o codigo (HTTP " + response.statusCode() + "): " + response.body());
                System.exit(1);
            }


            String json = response.body().trim();
            System.out.println("WAKATIME_ACCESS_TOKEN=" + extrairCampoJson(json, "access_token"));
            System.out.println("WAKATIME_REFRESH_TOKEN=" + extrairCampoJson(json, "refresh_token"));
            System.out.println("expires_at=" + extrairCampoJson(json, "expires_at"));
        } finally {
            server.stop(0);
        }
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static Map<String, String> parse(String query) {
        Map<String, String> result = new HashMap<>();
        if (query == null) {
            return result;
        }
        for (String pair : query.split("&")) {
            int i = pair.indexOf('=');
            if (i > 0) {
                result.put(URLDecoder.decode(pair.substring(0, i), StandardCharsets.UTF_8),
                        URLDecoder.decode(pair.substring(i + 1), StandardCharsets.UTF_8));
            }
        }
        return result;
    }


    private static String extrairCampoJson(String json, String campo) {
        Pattern pattern = Pattern.compile("\"" + campo + "\":\\s*\"?([^\",}]+)\"?");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1).replace("\"", "").trim();
        }
        return "null";
    }
}
