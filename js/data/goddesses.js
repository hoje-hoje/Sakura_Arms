// ============================================
// 여신 데이터
// 여신을 하나씩 추가할 때 이 파일에만 추가하면 됩니다.
// 아직 로직이 없는 여신은 normalCards/specialCards를 빈 배열로 두고
// 이름/이미지만 채워도 됩니다.
//
// 어나더 버전은 별도의 항목(별도 id)으로 등록합니다 - 쌍장요란에서
// 독립적으로 선택 가능해야 하기 때문입니다. baseId로 원본 여신과
// 같은 계열임을 표시해둡니다.
//
// versionGroup: cards.js의 카드 데이터(CARDS)에서 이 여신에게 해당하는
// 카드를 골라낼 때 쓰는 키입니다 ("O"=기본형, "A1"/"A2"/"AA1"=어나더).
// 기본형(baseId 없음)은 항상 "O"이므로 따로 안 적어도 됩니다.
// ============================================

const GODDESSES = [
  { id: "yurina", name: "유리나", image: "assets/goddesses/유리나.png" },
  { id: "yurina_another_1", name: "유리나 (어나더: 제1장)", baseId: "yurina", versionGroup: "A1", image: "assets/goddesses/유리나_어나더1_제1장.png" },
  { id: "yurina_another_2", name: "유리나 (어나더: 조정자)", baseId: "yurina", versionGroup: "A2", image: "assets/goddesses/유리나_어나더2_조정자.png" },

  { id: "saine", name: "사이네", image: "assets/goddesses/사이네.png" },
  { id: "saine_another_1", name: "사이네 (어나더: 제2장)", baseId: "saine", versionGroup: "A1", image: "assets/goddesses/사이네_어나더1_제2장.png" },
  { id: "saine_another_2", name: "사이네 (어나더: 허무신)", baseId: "saine", versionGroup: "A2", image: "assets/goddesses/사이네_어나더2_허무신.png" },

  { id: "himika", name: "히미카", image: "assets/goddesses/히미카.png" },
  { id: "himika_another", name: "히미카 (어나더: 원초)", baseId: "himika", versionGroup: "A1", image: "assets/goddesses/히미카_어나더_원초.png" },

  { id: "tokoyo", name: "토코요", image: "assets/goddesses/토코요.png" },
  { id: "tokoyo_another_1", name: "토코요 (어나더: 방랑예인)", baseId: "tokoyo", versionGroup: "A1", image: "assets/goddesses/토코요_어나더1_방랑예인.png" },
  { id: "tokoyo_another_2", name: "토코요 (어나더: 허무신)", baseId: "tokoyo", versionGroup: "A2", image: "assets/goddesses/토코요_어나더2_허무신.png" },

  { id: "oboro", name: "오보로", image: "assets/goddesses/오보로.png" },
  { id: "oboro_another_1", name: "오보로 (어나더: 소실)", baseId: "oboro", versionGroup: "A2", image: "assets/goddesses/오보로_어나더_소실.png" },
  { id: "oboro_another_2", name: "오보로 (어나더: 제3장)", baseId: "oboro", versionGroup: "A1", image: "assets/goddesses/오보로_어나더_제3장.png" },

  { id: "yukihi", name: "유키히", image: "assets/goddesses/유키히_접음.png", altImage: "assets/goddesses/유키히_펼침.png" },

  { id: "shinra", name: "신라", image: "assets/goddesses/신라.png" },
  { id: "shinra_another", name: "신라 (어나더: 교주)", baseId: "shinra", versionGroup: "A1", image: "assets/goddesses/신라_어나더_교주.png" },

  { id: "hagane", name: "하가네", image: "assets/goddesses/하가네.png" },
  { id: "hagane_another", name: "하가네 (어나더: 대장장이)", baseId: "hagane", versionGroup: "A1", image: "assets/goddesses/하가네_어나더_대장장이.png" },

  { id: "chikage", name: "치카게", image: "assets/goddesses/치카게.png" },
  { id: "chikage_another", name: "치카게 (어나더: 제4장)", baseId: "chikage", versionGroup: "A1", image: "assets/goddesses/치카게_어나더_제4장.png" },

  { id: "kururu", name: "쿠루루", image: "assets/goddesses/쿠루루.png" },
  { id: "kururu_another_1", name: "쿠루루 (어나더: 탐색자)", baseId: "kururu", versionGroup: "A1", image: "assets/goddesses/쿠루루_어나더1_탐색자.png" },
  { id: "kururu_another_2", name: "쿠루루 (어나더: 허무신)", baseId: "kururu", versionGroup: "A2", image: "assets/goddesses/쿠루루_어나더2_허무신.png" },

  { id: "taliya", name: "탈리야", image: "assets/goddesses/탈리야.png" },
  { id: "taliya_another", name: "탈리야 (어나더: 귀환)", baseId: "taliya", versionGroup: "A1", image: "assets/goddesses/탈리야_어나더_귀환.png" },

  { id: "laila", name: "라이라", image: "assets/goddesses/라이라.png" },
  { id: "laila_another", name: "라이라 (어나더: 기도사)", baseId: "laila", versionGroup: "A1", image: "assets/goddesses/라이라_어나더_기도사.png" },

  { id: "utsuro", name: "우츠로", image: "assets/goddesses/우츠로.png" },
  { id: "utsuro_another", name: "우츠로 (어나더: 종장)", baseId: "utsuro", versionGroup: "A1", image: "assets/goddesses/우츠로_어나더_종장.png" },

  { id: "honoka", name: "호노카", image: "assets/goddesses/호노카.png" },
  { id: "honoka_another", name: "호노카 (어나더: 오우카)", baseId: "honoka", versionGroup: "A1", image: "assets/goddesses/호노카_어나더_오우카.png" },

  { id: "kornu", name: "코르누", image: "assets/goddesses/코르누.png" },

  { id: "yatsuha", name: "야츠하", image: "assets/goddesses/야츠하.png" },
  { id: "yatsuha_another_1", name: "야츠하 (어나더: 자아)", baseId: "yatsuha", versionGroup: "AA1", image: "assets/goddesses/야츠하_어나더-어나더1_자아.png" },
  { id: "yatsuha_another_2", name: "야츠하 (어나더: 완전태)", baseId: "yatsuha", versionGroup: "A1", image: "assets/goddesses/야츠하_어나더1_완전태.png" },

  { id: "hatsumi", name: "하츠미", image: "assets/goddesses/하츠미.png" },
  { id: "hatsumi_another", name: "하츠미 (어나더: 허무신)", baseId: "hatsumi", versionGroup: "A1", image: "assets/goddesses/하츠미_어나더_허무신.png" },

  { id: "mizuki", name: "미즈키", image: "assets/goddesses/미즈키.png" },
  { id: "megumi", name: "메구미", image: "assets/goddesses/메구미.png" },
  { id: "kanae", name: "카나에", image: "assets/goddesses/카나에.png" },
  { id: "kamui", name: "카무이", image: "assets/goddesses/카무이.png" },

  { id: "renri", name: "렌리", image: "assets/goddesses/렌리.png" },
  { id: "renri_another", name: "렌리 (어나더: 역사가)", baseId: "renri", versionGroup: "A1", image: "assets/goddesses/렌리_어나더_역사가.png" },

  { id: "akina", name: "아키나", image: "assets/goddesses/아키나.png" },
  { id: "shisui", name: "시스이", image: "assets/goddesses/시스이.png" },
  { id: "misora", name: "미소라", image: "assets/goddesses/미소라.png" },

  // 이니르는 아직 이미지가 없어서 이모지로 임시 표시 (이미지 생기면 image 필드 추가)
  // 이니르는 통상패/비장패 대신 운명패 체계를 쓰는 특수 케이스라 안전구축 로직이 다르게 필요함 (추후 별도 작업)
  { id: "inir", name: "이니르", thumbEmoji: "🌸" },
];