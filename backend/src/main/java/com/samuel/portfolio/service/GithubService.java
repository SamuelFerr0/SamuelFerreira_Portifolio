package com.samuel.portfolio.service;

import com.samuel.portfolio.dto.Share;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GithubService {
    private final RestClient client;
    private final String user;
    private final List<String> hidden;

    public GithubService(@Value("${github.username}") String user,
                         @Value("${github.token}") String token,
                         @Value("${github.hidden-repos:}") List<String> hidden) {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl("https://api.github.com")
                .defaultHeader("Accept", "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28");
        if (!token.isBlank()) {
            builder.defaultHeader("Authorization", "Bearer " + token);
        }
        this.client = builder.build();
        this.user = user;
        this.hidden = hidden.stream().map(String::trim).filter(name -> !name.isEmpty()).map(String::toLowerCase).toList();
    }

    public String recentReposPath() {
        return "/users/" + user + "/repos?type=owner&sort=created&direction=asc&per_page=100";
    }

    public String languagesPath(String repo) {
        return "/repos/" + user + "/" + repo + "/languages";
    }

    @Cacheable("github-repo-names")
    public List<String> repoNames() {
        return ownRepos().stream().map(GithubRepo::name).toList();
    }

    @Cacheable("github-proxy")
    public String proxy(String path) {
        return client.get().uri(path).retrieve().body(String.class);
    }

    @Cacheable("github-languages")
    public List<Share> languages() {
        Map<String, Long> bytes = new HashMap<>();
        for (GithubRepo repo : ownRepos().stream().limit(30).toList()) {
            Map<String, Long> repoBytes = client.get()
                    .uri("/repos/{user}/{repo}/languages", Map.of("user", user, "repo", repo.name()))
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Long>>() {
                    });
            if (repoBytes != null) {
                repoBytes.forEach((language, value) -> bytes.merge(language, value, Long::sum));
            }
        }
        long total = bytes.values().stream().mapToLong(Long::longValue).sum();
        if (total == 0) {
            return List.of();
        }
        return bytes.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .map(entry -> new Share(entry.getKey(), Math.round(entry.getValue() * 1000.0 / total) / 10.0))
                .toList();
    }

    @Cacheable("github-activity")
    public List<CommitView> activity() {
        List<CommitView> commits = new ArrayList<>();
        for (GithubRepo repo : ownRepos().stream().limit(5).toList()) {
            List<GithubCommit> list = client.get()
                    .uri("/repos/{user}/{repo}/commits?author={user}&per_page=5",
                            Map.of("user", user, "repo", repo.name()))
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<GithubCommit>>() {
                    });
            if (list == null) {
                continue;
            }
            for (GithubCommit item : list) {
                if (item.commit() == null || item.commit().author() == null) {
                    continue;
                }
                commits.add(new CommitView(repo.name(), firstLine(item.commit().message()),
                        item.commit().author().date()));
            }
        }
        return commits.stream()
                .sorted(Comparator.comparing(CommitView::date).reversed())
                .limit(10)
                .toList();
    }

    @Cacheable("github-perfil")
    public PerfilView perfil() {
        GithubUser dados = client.get().uri("/users/{user}", user).retrieve().body(GithubUser.class);
        if (dados == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "GitHub nao respondeu");
        }
        List<GithubRepo> repos = ownRepos();
        int stars = repos.stream().mapToInt(GithubRepo::stars).sum();
        int forks = repos.stream().mapToInt(GithubRepo::forks).sum();
        String createdAt = dados.createdAt() != null && dados.createdAt().length() >= 10
                ? dados.createdAt().substring(0, 10)
                : null;
        UserView view = new UserView(dados.login(),
                dados.name() != null && !dados.name().isBlank() ? dados.name() : dados.login(),
                dados.avatarUrl(), dados.url(), dados.bio(), dados.company(), dados.location(),
                dados.followers(), dados.following(), createdAt);
        return new PerfilView(view, repos.size(), stars, forks);
    }

    private List<GithubRepo> ownRepos() {
        List<GithubRepo> all = client.get()
                .uri("/users/{user}/repos?type=owner&sort=updated&per_page=100", user)
                .retrieve()
                .body(new ParameterizedTypeReference<List<GithubRepo>>() {
                });
        if (all == null) {
            return List.of();
        }
        return all.stream().filter(repo -> !repo.fork() && !hidden.contains(repo.name().toLowerCase())).toList();
    }

    private static String firstLine(String message) {
        if (message == null) {
            return "";
        }
        return message.split("\n", 2)[0];
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GithubRepo(String name,
                             String description,
                             String language,
                             boolean fork,
                             @JsonProperty("html_url") String htmlUrl,
                             @JsonProperty("updated_at") String updatedAt,
                             @JsonProperty("stargazers_count") int stars,
                             @JsonProperty("forks_count") int forks) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GithubUser(String login,
                             String name,
                             @JsonProperty("avatar_url") String avatarUrl,
                             @JsonProperty("html_url") String url,
                             String bio,
                             String company,
                             String location,
                             int followers,
                             int following,
                             @JsonProperty("created_at") String createdAt) {
    }

    public record UserView(String login, String name, String avatarUrl, String url, String bio,
                           String company, String location, int followers, int following, String createdAt) {
    }

    public record PerfilView(UserView user, int repos, int stars, int forks) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GithubCommit(CommitDetail commit) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CommitDetail(String message, CommitAuthor author) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CommitAuthor(String date) {
    }

    public record CommitView(String repo, String message, String date) {
    }
}
