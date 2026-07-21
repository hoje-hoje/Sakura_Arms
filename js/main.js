// ============================================
// 진입점: 페이지 로드 시 첫 화면을 그립니다.
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  render();
});

// ============================================
// 쌍장요란 화면 전용 전역 이벤트
// (render()가 화면을 통째로 다시 그리기 때문에, 리스너를 render() 안에서
//  매번 새로 붙이면 계속 쌓여서 중복 실행됨 -> 여기서 딱 한 번만 등록하고
//  실제 처리 함수 안에서 "지금 이 화면일 때만 동작"하도록 분기함)
// ============================================
document.addEventListener("keydown", (e) => {
  if (gameState.phase === PHASE.SSANGJANG_YORAN) {
    handleSsangjangKeydown(e);
  }
});

document.addEventListener("mouseup", () => {
  ssangjangUI.isDragging = false;
});
