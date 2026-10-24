package com.example.headers;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class NegotiationTest {
    @Autowired MockMvc mvc;
    private static final String BODY = "{\"title\":\"HTTP 헤더\"}";

    @Test void jsonInputJsonOutput() throws Exception {
        mvc.perform(post("/articles/preview").contentType("application/json")
                .accept("application/json").content(BODY))
            .andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith("application/json"))
            .andExpect(jsonPath("$.title").value("HTTP 헤더"));
    }
    @Test void jsonInputTextOutput() throws Exception {
        mvc.perform(post("/articles/preview").contentType("application/json")
                .accept("text/plain").content(BODY))
            .andExpect(status().isOk()).andExpect(content().contentType("text/plain;charset=UTF-8"))
            .andExpect(content().string("Preview: HTTP 헤더"));
    }
    @Test void unsupportedInput() throws Exception {
        mvc.perform(post("/articles/preview").contentType("text/plain")
                .accept("application/json").content("hello"))
            .andExpect(status().isUnsupportedMediaType());
    }
    @Test void unsupportedOutput() throws Exception {
        mvc.perform(post("/articles/preview").contentType("application/json")
                .accept("application/xml").content(BODY))
            .andExpect(status().isNotAcceptable());
    }
    @Test void invalidJson() throws Exception {
        mvc.perform(post("/articles/preview").contentType("application/json")
                .accept("application/json").content("not-json"))
            .andExpect(status().isBadRequest());
    }
    @Test void jsonInputSvgOutput() throws Exception {
        mvc.perform(post("/articles/preview").contentType("application/json")
                .accept("image/svg+xml").content(BODY))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith("image/svg+xml"))
            .andExpect(xpath("/*[local-name()='svg']").exists())
            .andExpect(xpath("//*[local-name()='text'][2]").string("HTTP 헤더"));
    }
    @Test void svgTitleIsTextNotMarkup() throws Exception {
        mvc.perform(post("/articles/preview").contentType("application/json")
                .accept("image/svg+xml")
                .content("{\"title\":\"<script>alert(1)</script> & 제목\"}"))
            .andExpect(status().isOk())
            .andExpect(xpath("//*[local-name()='script']").doesNotExist())
            .andExpect(xpath("//*[local-name()='text'][2]")
                    .string("<script>alert(1)</script> & 제목"));
    }
}
