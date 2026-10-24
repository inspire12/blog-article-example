### 압축: 같은 내용을 더 적은 바이트로 전달하기

앞에서는 어떤 형식의 데이터를 주고받을지 살펴봤습니다. 이번에는 그 데이터를 압축해서 전달하는 방법입니다. 반복되는 내용이 많은 텍스트는 압축하면 본문 전송량을 줄일 수 있습니다. 다만 압축·복원에도 처리 비용이 들기 때문에 모든 응답을 무조건 압축하는 것이 목표는 아닙니다.

응답 압축에서는 다음 두 헤더를 함께 봅니다.

| 헤더 | 역할 |
| --- | --- |
| 요청의 `Accept-Encoding` | 클라이언트가 처리할 수 있는 콘텐츠 인코딩을 알림 |
| 응답의 `Content-Encoding` | 서버가 실제 본문에 적용한 콘텐츠 인코딩을 알림 |

여기서는 gzip을 사용합니다. 클라이언트가 gzip을 지원한다고 해서 서버가 반드시 압축해야 하는 것은 아닙니다. 서버의 지원 방식, 응답 크기와 종류 등도 영향을 줍니다. [MDN Accept-Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Encoding)

![gzip 응답 압축과 복원 흐름](../../output/diagrams/http-compression.png)

```http
GET /compression/article HTTP/1.1
Host: localhost:8080
Accept: text/plain
Accept-Encoding: gzip
```

이 요청은 “텍스트 응답을 받고 싶으며, gzip으로 압축해도 처리할 수 있다”는 뜻입니다. 서버가 gzip을 적용하면 다음처럼 응답합니다.

```http
HTTP/1.1 200 OK
Content-Type: text/plain;charset=UTF-8
Content-Encoding: gzip
Vary: Accept-Encoding

[gzip으로 압축된 본문 바이트]
```

설명을 위해 일부 헤더를 생략했습니다. `Content-Type`은 여전히 `text/plain`입니다. 압축 파일 자체를 다운로드하는 상황이 아니라, 텍스트 표현에 gzip 인코딩을 적용했기 때문입니다. 클라이언트는 gzip을 복원한 다음 UTF-8 텍스트로 해석합니다. `Content-Encoding`을 적는 것만으로 본문이 압축되는 것은 아닙니다. [MDN Content-Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding)

`Vary: Accept-Encoding`은 캐시가 응답을 선택할 때 요청의 인코딩 조건도 고려하도록 알립니다. 압축과 캐시가 만나는 부분이며 자세한 동작은 캐시 편에서 살펴보겠습니다.

### Spring Boot에서는 실제 압축을 서버에 맡긴다

기존 Spring 예제에 다음 Controller를 추가합니다. 반복 문장은 압축 여부를 쉽게 관찰하기 위한 실습 데이터이며, 실제 서비스의 평균 압축률을 대표하지 않습니다.

```java
@RestController
public class CompressionController {
    @GetMapping(value = "/compression/article",
            produces = "text/plain;charset=UTF-8")
    public String article() {
        return "HTTP 헤더는 요청과 응답의 처리 정보를 전달합니다.\n".repeat(200);
    }
}
```

Controller는 압축하지 않은 문자열만 반환합니다. `application.properties`에서 응답 압축을 활성화합니다.

```properties
server.compression.enabled=true
server.compression.mime-types=application/json,text/plain
server.compression.min-response-size=1KB
```

이 예제는 Spring Boot 3.5.7의 내장 Tomcat을 사용합니다. 설정은 압축 활성화, 대상 MIME 타입, 최소 응답 크기를 지정합니다. 대상 목록을 명시하면 이 목록을 사용하므로 다른 타입도 압축하려면 추가해야 합니다. 응답 길이를 사전에 알 수 있는지 등 컨테이너 조건도 영향을 줄 수 있습니다. [Spring Boot 응답 압축 안내](https://docs.spring.io/spring-boot/how-to/webserver.html#howto.webserver.enable-response-compression)

애플리케이션에서 gzip 바이트를 직접 만들거나 Content-Encoding을 수동 설정할 필요는 없습니다. 이 실습에서는 내장 서버가 실제 압축과 관련 헤더 처리를 담당합니다.

### 헤더와 실제 바이트를 함께 확인하기

[Spring 예제](../../examples/http-headers-spring/README.md)를 실행한 뒤, 다음 명령을 임시 작업 폴더에서 실행합니다.

```bash
mkdir -p /tmp/http-header-compression
cd /tmp/http-header-compression

# 압축하지 않은 응답
curl -sS -D identity.headers -o identity.txt \
  -H 'Accept-Encoding: identity' \
  http://localhost:8080/compression/article

# gzip 바이트 그대로 저장 (--compressed를 사용하지 않음)
curl -sS -D gzip.headers -o response.gz \
  -H 'Accept-Encoding: gzip' \
  http://localhost:8080/compression/article

cat gzip.headers
gzip -dc response.gz > decoded.txt
cmp identity.txt decoded.txt
wc -c identity.txt response.gz
```

`identity`는 콘텐츠 인코딩을 적용하지 않은 응답을 요청합니다. gzip 응답에서는 `Content-Encoding: gzip`을 확인하고, 압축을 푼 파일이 원문과 같은지 비교합니다. `cmp`는 내용이 같으면 출력 없이 성공합니다. 크기 비교는 본문 바이트만 비교하며 헤더·TLS 등 전체 네트워크 비용이나 지연 개선을 측정한 것은 아닙니다.

읽을 수 있는 결과만 빠르게 확인하려면 다음처럼 쓸 수도 있습니다.

```bash
curl --compressed http://localhost:8080/compression/article
```

이 옵션은 curl이 지원하는 압축을 요청하고 응답을 자동으로 복원합니다. 따라서 이 방식으로 저장한 파일 크기를 압축된 원본 크기라고 보면 안 됩니다. 브라우저 역시 보통 자동 복원하므로 화면에서 텍스트가 읽힌다는 이유만으로 비압축 응답이라고 판단하지 않습니다.

압축을 이해할 때는 **지원한다고 알린 방식, 실제 적용된 방식, 복원한 본문의 일치 여부**를 함께 확인하면 됩니다.

실제 검증에서는 Java 21·Spring Boot 3.5.7의 내장 Tomcat에 HTTP 요청을 보내 확인했습니다. 반복 문장 200회로 만든 원문은 13,800바이트, gzip 본문은 167바이트였고 복원한 바이트가 원문과 일치했습니다. 이 수치는 위 실습 데이터에 한정되며 일반적인 서비스 압축률을 의미하지 않습니다. 기존 예제를 포함해 자동 테스트 6개가 통과했습니다. 위 curl 명령은 수동 재현용이며 실제 테스트는 Java HttpClient로 수행했습니다.
