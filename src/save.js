// 진행 저장(localStorage). 도달한 경기 번호(1~7, 8 = 우승)와 레벨만 저장한다.
// 버전이 다르거나 읽기에 실패하면 저장이 없는 것으로 보고 처음부터 시작한다.
export const SAVE_VERSION = 1;
const KEY = 'bakchigi-champion.save';

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null; // 사생활 보호 모드 등
  }
}

export function loadSave() {
  try {
    const s = storage();
    const raw = s && s.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || d.v !== SAVE_VERSION) return null;
    const stage = Number(d.stage);
    const level = Number(d.level);
    if (!Number.isInteger(stage) || stage < 1 || stage > 8) return null;
    if (!Number.isInteger(level) || level < 1 || level > 5) return null;
    return { stage, level };
  } catch {
    return null;
  }
}

export function writeSave(stage, level) {
  try {
    const s = storage();
    if (s) s.setItem(KEY, JSON.stringify({ v: SAVE_VERSION, stage, level, at: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function clearSave() {
  try {
    const s = storage();
    if (s) s.removeItem(KEY);
  } catch {
    // 무시
  }
}
