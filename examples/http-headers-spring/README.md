# Accept와 Content-Type — Spring MVC 예제

Java 21, Spring Boot 3.5.7, Gradle 8.13에 고정한 학습용 예제다. 최신 버전임을 의미하지 않는다. DB 저장·인증 없이 받은 제목의 미리보기만 만든다.

## 실행

```bash
cd examples/http-headers-spring
./gradlew test
./gradlew bootRun
```

첫 실행에는 의존성 다운로드를 위한 네트워크가 필요하다. 기본 포트는 8080이다. 종료는 Ctrl+C.

## 요청

```bash
curl -i http://localhost:8080/articles/preview \
  -H 'Content-Type: application/json' -H 'Accept: text/plain' \
  --data '{"title":"HTTP 헤더"}'

curl -i http://localhost:8080/articles/preview \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  --data '{"title":"HTTP 헤더"}'
```

첫 요청은 텍스트, 두 번째는 JSON 응답이다. 상태 코드·응답 Content-Type·실제 본문을 함께 확인한다. 글 생성 API가 아니므로 201 대신 200을 사용한다.

```bash
# 지원하지 않는 요청 형식 → 415
curl -i http://localhost:8080/articles/preview \
  -H 'Content-Type: text/plain' -H 'Accept: application/json' --data 'hello'

# 지원하지 않는 응답 형식 → 406
curl -i http://localhost:8080/articles/preview \
  -H 'Content-Type: application/json' -H 'Accept: application/xml' \
  --data '{"title":"HTTP 헤더"}'

# JSON이라고 선언했지만 실제 본문이 JSON이 아님 → 400
curl -i http://localhost:8080/articles/preview \
  -H 'Content-Type: application/json' -H 'Accept: application/json' --data 'not-json'
```

## 구현과 검증 범위

[Controller](src/main/java/com/example/headers/PreviewController.java)의 consumes는 요청 형식, produces는 응답 형식의 매핑 조건이다. 실제 읽기·쓰기는 메시지 컨버터가 담당한다. 입력 검증·보안·와일드카드 Accept에서의 기본 형식 정책은 예제 범위 밖이다.

[테스트](src/test/java/com/example/headers/NegotiationTest.java)는 전체 Spring 컨텍스트와 MockMvc로 매핑·변환을 확인한다. 실제 네트워크를 쓰지 않는 테스트이며 브라우저 검증과는 구분한다.

[블로그 본문](../../docs/http-headers/SECTION-01-representation.md) · [도식 PNG](../../output/diagrams/http-accept-content-type.png) · [SVG 원본](../../output/diagrams/http-accept-content-type.svg)

## 실제 검증 결과

2026-10-24, macOS arm64 / Amazon Corretto 21.0.3 / Gradle 8.13 / Spring Boot 3.5.7에서 `gradle test wrapper --gradle-version 8.13 --no-daemon` 성공. MockMvc 테스트 5개 통과(실패·오류 0). JSON·텍스트 응답과 400·406·415를 확인했다. curl을 통한 실제 소켓 요청 및 티스토리 발행은 아직 실행하지 않았다.

## 응답 압축 예제

`GET /compression/article`은 반복되는 UTF-8 텍스트를 반환한다. `application.properties`에서 응답 압축을 활성화하고 최소 크기를 1KB로 설정했다. 내장 Tomcat이 gzip 처리를 담당한다.

```bash
curl -i -H 'Accept-Encoding: identity' http://localhost:8080/compression/article
curl --compressed http://localhost:8080/compression/article
```

원시 gzip 바이트를 파일로 저장·복원하는 명령은 [압축 본문](../../docs/http-headers/SECTION-02-compression.md)에 있다. `--compressed`는 자동 복원하므로 압축 크기 측정에는 사용하지 않는다.

2026-10-24: 전체 테스트 6개 성공. 기존 MockMvc 5개에 더해 `CompressionTest`가 RANDOM_PORT로 내장 Tomcat을 기동하고 Java HttpClient로 실제 소켓 요청을 보냈다. identity 응답은 Content-Encoding 없음, gzip 응답은 Content-Encoding: gzip 및 Vary: Accept-Encoding 확인. gzip 복원 결과와 원문 바이트 일치. 반복 문장 200회의 원문은 13,800바이트, gzip 본문은 167바이트였다. 실제 서비스 압축률이나 응답 시간 개선을 대표하는 측정이 아니다. curl 명령 자체의 실행은 미검증이다.

## 이미지 표현도 선택하기

같은 `POST /articles/preview`에 `Accept: image/svg+xml`을 보내면 제목을 담은 SVG 이미지 바이트를 반환한다. 요청 Content-Type은 여전히 application/json이다. SVG는 텍스트로 작성 가능한 이미지 형식이므로 별도 이미지 라이브러리 없이 변환 관계를 보여줄 수 있다. 제목은 마크업으로 해석되지 않도록 이스케이프한다. 고정 크기 학습 예제라 긴 제목은 이미지 영역 밖으로 잘릴 수 있다.

```bash
curl -sS -D /tmp/article-preview.headers \
  http://localhost:8080/articles/preview \
  -H 'Content-Type: application/json' \
  -H 'Accept: image/svg+xml' \
  --data '{"title":"HTTP 헤더"}' \
  -o /tmp/article-preview.svg
```

저장한 SVG를 브라우저로 열면 이미지가 보인다. API는 POST이므로 주소창으로 API URL을 여는 GET 요청과는 다르다.

브라우저에서 직접 비교하려면 서버 실행 후 `http://localhost:8080/preview.html`을 연다. 제목과 Accept를 선택하면 같은 JSON 요청으로 JSON·텍스트·SVG 응답을 비교한다. SVG는 fetch의 Blob 결과를 img에 표시한다. 이 페이지는 서버를 통해 열어야 한다.

이미지 추가 검증(2026-10-24): 전체 테스트 8개 통과. SVG 응답의 MIME 타입·XML 구조·한글 제목 및 마크업 이스케이프 확인. 브라우저 비교 화면은 JavaScript 문법 검사 완료, 실제 브라우저 렌더링은 미확인.

## 캐시·재검증 예제

[2편 캐시 본문](../../docs/http-headers/BLOG-02-cache-auth-state.md) · [CacheController](src/main/java/com/example/headers/CacheController.java) · [CacheTest](src/test/java/com/example/headers/CacheTest.java)

서버를 실행한 다음 순서대로 요청한다. `실제-응답-UUID`는 첫 응답의 ETag 값으로 바꾼다. 수정 후에도 이전 값을 보내야 변경 후 200을 확인할 수 있다.

```bash
curl -i http://localhost:8080/cache/article
curl -i -H 'If-None-Match: W/"실제-응답-UUID"' http://localhost:8080/cache/article
curl -i -X PUT http://localhost:8080/cache/article \
  -H 'Content-Type: application/json' --data '{"title":"수정한 제목"}'
curl -i -H 'If-None-Match: W/"실제-응답-UUID"' http://localhost:8080/cache/article
```

예상 순서는 200(본문·태그), 304(본문 없음), 204(수정 완료), 200(새 본문·새 태그)이다. UUID는 변경마다 새로 생성하며 약한 검증자로 제공한다. 데이터와 태그를 하나의 불변 스냅샷으로 저장해 서로 다른 버전이 조합되지 않도록 했다. DB나 인증이 없는 메모리 예제이며 재시작 시 초기화된다.

`GET /cache/article/fresh`는 `private, max-age=60, must-revalidate` 정책을 제공한다. 브라우저에서 확인할 때 Network 탭의 Disable cache를 끄고 같은 URL을 다시 요청한다. 강제 새로고침은 일반적인 재사용과 다를 수 있다. `/cache/article`에 PUT을 보내도 별개 URL인 `/cache/article/fresh`의 기존 브라우저 캐시가 즉시 제거되는 것은 아니다.

검증(2026-10-24): 전체 테스트 10개 통과, 실패·오류 0. CacheTest 2개는 내장 서버에 Java HttpClient로 실제 HTTP 요청을 보내 200→304→수정→200, 빈 304 본문, 정책·태그 유지, 복수 If-None-Match 값을 확인했다. HttpClient는 응답 캐시를 구현하지 않으므로 브라우저의 신선한 응답 재사용은 검증하지 않았다. 위 curl 명령 자체도 별도로 실행하지 않았다.
