package com.example.headers;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cache/article")
public class CacheController {
    public record Article(String title) {}
    private record Snapshot(Article article, String tag) {}
    // One immutable snapshot keeps the body and validator consistent.
    private final AtomicReference<Snapshot> current = new AtomicReference<>(
            new Snapshot(new Article("HTTP 헤더"), UUID.randomUUID().toString()));

    @GetMapping(produces = "application/json")
    public ResponseEntity<Article> read() {
        return response(CacheControl.noCache().cachePrivate());
    }

    @GetMapping(value = "/fresh", produces = "application/json")
    public ResponseEntity<Article> fresh() {
        return response(CacheControl.maxAge(Duration.ofSeconds(60)).cachePrivate().mustRevalidate());
    }

    private ResponseEntity<Article> response(CacheControl policy) {
        Snapshot snapshot = current.get();
        // Weak validator identifies this data revision, not exact encoded bytes.
        return ResponseEntity.ok().cacheControl(policy)
                .eTag("W/\"" + snapshot.tag() + "\"").body(snapshot.article());
    }

    // Local learning example only: no DB persistence or authentication.
    @PutMapping(consumes = "application/json")
    public ResponseEntity<Void> update(@RequestBody Article article) {
        current.set(new Snapshot(article, UUID.randomUUID().toString()));
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }
}
