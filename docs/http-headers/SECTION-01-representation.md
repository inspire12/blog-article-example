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
