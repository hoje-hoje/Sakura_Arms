# 코드 파트 뷰어 (독립 실행형)

git이나 서버 없이, 브라우저에서 파일 하나 열어서 index.html을 파트별로 나눠 보는 도구입니다.
게임 코드든 카드 데이터베이스든 어떤 프로젝트의 index.html이든 사용 가능합니다.

## 사용법

1. `part-viewer.html`을 크롬(또는 아무 브라우저)에서 더블클릭해서 엽니다. (설치/서버 불필요)
2. `index.html` 칸에 보고 싶은 index.html 파일을 드래그하거나 클릭해서 선택
3. (선택) `manifest.json` 칸에 파트 이름을 지정하는 json 파일을 드래그
4. "파트별로 보기" 버튼 클릭

먼저 `example-index.html`과 `example-manifest.json`으로 테스트해보면 감이 옵니다.

## 파트 나누는 원리

index.html 안의 `<script>`와 `<style>` 태그를 자동으로 하나씩 파트로 인식합니다.
파트에 이름을 붙이고 싶으면 태그에 `id`를 달아주세요:

```html
<script id="game-state">
  const gameState = { ... };
</script>
```

이렇게 id를 붙여두면 manifest.json에서 그 id를 찾아 이름/그룹을 지정할 수 있습니다:

```json
{
  "game-state": { "label": "gameState (상태)", "group": "엔진" }
}
```

id가 없는 태그는 "script #1 (id 없음)" 식으로 자동 표시되며 그래도 내용은 볼 수 있습니다.
`__structure__` 라는 특수 id로 HTML 뼈대 부분의 이름도 바꿀 수 있습니다.

## 참고

- manifest.json 없이 index.html만 넣어도 동작합니다 (자동 순번으로 표시됨)
- 외부 파일을 불러오는 `<script src="...">`는 내용을 보여줄 수 없고 경로만 표시됩니다 (파일이 index.html 안에 없기 때문)
- 지금 이 도구는 "하나의 파일 안에 script/style 태그로 나뉜 코드"를 보기 위한 용도입니다.
  이미 파일 자체를 여러 개(js/, css/ 등)로 나눠놓은 프로젝트는 각 파일을 에디터나 이전에 만든
  git 기반 뷰어(`viewer/index.html`)로 보는 게 더 맞습니다.
