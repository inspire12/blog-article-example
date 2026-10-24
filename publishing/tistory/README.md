# 티스토리 표 서식

## 파일

- [tables.css](tables.css): 스킨에 한 번 추가할 공통 스타일.
- [table-2col.html](table-2col.html): 항목·설명용 2열 서식.
- [table-3col.html](table-3col.html): 역할·헤더·동작용 3열 서식.
- [http-headers-tables.html](http-headers-tables.html): 이번 HTTP Header 글에 넣을 표 본문 조각. 글 전체가 아니다.
- [preview.html](preview.html): 브라우저로 열어 볼 독립 미리보기. 이 파일 전체를 글에 붙여 넣지 않는다.

## 간단한 HTTP Header 요약표

[http-headers-summary.html](http-headers-summary.html)은 역할과 핵심 헤더 8개 항목을 담은 2열 표다. 공통 CSS를 적용한 뒤 이 파일의 소스를 글의 HTML 모드에 붙여 넣는다. `preview.html` 상단에서 확인할 수 있다.

## 공통 CSS 설치

티스토리 관리자에서 꾸미기 → 스킨 편집 → HTML 편집의 CSS 영역을 연다. 기존 CSS를 백업한 뒤 `tables.css` 내용을 끝에 추가하고 저장한다. CSS 파일에는 `<style>` 태그를 붙이지 않는다. 관리자 메뉴는 버전에 따라 다를 수 있다.

`inspire-table-wrap`, `inspire-table` 클래스가 있는 표만 대상으로 한다. 기존 스킨이 더 높은 우선순위나 `!important`로 표를 지정했다면 실제 미리보기에서 조정해야 한다. 편집 화면과 발행 화면이 같은 스타일을 사용하는 것은 아니다.

## 이번 HTTP Header 글에 적용

글의 HTML 모드에서 `http-headers-tables.html`의 코드를 원하는 위치에 붙여 넣는다. 화면에 렌더링된 표를 드래그해서 복사하는 방식이 아니라 파일의 HTML 소스를 복사한다. 마크다운 코드 블록의 백틱은 넣지 않는다.

PC·모바일 미리보기에서 제목 행, 헤더 이름, 좌우 스크롤을 확인한다. 3열 표는 600px, 2열 표는 360px보다 좁은 컨테이너에서 표 영역만 가로 스크롤된다. 표가 페이지 전체를 밀어내지 않는지 확인한다. 스타일은 밝은 배경과 글자색을 함께 지정한다.

실제 티스토리 스킨 설치·발행은 아직 하지 않았다. 현재 파일은 적용 가능한 초안이며 티스토리 편집기가 속성이나 태그를 변경하는지는 실제 저장 후 확인해야 한다.

## 재사용 서식 저장

관리자의 콘텐츠 → 서식 관리에서 새 서식을 만들고 HTML 모드로 `table-2col.html` 또는 `table-3col.html`을 붙여 넣는다. 각각 ‘기술 글 표 2열’, ‘기술 글 표 3열’처럼 저장한다. 새 글에서는 서식 삽입 기능으로 불러온 뒤 내용과 caption(표 제목), aria-label(표 영역 이름)을 바꾼다.

행을 늘릴 때는 `<tbody>` 안의 `<tr>...</tr>`를 복제한다. 첫 칸의 `<th scope="row">`는 행 제목이며 나머지는 `<td>`다. 제목 행의 `<th scope="col">`와 표를 감싸는 div를 유지한다. 독립 스크롤 영역은 키보드로도 접근할 수 있도록 tabindex를 지정했다.

표 내용에 `<`, `>`, `&`를 직접 넣을 때는 HTML 이스케이프를 사용한다. HTML·기본 모드를 오간 후에는 표 구조를 확인하고, 스타일 적용 후 마크다운 모드 전환은 피한다.

## 수정과 검증

지식 원문은 [HTTP Header 문서](../../docs/http-headers/README.md)다. 글의 내용이 바뀌면 HTML 표에도 함께 반영한다. 미리보기는 CSS와 HTML을 포함한 스냅샷이므로 변경 시 함께 갱신한다.

이번 확인 범위: HTML 표의 열 수, caption·행/열 제목·스크롤 영역 속성, 8개 역할 반영, Git 공백 오류 검사. 실제 브라우저 렌더링 및 티스토리 저장 후 표시는 미확인이다.

티스토리 편집 모드 참고: https://notice.tistory.com/2482

## 화면에서 복사해 기본 모드에 붙여 넣기

[http-headers-copy.html](http-headers-copy.html)을 브라우저에서 열고 ‘표 복사’를 누른다. 티스토리 기본 모드에서 일반 붙여넣기를 사용한다. HTML과 일반 텍스트를 클립보드에 함께 담으며, CSS는 각 셀 안에 포함되어 있다. 자동 복사 권한이 없으면 ‘표 선택’ 후 ⌘C 또는 Ctrl+C를 사용한다.

제목 행도 td와 strong으로 구성해 외부 CSS나 th 변환에 의존하지 않는다. 이는 제목 행의 모양을 전달하기 위한 버전이며 의미상 헤더 셀을 보존하는 버전은 아니다. 기존 th 기반 파일은 별도로 유지한다. 편집기가 인라인 스타일을 제거할 가능성이 있어 실제 붙여넣기는 확인해야 한다.

[http-headers-summary-inline.html](http-headers-summary-inline.html)은 같은 표의 인라인 HTML 소스다. 필요하면 이 파일만 HTML 모드에 붙여 넣는다. 복사용 페이지 전체의 버튼·스크립트는 글에 넣지 않는다.
