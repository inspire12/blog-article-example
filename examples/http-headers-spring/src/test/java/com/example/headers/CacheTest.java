package com.example.headers;

import java.net.URI;
import java.net.http.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CacheTest {
    @LocalServerPort int port;
    private final HttpClient client = HttpClient.newHttpClient();
    private HttpRequest.Builder request(String suffix) {
        return HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/cache/article" + suffix));
    }
    private HttpResponse<String> send(HttpRequest.Builder request) throws Exception {
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }
    @Test void unchangedThenUpdatedRepresentation() throws Exception {
        var first = send(request("").GET());
        assertEquals(200, first.statusCode());
        String tag = first.headers().firstValue("ETag").orElseThrow();
        assertTrue(first.headers().firstValue("Cache-Control").orElseThrow().contains("no-cache"));
        var unchanged = send(request("").header("If-None-Match", tag).GET());
        assertEquals(304, unchanged.statusCode());
        assertEquals("", unchanged.body());
        assertEquals(tag, unchanged.headers().firstValue("ETag").orElseThrow());
        assertTrue(unchanged.headers().firstValue("Cache-Control").orElseThrow().contains("no-cache"));
        var updated = send(request("").header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString("{\"title\":\"캐시 수정 확인\"}")));
        assertEquals(204, updated.statusCode());
        var changed = send(request("").header("If-None-Match", tag).GET());
        assertEquals(200, changed.statusCode());
        assertTrue(changed.body().contains("캐시 수정 확인"));
        assertNotEquals(tag, changed.headers().firstValue("ETag").orElseThrow());
    }
    @Test void freshPolicyAndMultipleValidators() throws Exception {
        var first = send(request("/fresh").GET());
        String policy = first.headers().firstValue("Cache-Control").orElseThrow();
        assertTrue(policy.contains("max-age=60"));
        assertTrue(policy.contains("private"));
        assertTrue(policy.contains("must-revalidate"));
        var checked = send(request("/fresh").header("If-None-Match",
                "\"other\", " + first.headers().firstValue("ETag").orElseThrow()).GET());
        assertEquals(304, checked.statusCode());
    }
}
