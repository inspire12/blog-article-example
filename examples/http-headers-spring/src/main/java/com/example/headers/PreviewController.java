package com.example.headers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PreviewController {
    public record ArticleRequest(String title) {}
    public record ArticlePreview(String title, String message) {}

    @PostMapping(value = "/articles/preview",
            consumes = "application/json", produces = "application/json")
    public ArticlePreview json(@RequestBody ArticleRequest request) {
        return new ArticlePreview(request.title(), "Preview: " + request.title());
    }

    @PostMapping(value = "/articles/preview",
            consumes = "application/json", produces = "text/plain;charset=UTF-8")
    public String text(@RequestBody ArticleRequest request) {
        return "Preview: " + request.title();
    }
}
