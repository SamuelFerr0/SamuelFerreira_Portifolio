package com.samuel.portfolio.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class WakatimeService {

    private static final Set<String> RANGES =
            Set.of("last_7_days", "last_30_days", "last_6_months", "last_year", "all_time");
    private static final double MIN_SECONDS = 60;

    private final WakaTimeClient client;
    private final String defaultRange;
    private final int maxLanguages;
    private final Set<String> hiddenLanguages;
    private final String profileUrl;
    private final boolean showProjects;

    public WakatimeService(WakaTimeClient client,
                           @Value("${wakatime.default-range}") String defaultRange,
                           @Value("${wakatime.max-languages}") int maxLanguages,
                           @Value("${wakatime.hidden-languages}") String hiddenLanguages,
                           @Value("${wakatime.profile-url}") String profileUrl,
                           @Value("${wakatime.show-projects}") boolean showProjects) {
        if (!RANGES.contains(defaultRange)) {
            throw new IllegalArgumentException("wakatime.default-range invalido: " + defaultRange);
        }
        this.client = client;
        this.defaultRange = defaultRange;
        this.maxLanguages = maxLanguages;
        this.hiddenLanguages = Arrays.stream(hiddenLanguages.split(","))
                .map(name -> name.trim().toLowerCase(Locale.ROOT))
                .filter(name -> !name.isEmpty())
                .collect(Collectors.toSet());
        this.profileUrl = profileUrl.isBlank() ? null : profileUrl.trim();
        this.showProjects = showProjects;
    }

    public String defaultRange() {
        return defaultRange;
    }

    @Cacheable("wakatime")
    public WakatimeView stats(String range) {
        if (!RANGES.contains(range)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Periodo invalido");
        }
        StatsResponse response = client.get("/users/current/stats/{range}", StatsResponse.class, range);
        if (response.data() == null) {
            throw new WakaTimeException(WakaTimeException.Reason.UNAVAILABLE, "Estatisticas sem dados");
        }
        if ("pending_update".equals(response.data().status()) || response.data().languages() == null) {
            throw new WakaTimeException(WakaTimeException.Reason.PENDING, "Estatisticas ainda sendo calculadas");
        }
        StatsData data = response.data();
        return new WakatimeView(
                firstOf(data.totalSecondsIncludingOtherLanguage(), data.totalSeconds()),
                firstOf(data.dailyAverageIncludingOtherLanguage(), data.dailyAverage()),
                data.daysMinusHolidays(),
                data.daysIncludingHolidays(),
                since(data.start()),
                profileUrl,
                maxLanguages,
                items(data.languages()).stream()
                        .filter(item -> !hiddenLanguages.contains(item.name().toLowerCase(Locale.ROOT)))
                        .toList(),
                items(data.editors()),
                items(data.categories()),
                items(data.operatingSystems()),
                showProjects ? items(data.projects()) : List.of());
    }

    private static double firstOf(Double preferred, Double fallback) {
        if (preferred != null) {
            return preferred;
        }
        return fallback != null ? fallback : 0;
    }

    private static String since(String start) {
        return start != null && start.length() >= 10 ? start.substring(0, 10) : null;
    }

    private static List<Item> items(List<StatsItem> list) {
        if (list == null) {
            return List.of();
        }
        return list.stream()
                .filter(item -> item.totalSeconds() >= MIN_SECONDS)
                .map(item -> new Item(item.name(), item.totalSeconds(), item.percent()))
                .toList();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StatsResponse(StatsData data) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StatsData(String status,
                            String start,
                            @JsonProperty("total_seconds") Double totalSeconds,
                            @JsonProperty("total_seconds_including_other_language") Double totalSecondsIncludingOtherLanguage,
                            @JsonProperty("daily_average") Double dailyAverage,
                            @JsonProperty("daily_average_including_other_language") Double dailyAverageIncludingOtherLanguage,
                            @JsonProperty("days_minus_holidays") Integer daysMinusHolidays,
                            @JsonProperty("days_including_holidays") Integer daysIncludingHolidays,
                            List<StatsItem> languages,
                            List<StatsItem> editors,
                            List<StatsItem> categories,
                            @JsonProperty("operating_systems") List<StatsItem> operatingSystems,
                            List<StatsItem> projects) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StatsItem(String name, @JsonProperty("total_seconds") double totalSeconds, double percent) {
    }

    public record Item(String name, double seconds, double percent) {
    }

    public record WakatimeView(double totalSeconds,
                               double dailyAverage,
                               Integer activeDays,
                               Integer totalDays,
                               String since,
                               String profileUrl,
                               int maxLanguages,
                               List<Item> languages,
                               List<Item> editors,
                               List<Item> categories,
                               List<Item> operatingSystems,
                               List<Item> projects) {
    }
}
