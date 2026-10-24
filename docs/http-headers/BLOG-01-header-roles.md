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

## HTTP Header가 하는 일들

서버가 응답으로 JSON을 보냈다고 해보겠습니다. 본문에는 필요한 데이터가 들어 있지만, 받는 쪽에는 그 데이터를 처리할 정보도 필요합니다. 어떤 형식으로 읽어야 할지, 저장했다가 다시 써도 될지, 압축되어 있다면 어떻게 풀어야 할지 같은 것들입니다.

헤더에는 이런 정보가 담깁니다. 요청에서도 마찬가지입니다. 어떤 응답을 받을 수 있는지 알리거나, 보호된 데이터에 접근하기 위한 인증 정보를 보내는 데 사용합니다.

종류가 많아서 한꺼번에 외우기는 어렵습니다. 저는 개발할 때 어떤 문제와 연결되는지를 기준으로 묶어봤습니다.

| 역할 | 관련 헤더 |
| --- | --- |
| 데이터의 형식과 언어 선택·해석 | `Accept`, `Content-Type`, `Accept-Language` |
| 압축 방식 협의와 표시 | `Accept-Encoding`, `Content-Encoding` |
| 응답 저장·재사용·변경 확인 | `Cache-Control`, `ETag`, `If-None-Match`, `Vary` |
| 인증 정보 전달과 인증 방식 안내 | `Authorization`, `WWW-Authenticate` |
| 요청 사이의 상태 유지 | `Set-Cookie`, `Cookie` |
| 다른 출처의 응답 읽기 허용 | `Origin`, `Access-Control-Allow-Origin` 등 |
| 브라우저 보안 정책 전달 | `Content-Security-Policy` 등 |
| 이동·다운로드·부분 조회 | `Location`, `Content-Disposition`, `Range` |

이렇게 나눴지만 역할 사이에 선이 딱 그어지는 것은 아닙니다. 쿠키는 로그인 상태를 이어가는 데 쓰일 수 있고, 압축 방식이 다르면 캐시도 응답을 구분해야 합니다.

표는 필요한 헤더를 찾기 위한 출발점입니다. 캐시 때문에 이전 데이터가 보이는 것 같다면 캐시 헤더부터, 브라우저에서만 응답을 읽지 못한다면 CORS 관련 헤더부터 살펴보는 식입니다. [MDN 헤더 문서](https://developer.mozilla.org/ko/docs/Web/HTTP/Reference/Headers)를 읽을 때도 이런 질문을 가지고 찾아보려고 합니다.

먼저 자주 함께 사용하는 Accept와 Content-Type부터 보겠습니다.

### 표현 선택·해석: JSON을 보내면 응답도 JSON일까?

API를 호출할 때 `Content-Type`과 `Accept`에 모두 `application/json`을 넣는 경우가 많습니다. 같은 값을 쓰다 보니 비슷한 설정처럼 보이지만, 두 헤더가 설명하는 대상은 다릅니다.

`Content-Type`은 **지금 보내는 본문이 어떤 형식인지**, 요청의 `Accept`는 **응답으로 어떤 형식을 수용할 수 있는지**를 알려줍니다.

차이를 보려면 두 값을 다르게 놓아보는 편이 쉽습니다. 글 제목은 JSON으로 보내고, 미리보기는 텍스트로 받는 요청입니다.

```http
POST /articles/preview HTTP/1.1
Host: localhost:8080
Content-Type: application/json
Accept: text/plain

{"title":"HTTP 헤더"}
```

“JSON을 보냈으니 JSON으로 응답해 줘”가 아니라, “보내는 내용은 JSON이고, 받을 내용은 텍스트였으면 좋겠다”는 뜻입니다. 서버가 이 형식을 지원한다면 다음처럼 응답할 수 있습니다.

```http
HTTP/1.1 200 OK
Content-Type: text/plain;charset=UTF-8

Preview: HTTP 헤더
```

응답에도 `Content-Type`이 있습니다. 이번에는 서버가 보낸 본문을 설명하므로 값이 `text/plain`입니다. 요청과 응답의 Content-Type이 같아야 할 이유는 없습니다. 위 메시지는 일부 헤더를 생략한 설명용 예시입니다.

![JSON 요청과 텍스트 응답](../../output/diagrams/http-accept-content-type.png)

Spring에서는 `consumes`로 받을 요청 형식을, `produces`로 제공할 응답 형식을 지정할 수 있습니다. 예제에서는 같은 URL에 JSON·텍스트 응답을 준비하고 `Accept`에 따라 선택하도록 했습니다.

다만 헤더를 바꾼다고 본문까지 자동으로 바뀌는 것은 아닙니다. `Content-Type: application/json`이라고 선언했다면 본문도 실제 JSON이어야 하고, 서버가 JSON 응답을 제공하려면 그 응답을 만드는 처리도 있어야 합니다. Spring에서는 메시지 컨버터가 본문을 읽고 쓰는 변환을 담당합니다.

전체 Controller와 실행 명령은 [GitHub 예제](https://github.com/inspire12/blog-article-example/tree/main/examples/http-headers-spring)에 정리했습니다. JSON·텍스트 응답뿐 아니라 요청 형식이 맞지 않는 경우, 지원하지 않는 응답 형식을 요구하는 경우도 테스트에서 확인할 수 있습니다.

요청 본문을 읽지 못한다면 먼저 Content-Type과 실제 본문을, 원하는 응답을 받지 못한다면 Accept와 서버가 지원하는 형식을 함께 확인하면 됩니다.

참고: [MDN Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept) · [MDN Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type) · [Spring 요청 매핑](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html)

### 압축

텍스트나 JSON을 압축해서 보낼 때는 `Accept-Encoding`과 `Content-Encoding`을 함께 봅니다. 어떤 방식으로 압축해도 되는지 요청에서 알리고, 실제 적용한 방식은 응답에 표시합니다. 압축을 풀고 난 내용의 형식은 여전히 Content-Type으로 설명합니다. [압축 본문과 예제](SECTION-02-compression.md)

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
