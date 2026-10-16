package com.samuel.portfolio.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;

@Service
public class CodandoService {

    private static final long CACHE_MS = 60_000;
    private static final long EDITORS_CACHE_MS = 60 * 60_000;
    private static final Map<String, String> EDITORS = Map.ofEntries(
            Map.entry("vscode", "VS Code"),
            Map.entry("cursor", "Cursor"),
            Map.entry("windsurf", "Windsurf"),
            Map.entry("vscodium", "VSCodium"),
            Map.entry("zed", "Zed"),
            Map.entry("vim", "Vim"),
            Map.entry("neovim", "Neovim"),
            Map.entry("emacs", "Emacs"),
            Map.entry("sublime", "Sublime Text"),
            Map.entry("intellij", "IntelliJ IDEA"),
            Map.entry("idea", "IntelliJ IDEA"),
            Map.entry("pycharm", "PyCharm"),
            Map.entry("webstorm", "WebStorm"),
            Map.entry("androidstudio", "Android Studio"),
            Map.entry("xcode", "Xcode"),
            Map.entry("eclipse", "Eclipse"),
            Map.entry("visualstudio", "Visual Studio"),
            Map.entry("jupyter", "Jupyter"));

    private final WakaTimeClient client;
    private final ZoneId zone;
    private final int activeMinutes;
    private final int pauseMinutes;
    private final int refreshSeconds;
    private final Set<String> publicProjects;
    private final boolean showPrivate;

    private record Cached<T>(long at, T value) {
    }

    private final ReentrantLock refresh = new ReentrantLock();
    private volatile Cached<CodandoView> cache;
    private Cached<Map<String, String>> editors;

    public CodandoService(WakaTimeClient client,
                          @Value("${wakatime.timezone}") String timezone,
                          @Value("${wakatime.ativo-minutos}") int activeMinutes,
                          @Value("${wakatime.pausa-minutos}") int pauseMinutes,
                          @Value("${wakatime.coding-now.refresh-seconds}") int refreshSeconds,
                          @Value("${wakatime.coding-now.public-projects}") String publicProjects,
                          @Value("${wakatime.coding-now.show-private}") boolean showPrivate) {
        this.client = client;
        this.zone = ZoneId.of(timezone);
        this.activeMinutes = activeMinutes;
        this.pauseMinutes = pauseMinutes;
        this.refreshSeconds = refreshSeconds;
        this.showPrivate = showPrivate;
        this.publicProjects = Arrays.stream(publicProjects.split(","))
                .map(name -> name.trim().toLowerCase(Locale.ROOT))
                .filter(name -> !name.isEmpty())
                .collect(Collectors.toSet());
    }

    public boolean enabled() {
        return refreshSeconds > 0;
    }

    public CodandoView state() {
        Cached<CodandoView> current = cache;
        if (fresh(current)) {
            return current.value();
        }
        if (current == null) {
            refresh.lock();
        } else if (!refresh.tryLock()) {
            return current.value();
        }
        try {
            Cached<CodandoView> again = cache;
            if (fresh(again)) {
                return again.value();
            }
            long now = System.currentTimeMillis();
            CodandoView view = build(now);
            cache = new Cached<>(now, view);
            return view;
        } finally {
            refresh.unlock();
        }
    }

    private static boolean fresh(Cached<CodandoView> cached) {
        return cached != null && System.currentTimeMillis() - cached.at() < CACHE_MS;
    }

    private CodandoView build(long now) {
        String today = day(now);
        List<Heartbeat> todays = heartbeats(today);
        Map<String, String> editorNames = editorNames();

        List<Heartbeat> all = todays;
        if (minutesOfDay(now) < pauseMinutes + activeMinutes) {
            List<Heartbeat> yesterdays = heartbeats(day(now - 24 * 60 * 60 * 1000L));
            all = new java.util.ArrayList<>(yesterdays);
            all.addAll(todays);
        }

        long todaySeconds = sumSeconds(todays);
        if (all.isEmpty()) {
            return new CodandoView(refreshSeconds, false, todaySeconds, null);
        }

        Heartbeat last = all.get(all.size() - 1);
        boolean isPublic = last.project() != null
                && (showPrivate || publicProjects.contains(last.project().toLowerCase(Locale.ROOT)));
        boolean active = now / 1000.0 - last.time() <= activeMinutes * 60L;
        long projectToday = sumSeconds(todays.stream()
                .filter(heartbeat -> java.util.Objects.equals(heartbeat.project(), last.project()))
                .toList());

        return new CodandoView(refreshSeconds, active, todaySeconds, new Last(
                isPublic,
                isPublic ? last.project() : null,
                isPublic && last.branch() != null && !last.branch().isBlank() ? last.branch() : null,
                blankToNull(last.language()),
                editorNames.get(last.userAgentId()),
                Math.round(last.time() * 1000),
                Math.round(sessionStart(all) * 1000),
                projectToday));
    }

    private List<Heartbeat> heartbeats(String day) {
        HeartbeatsResponse response = client.get("/users/current/heartbeats?date={day}", HeartbeatsResponse.class, day);
        if (response.data() == null) {
            return List.of();
        }
        return response.data().stream()
                .filter(heartbeat -> "file".equals(heartbeat.type()) && heartbeat.time() != null)
                .sorted(Comparator.comparingDouble(Heartbeat::time))
                .toList();
    }

    private Map<String, String> editorNames() {
        long now = System.currentTimeMillis();
        if (editors != null && now - editors.at() < EDITORS_CACHE_MS) {
            return editors.value();
        }
        try {
            UserAgentsResponse response = client.get("/users/current/user_agents", UserAgentsResponse.class);
            Map<String, String> names = new HashMap<>();
            if (response.data() != null) {
                for (UserAgent agent : response.data()) {
                    if (agent.id() != null && agent.editor() != null) {
                        names.put(agent.id(), editorName(agent.editor()));
                    }
                }
            }
            editors = new Cached<>(now, names);
        } catch (RuntimeException exception) {
            if (editors == null) {
                return Map.of();
            }
        }
        return editors.value();
    }

    private static String editorName(String editor) {
        String key = editor.toLowerCase(Locale.ROOT).replaceAll("[\\s_-]", "");
        String known = EDITORS.get(key);
        return known != null ? known : Character.toUpperCase(editor.charAt(0)) + editor.substring(1);
    }

    private long sumSeconds(List<Heartbeat> heartbeats) {
        double total = 0;
        for (int i = 1; i < heartbeats.size(); i++) {
            double gap = heartbeats.get(i).time() - heartbeats.get(i - 1).time();
            if (gap < pauseMinutes * 60.0) {
                total += gap;
            }
        }
        return Math.round(total);
    }

    private double sessionStart(List<Heartbeat> heartbeats) {
        int i = heartbeats.size() - 1;
        while (i > 0 && heartbeats.get(i).time() - heartbeats.get(i - 1).time() < pauseMinutes * 60.0) {
            i--;
        }
        return heartbeats.get(i).time();
    }

    private String day(long millis) {
        return LocalDate.ofInstant(Instant.ofEpochMilli(millis), zone).toString();
    }

    private int minutesOfDay(long millis) {
        ZonedDateTime time = ZonedDateTime.ofInstant(Instant.ofEpochMilli(millis), zone);
        return time.getHour() * 60 + time.getMinute();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record HeartbeatsResponse(List<Heartbeat> data) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Heartbeat(String type,
                            Double time,
                            String project,
                            String branch,
                            String language,
                            @JsonProperty("user_agent_id") String userAgentId) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UserAgentsResponse(List<UserAgent> data) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UserAgent(String id, String editor) {
    }

    public record CodandoView(int atualizarSegundos, boolean ativo, long hojeSegundos, Last ultimo) {
    }

    public record Last(boolean publico,
                       String projeto,
                       String branch,
                       String linguagem,
                       String editor,
                       long em,
                       long sessaoDesde,
                       long projetoHojeSegundos) {
    }
}
