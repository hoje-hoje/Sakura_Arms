// ============================================
// 여신 데이터
// 여신을 하나씩 추가할 때 이 파일에만 추가하면 됩니다.
// 아직 로직이 없는 여신은 normalCards/specialCards를 빈 배열로 두고
// 이름/이미지만 채워도 됩니다.
// ============================================

const GODDESSES = [
  // ============================================
  // 테스트용 임시 데이터입니다. 실제 여신 26명 데이터로 교체 예정입니다.
  // (지금은 선택 화면 동작 확인용으로 이름만 넣어둔 상태 - 이미지/카드 정보 없음)
  // ============================================
  { id: "test_01", name: "유리나", thumbEmoji: "🌸" },
  { id: "test_02", name: "사이네", thumbEmoji: "🌙" },
  { id: "test_03", name: "히미카", thumbEmoji: "🔥" },
  { id: "test_04", name: "토코요", thumbEmoji: "🌊" },
  { id: "test_05", name: "하츠미", thumbEmoji: "⚔️" },
  { id: "test_06", name: "미즈키", thumbEmoji: "💧" },
  { id: "test_07", name: "메구미", thumbEmoji: "🍃" },
  { id: "test_08", name: "오보로", thumbEmoji: "🌫️" },

  // 예시 형태 (실제 데이터로 교체 예정)
  // {
  //   id: "goddess_01",
  //   name: "여신 이름",
  //   image: "assets/goddesses/goddess_01.png",
  //   normalCards: [
  //     // { id, name, cost, effect, description }
  //   ],
  //   specialCards: [
  //     // 비장패
  //   ],
  // },
];
