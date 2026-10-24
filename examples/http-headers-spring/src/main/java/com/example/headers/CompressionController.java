package com.example.headers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CompressionController {
    @GetMapping(value = "/compression/article", produces = "text/plain;charset=UTF-8")
    public String article() {
        return "HTTP 헤더는 요청과 응답의 처리 정보를 전달합니다.\n".repeat(200);
    }
}
