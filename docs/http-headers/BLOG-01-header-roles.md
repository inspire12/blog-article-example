# HTTP 헤더 1편: 무엇을 주고 어떻게 받을까?

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

같은 요청에서 `Accept: image/svg+xml`을 보내면 글 제목을 이미지로 받을 수도 있습니다. 예제에 SVG 응답을 추가했습니다. JSON 요청이 텍스트 응답뿐 아니라 이미지 응답으로도 이어질 수 있는 셈입니다. 서버 실행 후 `/preview.html`에서 세 표현을 비교할 수 있습니다.

전체 Controller와 실행 명령은 [GitHub 예제](https://github.com/inspire12/blog-article-example/tree/main/examples/http-headers-spring)에 정리했습니다. JSON·텍스트 응답뿐 아니라 요청 형식이 맞지 않는 경우, 지원하지 않는 응답 형식을 요구하는 경우도 테스트에서 확인할 수 있습니다.

요청 본문을 읽지 못한다면 먼저 Content-Type과 실제 본문을, 원하는 응답을 받지 못한다면 Accept와 서버가 지원하는 형식을 함께 확인하면 됩니다.

참고: [MDN Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept) · [MDN Content-Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type) · [Spring 요청 매핑](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html)

### 압축: 압축해서 보내도 데이터의 형식은 그대로다

앞에서는 Content-Type으로 본문의 형식을 알려준다고 했습니다. 그렇다면 JSON을 gzip으로 압축해서 보내면 Content-Type도 바뀌어야 할까요?

두 헤더를 같이 보면 구분하기 쉽습니다.

```http
Content-Type: application/json
Content-Encoding: gzip
```

본문을 gzip으로 압축했지만, 압축을 풀면 나오는 내용은 여전히 JSON입니다. Content-Type은 그 데이터의 형식을, Content-Encoding은 적용한 인코딩을 설명합니다.

클라이언트는 요청할 때 자신이 처리할 수 있는 방식을 알려줍니다.

```http
Accept-Encoding: gzip
```

서버는 이 조건과 자신의 설정을 보고 압축 여부를 결정합니다. 헤더에 gzip이라고 적는 것만으로 압축되는 것은 아니고, 실제 본문도 압축해야 합니다.

![응답 압축과 복원](../../output/diagrams/http-compression.png)

Spring Boot 예제에서는 내장 서버가 응답을 압축하도록 설정했습니다. 반복 문장으로 만든 텍스트 응답이 13,800바이트에서 167바이트로 줄었고, gzip으로 받은 본문을 다시 풀었을 때 원문과 같다는 것을 확인했습니다. 같은 문장을 반복한 데이터라 압축이 잘되는 조건입니다. 실제 서비스의 평균 압축률로 볼 수는 없습니다.

예제를 확인할 때 한 가지 주의할 점도 있습니다. `curl --compressed`는 응답을 자동으로 풀어줍니다. 결과가 읽을 수 있는 텍스트라고 해서 압축되지 않은 것은 아닙니다.

[압축 설정과 검증 코드는 GitHub](https://github.com/inspire12/blog-article-example/tree/main/examples/http-headers-spring)에 정리했습니다. [MDN Content-Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding)에서 세부 설명을 볼 수 있습니다.

이번에는 데이터를 어떤 형식으로 주고받고, 어떻게 압축해서 전달하는지 살펴봤습니다. 다음 편에서는 받은 응답을 다시 사용하는 캐시와, 사용자를 확인하고 요청 사이의 상태를 이어가는 인증·쿠키를 살펴보겠습니다.
