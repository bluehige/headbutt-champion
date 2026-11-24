// 상대 패턴 실행기 (렌더링·DOM과 무관, node에서도 동작)
// 상대 데이터(opponents.json)의 pattern·attackInterval·guardChance를 읽어
// "지금 무엇을 할지"만 결정한다. 상태 전이와 판정은 game.js가 맡는다.

export class OpponentBrain {
  constructor(def, attackTypes, rng) {
    this.def = def;
    this.types = attackTypes;
    this.rng = rng;
    this.history = [];
    this.nextAttackIn = 1.0 + rng() * 0.6; // 경기 시작 직후 첫 공격까지
    this.guardTimer = 0;
    this.guarding = false;
  }

  // 상대가 중립 상태일 때 매 프레임 호출. dist = 상대 x - 아저씨 x (양수)
  // 반환: { move: -1(다가감) | 0 | 1(물러남), guard: bool, attack: 공격 id | null }
  think(dt, dist) {
    const d = this.def;
    this.nextAttackIn -= dt;

    this.guardTimer -= dt;
    if (this.guardTimer <= 0) {
      this.guardTimer = 0.45 + this.rng() * 0.45;
      this.guarding = dist < 340 && this.rng() < (d.guardChance ?? 0);
    }

    let attack = null;
    if (this.nextAttackIn <= 0) attack = this.pick(dist);

    let move = 0;
    const pref = d.preferredRange ?? 210;
    if (dist > pref + 20) move = -1;
    else if (dist < pref - 60) move = 1;
    return { move, guard: this.guarding && !attack, attack };
  }

  // 거리 안에 들어오는 공격 중에서 가중치로 고른다. maxRepeat>0이면 같은 공격 연속 횟수를 제한.
  pick(dist) {
    const pattern = this.def.pattern || {};
    let cands = Object.entries(pattern).filter(([id, w]) => w > 0 && this.types[id] && dist <= this.types[id].engageRange);
    const maxRep = this.def.maxRepeat || 0;
    if (maxRep > 0 && this.history.length >= maxRep) {
      const last = this.history.slice(-maxRep);
      if (last.every((id) => id === last[0])) {
        const filtered = cands.filter(([id]) => id !== last[0]);
        if (filtered.length) cands = filtered;
      }
    }
    if (!cands.length) return null;
    const total = cands.reduce((s, [, w]) => s + w, 0);
    let r = this.rng() * total;
    for (const [id, w] of cands) {
      r -= w;
      if (r <= 0) return id;
    }
    return cands[cands.length - 1][0];
  }

  // 예고를 시작한 순간. 다음 공격까지의 간격을 다시 잡는다(예고 시작 → 다음 예고 시작 기준).
  onAttackStarted(id) {
    this.history.push(id);
    if (this.history.length > 8) this.history.shift();
    const jitter = 0.85 + this.rng() * 0.3;
    this.nextAttackIn = (this.def.attackInterval ?? 2.8) * jitter;
    this.guarding = false;
  }

  // 공격·빈틈·경직이 끝나 중립으로 돌아온 순간. 숨 돌릴 최소 시간을 보장한다.
  onNeutral() {
    this.nextAttackIn = Math.max(this.nextAttackIn, 0.6 + this.rng() * 0.3);
    this.guardTimer = 0;
  }
}
