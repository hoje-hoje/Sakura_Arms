// ============================================
// 페이즈 진행 로직
// 쌍장요란 -> 안전구축 -> 벚꽃결투
// ============================================

function toggleGoddessSelection(playerIndex, goddessId) {
  const player = gameState.players[playerIndex];
  const goddess = GODDESSES.find((g) => g.id === goddessId);
  if (!goddess) return;

  const already = player.goddesses.find((g) => g.id === goddessId);
  if (already) {
    player.goddesses = player.goddesses.filter((g) => g.id !== goddessId);
  } else if (player.goddesses.length < 2) {
    player.goddesses.push(goddess);
  }
  render();
}

function advanceSsangjangYoran() {
  const activePlayer = gameState.players[ssangjangUI.activePlayerIndex];
  if (activePlayer.goddesses.length < 2) return;

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
    // 4-1: 벚꽃결투 준비 절차 실행 (패산/비장패 배치, 활성 플레이어 결정 등)
    setupBeotkkotGyeoltu();
    render();
  }
}

function startBeotkkotGyeoltu() {
  logEvent("벚꽃결투 시작!");
  render();
}