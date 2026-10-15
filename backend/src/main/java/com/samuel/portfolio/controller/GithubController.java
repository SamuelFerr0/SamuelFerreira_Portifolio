package com.samuel.portfolio.controller;

import com.samuel.portfolio.dto.Share;
import com.samuel.portfolio.service.GithubService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/github")
public class GithubController {

    private static final Pattern REPO_NAME = Pattern.compile("^(?!\\.\\.?$)[\\w.-]{1,100}$");
    private static final String SUFFIX = "/languages";

    private final GithubService service;

    public GithubController(GithubService service) {
        this.service = service;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> proxy(@RequestParam(required = false) String path) {
        if (path == null || !allowed(path)) {
            return respond(HttpStatus.BAD_REQUEST.value(), "{\"message\":\"Caminho nao permitido no proxy\"}");
        }
        try {
            return respond(HttpStatus.OK.value(), service.proxy(path));
        } catch (RestClientResponseException exception) {
            return respond(exception.getStatusCode().value(), exception.getResponseBodyAsString());
        }
    }

    @GetMapping("/linguagens")
    public List<Share> linguagens() {
        return service.languages();
    }

    @GetMapping("/atividade")
    public List<GithubService.CommitView> atividade() {
        return service.activity();
    }

    @GetMapping("/perfil")
    public GithubService.PerfilView perfil() {
        return service.perfil();
    }

    private boolean allowed(String path) {
        if (path.equals(service.recentReposPath())) {
            return true;
        }
        String prefix = service.languagesPath("");
        prefix = prefix.substring(0, prefix.length() - 1);
        if (!path.startsWith(prefix) || !path.endsWith(SUFFIX) || path.length() <= prefix.length() + SUFFIX.length()) {
            return false;
        }
        String repo = path.substring(prefix.length(), path.length() - SUFFIX.length());
        return REPO_NAME.matcher(repo).matches() && service.repoNames().contains(repo);
    }

    private static ResponseEntity<String> respond(int status, String body) {
        return ResponseEntity.status(status)
                .header("X-GitHub-Proxy", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body);
    }
}
