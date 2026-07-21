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

function renderSsangjangYoran() {
  const el = document.createElement("div");
  el.className = "ssangjang-screen";

  const activePlayer = gameState.players[ssangjangUI.activePlayerIndex];
  const selectedCount = activePlayer.goddesses.length;

  el.innerHTML = `
    <img class="ssangjang-bg" src="assets/ui/ssangjang-bg.jpg" alt="">
    <img class="ssangjang-title ${ssangjangUI.introPlayed ? "intro-done" : ""}"
         src="assets/ui/ssangjang-title.png" alt="쌍장요란">
    <div class="ssangjang-hud">
      <div class="mikoto-label">미코토 ${ssangjangUI.activePlayerIndex + 1} 선택</div>
      <div class="selection-count">여신선택(${selectedCount}/2)</div>
    </div>
    <div class="goddess-select-grid" id="goddess-grid"></div>
    <button class="next-btn" id="next-btn" ${selectedCount < 2 ? "disabled" : ""}>다음 -></button>
  `;

  // 타이틀 애니메이션은 이 화면에 처음 들어왔을 때 한 번만 재생 (재렌더링 때마다 다시 재생되지 않게)
  const titleImg = el.querySelector(".ssangjang-title");
  if (!ssangjangUI.introPlayed) {
    titleImg.addEventListener(
      "animationend",
      () => {
        ssangjangUI.introPlayed = true;
      },
      { once: true }
    );
  }

  const grid = el.querySelector("#goddess-grid");
  GODDESSES.forEach((g, index) => {
    const card = document.createElement("div");
    card.className = "select-card";
    if (index === ssangjangUI.focusedIndex) card.classList.add("focused");
    if (activePlayer.goddesses.find((sel) => sel.id === g.id)) card.classList.add("selected");

    card.innerHTML = `
      <span class="select-mark"></span>
      <div class="select-thumb">${g.thumbEmoji || "🌸"}</div>
      <div class="select-name">${g.name}</div>
    `;

    // 클릭(드래그 시작) -> 그 카드로 포커스 이동
    card.addEventListener("mousedown", () => {
      ssangjangUI.isDragging = true;
      ssangjangUI.focusedIndex = index;
      render();
    });
    // 마우스 누른 채로 이 카드 위로 들어오면 -> 포커스만 따라 이동 (드래그)
    card.addEventListener("mouseenter", () => {
      if (ssangjangUI.isDragging) {
        ssangjangUI.focusedIndex = index;
        render();
      }
    });
    // 더블클릭 -> 선택/선택취소 확정
    card.addEventListener("dblclick", () => {
      ssangjangUI.focusedIndex = index;
      toggleGoddessSelection(ssangjangUI.activePlayerIndex, g.id);
    });

    grid.appendChild(card);
  });

  el.querySelector("#next-btn").onclick = advanceSsangjangYoran;

  return el;
}

// 현재 카드 그리드가 한 줄에 몇 개씩 배치됐는지 (위/아래 화살표 이동 계산용)
function getSsangjangGridColumnCount() {
  const grid = document.getElementById("goddess-grid");
  if (!grid) return 1;
  const cards = grid.querySelectorAll(".select-card");
  if (cards.length === 0) return 1;
  const firstTop = cards[0].offsetTop;
  let count = 0;
  for (const c of cards) {
    if (c.offsetTop === firstTop) count++;
    else break;
  }
  return count || 1;
}

// 쌍장요란 화면에서의 키보드 조작 (main.js에서 항상 연결되어 있고, 이 화면일 때만 동작함)
function handleSsangjangKeydown(e) {
  if (GODDESSES.length === 0) return;
  const cols = getSsangjangGridColumnCount();
  const lastIndex = GODDESSES.length - 1;

  if (e.key === "ArrowRight") {
    ssangjangUI.focusedIndex = Math.min(ssangjangUI.focusedIndex + 1, lastIndex);
    render();
  } else if (e.key === "ArrowLeft") {
    ssangjangUI.focusedIndex = Math.max(ssangjangUI.focusedIndex - 1, 0);
    render();
  } else if (e.key === "ArrowDown") {
    ssangjangUI.focusedIndex = Math.min(ssangjangUI.focusedIndex + cols, lastIndex);
    render();
  } else if (e.key === "ArrowUp") {
    ssangjangUI.focusedIndex = Math.max(ssangjangUI.focusedIndex - cols, 0);
    render();
  } else if (e.key === "Enter") {
    const activePlayer = gameState.players[ssangjangUI.activePlayerIndex];
    const g = GODDESSES[ssangjangUI.focusedIndex];
    toggleGoddessSelection(ssangjangUI.activePlayerIndex, g.id);
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
