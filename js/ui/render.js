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

function renderSsangjangYoran() {
  const el = document.createElement("div");
  el.className = "screen";

  gameState.players.forEach((player, pIndex) => {
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = `<h2>${player.name} - 여신 2개 선택 (${player.goddesses.length}/2)</h2>`;

    const grid = document.createElement("div");
    grid.className = "goddess-grid";

    GODDESSES.forEach((g) => {
      const card = document.createElement("div");
      card.className = "goddess-card";
      if (player.goddesses.find((sel) => sel.id === g.id)) {
        card.classList.add("selected");
      }
      card.textContent = g.name;
      card.onclick = () => selectGoddess(pIndex, g.id);
      grid.appendChild(card);
    });

    panel.appendChild(grid);
    el.appendChild(panel);
  });

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "선택 완료 -> 안전구축";
  confirmBtn.onclick = confirmSsangjangYoran;
  el.appendChild(confirmBtn);

  return el;
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
