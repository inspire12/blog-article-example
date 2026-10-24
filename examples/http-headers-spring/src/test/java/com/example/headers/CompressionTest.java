package com.example.headers;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.zip.GZIPInputStream;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CompressionTest {
    @LocalServerPort int port;

    private HttpResponse<byte[]> get(String encoding) throws Exception {
        return HttpClient.newHttpClient().send(HttpRequest.newBuilder(
                URI.create("http://localhost:" + port + "/compression/article"))
                .header("Accept-Encoding", encoding).GET().build(),
                HttpResponse.BodyHandlers.ofByteArray());
    }

    @Test void gzipBytesDecodeToIdentityBody() throws Exception {
        var plain = get("identity");
        var gzip = get("gzip");
        assertEquals(200, plain.statusCode());
        assertEquals(200, gzip.statusCode());
        assertTrue(plain.headers().firstValue("Content-Encoding").isEmpty());
        assertEquals("gzip", gzip.headers().firstValue("Content-Encoding").orElseThrow());
        assertTrue(gzip.headers().firstValue("Content-Type").orElseThrow().startsWith("text/plain"));
        assertTrue(gzip.headers().allValues("Vary").stream()
                .anyMatch(v -> v.toLowerCase().contains("accept-encoding")));
        try (var decoded = new GZIPInputStream(new ByteArrayInputStream(gzip.body()))) {
            assertArrayEquals(plain.body(), decoded.readAllBytes());
        }
        assertTrue(gzip.body().length < plain.body().length);
        System.out.printf("COMPRESSION_BYTES identity=%d gzip=%d%n", plain.body().length, gzip.body().length);
    }
}
