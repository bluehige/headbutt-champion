// 브라우저 자동 시험 도우미. 게임 페이지 콘솔에서:
//   await import('/tools/browser-drive.js');  __drive.frames(60);  __drive.until(() => __match.done, __drive.bots.perfect())
// 실제 키보드 이벤트를 window에 보내고, __test.tick()으로 프레임을 직접 돌린다(탭이 가려져 rAF가 멈춰도 동작).
const send = (type, code) => window.dispatchEvent(new KeyboardEvent(type, { code, key: code }));
const T = window.__test;
T.hold = true;
let ups = [];
const holding = {};
const tap = (code, frames = 3) => {
  if (holding[code]) return;
  send('keydown', code);
  holding[code] = true;
  ups.push([code, frames]);
};
const hold = (code, on) => {
  if (!!holding[code] === on) return;
  holding[code] = on;
  send(on ? 'keydown' : 'keyup', code);
};
function step(bot) {
  ups = ups.filter((u) => {
    if (u[1] <= 0) {
      holding[u[0]] = false;
      send('keyup', u[0]);
      return false;
    }
    u[1]--;
    return true;
  });
  if (bot) bot();
  T.tick(1 / 60);
}

const bots = {
  idle: () => () => {},
  // 예고를 읽고 정답 입력 → 빈틈에 박치기(opts.skill이 있으면 빈틈에 그 기술 키)
  perfect: (opts = {}) => {
    let answered = null;
    return () => {
      const m = window.__match;
      if (!m || m.phase !== 'fight') return;
      const o = m.opp;
      const p = m.player;
      const reach = m.R.headbutt.reach;
      let right = false;
      const id = m.stats.telegraphs.high + m.stats.telegraphs.low + m.stats.telegraphs.grab;
      if (o.state === 'telegraph') {
        const tg = o.attack.telegraph;
        if (tg === 'grab') {
          if (m.dist > reach - 5) right = true;
          else if (o.t > 0.25 && p.state === 'idle') tap('Space');
        } else if (o.dur - o.t <= 0.3 && answered !== id) {
          answered = id;
          tap(tg === 'high' ? 'ArrowDown' : 'ShiftLeft');
        }
      } else if (o.state === 'stun') {
        if (m.dist > reach - 5) right = true;
        else if (opts.skill && (p.state === 'idle' || p.evaded) && m.hasSkill(opts.skillId) && p.gauge >= m.skills[opts.skillId].cost) tap(opts.skill);
        else if (p.state === 'idle' || p.evaded) tap('Space');
      } else if (m.dist > reach - 5) right = true;
      hold('ArrowRight', right);
    };
  },
};

window.__drive = {
  step,
  tap,
  hold,
  bots,
  frames(n, bot) {
    for (let i = 0; i < n; i++) step(bot);
    return T.scene;
  },
  until(cond, bot, max = 6000) {
    let i = 0;
    while (i < max && !cond()) {
      step(bot);
      i++;
    }
    return { frames: i, ok: !!cond() };
  },
  stat() {
    const m = window.__match;
    if (!m) return { scene: T.scene };
    const s = m.stats;
    return {
      scene: T.scene, phase: m.phase, result: m.result, time: +m.timeLeft.toFixed(1), lv: m.level,
      hp: [m.player.hp, m.player.maxHp, m.opp.hp, m.opp.maxHp], gauge: m.player.gauge,
      tele: s.telegraphs, ev: s.evades, hit: s.hitsTaken, counters: s.counters, hits: s.headbuttHits,
      blocks: s.blocks, skills: s.skillsUsed, iron: s.ironBlocks,
    };
  },
};
