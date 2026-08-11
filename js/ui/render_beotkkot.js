// ============================================
// 벚꽃결투 화면 (좌표 레이아웃 기반: BEOTKKOT_LAYOUT)
// ============================================

// 카드 참조({goddessId, cardId}) -> 실제 카드 데이터 조회
function resolveCard(ref) {
  if (!ref) return null;
  if (typeof getCardById === "function") return getCardById(ref.goddessId, ref.cardId);
  return CARDS.find((c) => c.goddess === ref.goddessId && c.id === ref.cardId) || null;
}

// 벚꽃결정 개수를 ● / ○ 문자열로 표현
function sakuraDots(current, max) {
  if (max == null) return "●".repeat(current);
  const filled = Math.min(current, max);
  const empty = Math.max(max - current, 0);
  return "●".repeat(filled) + "○".repeat(empty);
}

const CARD_BACK_NORMAL = "assets/cardbacks/normal_back.png";
const CARD_BACK_SPECIAL = "assets/cardbacks/special_back.png";
const FOCUS_TOKEN_IMG = "assets/tokens/focus_token.png";

// 여신별 추가판(특수 상태) 렌더러. 여신 id를 key로 등록.
const GODDESS_EXTRA_RENDERERS = {
  shinra: (state) => `<div class="extra-line"><span class="extra-goddess">신라</span>계략 비공개</div>`,
  laila: (state) => `<div class="extra-line"><span class="extra-goddess">라이라</span>풍 ${state.windGauge ?? 0} · 뇌 ${state.thunderGauge ?? 0}</div>`,
  kamui: (state) => `<div class="extra-line"><span class="extra-goddess">카무이</span>금기 ${state.tabooGauge ?? 0}/16</div>`,
  megumi: (state) => `<div class="extra-line"><span class="extra-goddess">메구미</span>발아 ${state.sprouted ?? 0}/5</div>`,
};

function buildExtraBoardContent(beotkkotPlayer) {
  const lines = [];
  beotkkotPlayer.goddesses.forEach((g) => {
    const key = g.baseId || g.id;
    const renderer = GODDESS_EXTRA_RENDERERS[key];
    if (renderer) lines.push(renderer(beotkkotPlayer.goddessState[key] || {}));
  });
  if (lines.length === 0) {
    return `<div class="extra-empty">추가판 없음</div>`;
  }
  return lines.join("");
}

// 더미 카드 뒷면 스택 (최대 3장 겹쳐 표시 + 장수 표기)
// horizontal=true면 카드를 90도 돌려서 가로 방향으로 표시한다.
// (통합 규칙 6-2-2-2, 7-1-8: 덮음패에 놓인 카드는 뒷면 "가로 방향"이 기본 상태)
function buildDeckStackContent(count, backImg, horizontal) {
  if (count <= 0) return `<div class="slot-empty"></div>`;
  const layers = Math.min(count, 3);
  let imgs = "";
  for (let i = 0; i < layers; i++) {
    imgs += `<img class="stack-img" src="${backImg}" alt="">`;
  }
  const cls = horizontal ? "deck-stack deck-stack-h" : "deck-stack";
  return `<div class="${cls}">${imgs}</div><div class="deck-count">${count}</div>`;
}

// 카드 앞면을 실제 이미지로 렌더링 (cards.js의 image 필드 사용).
// 이미지 로딩이 실패하면(아직 에셋 업로드 전 등) onerror로 자동으로 이름 텍스트로 대체된다.
function buildCardFaceHTML(ref, extraClasses) {
  const card = resolveCard(ref);
  const name = card ? card.name : "?";
  const cls = ["card-face"].concat(extraClasses || []).join(" ");
  const dataAttrs = `data-goddess="${ref.goddessId}" data-card="${ref.cardId}"`;

  if (card && card.image) {
    return `<div class="${cls}" ${dataAttrs} title="${name}">
      <img class="card-face-img" src="${card.image}" alt="${name}"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="card-face-fallback" style="display:none;">${name}</div>
    </div>`;
  }
  return `<div class="${cls}" ${dataAttrs} title="${name}">
    <div class="card-face-fallback">${name}</div>
  </div>`;
}

// 버림패 슬롯(1~6번): index(0-based) 카드가 있으면 표시, 없으면 빈칸
function buildDiscardSlotContent(beotkkotPlayer, slotIndex) {
  const ref = beotkkotPlayer.discard[slotIndex];
  if (!ref) return `<div class="slot-empty"></div>`;
  return buildCardFaceHTML(ref);
}

// 손패 슬롯(내 쪽, 1~4번): "나"의 손패는 실시간 관점에서 항상 나 자신에게는
// 앞면으로 보여야 한다 (턴이 안 왔다고 내 카드가 안 보이는 건 이상함).
// 대신 지금 내 턴이 아니면 클릭 못 하게 dimmed 처리만 해서 구분한다.
function buildHandSlotContent(beotkkotPlayer, isMyTurn, slotIndex) {
  const ref = beotkkotPlayer.hand[slotIndex];
  if (!ref) return `<div class="slot-empty"></div>`;
  return buildCardFaceHTML(ref, [isMyTurn ? "clickable" : "disabled"]);
}

// 상대 손패(뭉뚱그린 한 칸): 장수만 표시, 항상 뒷면
function buildOpponentHandCollapsedContent(beotkkotPlayer) {
  const count = beotkkotPlayer.hand.length;
  if (count === 0) return `<div class="slot-empty"></div>`;
  return buildDeckStackContent(count, CARD_BACK_NORMAL);
}

// 비장패 슬롯(1~3번): 미사용=뒷면(7-1-11), 사용됨=앞면(실제 카드 이미지).
// 앞면 이미지 로딩 실패 시 뒷면 이미지로 대체.
function buildSpecialSlotContent(beotkkotPlayer, slotIndex) {
  const entry = beotkkotPlayer.special[slotIndex];
  if (!entry) return `<div class="slot-empty"></div>`;

  if (!entry.used) {
    return `<img class="card-img" src="${CARD_BACK_SPECIAL}" alt="">`;
  }

  const card = resolveCard(entry.card);
  if (card && card.image) {
    return `<img class="card-img" src="${card.image}" alt="${card.name}"
      onerror="this.src='${CARD_BACK_SPECIAL}'; this.style.opacity=0.6;">`;
  }
  return `<img class="card-img" style="opacity:0.6;" src="${CARD_BACK_SPECIAL}" alt="">`;
}

// 추가패(여신별 추가 카드) 파일: extra 배열 그대로 스택으로
function buildExtraPileContent(beotkkotPlayer, pileFilterFn) {
  const list = pileFilterFn ? beotkkotPlayer.extra.filter(pileFilterFn) : beotkkotPlayer.extra;
  if (!list || list.length === 0) return `<div class="slot-empty"></div><div class="zone-caption">추가패</div>`;
  return buildDeckStackContent(list.length, CARD_BACK_NORMAL) + `<div class="zone-caption">추가패</div>`;
}

function buildFocusContent(beotkkotPlayer, canSpend) {
  const btn = canSpend && beotkkotPlayer.focus > 0
    ? `<button class="zone-btn focus-spend-btn" data-action="spend-focus">사용</button>`
    : "";
  return `
    <img class="focus-token" src="${FOCUS_TOKEN_IMG}" alt="">
    <div class="focus-num">${beotkkotPlayer.focus}/${beotkkotPlayer.focusLimit}</div>
    ${beotkkotPlayer.isWithered ? `<div class="withered-tag">위축</div>` : ""}
    ${btn}
  `;
}

function buildFacedownPileContent(beotkkotPlayer) {
  return buildDeckStackContent(beotkkotPlayer.facedown.length, CARD_BACK_NORMAL, true) +
    `<div class="zone-caption">덮음패</div>`;
}

// 간격 트랙: 세로로 긴 박스이므로 10칸 세로 점으로 표시, 현재 값만큼 채움
function buildIntervalContent(bk) {
  let dotsHTML = "";
  for (let i = 10; i >= 1; i--) {
    const filled = i <= bk.interval;
    dotsHTML += `<div class="interval-dot ${filled ? "filled" : ""}"></div>`;
  }
  return `<div class="interval-track">${dotsHTML}</div><div class="interval-num">${bk.interval}</div>`;
}

function buildProfileContent(bk) {
  const activeName = bk.players[bk.activePlayerIndex].name;
  return `<div class="profile-active-label">활성 턴</div><div class="profile-active-name">${activeName}</div>`;
}

// 라이프/오라/플레어 공통
function buildStatContent(label, current, max) {
  return `<div class="stat-label">${label}</div><div class="stat-dots">${sakuraDots(current, max)}</div><div class="stat-num">${current}</div>`;
}

// ============================================
// 로컬 관점(누가 "나"인가)
// 지금은 hot-seat 한 화면에서 두 명이 번갈아 쓰지만, 이 레이아웃 자체는
// "실시간 대전 시 각자 자기 화면에서 보는 뷰"를 상정하고 만들어졌다.
// (me/you가 활성 플레이어를 따라 자리 이동하는 게 아니라, "이 클라이언트가
//  어느 플레이어인가"에 고정됨 - 실제 멀티플레이에서는 서버가 알려주는
//  내 playerIndex로 세팅될 값)
//
// 지금은 개발/테스트 편의를 위해 전역 변수로 두고, 버튼이나 단축키로
// 토글하면서 "상대 관점에서도 레이아웃이 똑같이 잘 도는지" 확인한다.
// ============================================
let localViewIndex = 0;

// localViewIndex만 바꾸고 실제 화면 갱신은 호출부에 맡긴다.
// (메인 render()를 여기서 직접 부르면, 지금 화면이 벚꽃결투가 아닐 때
//  - 예: 이 함수를 테스트 오버레이에서 부를 때 - 엉뚱하게 배경 화면이
//  다시 그려지면서 BGM 재생/애니메이션 재시작 같은 부작용이 생긴다.)
function toggleLocalView() {
  localViewIndex = 1 - localViewIndex;
}

// 좌표 레이아웃의 zone 이름 -> 실제 컨텐츠 HTML 매핑.
// me = localViewIndex 쪽(아래 자리 고정), you = 반대쪽(위 자리 고정).
// 활성 여부는 자리와 무관하게 bk.activePlayerIndex로 판단 (손패 공개 등에 사용).
function resolveZoneContent(name, bk) {
  const me = bk.players[localViewIndex];
  const you = bk.players[1 - localViewIndex];
  const meActive = bk.activePlayerIndex === localViewIndex;
  const youActive = bk.activePlayerIndex === 1 - localViewIndex;

  // 숫자가 붙은 슬롯류는 정규식으로 처리
  let m;
  if ((m = name.match(/^버림패(\d)_me$/))) return buildDiscardSlotContent(me, +m[1] - 1);
  if ((m = name.match(/^버림패(\d)_you$/))) return buildDiscardSlotContent(you, +m[1] - 1);
  if ((m = name.match(/^손패(\d)_me$/))) return buildHandSlotContent(me, meActive, +m[1] - 1);
  if ((m = name.match(/^비장패(\d)_me$/))) return buildSpecialSlotContent(me, +m[1] - 1);
  if ((m = name.match(/^비장패(\d)_you$/))) return buildSpecialSlotContent(you, +m[1] - 1);

  switch (name) {
    case "추가판_me": return buildExtraBoardContent(me);
    case "추가판_you": return buildExtraBoardContent(you);

    case "게임판": return ""; // 컨테이너, 자체 콘텐츠 없음(자식이 채움)

    case "플레어_me": return buildStatContent("플레어", me.flare, null);
    case "플레어_you": return buildStatContent("플레어", you.flare, null);
    case "오라_me": return buildStatContent("오라", me.aura, 5);
    case "오라_you": return buildStatContent("오라", you.aura, 5);
    case "라이프_me": return buildStatContent("라이프", me.life, null);
    case "라이프_you": return buildStatContent("라이프", you.life, null);

    case "간격": return buildIntervalContent(bk);

    case "버림패": return ""; // 컨테이너
    case "버림패버튼_me": return `<button class="zone-btn" data-action="expand-discard" data-player="0">전체${me.discard.length > 6 ? " (" + me.discard.length + ")" : ""}<br>보기</button>`;
    case "버림패버튼_you": return `<button class="zone-btn" data-action="expand-discard" data-player="1">전체${you.discard.length > 6 ? " (" + you.discard.length + ")" : ""}<br>보기</button>`;

    case "추가패1": return buildExtraPileContent(me); // me의 첫 번째 추가패 묶음
    case "추가패2_me": return buildExtraPileContent(me); // me의 두 번째 추가패 묶음(여신별로 다수 필요시)
    case "추가패1_you": return buildExtraPileContent(you);

    case "패산_me": return buildDeckStackContent(me.pile.length, CARD_BACK_NORMAL) + `<div class="zone-caption">패산 ${me.pile.length}</div>`;
    case "패산_you": return buildDeckStackContent(you.pile.length, CARD_BACK_NORMAL) + `<div class="zone-caption">패산 ${you.pile.length}</div>`;

    case "손패_me": return ""; // 컨테이너(개별 슬롯 1~4가 자식으로 채움)
    case "손패버튼_me": return me.hand.length > 4 ? `<button class="zone-btn" data-action="expand-hand" data-player="0">더보기<br>(${me.hand.length})</button>` : "";
    case "손패_you": return buildOpponentHandCollapsedContent(you) + `<div class="zone-caption">상대 손패 ${you.hand.length}</div>`;

    case "비장패_me": return ""; // 컨테이너
    case "비장패": return ""; // 컨테이너(you의 비장패 묶음)

    case "덮음패_you": return buildFacedownPileContent(you);
    case "덮음패_me": return buildFacedownPileContent(me);

    case "집중력_me": return buildFocusContent(me, bk.activePlayerIndex === localViewIndex);
    case "집중력_you": return buildFocusContent(you, false);

    case "프로필": return buildProfileContent(bk);

    case "빈공간": return `<div class="reserved-tag">예약 공간</div>`;

    default: return "";
  }
}

// BEOTKKOT_LAYOUT을 재귀적으로 실제 DOM으로 만든다.
// (기존 와이어프레임 스크립트의 build() 로직 + 실제 콘텐츠 주입)
function buildBeotkkotZone(shape, allShapes, bk) {
  const el = document.createElement("div");
  const hasChildren = allShapes.some((s) => s.parent === shape.name);
  el.className = "bk-zone" + (hasChildren ? " bk-zone-container" : "");
  el.dataset.zone = shape.name;

  const content = resolveZoneContent(shape.name, bk);
  if (content) el.innerHTML = content;

  // 집중력 "사용" 버튼: 항상 localViewIndex(나) 쪽에서만 눌러야 하므로
  // spendFocus에는 localViewIndex를 그대로 넘긴다(내 턴이 아니면 함수 내부에서 무시됨).
  const focusBtn = el.querySelector("[data-action='spend-focus']");
  if (focusBtn) {
    focusBtn.addEventListener("click", () => spendFocus(localViewIndex));
  }

  allShapes
    .filter((s) => s.parent === shape.name)
    .forEach((child) => {
      const childEl = buildBeotkkotZone(child, allShapes, bk);
      childEl.style.left = child.relativeToParent.left + "%";
      childEl.style.top = child.relativeToParent.top + "%";
      childEl.style.width = child.relativeToParent.width + "%";
      childEl.style.height = child.relativeToParent.height + "%";
      el.appendChild(childEl);
    });

  return el;
}

// 실제 게임 화면에서 쓸 정식 관점 전환 (메인 render()까지 같이 갱신).
// 테스트 오버레이에서는 이거 대신 toggleLocalView() + refreshBeotkkotTest()를 쓴다.
function toggleLocalViewAndRender() {
  toggleLocalView();
  if (gameState.phase === PHASE.BEOTKKOT_GYEOLTU) render();
}

function renderBeotkkotGyeoltu() {
  const bk = gameState.beotkkot;

  if (bk.phaseInTurn === "MULLIGAN") {
    return renderMulliganScreen();
  }

  const wrap = document.createElement("div");
  wrap.className = "beotkkot-wrap";

  const stage = document.createElement("div");
  stage.className = "bk-stage";

  BEOTKKOT_LAYOUT.filter((s) => !s.parent).forEach((shape) => {
    const el = buildBeotkkotZone(shape, BEOTKKOT_LAYOUT, bk);
    el.style.left = shape.percent.left + "%";
    el.style.top = shape.percent.top + "%";
    el.style.width = shape.percent.width + "%";
    el.style.height = shape.percent.height + "%";
    stage.appendChild(el);
  });

  wrap.appendChild(stage);
  wrap.appendChild(buildTurnBar(bk));
  return wrap;
}

// 화면 상단에 떠 있는 턴 정보 + 턴 종료 버튼.
// (BEOTKKOT_LAYOUT 좌표에는 이 버튼 자리가 따로 없어서, 스테이지 위에 얹는 별도 바로 만듦)
function buildTurnBar(bk) {
  const bar = document.createElement("div");
  bar.className = "bk-turnbar";

  const isMyTurn = bk.activePlayerIndex === localViewIndex;
  const activeName = bk.players[bk.activePlayerIndex].name;

  bar.innerHTML = `
    <span class="bk-turnbar-info">턴 ${bk.turnNumber} · ${activeName} 차례${isMyTurn ? " (내 턴)" : ""}</span>
    <button class="zone-btn bk-endturn-btn" ${isMyTurn ? "" : "disabled"}>턴 종료</button>
  `;

  bar.querySelector(".bk-endturn-btn").addEventListener("click", () => {
    if (isMyTurn) endBeotkkotTurn();
  });

  return bar;
}

// 4-1-5 멀리건 화면
function renderMulliganScreen() {
  const bk = gameState.beotkkot;
  const player = bk.players[bk.mulliganPlayerIndex];
  const isMyMulligan = bk.mulliganPlayerIndex === localViewIndex;

  const wrap = document.createElement("div");
  wrap.className = "beotkkot-wrap bk-mulligan-wrap";

  const box = document.createElement("div");
  box.className = "bk-mulligan-box";

  const cardsHTML = player.hand
    .map((ref, i) => {
      const card = resolveCard(ref);
      const name = card ? card.name : "?";
      const selected = bk.mulliganSelected.includes(i);
      const imgHTML = card && card.image
        ? `<img class="bk-mulligan-card-img" src="${card.image}" alt="${name}"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="bk-mulligan-card-fallback" style="display:none;">${name}</div>`
        : `<div class="bk-mulligan-card-fallback">${name}</div>`;
      return `<div class="bk-mulligan-card ${selected ? "selected" : ""}" data-index="${i}">
        ${imgHTML}
      </div>`;
    })
    .join("");

  box.innerHTML = `
    <div class="bk-mulligan-title">${player.name} 멀리건</div>
    <div class="bk-mulligan-desc">
      ${isMyMulligan
        ? "바꾸고 싶은 카드를 클릭해서 선택한 뒤 확정하세요. 아무것도 선택 안 하고 확정해도 됩니다."
        : "상대가 멀리건을 진행 중입니다..."}
    </div>
    <div class="bk-mulligan-cards">${isMyMulligan ? cardsHTML : `<div class="bk-mulligan-hidden">비공개</div>`}</div>
    <button class="zone-btn bk-mulligan-confirm" ${isMyMulligan ? "" : "disabled"}>
      ${bk.mulliganSelected.length > 0 ? bk.mulliganSelected.length + "장 바꾸고 " : ""}확정
    </button>
  `;

  if (isMyMulligan) {
    box.querySelectorAll(".bk-mulligan-card").forEach((el) => {
      el.addEventListener("click", () => toggleMulliganCard(parseInt(el.dataset.index, 10)));
    });
    box.querySelector(".bk-mulligan-confirm").addEventListener("click", confirmMulligan);
  }

  wrap.appendChild(box);
  return wrap;
}
