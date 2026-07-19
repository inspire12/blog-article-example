# NestJS REST Controller vs GraphQL Resolver

NestJS에서 REST Controller와 GraphQL Resolver가 요청을 받는 기준을 비교하는 예제입니다. 두 API는 같은 `UserService`를 호출하므로 진입점의 차이에 집중할 수 있습니다.

## 실행

Node.js 20.11 이상을 권장합니다.

```bash
npm install
npm run start:dev
```

- REST: `GET http://localhost:3000/users/1`
- GraphQL endpoint와 Apollo Sandbox: `http://localhost:3000/graphql`

Apollo Sandbox의 Explorer에서 Query와 필드를 선택하면 Operation Editor에 요청이 자동으로 만들어집니다.
`introspection: true`로 Sandbox가 서버 Schema를 조회해 문서와 자동완성을 구성하고, `embed: true`로 Sandbox를 Landing Page 안에 표시합니다.

```graphql
query {
  user(id: 1) {
    id
    name
  }
}
```

## 요청이 연결되는 기준

REST는 HTTP Method와 URL을 기준으로 Controller 메서드를 선택합니다.

```text
GET /users/1
    ↓
UserController.getUser(1)
    ↓
UserService.getUser(1)
```

GraphQL은 요청한 필드를 Schema에서 찾고, 그 필드에 연결된 Resolver를 실행합니다.

```text
Query.user
    ↓
UserResolver.user(1)
    ↓
UserService.getUser(1)
```

Schema는 [`src/users/user.graphql`](src/users/user.graphql)에 정의되어 있습니다.

```graphql
type Query {
  user(id: Int!): User!
}

type User {
  id: Int!
  name: String!
}
```

`age`처럼 Schema에 없는 필드나 `"1"`처럼 잘못된 타입의 인자를 보내면 GraphQL 검증 단계에서 요청이 거절되며 Resolver는 실행되지 않습니다.

```bash
npm run build
```

## REST와 GraphQL 비교

| 역할 | REST | GraphQL |
| --- | --- | --- |
| 요청 진입점 | Controller | Resolver |
| 작업 식별 | HTTP Method + URL | Query/Mutation 필드 |
| 입력값 | Path, Query String, Body | Arguments, Input |
| 비즈니스 로직 | Service 호출 | Service 호출 |
| 일반적인 응답 형식 | JSON | JSON |
| 데이터 조회 | Repository 또는 ORM | Repository 또는 ORM |
| 계약 확인 | Request/Response DTO + Swagger | Schema + Explorer/GraphiQL |

> GraphQL 요청도 일반적으로 하나의 HTTP endpoint를 통해 들어옵니다. Resolver가 HTTP 요청 자체를 직접 처리한다기보다, GraphQL 실행 엔진이 요청을 파싱·검증한 뒤 Schema 필드에 연결된 Resolver를 호출한다고 표현하는 편이 더 정확합니다.
