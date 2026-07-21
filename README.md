# 벚꽃 내리는 시대에 결투를 - 온라인 구현

보드게임 '벚꽃 내리는 시대에 결투를'을 온라인 1대1 대결로 구현하는 프로젝트입니다.

## 코드 구조

파일이 나뉜 이유: index.html이 계속 커지면 수정할 때마다 전체를 다시 봐야 해서
버그가 생기기 쉽습니다. 아래처럼 역할별로 나눠서, 수정할 때 해당 파일만 열면 됩니다.

```
index.html               껍데기(뼈대). 거의 안 건드림.
css/style.css            스타일
js/data/goddesses.js      여신/카드 데이터 <- 여신 추가할 때 여기만 수정
js/engine/gameState.js    게임 상태(state) 정의
js/engine/phases.js       쌍장요란 -> 안전구축 -> 벚꽃결투 진행 로직
js/ui/render.js           화면 그리기
js/main.js                진입점
```

빌드 도구(webpack, npm 등) 필요 없습니다. `<script>` 태그로 순서대로 불러올 뿐입니다.

## 진행 단계 (게임 규칙)

1. **쌍장요란**: 여신 26명 중 2명 선택 (선택하는 플레이어 = 미코토)
2. **안전구축**: 고른 두 여신으로 통상패 7장, 비장패 3장 선택
3. **벚꽃결투**: 고른 패로 실제 대결 (액션 포인트, 핸드관리, 지역 영향력, 다이렉트 공격)

이 게임은 튜토리얼 없이, 보드게임 룰을 이미 아는 사람을 대상으로 만듭니다.

## 현재 상태

- 게임판/기본 동작을 먼저 완성 후, 여신을 하나씩 추가할 예정 (여신마다 고유 카드/효과가 있어 한 번에 다 구현하기 어려움)
- 현재는 **로컬(hot-seat) 모드**: 한 화면에서 두 플레이어가 번갈아 조작
- 실시간 온라인 대결(방 생성/입장)은 기본 게임 로직이 안정된 후 Firebase 등으로 추가 예정

## 리눅스 없이 개발하는 법 (크롬북)

로컬 서버/빌드 도구가 필요 없는 구조라서, 별도 설치 없이 개발 가능합니다.

1. 이 저장소를 GitHub에 push
2. 저장소 페이지에서 키보드로 `.` 입력 → 브라우저에서 VS Code(github.dev)가 열림
3. 파일 수정 후 커밋 → GitHub Pages가 자동 배포
4. 실제 URL(`https://<username>.github.io/<repo>/`)로 접속해서 테스트

## 코드 뷰어 (팀원과 같이 코드 보기)

`/viewer/index.html`에 파트별로 나눠서 코드를 볼 수 있는 뷰어가 있습니다.
GitHub Pages 배포 후 `https://<username>.github.io/<repo>/viewer/`로 접속하면
왼쪽 사이드바에서 파일(구조/스타일/데이터/엔진/UI)을 클릭해 문법 강조된 코드로 볼 수 있습니다.
직접 에디터를 켜지 않아도 팀원끼리 코드 리뷰하듯 볼 수 있는 용도입니다.

새 파일을 추가하면 `viewer/files.json`에 한 줄 추가해야 뷰어 목록에 나타납니다:

```json
{ "path": "../js/engine/newfile.js", "label": "newfile.js (설명)", "group": "엔진" }
```

`viewer/index.html` 안의 `GITHUB_REPO_URL` 값도 실제 저장소 주소로 바꿔주면
"GitHub에서 보기" 링크가 정상 작동합니다.

## 파트 뷰어 도구 (파일 하나짜리 index.html을 파트별로 볼 때)

`/tools/part-viewer/index.html`은 위의 `/viewer/`와는 다른 용도입니다.

- `/viewer/` : 이미 `js/`, `css/`로 **파일이 나뉜** 이 프로젝트를 git에서 자동으로 불러와 보는 뷰어
- `/tools/part-viewer/` : **파일 하나(index.html)** 안에 `<script id="...">`, `<style id="...">`로 코드가 나뉜 경우, 그 index.html과 json 파일을 화면에 직접 드래그해서 파트별로 나눠 보는 범용 도구. 게임 코드뿐 아니라 다른 프로젝트(카드 데이터베이스 등)에도 쓸 수 있습니다.

GitHub Pages 배포 후 `https://<username>.github.io/<repo>/tools/part-viewer/`로 접속하면
누구나(팀원 포함) 브라우저에서 자기 컴퓨터에 있는 index.html/json 파일을 드래그해서 바로 볼 수 있습니다.
사용법 자세한 건 `tools/part-viewer/README.md` 참고.

## 여신 추가하는 법

1. `js/data/goddesses.js`에 여신 객체 추가 (이름, 이미지, 통상패/비장패 목록)
2. 이미지 파일은 `assets/goddesses/`에 저장
3. 다른 파일은 건드릴 필요 없음 (있으면 그 여신 특성 로직만 추가)
