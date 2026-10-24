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
