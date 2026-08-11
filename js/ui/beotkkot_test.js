// ============================================
// 벚꽃결투 테스트 헬퍼
// index.html에서 다른 스크립트 다 로드한 뒤 마지막에 include하면
// 화면 하단에 "벚꽃결투 테스트" 버튼이 생기고, 누르면 목 데이터로
// renderBeotkkotGyeoltu()를 실행해서 실제 DOM을 화면에 붙여줌.
// ============================================

// ─────────────────────────────────────────
// 1. 목(Mock) gameState.beotkkot 초기화
// ─────────────────────────────────────────
function initMockBeotkkot() {
  // ⚠️ goddessId는 GODDESSES/CARDS가 쓰는 영어 id를 써야 함 ("유리나" 아님).
  //    한글 이름을 넣으면 getCardById()가 못 찾아서 카드명이 다 안 뜬다.
  const yurinaRef = (id) => ({ goddessId: "yurina", cardId: id });
  const saineRef  = (id) => ({ goddessId: "saine",  cardId: id });

  gameState.beotkkot = {
    interval: 5,
    masterInterval: 2,
    dust: 3,
    turnNumber: 1,
    phaseInTurn: "메인",
    activePlayerIndex: 0, // 0 = players[0](유리나)가 활성

    players: [
      {
        // ── 플레이어 0 (localViewIndex=0일 때 "나")
        name: "유리나",
        goddesses: [{ id: "yurina", baseId: "yurina" }],
        goddessState: {},

        life: 8,
        aura: 3,
        flare: 2,
        focus: 1,
        focusLimit: 2,
        isWithered: false,

        hand:     [yurinaRef("O-N-1"), yurinaRef("O-N-2"), yurinaRef("O-N-3")],
        pile:     Array(8).fill(null).map((_, i) => yurinaRef("O-N-" + (i % 7 + 1))),
        discard:  [yurinaRef("O-N-4"), yurinaRef("O-N-5")],
        facedown: [yurinaRef("O-N-6")],
        // ⚠️ gameState.js 스키마와 동일하게 "card" 키 사용 (이전엔 "ref"였음)
        special: [
          { card: yurinaRef("O-S-1"), used: false },
          { card: yurinaRef("O-S-2"), used: true },
          { card: yurinaRef("O-S-3"), used: false },
        ],
        bond: [],
        extra: [],
      },
      {
        // ── 플레이어 1 (localViewIndex=0일 때 "상대")
        name: "사이네",
        goddesses: [{ id: "saine", baseId: "saine" }],
        goddessState: {},

        life: 10,
        aura: 5,
        flare: 0,
        focus: 2,
        focusLimit: 2,
        isWithered: false,

        hand:     [saineRef("O-N-1"), saineRef("O-N-2"), saineRef("O-N-3"), saineRef("O-N-4")],
        pile:     Array(6).fill(null).map((_, i) => saineRef("O-N-" + (i % 7 + 1))),
        discard:  [saineRef("O-N-5"), saineRef("O-N-6"), saineRef("O-N-7")],
        facedown: [],
        special: [
          { card: saineRef("O-S-1"), used: false },
          { card: saineRef("O-S-2"), used: false },
          { card: saineRef("O-S-3"), used: false },
        ],
        bond: [],
        extra: [],
      },
    ],
  };

  localViewIndex = 0;
}

// ─────────────────────────────────────────
// 2. 화면에 붙이기 + 토글 버튼 UI
// ─────────────────────────────────────────
let _bkContainer = null;

function mountBeotkkotTest() {
  if (!_bkContainer) {
    _bkContainer = document.createElement("div");
    _bkContainer.id = "bk-test-overlay";
    _bkContainer.style.cssText = [
      "position:fixed", "inset:0", "z-index:9999",
      "background:#1a1420",
      "display:flex", "flex-direction:column",
      "overflow:hidden",
    ].join(";");

    const bar = document.createElement("div");
    bar.style.cssText = [
      "display:flex", "align-items:center", "gap:12px",
      "padding:8px 16px",
      "background:#2a2130",
      "border-bottom:1px solid rgba(255,255,255,0.15)",
      "flex-shrink:0",
    ].join(";");

    const btnClose = document.createElement("button");
    btnClose.textContent = "✕ 닫기";
    btnClose.onclick = unmountBeotkkotTest;
    bar.appendChild(btnClose);

    // 관점 토글: toggleLocalView()는 localViewIndex만 바꾸고 메인 render()는
    // 건드리지 않으므로(render_beotkkot.js 참고), 이 오버레이 갱신은
    // refreshBeotkkotTest()가 직접 담당한다.
    const btnToggle = document.createElement("button");
    btnToggle.id = "bk-toggle-btn";
    btnToggle.onclick = () => {
      toggleLocalView();
      refreshBeotkkotTest();
    };
    bar.appendChild(btnToggle);

    const btnActive = document.createElement("button");
    btnActive.textContent = "활성 플레이어 전환";
    btnActive.onclick = () => {
      gameState.beotkkot.activePlayerIndex = 1 - gameState.beotkkot.activePlayerIndex;
      refreshBeotkkotTest();
    };
    bar.appendChild(btnActive);

    const btnAddDiscard = document.createElement("button");
    btnAddDiscard.textContent = "+ 버림패 추가(me)";
    btnAddDiscard.onclick = () => {
      const me = gameState.beotkkot.players[localViewIndex];
      me.discard.push({ goddessId: me.goddesses[0].id, cardId: "O-N-1" });
      refreshBeotkkotTest();
    };
    bar.appendChild(btnAddDiscard);

    const lbl = document.createElement("span");
    lbl.id = "bk-status-lbl";
    lbl.style.cssText = "margin-left:auto;color:#e88fb0;font-size:13px;";
    bar.appendChild(lbl);

    _bkContainer.appendChild(bar);

    const renderArea = document.createElement("div");
    renderArea.id = "bk-render-area";
    renderArea.style.cssText = ["flex:1", "overflow:auto", "position:relative"].join(";");
    _bkContainer.appendChild(renderArea);

    document.body.appendChild(_bkContainer);
  }

  refreshBeotkkotTest();
}

function unmountBeotkkotTest() {
  if (_bkContainer) {
    _bkContainer.remove();
    _bkContainer = null;
  }
}

function refreshBeotkkotTest() {
  if (!_bkContainer) return;

  const toggleBtn = document.getElementById("bk-toggle-btn");
  if (toggleBtn) {
    const myName = gameState.beotkkot.players[localViewIndex].name;
    toggleBtn.textContent = `관점 전환 (지금: ${myName} 시점)`;
  }

  const lbl = document.getElementById("bk-status-lbl");
  if (lbl) {
    const active = gameState.beotkkot.players[gameState.beotkkot.activePlayerIndex].name;
    lbl.textContent = `활성: ${active} | 간격: ${gameState.beotkkot.interval}`;
  }

  const area = document.getElementById("bk-render-area");
  if (!area) return;
  area.innerHTML = "";

  const dom = renderBeotkkotGyeoltu();
  area.appendChild(dom);

  area.querySelectorAll("[data-action='expand-discard']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pidx = parseInt(btn.dataset.player, 10);
      const actualIdx = pidx === 0 ? localViewIndex : 1 - localViewIndex;
      showDiscardModal(gameState.beotkkot.players[actualIdx]);
    });
  });

  area.querySelectorAll("[data-action='expand-hand']").forEach((btn) => {
    btn.addEventListener("click", () => {
      showHandModal(gameState.beotkkot.players[localViewIndex]);
    });
  });

  area.querySelectorAll(".card-face.clickable").forEach((el) => {
    el.addEventListener("click", () => {
      console.log("[카드 선택]", el.dataset.goddess, el.dataset.card);
    });
  });
}

// ─────────────────────────────────────────
// 3. 모달 (버림패 전체 보기 / 손패 더보기)
// ─────────────────────────────────────────
function showDiscardModal(player) {
  const modal = buildModal("버림패 전체 (" + player.discard.length + "장)");
  const grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:16px;";
  player.discard.forEach((ref) => {
    const card = resolveCard(ref);
    const el = document.createElement("div");
    el.style.cssText = [
      "background:#3a2f40", "border:1px solid #6a4f7a",
      "border-radius:6px", "padding:8px", "font-size:12px",
      "color:#f0e6ec", "text-align:center",
    ].join(";");
    el.textContent = card ? card.name : ref.cardId;
    grid.appendChild(el);
  });
  modal.content.appendChild(grid);
  document.body.appendChild(modal.el);
}

function showHandModal(player) {
  const modal = buildModal("손패 전체 (" + player.hand.length + "장)");
  const grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:16px;";
  player.hand.forEach((ref, i) => {
    const card = resolveCard(ref);
    const el = document.createElement("div");
    el.style.cssText = [
      "background:#3a2f40", "border:1px solid #4a8f7a",
      "border-radius:6px", "padding:8px", "font-size:12px",
      "color:#f0e6ec", "text-align:center", "cursor:pointer",
    ].join(";");
    el.textContent = (card ? card.name : ref.cardId) + " (손패" + (i + 1) + ")";
    el.onclick = () => console.log("[손패 선택]", ref.goddessId, ref.cardId);
    grid.appendChild(el);
  });
  modal.content.appendChild(grid);
  document.body.appendChild(modal.el);
}

function buildModal(title) {
  const overlay = document.createElement("div");
  overlay.style.cssText = [
    "position:fixed", "inset:0", "z-index:99999",
    "background:rgba(0,0,0,0.75)",
    "display:flex", "align-items:center", "justify-content:center",
  ].join(";");

  const box = document.createElement("div");
  box.style.cssText = [
    "background:#2a2130", "border:1px solid rgba(255,255,255,0.2)",
    "border-radius:12px", "min-width:400px", "max-width:90vw",
    "max-height:80vh", "overflow-y:auto",
    "display:flex", "flex-direction:column",
  ].join(";");

  const header = document.createElement("div");
  header.style.cssText = [
    "display:flex", "align-items:center", "justify-content:space-between",
    "padding:12px 16px",
    "border-bottom:1px solid rgba(255,255,255,0.15)",
  ].join(";");

  const ttl = document.createElement("span");
  ttl.style.cssText = "color:#f0e6ec;font-weight:bold;";
  ttl.textContent = title;

  const btnClose = document.createElement("button");
  btnClose.textContent = "✕";
  btnClose.onclick = () => overlay.remove();

  header.appendChild(ttl);
  header.appendChild(btnClose);

  const content = document.createElement("div");

  box.appendChild(header);
  box.appendChild(content);
  overlay.appendChild(box);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

  return { el: overlay, content };
}

// ─────────────────────────────────────────
// 4. 진입점 버튼
// ─────────────────────────────────────────
(function injectLaunchButton() {
  const btn = document.createElement("button");
  btn.id = "bk-launch-btn";
  btn.textContent = "🌸 벚꽃결투 테스트";
  btn.style.cssText = [
    "position:fixed", "bottom:16px", "right:16px", "z-index:8888",
    "padding:10px 18px",
    "background:#6a2a4a", "color:#f0e6ec",
    "border:none", "border-radius:8px",
    "font-size:14px", "cursor:pointer",
    "box-shadow:0 2px 8px rgba(0,0,0,0.5)",
  ].join(";");
  btn.onclick = () => {
    initMockBeotkkot();
    mountBeotkkotTest();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => document.body.appendChild(btn));
  } else {
    document.body.appendChild(btn);
  }
})();
