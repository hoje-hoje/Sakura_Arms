// ============================================
// 벚꽃결투 턴 진행 로직
// 4-1-5(멀리건), 5-1-2(집중력 소모), 8-1~8-3(턴/페이즈 진행)를 다룬다.
//
// 주의: 지금 구현은 "표준행동/전력행동으로 카드를 실제로 사용하는" 부분(9-2)까지는
// 아직 안 만들었다. 여기서는 그 전 단계 - 멀리건, 집중력 자원 소모, 턴 넘기기 -
// 까지만 동작한다.
// ============================================

// ─────────────────────────────────────────
// 4-1-5 멀리건
// ─────────────────────────────────────────

// 멀리건 화면에서 손패 카드를 "바꿀 카드"로 선택/해제
function toggleMulliganCard(handIndex) {
  const bk = gameState.beotkkot;
  if (bk.phaseInTurn !== "MULLIGAN") return;

  const idx = bk.mulliganSelected.indexOf(handIndex);
  if (idx >= 0) {
    bk.mulliganSelected.splice(idx, 1);
  } else {
    bk.mulliganSelected.push(handIndex);
  }
  render();
}

// "다시 뽑기" 확정: 선택한 장수만큼 패산 아래로 보내고 같은 장수를 다시 뽑는다.
function confirmMulligan() {
  const bk = gameState.beotkkot;
  if (bk.phaseInTurn !== "MULLIGAN") return;

  const player = bk.players[bk.mulliganPlayerIndex];
  const selectedCount = bk.mulliganSelected.length;

  // 선택된 인덱스를 큰 것부터 제거해야 앞쪽 인덱스가 안 밀림
  const sortedDesc = [...bk.mulliganSelected].sort((a, b) => b - a);
  const removed = [];
  sortedDesc.forEach((i) => {
    removed.push(player.hand.splice(i, 1)[0]);
  });
  // 5-1: "원하는 순서로 패산 아래에 놓는다" - 여기서는 선택한 순서 그대로
  removed.reverse().forEach((ref) => player.pile.push(ref));

  drawCardsFor(player, selectedCount);

  // 다음 차례로: 활성 플레이어가 먼저 멀리건했다면 비활성 플레이어 차례로,
  // 비활성 플레이어까지 끝났다면 멀리건 종료 -> 실제 턴 시작(4-1-6, 4-1-7)
  if (bk.mulliganPlayerIndex === bk.activePlayerIndex) {
    bk.mulliganPlayerIndex = 1 - bk.activePlayerIndex;
    bk.mulliganSelected = [];
  } else {
    finishMulligan();
    return;
  }
  render();
}

// 4-1-6, 4-1-7: 집중력 설정하고 1번째 턴 시작
function finishMulligan() {
  const bk = gameState.beotkkot;
  const active = bk.players[bk.activePlayerIndex];
  const inactive = bk.players[1 - bk.activePlayerIndex];

  active.focus = 0;
  inactive.focus = 1;

  bk.phaseInTurn = "PLAY";
  bk.turnNumber = 1;
  bk.mulliganSelected = [];

  // 로컬(패스앤플레이) 환경이므로, 턴이 시작되는 순간 화면 관점도
  // 지금 턴을 잡은 활성 플레이어 쪽으로 맞춰준다.
  localViewIndex = bk.activePlayerIndex;

  render();
}

// ─────────────────────────────────────────
// 5-1-2 / 9-6 집중력 소모
// (아직 기본동작 종류 선택 UI는 없어서, "집중력을 자원으로 쓴다"는
//  느낌만 먼저 동작하게 만든 단순화 버전. 실제로는 기본동작 종류마다
//  결과가 다름 - 9-6-1~9-6-5)
// ─────────────────────────────────────────
function spendFocus(playerIndex) {
  const bk = gameState.beotkkot;
  if (bk.phaseInTurn !== "PLAY") return;
  if (bk.activePlayerIndex !== playerIndex) return; // 내 턴 아니면 무시

  const player = bk.players[playerIndex];
  if (player.focus <= 0) return;
  player.focus -= 1;
  render();
}

// ─────────────────────────────────────────
// 8-3 종료 페이즈 + 다음 턴 8-1 개시 페이즈
// (손패 상한 초과 시 원래는 플레이어가 직접 뭘 덮음패로 보낼지 고르지만,
//  아직 그 선택 UI가 없어서 일단 손패 뒤쪽 카드부터 자동으로 덮음패로 보낸다 - TODO)
// ─────────────────────────────────────────
function endBeotkkotTurn() {
  const bk = gameState.beotkkot;
  if (bk.phaseInTurn !== "PLAY") return;

  const activePlayer = bk.players[bk.activePlayerIndex];

  // 8-3-2 종료 페이즈 기정 처리 (단순화: 손패 상한 초과분 자동으로 덮음패行)
  while (activePlayer.hand.length > activePlayer.handLimit) {
    activePlayer.facedown.push(activePlayer.hand.pop());
  }

  // 턴 교대
  bk.activePlayerIndex = 1 - bk.activePlayerIndex;
  bk.turnNumber += 1;

  // 로컬(패스앤플레이) 환경이므로, 턴이 넘어가면 화면 관점도
  // 새로 턴을 잡은 플레이어 쪽으로 자동 전환한다.
  localViewIndex = bk.activePlayerIndex;

  const newActive = bk.players[bk.activePlayerIndex];

  // 8-1-3: 제1턴(선공 첫턴)과 제2턴(후공 첫턴)에는 개시 페이즈 기정 처리를 건너뜀
  if (bk.turnNumber > 2) {
    // i: 집중력 1 얻음 (상한 있음)
    newActive.focus = Math.min(newActive.focus + 1, newActive.focusLimit);
    // ii: 부여패 벚꽃결정 소모 - 부여패 시스템 아직 없어서 생략 (TODO)
    // iii: 패산 재구성 - 아직 선택 UI 없어서 생략 (TODO)
    // iv: 카드 2장 뽑기
    drawCardsFor(newActive, 2);
  }

  render();
}
