# Knowledge & Growth

개인 지식을 총정리하고 퀴즈·면접·실험으로 이해를 검증하며, 블로그를 통해 전문성을 쌓는 프로젝트입니다. GitHub에서 지식과 성장 이력을 관리하고 [티스토리](https://inspire12.tistory.com)에 검증한 내용을 공유합니다.

시작점: [지식과 성장 지도](docs/README.md) · [퀴즈](docs/practice/quiz.md) · [면접 연습](docs/practice/interview.md) · [학습 기록](docs/practice/log.md) · [블로그 개선 계획](docs/blog/README.md)

실행 가능한 예제는 독립된 폴더에서 의존성을 설치하고 실행합니다.

## 구성

```text
examples/
  rest-graphql-nestjs/  # NestJS REST Controller와 GraphQL Resolver 비교
docs/
  README.md           # 지식 지도와 학습 흐름
  practice/           # 퀴즈·면접·학습 기록
  templates/          # 지식 노트 양식
  blog/               # 블로그 개선·발행 관리
  ai-backend/          # AI 백엔드 학습 기획과 OWASP 블로그 초안
output/
  diagrams/            # 블로그 다이어그램 SVG 원본과 PNG 이미지
START-HERE.md          # 다른 컴퓨터에서 이어서 작업할 시작 프롬프트
```

| 주제 | 문서 | 상태 |
| --- | --- | --- |
| HTTP Header 역할과 검증 | [글 구성·역할별 지도·실습 계획](docs/http-headers/README.md) | 이번 주 작성·실습 전 |
| NestJS REST vs GraphQL | [예제 실행 안내](examples/rest-graphql-nestjs/README.md) | 구현 완료 |
| AI 백엔드 학습·주문/환불 도우미 | [기획안](docs/ai-backend/README.md) · [로드맵](docs/ai-backend/ROADMAP.md) | 기획 단계 |
| OWASP LLM Top 10 2025 | [블로그 초안](docs/ai-backend/BLOG-owasp-llm-top10-2025.md) | 초안 작성 |

## GraphQL 예제 실행

```bash
cd examples/rest-graphql-nestjs
npm ci
npm run start:dev
```

빌드는 같은 폴더에서 `npm run build`로 실행합니다. 기존 루트의 소스와 npm 설정은 모두 예제 폴더로 이동했습니다.

## 새 예제 추가

`examples/<주제>/`에 소스, 의존성 설정, 실행·검증 방법을 담은 README를 함께 둡니다. 글과 기획 자료는 해당 예제 또는 `docs/<주제>/`에 정리하고 위 목록에 링크를 추가합니다.

다른 컴퓨터에서 이어서 작업할 때는 [START-HERE.md](START-HERE.md)의 프롬프트를 사용하세요.

## 지식 관리

학습 내용, 설계 결정, 블로그 초안과 참고 출처는 `docs/<주제>/`에 Markdown으로 기록하고 GitHub에서 변경 이력을 관리합니다. 확인된 사실과 아이디어·미검증 가정을 구분하고, 자료를 참고했다면 출처 링크와 확인 날짜를 함께 남깁니다. 새 문서는 위 주제 목록에 연결합니다.

다이어그램은 `output/diagrams/`에서 편집 가능한 SVG 원본과 게시용 PNG 이미지를 함께 관리합니다.

- [GraphQL 도메인 구성](output/diagrams/graphql-domain-composition.svg) · [PNG](output/diagrams/graphql-domain-composition.png)
- [GraphQL 요청 필드](output/diagrams/graphql-requested-fields.svg) · [PNG](output/diagrams/graphql-requested-fields.png)
- [프로필 서비스 위임](output/diagrams/profile-service-delegation.svg) · [PNG](output/diagrams/profile-service-delegation.png)

비밀 키나 개인정보는 기록하지 않습니다. 작업 후 문서와 관련 자료를 함께 커밋·푸시하여 다른 컴퓨터에서도 저장소를 기준으로 이어서 작업합니다.
