// 색·글꼴 (기획서 7장). 웹폰트가 안 불러와져도 시스템 한글 글꼴로 대체된다.
export const COLORS = {
  red: '#D62B1F', // 현수막 빨강
  gold: '#F2B632', // 금색
  navy: '#14213D', // 중계 남색
  paper: '#F7F3E8', // 종이 흰색
  ink: '#1B1B1B', // 먹색
  blue: '#2F6FE0',
};

const KR_FALLBACK = '"Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", "Noto Sans KR", "Nanum Gothic", sans-serif';
export const FONT_TITLE = `"Black Han Sans", ${KR_FALLBACK}`;
export const FONT_BODY = `"Pretendard", ${KR_FALLBACK}`;

export function bodyFont(size, weight = 700) {
  return `${weight} ${size}px ${FONT_BODY}`;
}
export function titleFont(size) {
  return `${size}px ${FONT_TITLE}`;
}
