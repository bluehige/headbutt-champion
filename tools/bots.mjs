// 시험용 봇(node 시뮬레이션과 브라우저 자동 시험이 같이 쓴다).
// bot(m) → 그 스텝의 입력 객체({ left, right, duckPressed, backPressed, hbPressed, hbHeld, slot1..3 })
// m.threat()로 "지금 다가오는 위협"을 읽는다. 렌더링·DOM과 무관하다.

// 읽는 봇.
// opts.err      위협마다 틀린 답을 낼 확률(0 = 정답 봇)
// opts.react    [lo, hi] 맞기 몇 초 전에 누를지(기본 [0.25, 0.25])
// opts.naive    속임·예고를 끝까지 안 보고 처음 표시에 곧바로 반응할 확률
// opts.skills   { double, iron, kyuljae, ranged } 쓸 기술(레벨이 되어도 false면 안 씀)
// opts.rng      난수(재현용)
export function readerBot(opts = {}) {
  const rng = opts.rng || Math.random;
  const react = opts.react || [0.25, 0.25];
  const use = { double: true, iron: false, kyuljae: true, ranged: true, ...(opts.skills || {}) };
  const plans = new Map();
  let charging = false; // 결재 박치기를 노리고 스페이스를 누르고 있는 중
  let lastKey = null;

  const planFor = (th, m) => {
    let pl = plans.get(th.key);
    if (!pl) {
      pl = {
        at: react[0] + rng() * (react[1] - react[0]),
        wrong: rng() < (opts.err || 0),
        naive: rng() < (opts.naive || 0),
        rt: 0.2 + rng() * 0.12, // 처음 표시를 보고 반응하는 시간(순진하게 반응할 때)
        done: false,
        start: m.clock,
      };
      plans.set(th.key, pl);
      if (plans.size > 64) plans.delete(plans.keys().next().value);
    }
    return pl;
  };

  return (m) => {
    const inp = {};
    if (m.phase !== 'fight') return inp;
    const p = m.player;
    const o = m.opp;
    const R = m.R;
    const reach = R.headbutt.reach;
    const th = m.threat();
    const evadeOk =
      ((p.state === 'idle' || p.state === 'charge') && p.evadeCd <= 0) ||
      ((p.state === 'duck' || p.state === 'backstep') && p.evaded);
    const want = (k) => use[k] && m.hasSkill(k);
    const gaugeFor = (k) => p.gauge >= m.skills[k].cost;

    // 1) 위협에 답하기
    if (th) {
      const pl = planFor(th, m);
      // 차지가 다 됐고 닿는 거리면, 상대 예고(힘준 상태)를 결재 박치기로 부순다
      if (charging && p.state === 'charge' && p.holdTime >= m.skills.kyuljae.chargeTime && m.dist <= reach - 10 && th.src === 'tele' && th.eta > 0.2 && !pl.wrong) {
        charging = false;
        return inp; // hbHeld를 떼면 결재 박치기
      }
      if (th.key !== lastKey) lastKey = th.key;
      if (th.tg === 'grab' && !pl.wrong) {
        // 잡기는 박치기로 먼저 끊는다
        if (charging) {
          charging = false; // 스페이스를 떼면 차지가 풀리거나 결재 박치기가 나간다
        } else if (m.dist > reach - 5) inp.right = true;
        else if (o.t > 0.18 && p.state === 'idle') inp.hbPressed = true;
        return inp;
      }
      const elapsed = m.clock - pl.start;
      const pressNow = pl.naive ? elapsed >= pl.rt : th.eta <= pl.at;
      if (pressNow && !pl.done) {
        if (evadeOk) {
          const right = th.tg === 'high' ? 'duckPressed' : th.tg === 'low' ? 'backPressed' : null;
          const wrongKey = th.tg === 'high' ? 'backPressed' : 'duckPressed';
          inp[pl.wrong ? wrongKey : right] = true;
          pl.done = true;
          charging = false;
        } else if (want('iron') && gaugeFor('iron') && p.state === 'idle' && th.eta < 0.3) {
          inp.slot2 = true;
          pl.done = true;
        }
      }
      if (th.eta < 0.6 || pl.done) {
        if (charging && p.state === 'charge') inp.hbHeld = true;
        return inp;
      }
    }

    if (opts.passive) {
      // 피하기만 하는 봇(규칙 시험용)
      if (m.dist > reach - 5) inp.right = true;
      return inp;
    }

    // 2) 빈틈에 반격
    const helmetOn = o.helmetHp > 0;
    if (o.state === 'stun') {
      // 멀리 있는데 원거리 박치기를 쓸 수 있으면 쏜다
      if (m.dist > reach + 60 && want('ranged') && gaugeFor('ranged') && p.state === 'idle') {
        inp.slot3 = true;
        return inp;
      }
      if (m.dist > reach - 5) {
        inp.right = true;
        return inp;
      }
      const evadedNow = (p.state === 'duck' || p.state === 'backstep' || p.state === 'headbutt') && p.evaded;
      if (p.state === 'idle' || evadedNow) {
        const needPierce = m.def.stunGuard;
        if (want('double') && gaugeFor('double') && (needPierce || p.gauge >= 70)) inp.slot1 = true;
        else if (!needPierce || !want('double')) inp.hbPressed = true;
      }
      return inp;
    }

    // 3) 결재 박치기로 가드 부수기
    if (want('kyuljae') && (o.state === 'idle' && (o.guard || charging))) {
      if (p.state === 'charge') {
        inp.hbHeld = true;
        const ready = p.holdTime >= m.skills.kyuljae.chargeTime;
        if (m.dist > reach - 25) inp.right = true;
        else if (ready) inp.hbHeld = false; // 떼면 결재 박치기
        if (!inp.hbHeld) charging = false;
        return inp;
      }
      if (p.state === 'idle' && !charging) {
        // 스페이스를 누르고 있으면 박지 않고 차지로 넘어간다
        inp.hbPressed = true;
        inp.hbHeld = true;
        charging = true;
        return inp;
      }
      if (charging) {
        inp.hbHeld = true;
        return inp;
      }
    } else if (charging) {
      if (p.state === 'charge') {
        // 가드가 풀렸으면 그냥 떼서(차지 완료 시) 넣는다
        if (p.holdTime >= m.skills.kyuljae.chargeTime && m.dist <= reach - 10) charging = false;
        else {
          inp.hbHeld = true;
          if (m.dist > reach - 25) inp.right = true;
        }
      } else if (p.state === 'headbutt' || p.state === 'recoil') inp.hbHeld = true;
      else charging = false;
      return inp;
    }

    // 4) 원거리 박치기: 헬멧이 있거나 멀리 있으면
    if (want('ranged') && gaugeFor('ranged') && p.state === 'idle' && (!th || th.eta > 0.75) && (helmetOn || m.dist > reach + 120)) {
      inp.slot3 = true;
      return inp;
    }

    // 5) 다가가기
    if (m.dist > reach - 5) inp.right = true;
    return inp;
  }
}

// 아무 때나 박치기만 누르는 봇(읽지 않음)
export function masherBot() {
  return (m) => {
    const inp = {};
    if (m.dist > m.R.headbutt.reach - 10) inp.right = true;
    if (m.player.state === 'idle') inp.hbPressed = true;
    return inp;
  };
}
