# HTTP Header: 역할과 동작으로 묶어 이해하기

작성·출처 확인일: 2026-10-24. [3파트 연재 계획](SERIES.md)에 따라 [1편](BLOG-01-header-roles.md)에 이어 [2편 캐시·재검증 초안](BLOG-02-cache-auth-state.md)을 작성했다. Spring 표현 선택·압축·캐시 예제의 테스트 14개를 통과했다. 인증 예제까지 추가했고, 상태 유지와 브라우저 관련 실습은 후속 작업이며 발행 전이다.

## 글의 질문과 범위

“이 기능을 구현하려면 어떤 헤더를 보내야 하고, 제대로 동작하는지는 어디서 확인할까?”

HTTP 헤더는 요청·응답에 추가 정보를 담는다. 이 글에서는 본문의 표현 방식, 응답 재사용, 인증·상태, 브라우저 정책처럼 실제 동작을 중심으로 묶는다. 아래 묶음은 MDN의 공식 분류를 그대로 옮긴 것이 아니라 글을 위한 편집 구조다. 한 헤더가 여러 역할에 걸칠 수 있다.

출발 자료: [MDN 한국어 헤더 목록](https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Headers). 세부 의미와 지원 여부는 [영문 목록](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers) 및 개별 문서와 대조한다. 목록에 있다는 이유만으로 모든 헤더를 현재 권장 기능으로 소개하지 않는다.

## 티스토리용 표

[적용 안내와 2열·3열 서식](../../publishing/tistory/README.md) · [이번 글에 붙여 넣을 HTML](../../publishing/tistory/http-headers-tables.html) · [공통 CSS](../../publishing/tistory/tables.css) · [로컬 미리보기](../../publishing/tistory/preview.html). 역할별 지도를 작은 3열 표로 나누고 캐시 설명에 2열 표를 적용했다. 실제 티스토리 반영은 아직 하지 않았다.

## 역할별 지도

‘요청’은 클라이언트가 서버로, ‘응답’은 서버가 클라이언트로 보내는 방향이다. 브라우저가 자동으로 관리하는 헤더도 있으므로 모든 요청 헤더를 JavaScript에서 임의로 설정할 수 있다고 가정하지 않는다.

| 역할·독자의 질문 | 함께 볼 헤더 | 구현할 동작 | 확인할 증거 |
| --- | --- | --- | --- |
| 표현 선택·해석: 어떤 형식·언어를 주고받나? | 요청 `Accept`, `Accept-Language`; 요청·응답 `Content-Type`; 응답 `Content-Language`, `Vary` | 지원하는 표현 선택과 본문 파싱 | 요청 선호, 실제 본문, 응답 타입·언어 비교 |
| 압축: 같은 내용을 더 적은 바이트로 보내나? | 요청 `Accept-Encoding`; 응답 `Content-Encoding`, `Vary`; `Content-Length`가 있다면 함께 확인 | 지원하는 압축 방식 선택과 실제 압축 | 헤더뿐 아니라 압축 바이트·복원 결과 비교 |
| 캐시: 저장·재사용·재검증은 언제 하나? | 요청·응답 `Cache-Control`; 응답 `ETag`, `Last-Modified`, `Vary`, `Date`, `Age`; 요청 `If-None-Match`, `If-Modified-Since` | 캐시 정책 설정과 조건부 GET 처리 | 저장된 응답 재사용 여부, 재검증 요청, `200`·`304`와 본문 |
| 인증: 어떤 자격 증명을 요구·제출하나? | 응답 `WWW-Authenticate`; 요청 `Authorization` | 서버에서 자격 증명 검증 | 인증 정보 없는 요청·잘못된 요청·유효한 요청 비교 |
| 상태 유지: 이전 요청과 어떻게 연결하나? | 응답 `Set-Cookie`; 요청 `Cookie` | 쿠키 발급과 후속 요청의 세션 조회 | 브라우저 저장 상태와 실제 후속 요청 |
| CORS: 다른 출처의 스크립트가 응답을 읽어도 되나? | 요청 `Origin`, `Access-Control-Request-Method`, `Access-Control-Request-Headers`; 응답 `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Credentials`, `Access-Control-Expose-Headers`, `Vary` | 허용 출처·메서드·헤더 처리 | OPTIONS와 실제 요청, 브라우저 fetch 결과 |
| 브라우저 보안 정책: 무엇을 로드·실행할 수 있나? | 응답 `Content-Security-Policy`; 확장 후보 `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy` | 이번 실습은 CSP의 스크립트 제한에 집중 | 허용·차단된 스크립트와 브라우저 콘솔 |
| 이동·다운로드·부분 조회: 어디로 가고 어떻게 받을까? | 응답 `Location`, `Content-Disposition`, `Accept-Ranges`, `Content-Range`; 요청 `Range`, `If-Range` | 리다이렉트·첨부 다운로드·부분 응답을 각각 구현 | 상태 코드, 이동 대상, 다운로드, 실제 바이트 범위 |

표의 근거: [콘텐츠 협상](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation), [캐시](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching), [인증](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication), [쿠키](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies), [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy), [범위 요청](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests), [헤더 목록](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers).

## 본문 구성안

가제: **HTTP Header는 어떤 일을 할까? 역할별로 묶고 요청·응답으로 확인하기**

1. 본문만으로 전달되지 않는 정보: 헤더가 필요한 이유.
2. 위 역할 지도로 전체 범위를 소개한다.
3. 표현·압축: 클라이언트의 선호와 실제 응답을 연결한다.
4. 캐시: 최초 요청 → 재검증 → 변경 후 요청을 비교한다.
5. 인증·쿠키: 자격 증명 전달과 상태 유지를 구분한다.
6. CORS: 서버 응답과 브라우저의 읽기 허용을 구분한다.
7. 보안·다운로드·범위 요청은 짧은 사례로 소개하고 심화 주제로 연결한다.
8. 헤더 이름뿐 아니라 본문·상태 코드·브라우저 동작을 함께 확인하는 방법으로 마무리한다.

후속 글의 상세 실습 후보는 표현·캐시·CORS다. 나머지 역할은 전체 지도에 담고, 분량에 따라 후속 글로 확장한다. 모든 헤더의 옵션을 한 글에서 설명하는 것은 범위에서 제외한다.

각 절은 **문제 → 요청 헤더 → 서버 처리 → 응답 헤더 → 관찰 결과 → 흔한 오해** 순서로 쓴다.

## 본문에 쓸 요청·응답 예시: 캐시 재검증

아래는 설명용으로 작성한 HTTP/1.1 예시이며 실제 실행 로그가 아니다. HTTP/2·3의 전송 형식을 이 텍스트와 동일하게 설명하지 않는다.

최초 응답에서 재검증 정책과 식별자를 전달한다.

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-cache
ETag: "article-v1"

{"title":"HTTP Header"}
```

클라이언트가 저장된 식별자로 변경 여부를 묻는다.

```http
GET /article HTTP/1.1
Host: localhost:3000
If-None-Match: "article-v1"
```

현재 표현이 같은 경우 서버는 본문 없이 응답한다.

```http
HTTP/1.1 304 Not Modified
Cache-Control: no-cache
ETag: "article-v1"
```

이 흐름에서 `Cache-Control`은 재사용 정책, `ETag`는 표현의 검증자, `If-None-Match`는 요청 조건이다. `304`는 헤더가 아니라 상태 코드다. 서버가 비교 로직을 구현해야 하며 헤더를 붙이는 것만으로 재검증이 완성되지는 않는다. 이 예시는 일부 헤더를 생략했다. [근거: MDN 캐시 가이드](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)

## 실습 설계와 관측 방법

구현 후보 위치: `examples/http-headers/`. 아직 해당 서버는 없다. 아래 경로와 명령은 구현 후 사용할 계획이다.

| 실습 | 서버 구현·입력 변화 | 예상 관찰과 합격 기준 | 도구 |
| --- | --- | --- | --- |
| 표현 | `/representation`에서 지원하는 JSON·텍스트를 `Accept`에 따라 선택 | 본문과 `Content-Type`이 함께 바뀜. `Vary: Accept` 확인 | curl, Network |
| 압축 | 같은 본문을 identity·gzip으로 반환 | gzip 응답의 실제 바이트를 복원하면 원문과 같음. `Vary: Accept-Encoding` 확인 | curl, 압축 해제 도구 |
| 재검증 | `/article`에 ETag 비교 구현 | 첫 요청 200, 같은 태그 조건부 요청 304·본문 없음, 내용 변경 후 이전 태그 요청 200·새 태그 | curl, 서버 로그 |
| 브라우저 캐시 | 신선도 정책과 재검증 정책을 나누어 설정 | 실제 네트워크 요청이 없는 재사용과 304 재검증을 구분 | Network, 서버 로그 |
| CORS | 3001 포트의 페이지에서 3000 포트 API 호출. 허용·비허용 출처 및 커스텀 헤더 사용 | 허용 구성에서는 응답 읽기 성공. 비허용 구성은 브라우저에서 읽기 실패. preflight 실패 시 실제 요청 미전송 확인 | 브라우저 Network·Console |
| 쿠키 | 쿠키 발급 후 같은 사이트에서 후속 요청 | Set-Cookie 수신, 저장 여부, Cookie 송신을 각각 확인 | Network, Application |
| CSP | `script-src 'self'`가 있는 HTML에 외부 파일·인라인 스크립트 배치 | 같은 출처 파일 실행과 nonce/hash 없는 인라인 코드 차단을 구분 | 브라우저 Console |
| 범위 조회 | 고정 파일에 정상·범위 밖 Range 요청 | 지원 구현에서 206과 정확한 바이트, 충족 불가 범위에서 416 | curl, 파일 비교 |

관측용 명령 예시(현재 미실행):

```bash
curl -i -H 'Accept: application/json' http://localhost:3000/representation
curl -i http://localhost:3000/article
# 아래 태그는 실제 첫 응답에서 받은 값으로 바꾼다.
curl -i -H 'If-None-Match: "article-v1"' http://localhost:3000/article
```

본문까지 확인할 때는 GET과 `curl -i`를 쓴다. `curl -I`는 HEAD 요청이므로 GET의 본문 동작을 검증한 것으로 기록하지 않는다. curl은 일반 브라우저 HTTP 캐시나 CORS 집행을 재현하는 도구가 아니다. CORS 검증에는 두 출처의 브라우저 페이지가 필요하다.

브라우저 캐시 실험에서는 DevTools의 Disable cache를 끄고, 일반 재방문과 새로고침·강력 새로고침을 구분한다. 서비스 워커 개입 여부도 기록한다. 프록시 캐시를 구성하지 않았다면 `Age`가 나타날 것으로 가정하지 않는다.

## 글에서 구분할 개념

- `Accept`는 원하는 응답 표현, `Content-Type`은 해당 메시지의 본문 형식이다. 요청 본문에도 Content-Type을 쓴다. [콘텐츠 협상](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation)
- `no-cache`는 저장 금지가 아니라 재사용 전 검증을 요구한다. 저장 금지는 `no-store`다. [캐시](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
- `Secure`, `HttpOnly`, `SameSite`는 독립 헤더 이름이 아니라 Set-Cookie의 속성이다. HttpOnly 쿠키도 조건에 맞는 요청에는 전송된다. [쿠키](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)
- CORS는 서버 인증·인가를 대체하지 않는다. 단순 요청은 응답 읽기가 차단되어도 서버에 도달할 수 있다. 자격 증명 포함 요청에서 허용 출처로 `*`를 쓸 수 없다. [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- `Access-Control-Allow-Headers`는 요청에서 보낼 헤더, `Access-Control-Expose-Headers`는 스크립트에 추가로 노출할 응답 헤더에 관한 설정이다. [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- `Vary`는 캐시와 표현 선택을 잇는 헤더다. 응답을 달리 만드는 요청 헤더를 기록한다. [캐시](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)
- 연결·전송은 별도 심화 주제로 둔다. `Connection`, `Keep-Alive`는 HTTP/2·3에 적용할 설정으로 소개하지 않는다. [Connection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Connection)

## 검증 기록 양식

환경·버전 / 서버 구현 커밋 / 입력 요청 / 예상 결과 / 실제 상태 코드·헤더·본문 / 브라우저 관찰 / 예상과 다른 점 / 원본 로그.

현재 결과: 미구현·미실행. 이번 글에는 실행 후 확보한 증거만 실제 결과로 싣는다.

## 글 작성 전 회상 질문

1. Accept와 Content-Type을 각각 언제 확인하는가?
2. no-cache인 응답이 저장될 수 있는가? ETag와 어떤 역할 차이가 있는가?
3. curl은 성공하고 브라우저 fetch는 실패했다. 무엇을 추가로 확인해야 하는가?
4. Set-Cookie가 응답에 있다는 사실만으로 다음 요청에 Cookie가 실린다고 결론 내릴 수 있는가?
5. 헤더를 설정한 것과 그 기능을 구현한 것은 어떤 차이가 있는가?

## 표현 선택·해석 본문과 예제

[Accept·Content-Type 본문](SECTION-01-representation.md) · [Spring 실행 예제](../../examples/http-headers-spring/README.md) · [요청·응답 도식](../../output/diagrams/http-accept-content-type.png). 기존 1편 초안에서 해당 절을 편집할 때 사용할 확장 원고다.

## 압축 본문과 예제

[Accept-Encoding·Content-Encoding 본문](SECTION-02-compression.md) · [Spring 실행 예제](../../examples/http-headers-spring/README.md) · [압축 요청·응답 도식](../../output/diagrams/http-compression.png). 실제 HTTP 압축·복원 검증 완료. 블로그 발행 전.
