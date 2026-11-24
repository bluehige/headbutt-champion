# 박치기 챔피언 M2 배경·UI·효과 이미지

TASK `0091-headbutt-m2-misc`에서 내장 이미지 생성 도구에 전달한 영문 프롬프트다.

## 파일별 검수

| 파일 | 판정 | 재생성 | 확인한 내용 |
| --- | --- | ---: | --- |
| `assets/bg/national_hall.jpg` | 통과 | 0회 | 밝은 캔버스 링, 뒤쪽 로프, 좌우 관중석과 빈 현수막 |
| `assets/bg/world_arena.jpg` | 통과 | 0회 | 빈 대형 전광판, 객석의 휴대폰 불빛, 스포트라이트와 광택 바닥 |
| `assets/bg/champ_dome.jpg` | 통과 | 1회 | 빈 중앙, 좌우 불꽃과 금색 색종이, 금색 테두리의 검은 링 |
| `assets/ui/skill_basic.png` | 통과 | 0회 | 정면 이마와 충격 별 하나 |
| `assets/ui/skill_double.png` | 통과 | 0회 | 두 이마가 겹치고 뒤쪽이 잔상처럼 흐림 |
| `assets/ui/skill_iron.png` | 통과 | 0회 | 금속광 이마와 금빛 광배 |
| `assets/ui/skill_charge.png` | 통과 | 0회 | 글자 없는 둥근 붉은 인장과 모이는 빛 |
| `assets/ui/skill_ranged.png` | 통과 | 0회 | 옆으로 내민 이마와 오른쪽으로 나가는 금빛 충격파 |
| `assets/ui/title_key.jpg` | 통과 | 1회 | 왼쪽의 주인공과 돔 조명, 오른쪽의 어두운 제목·버튼 공간 |
| `assets/fx/forehead_wave.png` | 통과 | 0회 | 선명한 오른쪽 선두와 왼쪽으로 흩어지는 반투명 꼬리 |

최종 파일 10장을 직접 열어 구도, 그림체 및 글자·로고 여부를 확인했다. 아이콘 5장은 밝고 어두운 바탕에서 64px로 축소해 구별되는지 확인했다. 스크립트로 JPEG 4장 1920 × 1080, 아이콘 PNG 5장 512 × 512, 효과 PNG 1장 1024 × 512와 PNG 네 모서리의 알파 0을 확인했다.

아이콘은 원형 테두리 바깥에 투명 여백을 뒀다. 충격파 선두는 게임에서 그리는 위치에 맞춰 캔버스 너비의 85%에 뒀다. 로컬 서버의 파일 목록과 이미지 응답, 정적 이미지 목록에서 10장 모두 확인했다.

## 전국대회 배경

`assets/bg/national_hall.jpg`

```text
Paint a side-on arena background for the national tournament of a Korean comedy fighting game. Show a special ring set inside a regional civic auditorium. Use a light, matte canvas ring floor, rear ring ropes, folding bleachers with softly painted spectators at the rear left and right, a few overhead theater lights, and a plain blank cloth banner hung high. The hall is markedly larger than the neighborhood gym but retains a modest civic-hall feel.

Match the reference’s side-on camera, with a far ring edge running level at about 55% of the image height. Show one unbroken, flat fighting surface edge to edge across the lower 45%, with both fighter positions and the center entirely vacant. Place ropes and soft-focus spectators behind the far edge, toward the sides. Use visible semi-realistic brushwork, believable materials and slightly muted colors so the fighters will stand out. Leave all signage completely blank. No text, logos or watermarks. Widescreen 16:9, 1920 × 1080.

Input images:
1. assets/bg/dong_gym.jpg — Match the side-on camera, mat depth, clear center, and environment paint style.
2. assets/char/ajeossi/idle.png — Semi-realistic brushwork reference.
3. assets/char/gwak/telegraph_high.png — Sports broadcast lighting reference.
4. assets/char/gwak/stun.png — Painterly finish reference.
```

## 세계대회 배경

`assets/bg/world_arena.jpg`

```text
Paint a side-on arena background for the world tournament of a Korean comedy fighting game. Set it in a vast international indoor sports arena with steep, dark seating tiers that recede to both sides. Many softly painted audience silhouettes and pinpoints of phone light fill the rear stands. Strong sports spotlights illuminate the upper arena and catch on a glossy, dark ring mat. Hang a large, entirely blank scoreboard high above the ring.

Match the reference’s side-on camera, with a far ring edge running level at about 55% of the image height. Show one unbroken, flat fighting surface edge to edge across the lower 45%, with both fighter positions and the center entirely vacant. Place ropes and soft-focus spectators behind the far edge, toward the sides. Use visible semi-realistic brushwork, believable materials and slightly muted colors so the fighters will stand out. Leave all signage completely blank. No text, logos or watermarks. Widescreen 16:9, 1920 × 1080.

Input images:
1. assets/bg/dong_gym.jpg — Match the side-on camera, mat depth, clear center, and environment paint style.
2. assets/char/ajeossi/idle.png — Semi-realistic brushwork reference.
3. assets/char/gwak/telegraph_high.png — Sports broadcast lighting reference.
4. assets/char/gwak/stun.png — Painterly finish reference.
```

## 챔피언십 배경

`assets/bg/champ_dome.jpg`

```text
Paint the championship final arena for a Korean comedy fighting game, a colossal indoor dome with vaulting rows of stands and an extravagant stage. Use deep red and gold overhead lighting, stage haze, two tall flame columns well behind the ring at the far sides, and falling gold confetti in the upper arena. The open black ring mat has a thin gold perimeter. Show the gold trim on the mat itself and keep the floor completely clear of foreground ropes, fire, confetti and people.

Match the reference’s side-on camera, with a far ring edge running level at about 55% of the image height. Show one unbroken, flat fighting surface edge to edge across the lower 45%, with both fighter positions and the center entirely vacant. Place ropes and soft-focus spectators behind the far edge, toward the sides. Use visible semi-realistic brushwork, believable materials and slightly muted colors so the fighters will stand out. Leave all signage completely blank. No text, logos or watermarks. Widescreen 16:9, 1920 × 1080.

Input images:
1. assets/bg/dong_gym.jpg — Match the side-on camera, mat depth, clear center, and environment paint style.
2. assets/char/ajeossi/idle.png — Semi-realistic brushwork reference.
3. assets/char/gwak/telegraph_high.png — Sports broadcast lighting reference.
4. assets/char/gwak/stun.png — Painterly finish reference.
```

## 기본 박치기 아이콘

`assets/ui/skill_basic.png`

```text
Paint one bold, centered circular skill emblem for a Korean comedy fighting game. Use the same fictional office worker’s receding hairline, very broad glossy forehead and burgundy striped necktie tied along the upper hairline. Show only his head close up in a substantial dark round rim. Match the references’ semi-realistic comic brushwork and hard sports lighting, with clean, large shapes that read at 64 px.

Show his forehead thrust straight toward the viewer. The forehead is the largest shape. Show his serious brow beneath it and exactly one distinct impact star beside the forehead.

One centered badge on a 512 × 512 square canvas. Keep the circular silhouette clear, with true transparent space around the entire badge and at all four corners. No text, lettering, numerals, logos or watermarks.

Input images:
1. assets/char/ajeossi/idle.png — Exact character identity, forehead, striped necktie headband, and painting style.
2. assets/char/gwak/telegraph_high.png — Sports broadcast lighting and brushwork reference.
3. assets/char/gwak/stun.png — Expressive semi-realistic comic rendering reference.
4. assets/bg/dong_gym.jpg — Painted material texture reference.
```

## 이환이형 박치기 아이콘

`assets/ui/skill_double.png`

```text
Paint one circular skill emblem in the same set as the basic headbutt icon. Match its dark circular rim, painted proportions, compact silhouette and highlight treatment. Use the fictional office worker’s very broad, shiny forehead, receding hairline and burgundy striped necktie at the upper hairline. Match the references’ semi-realistic comic brushwork and use bold, simple shapes that read at 64 px.

Show exactly two offset, overlapping images of the same broad glossy forehead and striped headband. The front forehead is sharp and opaque. The rear forehead is a lighter afterimage visibly offset toward the upper left. Make the two forehead silhouettes read as two successive hits.

One centered badge on a 512 × 512 square canvas. Keep the circular silhouette clear, with true transparent space around the entire badge and at all four corners. No text, lettering, numerals, logos or watermarks.

Input images:
1. assets/char/ajeossi/idle.png — Exact character identity, forehead, striped necktie headband, and painting style.
2. assets/char/gwak/telegraph_high.png — Sports broadcast lighting and brushwork reference.
3. assets/char/gwak/stun.png — Expressive semi-realistic comic rendering reference.
4. assets/bg/dong_gym.jpg — Painted material texture reference.
5. assets/ui/skill_basic.png — Match this badge’s circular rim, cutout, brushwork, and level of detail for the set.
```

## 금강불괴 이마 아이콘

`assets/ui/skill_iron.png`

```text
Paint one circular skill emblem in the same set as the basic headbutt icon. Match its dark circular rim, painted proportions, compact silhouette and highlight treatment. Use the fictional office worker’s very broad, shiny forehead, receding hairline and burgundy striped necktie at the upper hairline. Match the references’ semi-realistic comic brushwork and use bold, simple shapes that read at 64 px.

Make the broad forehead shine like polished gold metal, with a solid gold bulbous surface and a bright specular highlight. Keep the burgundy striped tie readable and place a single Buddha-statue aureole behind the head.

One centered badge on a 512 × 512 square canvas. Keep the circular silhouette clear, with true transparent space around the entire badge and at all four corners. No text, lettering, numerals, logos or watermarks.

Input images:
1. assets/char/ajeossi/idle.png — Exact character identity, forehead, striped necktie headband, and painting style.
2. assets/char/gwak/telegraph_high.png — Sports broadcast lighting and brushwork reference.
3. assets/char/gwak/stun.png — Expressive semi-realistic comic rendering reference.
4. assets/bg/dong_gym.jpg — Painted material texture reference.
5. assets/ui/skill_basic.png — Match this badge’s circular rim, cutout, brushwork, and level of detail for the set.
```

## 결재 박치기 아이콘

`assets/ui/skill_charge.png`

```text
Paint one circular skill emblem in the same set as the basic headbutt icon. Match its dark circular rim, painted proportions, compact silhouette and highlight treatment. Use the fictional office worker’s very broad, shiny forehead, receding hairline and burgundy striped necktie at the upper hairline. Match the references’ semi-realistic comic brushwork and use bold, simple shapes that read at 64 px.

Stamp the center of his exposed forehead with a simple round red ink seal made of a ring and a plain geometric motif. It contains no writing or glyphs. Gather a compact warm-red energy glow around the forehead to show the charge building.

One centered badge on a 512 × 512 square canvas. Keep the circular silhouette clear, with true transparent space around the entire badge and at all four corners. No text, lettering, numerals, logos or watermarks.

Input images:
1. assets/char/ajeossi/idle.png — Exact character identity, forehead, striped necktie headband, and painting style.
2. assets/char/gwak/telegraph_high.png — Sports broadcast lighting and brushwork reference.
3. assets/char/gwak/stun.png — Expressive semi-realistic comic rendering reference.
4. assets/bg/dong_gym.jpg — Painted material texture reference.
5. assets/ui/skill_basic.png — Match this badge’s circular rim, cutout, brushwork, and level of detail for the set.
```

## 원거리 박치기 아이콘

`assets/ui/skill_ranged.png`

```text
Paint one circular skill emblem in the same set as the basic headbutt icon. Match its dark circular rim, painted proportions, compact silhouette and highlight treatment. Use the fictional office worker’s very broad, shiny forehead, receding hairline and burgundy striped necktie at the upper hairline. Match the references’ semi-realistic comic brushwork and use bold, simple shapes that read at 64 px.

Show the head on the left in a close right-facing view, with the brow low and forehead leading. Launch a distinct, bright white-gold forehead-shaped wave from it toward screen right. Leave a clean gap between the physical forehead and the projected curve. Keep the emblem easy to read at small size.

One centered badge on a 512 × 512 square canvas. Keep the circular silhouette clear, with true transparent space around the entire badge and at all four corners. No text, lettering, numerals, logos or watermarks.

Input images:
1. assets/char/ajeossi/idle.png — Exact character identity, forehead, striped necktie headband, and painting style.
2. assets/char/gwak/telegraph_high.png — Sports broadcast lighting and brushwork reference.
3. assets/char/gwak/stun.png — Expressive semi-realistic comic rendering reference.
4. assets/bg/dong_gym.jpg — Painted material texture reference.
5. assets/ui/skill_basic.png — Match this badge’s circular rim, cutout, brushwork, and level of detail for the set.
```

## 타이틀 그림

`assets/ui/title_key.jpg`

```text
Paint the key art as a vintage fighting tournament poster. Show the same fictional Korean office worker from the reference large in the left third, standing with his broad forehead thrust forward toward screen right and a dead-serious, determined scowl. Preserve his receding hairline, burgundy striped necktie headband, rolled white shirt and build. The exposed forehead emits a bright, localized glow. Keep the entire head visible.

Put dome-arena lighting and faint, soft opponent silhouettes behind him along the left. Keep the right two thirds dark, quiet and mostly empty so the game can place its own title and buttons there. Confine the brightest light and every face to the left third. Match the references’ semi-realistic comic brushwork, believable skin and fabric, painterly contours and contrasty sports broadcast lighting. No text, logos, watermarks or typography. Widescreen 16:9, 1920 × 1080.

Input images:
1. assets/char/ajeossi/idle.png — Exact character identity, forehead, striped necktie headband, and painting style.
2. assets/char/gwak/telegraph_high.png — Sports broadcast lighting and brushwork reference.
3. assets/char/gwak/stun.png — Expressive semi-realistic comic rendering reference.
4. assets/bg/dong_gym.jpg — Painted material texture reference.
```

## 이마 충격파 효과

`assets/fx/forehead_wave.png`

```text
Paint one horizontal, translucent white-gold shockwave projectile traveling toward screen right. At the right-hand leading end give it the clean, convex silhouette of the office worker’s broad, shiny forehead in the reference, like a luminous forehead-shaped pressure front. Paint it as energy with a bright white-gold leading arc. Draw out the rear into a long, tapered, scattering tail to the left, softer and more transparent as it dissipates. Match the game’s visible brushwork and hard lighting.

The effect is much wider than it is tall. Center it on a true transparent 2:1 canvas, 1024 × 512, with clear transparent space on all sides, especially above and below. Keep the four corners transparent. No physical face, character, floor, text, logos or watermarks.

Input images:
1. assets/char/ajeossi/idle.png — Exact character identity, forehead, striped necktie headband, and painting style.
2. assets/char/gwak/telegraph_high.png — Sports broadcast lighting and brushwork reference.
3. assets/char/gwak/stun.png — Expressive semi-realistic comic rendering reference.
4. assets/bg/dong_gym.jpg — Painted material texture reference.
```

## 챔피언십 배경 1차 재생성

`assets/bg/champ_dome.jpg`

초안의 중앙 무대 장식과 현수막이 경기 시야를 차지했다.

```text
Paint the championship final arena for a Korean comedy fighting game. It is a colossal indoor sports dome, with a sweeping steel roof, high tiers of spectators at the rear sides, and extravagantly theatrical gold and deep red arena lighting. Two bright flame columns stand behind the ring near the far left and right margins. Stage haze and falling gold confetti stay over the rear stands and above the ring.

The central axis looks into soft, dark, distant arena depth, with an unobstructed view. Keep the middle free of arches, banners, stage sets, stairs, screens, objects and figures. Keep all foreground flat and empty. A thin gold perimeter follows the near edge, the far edge and the sides of the black ring mat, with no ropes across the foreground.

Match the reference’s side-on camera, with a far ring edge running level at about 55% of the image height. Show one unbroken, flat fighting surface edge to edge across the lower 45%, with both fighter positions and the center entirely vacant. Place ropes and soft-focus spectators behind the far edge, toward the sides. Use visible semi-realistic brushwork, believable materials and slightly muted colors so the fighters will stand out. Leave all signage completely blank. No text, logos or watermarks. Widescreen 16:9, 1920 × 1080.

Input images:
1. assets/bg/dong_gym.jpg — Match the side-on camera, mat depth, clear center, and environment paint style.
2. assets/char/ajeossi/idle.png — Semi-realistic brushwork reference.
3. assets/char/gwak/telegraph_high.png — Sports broadcast lighting reference.
4. assets/char/gwak/stun.png — Painterly finish reference.
```

## 타이틀 그림 1차 재생성

`assets/ui/title_key.jpg`

초안에서 팔이 왼쪽 3분의 1을 넘고 체육관 벽과 매트가 오른쪽에 남았다.

```text
Paint vintage fighting tournament poster key art of the exact same fictional Korean office worker. He stands in the far left third, cropped around the hips and leaning his head forward toward screen right with his broad glossy forehead thrust in front. His fists stay low and close to his body. Preserve his receding hairline, burgundy striped necktie headband, white rolled-sleeve shirt, stocky build and dead-serious scowl. A localized bright glow comes from his bare forehead. Frame his whole head and all bright clothing and limbs inside the leftmost third.

Behind him on the far left, hint at the curve of a tall indoor sports dome with overhead spotlights and faint opponent silhouettes. Fade that detail to dark at one third of the canvas width. The entire right two thirds are calm near-black painterly atmosphere with no stage, wall, floor, silhouettes or other details, reserved for the game's title and buttons. Match the semi-realistic comic brushwork, believable skin and fabric, and hard sports broadcast lighting in the references. No text, logos, watermarks or typography. Widescreen 16:9, 1920 × 1080.

Input images:
1. assets/char/ajeossi/idle.png — Exact character identity, forehead, striped necktie headband, and painting style.
2. assets/char/gwak/telegraph_high.png — Sports broadcast lighting and brushwork reference.
3. assets/char/gwak/stun.png — Expressive semi-realistic comic rendering reference.
4. assets/bg/dong_gym.jpg — Brushwork and material texture only. Use a dome arena for the setting.
```
