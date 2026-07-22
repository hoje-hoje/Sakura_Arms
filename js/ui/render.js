// ============================================
// 화면 렌더링
// gameState.phase에 따라 다른 화면을 그립니다.
// ============================================

// 같은 여신 계열(기본 + 어나더들)을 구분하는 키
// baseId가 있으면 그 값, 없으면(기본형이면) 자기 자신의 id를 계열 키로 사용
function getFamilyId(goddess) {
  return goddess.baseId || goddess.id;
}

// 이 플레이어가 이미 이 여신과 같은 계열(다른 버전)을 선택해뒀는지 확인
function hasFamilyConflict(player, goddess) {
  const fam = getFamilyId(goddess);
  return player.goddesses.some(
    (sel) => sel.id !== goddess.id && getFamilyId(sel) === fam
  );
}

function render() {
  const app = document.getElementById("app");

  // 스크롤 위치가 확 튀는 걸 막기 위해, 다시 그리기 전에 현재 스크롤 위치를 저장해둠
  const existingWrap = document.getElementById("grid-wrap");
  if (existingWrap) ssangjangUI.lastScrollTop = existingWrap.scrollTop;

  app.innerHTML = "";

  // 화면 전환마다 중복 등록되지 않도록 항상 먼저 해제
  document.removeEventListener("keydown", handleSsangjangKeydown);

  switch (gameState.phase) {
    case PHASE.HOME:
      app.appendChild(renderHome());
      break;
    case PHASE.SSANGJANG_YORAN:
      app.appendChild(renderSsangjangYoran());

      // 저장해둔 스크롤 위치를 애니메이션 없이 즉시 복원 (맨 위로 튀었다가 내려오는 현상 방지)
      const newWrap = document.getElementById("grid-wrap");
      if (newWrap) newWrap.scrollTop = ssangjangUI.lastScrollTop || 0;

      // 화면에 실제로 붙은 뒤에 실행해야 요소를 찾을 수 있어서 여기서 호출함
      updatePreviewPanel();
      applyScreenGlow(ssangjangUI.focusedIndex);
      scrollFocusedIntoView();
      document.addEventListener("keydown", handleSsangjangKeydown);
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
  el.appendChild(createSakuraPetals());
  el.querySelector("#start-btn").onclick = () => {
    gameState.phase = PHASE.SSANGJANG_YORAN;
    render();
  };
  return el;
}

// 홈 화면에 흩날리는 벚꽃잎 이펙트 생성
function createSakuraPetals(count = 24) {
  const container = document.createElement("div");
  container.className = "sakura-petals";

  const petalSVG = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 8
               C 30 20, 18 40, 22 62
               C 24 78, 36 90, 50 94
               C 64 90, 76 78, 78 62
               C 82 40, 70 20, 50 8
               C 47 14, 53 14, 50 8 Z"
            fill="#f3b8c9" />
    </svg>
  `;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.innerHTML = petalSVG;

    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 8;
    const delay = Math.random() * 12;
    const size = 12 + Math.random() * 14;
    const drift = Math.round(Math.random() * 160 - 80) + "px";
    const spin = Math.random() > 0.5 ? "360deg" : "-360deg";

    petal.style.left = left + "%";
    petal.style.animationDuration = duration + "s";
    petal.style.animationDelay = "-" + delay + "s";
    petal.style.width = size + "px";
    petal.style.height = size + "px";
    petal.style.setProperty("--drift", drift);
    petal.style.setProperty("--spin", spin);
    container.appendChild(petal);
  }
  return container;
}

// 여신 이미지의 대표색 캐시 (한 번 계산한 건 재사용)
const dominantColorCache = {};

function renderSsangjangYoran() {
  const el = document.createElement("div");
  el.className = "ssangjang-screen";

  const activePlayer = gameState.players[ssangjangUI.activePlayerIndex];
  const selectedCount = activePlayer.goddesses.length;

  // 선택 슬롯(2칸) HTML - 이미지 있으면 이미지, 없으면 이모지, 빈 칸이면 번호만
  const slotsHTML = [0, 1].map((i) => {
    const sel = activePlayer.goddesses[i];
    if (sel && sel.image) {
      return `
        <div class="selected-slot filled">
          <img src="${sel.image}" alt="${sel.name}">
          <div class="selected-slot-label">${sel.name}</div>
        </div>`;
    } else if (sel) {
      return `
        <div class="selected-slot filled emoji">
          <div class="selected-slot-emoji">${sel.thumbEmoji || "🌸"}</div>
          <div class="selected-slot-label">${sel.name}</div>
        </div>`;
    }
    return `<div class="selected-slot empty"><span>${i + 1}</span></div>`;
  }).join("");

  el.innerHTML = `
    <img class="ssangjang-bg" src="assets/ui/ssangjang-bg.jpg" alt="">
    <div class="ssangjang-glow" id="glow"></div>
    <div class="ssangjang-white-overlay ${ssangjangUI.introPlayed ? "intro-done" : ""}" id="overlay"></div>
    <img class="ssangjang-title ${ssangjangUI.introPlayed ? "intro-done" : ""}" id="title"
         src="assets/ui/ssangjang-title.png" alt="쌍장요란">
    <div class="ssangjang-hud">
      <div class="mikoto-label">미코토 ${ssangjangUI.activePlayerIndex + 1} 선택</div>
      <div class="selection-count">여신선택(${selectedCount}/2)</div>
      <div class="selected-slots" id="selected-slots">
        ${slotsHTML}
      </div>
    </div>

    <div class="ssangjang-content">
      <div class="focus-preview" id="focus-preview">
        <div class="focus-preview-clip" id="preview-clip">
          <img id="preview-image" src="" alt="">
        </div>
        <div class="focus-preview-name" id="preview-name"></div>
      </div>
      <div class="goddess-grid-wrap" id="grid-wrap">
        <div class="goddess-grid" id="grid"></div>
      </div>
    </div>
    <div class="selection-flash" id="selection-flash">
      <img id="selection-flash-img" src="" alt="">
    </div>
    <button class="next-btn" id="next-btn" ${selectedCount < 2 ? "disabled" : ""}>다음 -></button>
    <button class="home-btn" id="home-btn">홈으로</button>
  `;

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

  const grid = el.querySelector("#grid");
  GODDESSES.forEach((g, index) => {
    const box = document.createElement("div");
    box.className = "grid-box";

    const isSelected = !!activePlayer.goddesses.find((sel) => sel.id === g.id);
    // 이미 같은 계열(같은 여신의 다른 버전)이 선택되어 있으면, 자기 자신이 아닌 이상 비활성화
    const isDisabled = !isSelected && hasFamilyConflict(activePlayer, g);

    if (index === ssangjangUI.focusedIndex) box.classList.add("focused");
    if (isSelected) box.classList.add("selected");
    if (isDisabled) box.classList.add("disabled");

    const visual = g.image
      ? `<img class="grid-box-image" src="${g.image}" alt="${g.name}">`
      : `<div class="grid-box-thumb">${g.thumbEmoji || "🌸"}</div>`;

    box.innerHTML = `
      <span class="grid-box-mark"></span>
      ${visual}
      <div class="grid-box-name">${g.name}</div>
    `;

    if (g.image) {
      const img = box.querySelector(".grid-box-image");
      ensureDominantColor(img, g.id, () => {
        if (index === ssangjangUI.focusedIndex) applyScreenGlow(ssangjangUI.focusedIndex);
      });
    }

    box.addEventListener("click", () => {
      ssangjangUI.focusedIndex = index;
      selectGoddessAt(index);
    });

    grid.appendChild(box);
  });

  el.querySelector("#next-btn").onclick = advanceSsangjangYoran;
  el.querySelector("#home-btn").onclick = () => {
    gameState.players.forEach((p) => { p.goddesses = []; });
    ssangjangUI.activePlayerIndex = 0;
    ssangjangUI.focusedIndex = 0;
    ssangjangUI.introPlayed = false;
    ssangjangUI.isPanning = false;
    ssangjangUI.dragMoved = false;
    ssangjangUI.lastOffset = 0;
    gameState.phase = PHASE.HOME;
    render();
  };

  return el;
}

  return el;
}

// 여신 선택 처리
// - 이미 2개 선택된 상태에서 새 여신 클릭 -> 무시 (플래시 없음)
// - 같은 계열(같은 여신의 다른 버전)이 이미 선택되어 있는데 다른 버전 클릭 -> 무시 (플래시 없음)
function selectGoddessAt(index) {
  const g = GODDESSES[index];
  const activePlayer = gameState.players[ssangjangUI.activePlayerIndex];
  const wasSelected = !!activePlayer.goddesses.find((sel) => sel.id === g.id);

  if (!wasSelected && hasFamilyConflict(activePlayer, g)) {
    // 같은 여신의 다른 버전이 이미 선택되어 있음 -> 아무 동작도 하지 않음
    return;
  }

  const willActuallySelect = !wasSelected && activePlayer.goddesses.length < 2;

  toggleGoddessSelection(ssangjangUI.activePlayerIndex, g.id);

  if (willActuallySelect) playSelectionFlash(g);
}

function getSsangjangGridColumnCount() {
  const grid = document.getElementById("grid");
  if (!grid) return 1;
  const boxes = grid.querySelectorAll(".grid-box");
  if (boxes.length === 0) return 1;
  const firstTop = boxes[0].offsetTop;
  let count = 0;
  for (const b of boxes) {
    if (b.offsetTop === firstTop) count++;
    else break;
  }
  return count || 1;
}

function scrollFocusedIntoView() {
  const grid = document.getElementById("grid");
  if (!grid) return;
  const box = grid.children[ssangjangUI.focusedIndex];
  if (box) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function handleSsangjangKeydown(e) {
  if (GODDESSES.length === 0) return;
  if (!ssangjangUI.introPlayed) return; // 인트로 재생 중엔 조작 무시 (재시작 버그 방지)
  const lastIndex = GODDESSES.length - 1;
  const cols = getSsangjangGridColumnCount();

  if (e.key === "ArrowRight") {
    ssangjangUI.focusedIndex = Math.min(ssangjangUI.focusedIndex + 1, lastIndex);
  } else if (e.key === "ArrowLeft") {
    ssangjangUI.focusedIndex = Math.max(ssangjangUI.focusedIndex - 1, 0);
  } else if (e.key === "ArrowDown") {
    ssangjangUI.focusedIndex = Math.min(ssangjangUI.focusedIndex + cols, lastIndex);
  } else if (e.key === "ArrowUp") {
    ssangjangUI.focusedIndex = Math.max(ssangjangUI.focusedIndex - cols, 0);
  } else if (e.key === "Enter") {
    selectGoddessAt(ssangjangUI.focusedIndex);
    return;
  } else {
    return;
  }
  render();
}

// ---- 여신 이미지 대표색 추출 (투명 픽셀은 제외하고 평균) ----
// RGB -> HSL -> RGB 변환 (채도만 살짝 올리기 위함)
function boostSaturation(r, g, b, boost) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  s = Math.min(1, s * boost);

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let nr, ng, nb;
  if (s === 0) {
    nr = ng = nb = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    nr = hue2rgb(p, q, h + 1 / 3);
    ng = hue2rgb(p, q, h);
    nb = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(nr * 255), Math.round(ng * 255), Math.round(nb * 255)];
}

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
      if (data[i + 3] < 128) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
// 글로우 효과 코드 (채도)
    if (count === 0) return "rgba(232,143,176,0.45)";
    const [br, bg, bb] = boostSaturation(r / count, g / count, b / count, 1.8);
    return `rgba(${br},${bg},${bb},0.6)`;
  } catch (e) {
    return "rgba(232,143,176,0.45)";
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
  const glow = document.getElementById("glow");
  if (!g || !glow) return;
  const color = g.image && dominantColorCache[g.id] ? dominantColorCache[g.id] : "rgba(232,143,176,0.45)";
  glow.style.boxShadow = `inset 0 -130px 140px -30px ${color}`;
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
    clip.style.display = "flex";
    img.style.display = "none";
    clip.textContent = g.thumbEmoji || "🌸";
    clip.style.fontSize = "120px";
    clip.style.alignItems = "center";
    clip.style.justifyContent = "center";
  }
}

// 선택 시 큰 이미지가 잠깐 나타났다 사라지는 효과 (텍스트 없음)
function playSelectionFlash(goddess) {
  const flash = document.getElementById("selection-flash");
  const img = document.getElementById("selection-flash-img");
  if (!flash || !img || !goddess.image) return;

  img.src = goddess.image;
  flash.classList.remove("active");
  void flash.offsetWidth;
  flash.classList.add("active");
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