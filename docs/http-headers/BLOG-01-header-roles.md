# HTTP 헤더, 이름보다 역할부터 이해하기

최근 CS 기본기를 혼자 공부하다가 HTTP Header에 대해 헷갈리는 부분이 있어 따로 정리하기 시작했습니다. `Content-Type`이나 `Authorization`처럼 개발하면서 자주 사용하는 헤더도 있지만, 각각의 설정을 알고 있는 것과 요청·응답 안에서 어떤 역할을 하는지 설명하는 것은 조금 달랐습니다.

모질라의 [MDN HTTP 헤더 문서](https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Headers)에 들어가면 방대한 설명과 예제를 볼 수 있습니다. 개인적으로는 웬만한 책이나 아티클보다 자세하고 친절하게 정리되어 있다고 느꼈습니다. 다만 헤더 종류가 워낙 많다 보니, 지금 해결하려는 문제에서 어떤 헤더를 찾아봐야 할지부터 정리하고 싶었습니다.

그래서 이번 글에서는 모든 헤더의 옵션을 설명하기보다, 헤더가 하는 일을 중심으로 분류하고 핵심적인 내용을 살펴보려고 합니다. 필요할 때 관련 문서로 찾아갈 수 있는 작은 지도를 만드는 것이 목표입니다.

## 헤더를 알면 개발할 때 무엇이 달라질까?

API를 개발하면 요청 본문과 응답 데이터에 먼저 집중하게 됩니다. JSON에 어떤 필드가 있는지, 원하는 데이터가 제대로 반환되는지부터 확인하는 것이 자연스럽습니다.

그런데 본문만 확인해서는 설명하기 어려운 문제도 있습니다.

- 서버의 데이터를 수정했는데 화면에는 이전 내용이 보입니다.
- 같은 API가 curl에서는 동작하는데 브라우저에서는 응답을 읽지 못합니다.
- 인증 정보를 보냈는데도 접근이 거절됩니다.
- 응답은 JSON인데, 네트워크에서는 압축된 데이터로 전달됩니다.

이때 헤더를 이해하고 있으면 캐시, CORS, 인증, 압축처럼 확인할 지점을 좁힐 수 있습니다. 헤더만 보고 모든 원인을 단정할 수는 없지만, 서버 로그와 브라우저의 Network 탭에서 무엇을 함께 봐야 하는지 판단하는 데 도움이 됩니다.

제가 생각하는 이점은 헤더 이름을 많이 외우는 데 있지 않습니다. **프레임워크가 대신 처리해 주던 동작을 설명하고, 설정을 바꿨을 때 어떤 결과가 나와야 하는지 검증할 수 있다는 것**입니다. 문제를 고치는 과정에서도, API의 동작을 설계하는 과정에서도 이런 이해가 차이를 만든다고 생각합니다.

## 헤더는 요청과 응답을 처리하는 데 필요한 정보를 전달한다

HTTP 메시지는 본문 외에도 여러 정보를 전달합니다. 헤더에는 본문을 어떤 형식으로 해석해야 하는지, 응답을 저장해도 되는지, 어떤 인증 정보를 제출했는지 등이 담깁니다.

예를 들어 JSON을 서버에 보내면서 HTML 응답을 받고 싶다면 다음처럼 요청할 수 있습니다.

```http
POST /articles HTTP/1.1
Host: example.com
Content-Type: application/json
Accept: text/html

{"title":"HTTP Header 공부"}
```

`Content-Type`과 `Accept`는 비슷해 보이지만 서로 다른 대상을 설명합니다.

- `Content-Type: application/json`: 지금 보내는 요청 본문이 JSON입니다.
- `Accept: text/html`: 응답으로 HTML 표현을 수용하겠다는 뜻입니다.

서버가 HTML을 지원하고 그 표현을 선택했다면 다음처럼 응답할 수 있습니다.

```http
HTTP/1.1 201 Created
Content-Type: text/html

<h1>HTTP Header 공부</h1>
```

이번 응답의 `Content-Type`은 서버가 보낸 본문의 형식을 설명합니다. 같은 헤더가 요청과 응답 양쪽에 등장할 수 있는 이유입니다. `Accept`를 설정하는 것만으로 응답이 자동 변환되는 것은 아니며, 실제 표현 선택과 생성은 서버가 수행해야 합니다.

위 메시지는 일부 필드를 생략한 HTTP/1.1 설명용 예시입니다. HTTP/2·3의 전송 형식까지 같은 텍스트 형태라는 뜻은 아닙니다. [MDN 콘텐츠 협상](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation) · [MDN HTTP 헤더](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers)

## 헤더를 역할별로 묶어 보기

헤더는 요청·응답 중 어디에 사용하는지에 따라 볼 수도 있고, 어떤 기능에 관여하는지에 따라 볼 수도 있습니다. 이번에는 개발 중 만나는 문제와 연결하기 쉽도록 기능을 기준으로 묶었습니다.

아래 표는 MDN의 공식 분류를 그대로 옮긴 것이 아니라, 이 글을 위해 재구성한 지도입니다. 한 헤더가 여러 역할에 걸칠 수도 있습니다.

| 역할 | 함께 볼 핵심 헤더 |
| --- | --- |
| 표현 선택·해석 | `Accept`, `Content-Type`, `Accept-Language` |
| 압축 | `Accept-Encoding`, `Content-Encoding` |
| 캐시·재검증 | `Cache-Control`, `ETag`, `If-None-Match`, `Vary` |
| 인증 | `Authorization`, `WWW-Authenticate` |
| 상태 유지 | `Set-Cookie`, `Cookie` |
| 다른 출처의 응답 읽기 | `Origin`, `Access-Control-*` |
| 브라우저 보안 정책 | `Content-Security-Policy` 등 |
| 이동·다운로드·부분 조회 | `Location`, `Content-Disposition`, `Range` |

`Access-Control-*`는 관련 헤더들을 묶어 쓴 표기이며, 그 이름 그대로 보내는 하나의 헤더는 아닙니다.

### 표현 선택·해석과 압축

표현 선택은 “어떤 형식과 언어로 주고받을 것인가?”에 관한 일입니다. 앞에서 본 `Accept`와 `Content-Type`, 선호 언어를 전달하는 `Accept-Language`가 여기에 속합니다.

압축은 그 내용을 전송하는 방식과 관련됩니다. 클라이언트는 `Accept-Encoding`으로 처리할 수 있는 인코딩을 알리고, 서버는 압축한 응답의 `Content-Encoding`으로 실제 적용한 방식을 알립니다. JSON에 gzip 압축을 적용했다면, 압축을 푼 뒤 JSON으로 해석하는 관계입니다. [MDN 콘텐츠 협상](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Content_negotiation)

### 캐시·재검증

캐시는 단순히 켜고 끄는 기능보다 질문이 많습니다. 응답을 저장해도 되는지, 얼마나 오래 재사용할 수 있는지, 저장한 내용이 바뀌었는지를 확인해야 합니다.

`Cache-Control`은 저장·재사용 정책을 전달하고, `ETag`와 `If-None-Match`는 저장된 표현의 유효성을 확인하는 데 함께 사용됩니다. `Vary`는 응답을 재사용할 때 어떤 요청 헤더를 추가로 고려할지 알려줍니다. 이들은 서로 다른 질문을 담당합니다. [MDN HTTP 캐시](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)

### 인증과 상태 유지

`Authorization`은 클라이언트가 자격 증명을 전달하는 헤더이고, `WWW-Authenticate`는 서버가 사용할 인증 방식 등을 알리는 헤더입니다. 실제 검증과 접근 허용 여부는 서버가 결정합니다. [MDN HTTP 인증](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication)

쿠키는 요청 사이에 상태를 이어가는 데 쓰입니다. 서버가 `Set-Cookie`로 쿠키를 전달하면, 브라우저는 저장·전송 조건에 따라 후속 요청의 `Cookie`에 값을 담습니다. 세션 식별에 사용할 수 있지만, 쿠키의 용도가 로그인에만 한정되는 것은 아닙니다. [MDN 쿠키](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)

### 다른 출처의 응답 읽기와 브라우저 보안 정책

CORS는 다른 출처의 응답을 브라우저에서 읽을 수 있는지와 관련됩니다. 요청의 `Origin`, 응답의 `Access-Control-Allow-Origin` 등을 함께 봅니다. 서버의 인증·인가를 대신하는 기능은 아니며, 브라우저의 읽기 제한과 서버의 접근 검사를 구분해야 합니다. [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

`Content-Security-Policy`는 페이지에서 어떤 리소스를 불러오거나 실행할 수 있는지 등의 정책을 브라우저에 전달합니다. CORS와 마찬가지로 브라우저 동작에 관여하지만, 제어하려는 대상은 다릅니다. [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy)

### 이동·다운로드·부분 조회

브라우저를 다른 위치로 이동시키거나, 파일을 첨부 형태로 내려주거나, 리소스의 일부만 요청할 때도 헤더를 사용합니다. 각각 `Location`, `Content-Disposition`, `Range`를 출발점으로 찾아볼 수 있습니다. 실제 동작은 상태 코드와 관련 응답 헤더까지 함께 확인해야 합니다. [MDN 헤더 목록](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers)

## 헤더를 설정하는 것과 기능이 동작하는 것은 다르다

정리하면서 계속 확인하게 된 점은, 헤더가 실제 처리를 대신하지는 않는다는 것입니다.

`Content-Encoding: gzip`이라고 적는 것만으로 본문이 압축되지는 않습니다. `Authorization`에 토큰이 있다고 인증이 완료되는 것도 아닙니다. 헤더는 필요한 정보를 전달하고, 서버·브라우저·캐시가 그 정보에 맞는 처리를 수행해야 합니다.

그래서 헤더를 공부할 때는 다음 질문을 함께 가져가려고 합니다.

1. 누가 보내는 헤더인가?
2. 받는 쪽에 무엇을 알리거나 요구하는가?
3. 실제로 어떤 처리가 필요한가?
4. 헤더 외에 상태 코드·본문·브라우저 동작 중 무엇을 확인해야 하는가?

이번 글은 그 질문을 시작하기 위한 역할 지도입니다. 다음 글에서는 표현 선택과 압축부터 요청·응답을 따라가며 살펴보려고 합니다. 캐시와 인증처럼 설명할 내용이 많은 주제도 각각 나누어 이어가겠습니다.
