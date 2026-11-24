// 키보드 + 터치 버튼 입력. 프레임마다 poll()로 경기용 입력 객체를 만든다.

const GAME_KEYS = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space', 'ShiftLeft', 'ShiftRight',
  'KeyQ', 'KeyW', 'KeyE', 'KeyL', 'Enter',
]);

// 터치 버튼 이름 → 가상 키 코드
const VIRTUAL = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  duck: 'ArrowDown',
  back: 'ShiftLeft',
  headbutt: 'Space',
  q: 'KeyQ',
  w: 'KeyW',
  e: 'KeyE',
};

export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.released = new Set();
    this.virtualDown = new Map(); // code → 누르고 있는 포인터 수

    window.addEventListener('keydown', (e) => {
      if (GAME_KEYS.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      if (!this.down.has(e.code)) this.pressed.add(e.code);
      this.down.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      if (GAME_KEYS.has(e.code)) e.preventDefault();
      this.down.delete(e.code);
      this.released.add(e.code);
    });
    window.addEventListener('blur', () => this.clear());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.clear();
    });
  }

  clear() {
    for (const c of this.down) this.released.add(c);
    this.down.clear();
    this.virtualDown.clear();
  }

  // 터치 버튼 요소에 연결
  bindButton(el, name) {
    const code = VIRTUAL[name];
    if (!code) return;
    const press = (e) => {
      e.preventDefault();
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* 무시 */
      }
      const n = (this.virtualDown.get(code) || 0) + 1;
      this.virtualDown.set(code, n);
      if (!this.down.has(code)) this.pressed.add(code);
      this.down.add(code);
      el.classList.add('on');
    };
    const release = (e) => {
      e.preventDefault();
      const n = Math.max(0, (this.virtualDown.get(code) || 0) - 1);
      this.virtualDown.set(code, n);
      if (n === 0) {
        this.down.delete(code);
        this.released.add(code);
      }
      el.classList.remove('on');
    };
    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isDown(code) {
    return this.down.has(code);
  }

  wasPressed(...codes) {
    return codes.some((c) => this.pressed.has(c));
  }

  // 경기 로직이 쓰는 형태로 변환
  gameInput() {
    const d = (c) => this.down.has(c);
    const p = (c) => this.pressed.has(c);
    return {
      left: d('ArrowLeft'),
      right: d('ArrowRight'),
      duckPressed: p('ArrowDown'),
      backPressed: p('ShiftLeft') || p('ShiftRight'),
      hbPressed: p('Space'),
      hbHeld: d('Space'),
      slot1: p('KeyQ'),
      slot2: p('KeyW'),
      slot3: p('KeyE'),
    };
  }

  // 프레임 끝에서 호출: 이번 프레임의 눌림·뗌 기록을 지운다
  endFrame() {
    this.pressed.clear();
    this.released.clear();
  }
}
