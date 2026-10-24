# 2·3편용 기존 설명 메모

1편에서 분리한 자료이며 발행용 완성 원고가 아니다. [연재 계획](SERIES.md)에 맞춰 후속 편에서 다듬는다.

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

