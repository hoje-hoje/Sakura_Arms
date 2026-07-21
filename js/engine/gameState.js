// ============================================
// 게임 상태 (State)
// 현재는 로컬(hot-seat) 모드 기준: 한 화면에서 두 플레이어가 번갈아 조작.
// 나중에 실시간 동기화(Firebase 등)를 붙일 때도
// 이 state 객체 구조를 그대로 주고받으면 됩니다.
// ============================================

const PHASE = {
  HOME: "HOME",                 // 방 생성/선택 화면
  SSANGJANG_YORAN: "SSANGJANG_YORAN", // 1. 쌍장요란 - 여신 2개 선택
  ANJEON_GUCHUK: "ANJEON_GUCHUK",     // 2. 안전구축 - 통상패7 비장패3 선택
  BEOTKKOT_GYEOLTU: "BEOTKKOT_GYEOLTU", // 3. 벚꽃결투 - 실제 대결
};

function createInitialPlayer(name) {
  return {
    name,
    goddesses: [],       // 선택한 여신 2개
    normalDeck: [],       // 선택한 통상패 7장
    specialDeck: [],       // 선택한 비장패 3장
    hand: [],
    actionPoints: 0,
    // 지역 영향력/확장 관련 상태는 게임판 규칙 확정되면 여기에 추가
  };
}

const gameState = {
  phase: PHASE.HOME,
  currentPlayerIndex: 0,
  players: [createInitialPlayer("플레이어 1"), createInitialPlayer("플레이어 2")],
  board: {
    // 지역 영향력/확장 등 게임판 상태. 규칙 확정 후 채울 예정.
  },
  log: [],
};

function logEvent(message) {
  gameState.log.push(message);
}
