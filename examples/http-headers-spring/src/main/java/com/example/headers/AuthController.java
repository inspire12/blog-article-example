package com.example.headers;

import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

/** Header-flow demonstration only: fixed public tokens, no token issuance or real identity verification. */
@RestController
public class AuthController {
    @GetMapping("/auth/article")
    public ResponseEntity<Map<String, String>> read(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        if (authorization == null || !authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return rejected(401, "Bearer realm=\"articles\"");
        }
        String token = authorization.substring(7).trim();
        if (token.equals("demo-no-scope")) {
            return rejected(403, "Bearer realm=\"articles\", error=\"insufficient_scope\", scope=\"articles:read\"");
        }
        if (!token.equals("demo-reader")) {
            return rejected(401, "Bearer realm=\"articles\", error=\"invalid_token\"");
        }
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(Map.of("title", "인증된 요청으로 읽는 글"));
    }

    private ResponseEntity<Map<String, String>> rejected(int status, String challenge) {
        return ResponseEntity.status(status).cacheControl(CacheControl.noStore())
                .header(HttpHeaders.WWW_AUTHENTICATE, challenge).build();
    }
}
