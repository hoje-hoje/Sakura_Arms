// ============================================
// 페이즈 진행 로직
// 쌍장요란 -> 안전구축 -> 벚꽃결투
// 각 함수는 상태를 바꾸고 render()를 호출해 화면을 갱신합니다.
// ============================================

// 1. 쌍장요란: 여신 2개 선택
function selectGoddess(playerIndex, goddessId) {
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

function confirmSsangjangYoran() {
  const allReady = gameState.players.every((p) => p.goddesses.length === 2);
  if (!allReady) {
    alert("두 여신을 모두 선택해야 합니다.");
    return;
  }
  gameState.phase = PHASE.ANJEON_GUCHUK;
  render();
}

// 2. 안전구축: 통상패 7장, 비장패 3장 선택
// TODO: 선택한 두 여신의 카드 풀에서 통상패7/비장패3 고르는 UI/로직
function confirmAnjeonGuchuk() {
  // 임시: 카드 선택 검증 없이 다음 단계로 (실제 로직은 추후 구현)
  gameState.phase = PHASE.BEOTKKOT_GYEOLTU;
  render();
}

// 3. 벚꽃결투: 실제 대결
// TODO: 액션 포인트 지급, 핸드 관리, 지역 영향력 확장, 다이렉트 공격 로직
function startBeotkkotGyeoltu() {
  logEvent("벚꽃결투 시작!");
  render();
}
