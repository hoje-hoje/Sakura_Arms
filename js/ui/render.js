// ============================================
// 화면 렌더링
// gameState.phase에 따라 다른 화면을 그립니다.
// ============================================

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  switch (gameState.phase) {
    case PHASE.HOME:
      app.appendChild(renderHome());
      break;
    case PHASE.SSANGJANG_YORAN:
      app.appendChild(renderSsangjangYoran());
      break;
    case PHASE.ANJEON_GUCHUK:
      app.appendChild(renderAnjeonGuchuk());
      break;
    case PHASE.BEOTKKOT_GYEOLTU:
      app.appendChild(renderBeotkkotGyeoltu());
      break;
  }
}

function renderHome() {
  const el = document.createElement("div");
  el.className = "home-screen";
  el.innerHTML = `
    <div class="home-action-panel">
      <button id="start-btn" class="home-start-btn">게임 시작</button>
      <p class="home-sub-text">현재는 로컬(hot-seat) 모드 — 한 화면에서 두 플레이어가 번갈아 진행합니다.</p>
    </div>
  `;
  el.querySelector("#start-btn").onclick = () => {
    // TODO(온라인 전환 시): 여기서 바로 쌍장요란으로 넘어가지 않고
    // "방 만들기 / 입장하기" 화면을 먼저 보여주도록 교체하면 됨.
    gameState.phase = PHASE.SSANGJANG_YORAN;
    render();
  };
  return el;
}

// 여신 이미지의 대표색 캐시 (한 번 계산한 건 재사용)
const dominantColorCache = {};

function renderSsangjangYoran() {
  const el = document.createElement("div");
  el.className = "ssangjang-screen";

  const activePlayer = gameState.players[ssangjangUI.activePlayerIndex];
  const selectedCount = activePlayer.goddesses.length;

  el.innerHTML = `
    <img class="ssangjang-bg" src="assets/ui/ssangjang-bg.jpg" alt="">
    <div class="ssangjang-white-overlay ${ssangjangUI.introPlayed ? "intro-done" : ""}" id="overlay"></div>
    <img class="ssangjang-title ${ssangjangUI.introPlayed ? "intro-done" : ""}" id="title"
         src="assets/ui/ssangjang-title.png" alt="쌍장요란">
    <div class="ssangjang-hud">
      <div class="mikoto-label">미코토 ${ssangjangUI.activePlayerIndex + 1} 선택</div>
      <div class="selection-count">여신선택(${selectedCount}/2)</div>
    </div>

    <div class="focus-preview" id="focus-preview">
      <div class="focus-preview-clip" id="preview-clip">
        <img id="preview-image" src="" alt="">
      </div>
      <div class="focus-preview-name" id="preview-name"></div>
    </div>

    <div class="goddess-track-wrap" id="track-wrap">
      <div class="goddess-track" id="track"></div>
    </div>
    <button class="next-btn" id="next-btn" ${selectedCount < 2 ? "disabled" : ""}>다음 -></button>
  `;

  // 타이틀 인트로 애니메이션은 처음 들어왔을 때 한 번만 재생
  const overlay = el.querySelector("#overlay");
  if (!ssangjangUI.introPlayed) {
    overlay.addEventListener(
      "animationend",
      () => {
        ssangjangUI.introPlayed = true;
      },
      { once: true }
    );
  }

  const track = el.querySelector("#track");
  GODDESSES.forEach((g, index) => {
    const item = document.createElement("div");
    item.className = "select-item";

    const card = document.createElement("div");
    card.className = "select-card";
    if (index === ssangjangUI.focusedIndex) card.classList.add("focused");
    if (activePlayer.goddesses.find((sel) => sel.id === g.id)) card.classList.add("selected");

    const visual = g.image
      ? `<img class="select-card-image" src="${g.image}" alt="${g.name}">`
      : `<div class="select-thumb">${g.thumbEmoji || "🌸"}</div>`;

    card.innerHTML = `<span class="select-mark"></span>${visual}`;

    if (g.image) {
      const img = card.querySelector(".select-card-image");
      ensureDominantColor(img, g.id, () => {
        if (index === ssangjangUI.focusedIndex) applyScreenGlow(ssangjangUI.focusedIndex);
      });
    }

    // 클릭 = 바로 선택/취소 (드래그 중이었으면 무시)
    card.addEventListener("click", () => {
      if (ssangjangUI.dragMoved) return;
      ssangjangUI.focusedIndex = index;
      toggleGoddessSelection(ssangjangUI.activePlayerIndex, g.id);
    });

    const name = document.createElement("div");
    name.className = "select-name";
    name.textContent = g.name;

    item.appendChild(card);
    item.appendChild(name);
    track.appendChild(item);
  });

  el.querySelector("#next-btn").onclick = advanceSsangjangYoran;

  // 화면(카드 목록)을 손으로 드래그해서 스크롤 시작
  const trackWrap = el.querySelector("#track-wrap");
  trackWrap.addEventListener("mousedown", (e) => {
    ssangjangUI.isPanning = true;
    ssangjangUI.dragMoved = false;
    ssangjangUI.dragStartX = e.clientX;
    ssangjangUI.dragStartOffset = currentTrackTranslateX(track);
    track.classList.add("no-transition");
    trackWrap.classList.add("panning");
  });

  updatePreviewPanel();
  applyScreenGlow(ssangjangUI.focusedIndex);
  centerFocusedCard();

  return el;
}

// 현재 카드 목록(track)이 얼마나 이동해있는지(translateX 값) 읽기
function currentTrackTranslateX(trackEl) {
  const track = trackEl || document.getElementById("track");
  if (!track) return 0;
  const matrix = new DOMMatrixReadOnly(window.getComputedStyle(track).transform);
  return matrix.m41;
}

// 포커스된 카드가 화면 중앙에 오도록 카드 목록 전체를 이동
function centerFocusedCard() {
  const wrap = document.getElementById("track-wrap");
  const track = document.getElementById("track");
  if (!wrap || !track) return;
  const items = track.querySelectorAll(".select-item");
  const focusedItem = items[ssangjangUI.focusedIndex];
  if (!focusedItem) return;
  const wrapWidth = wrap.clientWidth;
  const cardCenter = focusedItem.offsetLeft + focusedItem.offsetWidth / 2;
  const offset = wrapWidth / 2 - cardCenter;
  track.style.transform = `translateX(${offset}px)`;
}

// 드래그를 놓았을 때, 화면 중앙에 가장 가까운 카드로 스냅하며 그 카드를 포커스로 만듦
function snapToNearestSsangjangCard() {
  const wrap = document.getElementById("track-wrap");
  const track = document.getElementById("track");
  if (!wrap || !track) return;
  const items = track.querySelectorAll(".select-item");
  const wrapWidth = wrap.clientWidth;
  const offset = currentTrackTranslateX(track);
  let closestIndex = 0;
  let closestDist = Infinity;
  items.forEach((item, idx) => {
    const itemCenter = item.offsetLeft + item.offsetWidth / 2 + offset;
    const dist = Math.abs(itemCenter - wrapWidth / 2);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = idx;
    }
  });
  ssangjangUI.focusedIndex = closestIndex;
  render();
}

// main.js에서 document 전체에 딱 한 번만 등록해서 호출하는 함수들
// (render()가 화면을 통째로 다시 그리기 때문에, 여기서 매번 새로 리스너를 등록하면 안 됨)
function handleSsangjangMouseMove(e) {
  if (!ssangjangUI.isPanning) return;
  const track = document.getElementById("track");
  if (!track) return;
  const dx = e.clientX - ssangjangUI.dragStartX;
  if (Math.abs(dx) > 4) ssangjangUI.dragMoved = true;
  track.style.transform = `translateX(${ssangjangUI.dragStartOffset + dx}px)`;
}

function handleSsangjangMouseUp() {
  if (!ssangjangUI.isPanning) return;
  ssangjangUI.isPanning = false;
  const wrap = document.getElementById("track-wrap");
  const track = document.getElementById("track");
  if (wrap) wrap.classList.remove("panning");
  if (track) track.classList.remove("no-transition");

  if (ssangjangUI.dragMoved) {
    snapToNearestSsangjangCard();
    // 뒤이어 발생하는 click 이벤트가 선택으로 이어지지 않도록 살짝 지연 후 해제
    setTimeout(() => {
      ssangjangUI.dragMoved = false;
    }, 50);
  }
}

// 방향키 이동(main.js에서 이 화면일 때만 호출됨)
function handleSsangjangKeydown(e) {
  if (GODDESSES.length === 0) return;
  const lastIndex = GODDESSES.length - 1;

  if (e.key === "ArrowRight") {
    ssangjangUI.focusedIndex = Math.min(ssangjangUI.focusedIndex + 1, lastIndex);
    render();
  } else if (e.key === "ArrowLeft") {
    ssangjangUI.focusedIndex = Math.max(ssangjangUI.focusedIndex - 1, 0);
    render();
  } else if (e.key === "Enter") {
    const g = GODDESSES[ssangjangUI.focusedIndex];
    toggleGoddessSelection(ssangjangUI.activePlayerIndex, g.id);
  }
}

// ---- 여신 이미지 대표색 추출 (투명 픽셀은 제외하고 평균) ----
function extractDominantColor(imgEl) {
  try {
    const size = 32;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgEl, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue; // 투명 픽셀 제외
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    if (count === 0) return "rgba(232,143,176,0.5)";
    return `rgb(${Math.round(r / count)},${Math.round(g / count)},${Math.round(b / count)})`;
  } catch (e) {
    return "rgba(232,143,176,0.5)"; // 이미지 로딩/CORS 문제 시 기본색
  }
}

function ensureDominantColor(imgEl, goddessId, onReady) {
  if (dominantColorCache[goddessId]) {
    onReady(dominantColorCache[goddessId]);
    return;
  }
  const compute = () => {
    const color = extractDominantColor(imgEl);
    dominantColorCache[goddessId] = color;
    onReady(color);
  };
  if (imgEl.complete) compute();
  else imgEl.addEventListener("load", compute, { once: true });
}

// 화면 가장자리 전체에 포커스된 여신의 대표색으로 은은한 글로우
function applyScreenGlow(index) {
  const g = GODDESSES[index];
  const screen = document.querySelector(".ssangjang-screen");
  if (!g || !screen) return;
  if (g.image && dominantColorCache[g.id]) {
    screen.style.boxShadow = `inset 0 0 170px 10px ${dominantColorCache[g.id]}`;
  } else {
    screen.style.boxShadow = "inset 0 0 170px 10px rgba(232,143,176,0.35)";
  }
}

// 왼쪽 큰 미리보기 (포커스된 여신을 항상 반영, 선택 여부와 무관)
function updatePreviewPanel() {
  const panel = document.getElementById("focus-preview");
  const g = GODDESSES[ssangjangUI.focusedIndex];
  if (!panel || !g) return;

  document.getElementById("preview-name").textContent = g.name;
  const clip = document.getElementById("preview-clip");
  const img = document.getElementById("preview-image");

  if (g.image) {
    clip.style.display = "";
    img.style.display = "";
    img.src = g.image;
    img.alt = g.name;
  } else {
    // 이미지 없는(테스트) 여신은 이모지를 크게 표시
    clip.style.display = "flex";
    img.style.display = "none";
    clip.textContent = g.thumbEmoji || "🌸";
    clip.style.fontSize = "120px";
    clip.style.alignItems = "center";
    clip.style.justifyContent = "center";
  }
}

function renderAnjeonGuchuk() {
  const el = document.createElement("div");
  el.className = "screen";
  el.innerHTML = `
    <div class="panel">
      <h2>안전구축</h2>
      <p>TODO: 선택한 여신의 통상패/비장패 목록에서 통상패 7장, 비장패 3장을 고르는 UI</p>
      <button id="confirm-btn">구축 완료 -> 벚꽃결투</button>
    </div>
  `;
  el.querySelector("#confirm-btn").onclick = confirmAnjeonGuchuk;
  return el;
}

function renderBeotkkotGyeoltu() {
  const el = document.createElement("div");
  el.className = "screen";
  el.innerHTML = `
    <div class="panel">
      <h2>벚꽃결투</h2>
      <p>TODO: 게임판, 액션 포인트, 핸드, 지역 영향력 UI</p>
      <div id="log"></div>
    </div>
  `;
  const logDiv = el.querySelector("#log");
  logDiv.innerHTML = gameState.log.map((l) => `<div>${l}</div>`).join("");
  return el;
}
