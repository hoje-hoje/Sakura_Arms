// ============================================
// 페이즈 진행 로직
// 쌍장요란 -> 안전구축 -> 벚꽃결투
// 각 함수는 상태를 바꾸고 render()를 호출해 화면을 갱신합니다.
// ============================================

// 1. 쌍장요란: 여신 2개 선택 (미코토 1 -> 미코토 2 순서로 진행)
// ssangjangUI(진행 중인 미코토 번호, 포커스 위치 등 UI 상태)는 gameState.js에 정의되어 있음

function toggleGoddessSelection(playerIndex, goddessId) {
  const player = gameState.players[playerIndex];
  const goddess = GODDESSES.find((g) => g.id === goddessId);
  if (!goddess) return;

  const already = player.goddesses.find((g) => g.id === goddessId);
  if (already) {
    // 이미 선택됨 -> 선택 취소
    player.goddesses = player.goddesses.filter((g) => g.id !== goddessId);
  } else if (player.goddesses.length < 2) {
    player.goddesses.push(goddess);
  }
  render();
}

// "다음 ->" 버튼: 다음 미코토 차례로, 마지막 미코토면 안전구축으로
function advanceSsangjangYoran() {
  const activePlayer = gameState.players[ssangjangUI.activePlayerIndex];
  if (activePlayer.goddesses.length < 2) return; // 안전장치

  if (ssangjangUI.activePlayerIndex < gameState.players.length - 1) {
    ssangjangUI.activePlayerIndex++;
    ssangjangUI.focusedIndex = 0;
    render();
  } else {
    ssangjangBGM.pause();
    ssangjangBGM.currentTime = 0;
    anjeonUI.activePlayerIndex = 0;
    anjeonUI.selectedNormal = [];
    anjeonUI.selectedSpecial = [];
    gameState.phase = PHASE.ANJEON_GUCHUK;
    render();
  }
}

// 2. 안전구축: 통상패 7장, 비장패 3장 선택
// 카드 클릭 -> 선택/해제 (통상패 7장, 비장패 3장 넘으면 무시)
function toggleAnjeonCard(card) {
  const key = card.kind === "통상패" ? "selectedNormal" : "selectedSpecial";
  const max = card.kind === "통상패" ? 7 : 3;
  const list = anjeonUI[key];
  const idx = list.findIndex((c) => c.goddess === card.goddess && c.id === card.id);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else if (list.length < max) {
    list.push(card);
  }
  render();
}

// "구축 완료 ->" 버튼: 현재 미코토의 덱 확정 후 다음 미코토로, 마지막이면 벚꽃결투로
function confirmAnjeonGuchuk() {
  if (anjeonUI.selectedNormal.length !== 7 || anjeonUI.selectedSpecial.length !== 3) return;

  const player = gameState.players[anjeonUI.activePlayerIndex];
  player.normalDeck = anjeonUI.selectedNormal;
  player.specialDeck = anjeonUI.selectedSpecial;

  if (anjeonUI.activePlayerIndex < gameState.players.length - 1) {
    anjeonUI.activePlayerIndex++;
    anjeonUI.selectedNormal = [];
    anjeonUI.selectedSpecial = [];
    render();
  } else {
    gameState.phase = PHASE.BEOTKKOT_GYEOLTU;
    render();
  }
}

// 3. 벚꽃결투: 실제 대결
// TODO: 액션 포인트 지급, 핸드 관리, 지역 영향력 확장, 다이렉트 공격 로직
function startBeotkkotGyeoltu() {
  logEvent("벚꽃결투 시작!");
  render();
}
