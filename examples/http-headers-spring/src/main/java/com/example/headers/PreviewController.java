package com.example.headers;

import java.nio.charset.StandardCharsets;
import org.springframework.web.util.HtmlUtils;

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
    @PostMapping(value = "/articles/preview",
            consumes = "application/json", produces = "image/svg+xml")
    public byte[] image(@RequestBody ArticleRequest request) {
        // Escape user text so it cannot become SVG markup.
        String title = HtmlUtils.htmlEscape(request.title() == null ? "" : request.title());
        String svg = """
                <svg xmlns="http://www.w3.org/2000/svg" width="800" height="240" viewBox="0 0 800 240">
                  <rect width="800" height="240" rx="20" fill="#edf3fa"/>
                  <text x="40" y="65" font-family="sans-serif" font-size="20" fill="#526077">Article preview</text>
                  <text x="40" y="140" font-family="sans-serif" font-size="32" fill="#183b66">%s</text>
                </svg>
                """.formatted(title);
        return svg.getBytes(StandardCharsets.UTF_8);
    }
}
