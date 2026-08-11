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

  // 벚꽃결투 화면 진입 전에는 null. setupBeotkkotGyeoltu()가 실제 값을 채움.
  // (render_beotkkot.js가 이 값을 읽어서 화면을 그리므로, 이게 비어있으면
  //  "Cannot read properties of undefined (reading 'players')" 에러가 남)
  beotkkot: null,
};

function logEvent(message) {
  gameState.log.push(message);
}

// ============================================
// 벚꽃결투 플레이어 상태 (통합 규칙 5-1, 7-1 대응)
// ============================================
function createBeotkkotPlayerState(name) {
  return {
    name,

    // 5-1-5~5-1-7: 벚꽃결정 수치
    life: 10,
    aura: 3,
    flare: 0,

    // 5-1-2, 5-1-3: 집중력 / 손패 상한
    focus: 0,
    focusLimit: 2,
    handLimit: 2,

    // 5-1-4: 위축 상태
    isWithered: false,

    // 7-1-6 <패산>: 뒷면, 순서 있는 묶음. index 0이 맨 위.
    pile: [],

    // 7-1-7 <버림패>
    discard: [],

    // 7-1-8 <덮음패>
    facedown: [],

    // 7-1-9 <부여패>: [{ card: {goddessId,cardId}, sakuraCount: number }]
    bond: [],

    // 7-1-10 <손패>
    hand: [],

    // 7-1-11 <비장패>: 안전구축에서 고른 3장 고정.
    // [{ card: {goddessId,cardId}, used: boolean }]
    special: [],

    // 7-1-12 <추가패>
    extra: [],

    // 여신별 특수 상태(추가판에 표시). 여신 id를 key로.
    goddessState: {},

    // 선택한 여신 (쌍장요란에서 확정된 것을 그대로 참조)
    goddesses: [],
  };
}

// Fisher-Yates 셔플 (제자리 변경 + 반환)
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 카드를 count장 뽑아 손패로 이동. 패산이 비어있으면
// (원칙적으로는 5-5-3 초조가 발생해야 하지만, 재구성 시스템이 아직 없으므로
//  여기서는 "더 못 뽑음"으로 단순 처리하고 TODO로 남겨둠)
function drawCardsFor(beotkkotPlayer, count) {
  for (let i = 0; i < count; i++) {
    if (beotkkotPlayer.pile.length === 0) break; // TODO: 5-5-3 초조 처리
    beotkkotPlayer.hand.push(beotkkotPlayer.pile.shift());
  }
}

// ============================================
// 벚꽃결투 준비 (통합 규칙 4-1)
// 안전구축까지 끝난 gameState.players 정보를 바탕으로
// gameState.beotkkot을 실제로 만들어 채운다.
// 이 함수를 호출하지 않으면 gameState.beotkkot이 계속 null로 남는다.
//
// 4-1-1~4-1-4까지(벚꽃결정 배치, 덱 배치, 활성 플레이어 결정, 손패 3장 드로우)를
// 여기서 처리하고, 4-1-5(멀리건)는 사용자 조작이 필요하므로
// gameState.beotkkot.phaseInTurn = "MULLIGAN" 상태로 넘겨서 UI가 처리하게 한다.
// 멀리건이 끝나면(beotkkotTurns.js의 finishMulligan()) 4-1-6, 4-1-7이 이어서 실행된다.
// ============================================
function setupBeotkkotGyeoltu() {
  gameState.beotkkot = {
    activePlayerIndex: 0,
    turnNumber: 0, // 멀리건 끝나고 나서 1이 됨 (4-1-7)
    phaseInTurn: "MULLIGAN",
    mulliganPlayerIndex: 0,   // 지금 멀리건 차례인 플레이어
    mulliganSelected: [],     // 그 플레이어가 바꾸기로 고른 손패 인덱스들

    // 4-1-1: <간격>에 10개
    interval: 10,
    masterInterval: 2,

    // 4-1-1: <더스트>는 별도 언급 없지만 시작은 0
    dust: 0,

    players: [
      createBeotkkotPlayerState(gameState.players[0].name),
      createBeotkkotPlayerState(gameState.players[1].name),
    ],
  };

  // 4-1-3: 활성 플레이어 무작위 선택
  gameState.beotkkot.activePlayerIndex = Math.floor(Math.random() * 2);
  gameState.beotkkot.mulliganPlayerIndex = gameState.beotkkot.activePlayerIndex; // 활성부터 멀리건

  gameState.players.forEach((prepPlayer, i) => {
    const bp = gameState.beotkkot.players[i];
    bp.goddesses = prepPlayer.goddesses;

    // 4-1-2: 통상패 7장은 패산, 비장패 3장은 비장패 영역(미사용)으로
    bp.pile = prepPlayer.normalDeck.map((c) => ({ goddessId: c.goddess, cardId: c.id }));
    bp.special = prepPlayer.specialDeck.map((c) => ({
      card: { goddessId: c.goddess, cardId: c.id },
      used: false,
    }));

    // 4-1-4: 패산을 잘 섞고 3장 뽑는다
    shuffleArray(bp.pile);
    drawCardsFor(bp, 3);
  });

  gameState.phase = PHASE.BEOTKKOT_GYEOLTU;
}

// ============================================
// 쌍장요란 화면 전용 UI 상태
// (게임 규칙이 아니라 "지금 화면에서 뭐가 포커스됐는지" 같은 화면 진행 상태)
// ============================================
// ============================================
// 안전구축 화면 전용 UI 상태
// ============================================
const anjeonUI = {
  activePlayerIndex: 0,
  selectedNormal: [],  // 고른 통상패 (최대 7)
  selectedSpecial: [], // 고른 비장패 (최대 3)
};

const ssangjangUI = {
  activePlayerIndex: 0, // 지금 고르는 중인 미코토 (0 = 미코토 1, 1 = 미코토 2)
  focusedIndex: 0,      // 방향키로 움직이는 카드 위치 (GODDESSES 배열 인덱스)
  introPlayed: false,   // "쌍장요란" 타이틀 중앙->좌상단 애니메이션을 한 번 재생했는지

  // 화면(카드 목록)을 손으로 드래그해서 스크롤하는 것 관련 상태
  isPanning: false,      // 지금 마우스 누른 채로 드래그 중인지
  dragMoved: false,      // 이번 드래그가 실제로 움직였는지 (클릭과 구분하기 위함)
  dragStartX: 0,         // 드래그 시작 시점의 마우스 x좌표
  dragStartOffset: 0,    // 드래그 시작 시점의 카드 목록 위치(translateX)
  lastOffset: 0,          // 카드 목록이 마지막으로 있던 위치 (다음 이동 애니메이션의 시작점)
};