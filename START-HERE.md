# 다른 컴퓨터에서 이어서 작업하기

현재 저장소를 clone하거나 기존 checkout에서 변경 사항을 확인한 뒤 `git pull --ff-only`로 최신화합니다. 저장소 루트를 작업 폴더로 열고 아래 프롬프트를 복사해 사용하세요.

## 지식 정리·퀴즈·면접부터 이어가기

```text
이 저장소는 개인 지식 정리와 성장, 블로그 전문성 강화를 위한 프로젝트다.
git status와 README.md, docs/README.md, docs/practice/log.md를 읽어줘.
별도 요청이 없으면 마지막 학습 기록의 미해결 질문부터 이어가고,
기록이 없으면 docs/README.md의 현재 우선 주제를 확인해줘.
현재는 docs/http-headers/README.md의 글 구성과 실습 계획부터 이어가줘.
실제 답변과 근거를 기록하고 검증하지 않은 내용은 미검증으로 표시해줘.
블로그 작업은 docs/blog/README.md를 따르고 실제 발행은 요청받았을 때 해줘.
```

## AI 백엔드 구현을 선택했을 때의 시작 프롬프트

```text
이 저장소는 여러 블로그 글의 예제 코드와 기획 문서를 관리하는 Blog Examples 프로젝트다.
먼저 적용되는 AGENTS.md와 git status를 확인하고, 사용자의 기존 변경 사항을 보존해줘.
다음 문서를 읽고 현재 상태를 파악해줘.

1. README.md
2. docs/ai-backend/README.md
3. docs/ai-backend/ROADMAP.md
4. docs/ai-backend/BLOG-owasp-llm-top10-2025.md
5. examples/rest-graphql-nestjs/README.md와 package.json

기존 GraphQL 예제는 examples/rest-graphql-nestjs/에 독립된 프로젝트로 유지한다.
현재 AI 백엔드 기획은 문서 단계이며, 프로젝트 구현과 블로그 발행은 아직 하지 않았다.
핵심 학습 목표는 AI를 활용한 개발·검증, LLM API와 도구 호출, 품질 평가·운영이다.

이번 작업은 로드맵의 1~2주차를 시작하는 것이다.
별도 지시가 없다면 기존 저장소에서 사용하는 NestJS/TypeScript로
examples/ai-order-assistant/에 독립된 주문·환불 도우미 백엔드를 구현해줘.
가짜 주문 데이터와 모의 환불로 시작하고 유료 모델 연결은 아직 하지 않아도 된다.

구현할 API:
- GET /orders
- GET /orders/:id
- POST /refunds/preview
- POST /refunds

구현 전에 최소 환불 정책과 API 계약을 해당 예제 README에 명시해줘.
환불 자격과 금액은 서버가 결정하며, 사용자 확인 없이 환불을 실행하지 않도록 해줘.
개발용 사용자 인증 방식을 명확히 구분하고 요청 본문의 사용자 ID를 신뢰하지 마.
본인 주문 조회, 타인 주문 접근 차단, 환불 불가 조건, 중복 환불 방지를
통합 테스트로 검증하고 실제 실행 결과를 기록해줘.
기존 GraphQL 예제를 유지하고 루트 README에 새 예제를 연결해줘.
이미 일부 구현되어 있다면 상태를 확인하고 남은 작업부터 진행해줘.

마지막으로 변경 내용, 실행 방법, 테스트 결과, 남은 작업을 정리하고
docs/ai-backend/README.md의 현재 상태도 갱신해줘.
커밋·푸시와 블로그 발행은 요청받았을 때 진행해줘.
```

## 블로그 편집부터 이어가려면

위 프롬프트의 구현 요청 대신 다음 문장을 사용합니다.

```text
이번에는 구현 대신 OWASP LLM Top 10 2025 블로그 초안을 다듬어줘.
공식 2025판 자료로 사실관계를 확인하고, 원문 요약과 작성자의 설계 예시를 구분해줘.
백엔드 개발자가 읽기 쉬운 한국어로 편집하고 출처 링크를 유지해줘.
문서에 기록된 PDF 직접 열람 제한을 실제로 읽은 것처럼 바꾸지 마.
발행하지 말고 저장소의 초안 파일을 수정한 뒤 변경 내용을 알려줘.
```
