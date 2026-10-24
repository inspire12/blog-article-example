package com.example.headers;

import java.net.URI;
import java.net.http.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthTest {
    @LocalServerPort int port;
    private final HttpClient client = HttpClient.newHttpClient();
    private HttpResponse<String> get(String auth) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/auth/article"));
        if (auth != null) request.header("Authorization", auth);
        return client.send(request.GET().build(), HttpResponse.BodyHandlers.ofString());
    }
    @Test void missingCredentialsHaveChallengeWithoutError() throws Exception {
        var response = get(null);
        assertEquals(401, response.statusCode());
        assertEquals("Bearer realm=\"articles\"", response.headers().firstValue("WWW-Authenticate").orElseThrow());
        assertEquals("", response.body());
    }
    @Test void invalidTokenIsUnauthorized() throws Exception {
        var response = get("Bearer wrong-token");
        assertEquals(401, response.statusCode());
        assertTrue(response.headers().firstValue("WWW-Authenticate").orElseThrow().contains("invalid_token"));
        assertEquals("", response.body());
    }
    @Test void validTokenWithoutScopeIsForbidden() throws Exception {
        var response = get("Bearer demo-no-scope");
        assertEquals(403, response.statusCode());
        String challenge = response.headers().firstValue("WWW-Authenticate").orElseThrow();
        assertTrue(challenge.contains("insufficient_scope"));
        assertTrue(challenge.contains("articles:read"));
        assertEquals("", response.body());
    }
    @Test void validTokenReturnsProtectedBody() throws Exception {
        var response = get("bearer demo-reader");
        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("인증된 요청으로 읽는 글"));
        assertEquals("no-store", response.headers().firstValue("Cache-Control").orElseThrow());
        assertTrue(response.headers().firstValue("WWW-Authenticate").isEmpty());
    }
}
