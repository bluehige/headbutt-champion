# 박치기 챔피언 세계대회 상대 포즈와 소품

TASK 0090-headbutt-m2-opp-b

내장 이미지 생성 도구에서 투명 배경으로 생성했다. 먼저 상대별 `idle.png`를 만들고 이후 포즈의 인물 참조로 사용했다. 신규 생성에는 `STYLE_GUIDE.md`의 그림체 참조 네 장을 넣었다. 더 헬멧의 도주 자세 교정에는 기존 도주 포즈, 대기 포즈, 인물 그림체 참조 세 장을 넣었다.

생성된 PNG의 가장자리 알파를 정리하고 비율을 유지해 캐릭터 1024×1536, 소품 512×512로 내보냈다. 대기 포즈는 높이 약 85%에 맞췄고 지면에 닿는 포즈의 최하단은 1459px에 맞췄다. 엘 프렌테의 공중 보디 어택은 그보다 높게 배치했다. 세 패배 포즈는 머리를 왼쪽에 두고 캔버스 하단에 가로로 배치했다.

## 파일별 판정

최종 PNG 26장의 포즈, 왼쪽을 향하는 방향과 도주 예외, 의상 연속성, 그림체를 대조했다. 스크립트로 전 파일의 크기, PNG 디코딩, RGBA 모드, 네 모서리의 알파값 0과 외곽 여백을 확인했다. 로컬 `serve.mjs`의 폴더 목록과 이미지 URL에서도 26개를 확인했다.

| 파일 | 판정 | 재생성 | 확인 사항 |
| --- | --- | ---: | --- |
| `assets/char/frente/idle.png` | 통과 | 0 | 왼쪽을 보며 두 팔을 낮게 벌린 과시 자세. 초록 복면의 금색 이마 타원, 망토, 긴 타이츠 확인. |
| `assets/char/frente/telegraph_high.png` | 통과 | 0 | 양 무릎을 깊게 굽히고 두 팔을 뒤로 뺀 도약 준비. |
| `assets/char/frente/attack_high.png` | 통과 | 0 | 머리와 가슴이 왼쪽을 향하고 두 발이 뒤따르는 공중 보디 어택. |
| `assets/char/frente/telegraph_low.png` | 통과 | 0 | 한쪽 무릎을 낮추고 손을 바닥 가까이 둔 슬라이딩 준비. |
| `assets/char/frente/attack_low.png` | 통과 | 0 | 두 부츠가 모두 왼쪽으로 뻗은 낮은 슬라이딩 킥. |
| `assets/char/frente/telegraph_grab.png` | 통과 | 0 | 두 팔을 어깨 높이로 벌리고 손가락을 구부린 잡기 준비. |
| `assets/char/frente/attack_grab.png` | 통과 | 0 | 왼쪽으로 몸을 실어 두 팔을 안쪽으로 감는 잡기. 인물 한 명. |
| `assets/char/frente/stun.png` | 통과 | 0 | 왼쪽을 보며 눈이 커지고 발과 팔이 엇갈린 빈틈 자세. |
| `assets/char/frente/lose.png` | 통과 | 0 | 복면을 쓴 채 머리를 왼쪽에 두고 하단에 가로로 누운 자세. |
| `assets/char/gregor/idle.png` | 통과 | 0 | 왼쪽을 향한 눈이 큰 회색 글러브 두 개 위로 드러나는 대기 자세. |
| `assets/char/gregor/guard.png` | 통과 | 0 | 깊게 웅크려 두 글러브를 붙이고 얼굴과 가슴 앞을 가린 가드. |
| `assets/char/gregor/telegraph_high.png` | 통과 | 0 | 앞 글러브를 가드에 두고 뒷 글러브를 어깨 쪽으로 당긴 준비. |
| `assets/char/gregor/attack_high.png` | 통과 | 0 | 앞 글러브는 얼굴 높이에서 왼쪽으로 뻗고 뒷 글러브는 볼 옆에 둔 잽. |
| `assets/char/gregor/stun.png` | 통과 | 0 | 두 글러브가 양옆으로 벌어져 삭발, 짙은 콧수염, 크게 뜬 눈이 드러남. |
| `assets/char/gregor/lose.png` | 통과 | 0 | 머리가 왼쪽에 있고 글러브를 낀 채 하단에 가로로 누운 자세. |
| `assets/char/helmet/idle.png` | 통과 | 0 | 왼쪽을 보며 작은 트로피를 한 손에 들고 가슴을 편 자세. |
| `assets/char/helmet/telegraph_high.png` | 통과 | 0 | 트로피를 오른쪽 뒤로 높게 들어 던지기 직전의 자세. |
| `assets/char/helmet/attack_high.png` | 통과 | 0 | 빈 손을 얼굴 높이에서 왼쪽으로 뻗은 던지기 직후 자세. |
| `assets/char/helmet/telegraph_low.png` | 통과 | 0 | 허리를 낮추고 검은 볼링공을 오른쪽 뒤로 당긴 자세. |
| `assets/char/helmet/attack_low.png` | 통과 | 0 | 허리를 낮추고 빈 손을 왼쪽 아래로 뻗은 릴리스 직후 자세. |
| `assets/char/helmet/retreat.png` | 통과 | 1 | 몸은 오른쪽으로 달리고 바이저는 왼쪽을 향함. 등에는 벨트 뒷면이 보임. |
| `assets/char/helmet/stun.png` | 통과 | 0 | 두 손으로 헬멧을 붙잡고 불투명한 검은 바이저에 큰 금이 간 자세. |
| `assets/char/helmet/lose.png` | 통과 | 0 | 깨진 바이저가 있는 헬멧을 쓴 채 머리를 왼쪽에 두고 하단에 누운 자세. |
| `assets/fx/proj_trophy.png` | 통과 | 0 | 챔피언이 든 트로피와 같은 금색 컵, 두 손잡이, 어두운 받침. 왼쪽으로 살짝 기울임. |
| `assets/fx/proj_bowling.png` | 통과 | 0 | 손가락 구멍 세 개가 있는 검은 볼링공 하나. |
| `assets/fx/helmet_shard.png` | 통과 | 0 | 두꺼운 금빛 곡면과 파단면이 보이는 헬멧 조각 하나. |

`retreat.png` 초안은 벨트 앞판이 등에 그려져 다시 생성했다. 교정 호출 중 한 번은 참조 장수 제한으로 이미지 생성 전에 거부됐다. 성공한 교정만 재생성 횟수에 포함했다.

## 사용한 프롬프트

### `assets/char/frente/idle.png`

```text
Paint one full-body fighting-game sprite of El Frente, a stocky, powerfully muscular fictional masked pro wrestler in his thirties. His own green full-face wrestling mask has a single large plain gold oval centered high on the forehead, narrow eye openings, and green fabric covering the rest of the face. He wears full-length dark green wrestling tights, green lace-up wrestling boots, and a short green cape. Use small gold details on the tights and boots, and fabric folds and stitched seams to make the costume tangible.

Show him in a left-facing three-quarter stance, feet planted and chest lifted as he shows off to an unseen crowd. Spread both arms out in a relaxed, slightly lowered arc, elbows soft and palms up. His eyes and the front of the mask turn toward screen left. Give him the self-serious confidence of a showman.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Fit the entire silhouette with clear space on all sides. At standing height the figure is about 85% of the frame, with soles about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Input images:
1. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
2. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
3. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
4. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/frente/telegraph_high.png`

```text
Paint one full-body sprite of the exact same El Frente in the first reference. Preserve his stocky, powerfully muscular build, green full-face wrestling mask with a single large gold oval on the forehead, green short cape and gold clasps, long dark green wrestling tights with gold thigh details, and green gold-trimmed laced boots.

Show the load just before a leap toward screen left. Bend both knees very deeply with both boots planted, hips back and lowered, and lean his chest forward. Sweep both arms far behind his hips toward screen right, with both bent elbows and both hands clearly visible behind him. His eyes look left. Make an obvious two-foot spring-loaded silhouette.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/frente/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/frente/attack_high.png`

```text
Paint one full-body sprite of the exact same El Frente in the first reference. Preserve his stocky, powerfully muscular build, green full-face wrestling mask with a single large gold oval on the forehead, green short cape and gold clasps, long dark green wrestling tights with gold thigh details, and green gold-trimmed laced boots.

Show a flying body attack toward screen left in midair. Head and chest lead left, both boots trail to the right; make the long torso and legs almost horizontal with a slight diagonal from upper left to lower right. Extend both bent arms ahead of the chest, with the cape sweeping behind. Show the left-facing side of his mask. Keep clear transparency below the airborne sprite and fit the complete body.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Fit the entire silhouette with clear space on all sides. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/frente/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/frente/telegraph_low.png`

```text
Paint one full-body sprite of the exact same El Frente in the first reference. Preserve his stocky, powerfully muscular build, green full-face wrestling mask with a single large gold oval on the forehead, green short cape and gold clasps, long dark green wrestling tights with gold thigh details, and green gold-trimmed laced boots.

Show his low sliding wind-up in left-facing three-quarter side view. Set his rear knee down nearly on the ground, plant his lead boot ahead to screen left with that knee bent, and crouch extremely low over the planted leg. Bring one hand low near the mat for balance, arm bent, and draw the other near the waist. The staggered one-knee crouch has a different silhouette from a two-foot jump.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/frente/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/frente/attack_low.png`

```text
Paint one full-body sprite of the exact same El Frente in the first reference. Preserve his stocky, powerfully muscular build, green full-face wrestling mask with a single large gold oval on the forehead, green short cape and gold clasps, long dark green wrestling tights with gold thigh details, and green gold-trimmed laced boots.

Show the low impact instant of a sliding two-foot kick to screen left. His hips ride just above ground level, his chest leans back toward screen right, and both legs shoot out low to the left. Show both green boots separately in the silhouette, soles leading left and only slightly apart vertically. His masked head faces left and his short cape trails to the right. Keep the whole low horizontal silhouette close to the bottom.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep the entire figure and leave a clear margin, with the lowest point about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/frente/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/frente/telegraph_grab.png`

```text
Paint one full-body sprite of the exact same El Frente in the first reference. Preserve his stocky, powerfully muscular build, green full-face wrestling mask with a single large gold oval on the forehead, green short cape and gold clasps, long dark green wrestling tights with gold thigh details, and green gold-trimmed laced boots.

Show him preparing to grab someone to screen left. In left-facing near-profile three-quarter view, plant his feet wide, bend his knees slightly, and tip his chest forward. Hold both arms out very wide to either side at shoulder height, one stretching screen left and the other screen right, elbows slightly bent, fingers open and curved inward ready to seize. Keep both hands inside the frame.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/frente/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/frente/attack_grab.png`

```text
Paint one full-body sprite of the exact same El Frente in the first reference. Preserve his stocky, powerfully muscular build, green full-face wrestling mask with a single large gold oval on the forehead, green short cape and gold clasps, long dark green wrestling tights with gold thigh details, and green gold-trimmed laced boots.

Show the instant his grab closes toward screen left. He lunges left with his leftmost knee bent and wraps both arms forward around empty space at chest height. His forearms curve toward one another, almost touching as in a bear hug, and both hands are clearly visible. Only El Frente appears. Mask and torso are in left-facing near-profile three-quarter view.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/frente/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/frente/stun.png`

```text
Paint one full-body sprite of the exact same El Frente in the first reference. Preserve his stocky, powerfully muscular build, green full-face wrestling mask with a single large gold oval on the forehead, green short cape and gold clasps, long dark green wrestling tights with gold thigh details, and green gold-trimmed laced boots.

Show him staggering after missing an attack. In left-facing near-profile three-quarter view, he recoils on one planted boot with the other heel lifting, shoulders twisted off balance, both arms pulled out at uneven heights and fingers splayed. His eyes go wide with surprise through the original small mask openings. The mask stays on.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/frente/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/frente/lose.png`

```text
Paint one full-body sprite of the exact same El Frente in the first reference. Preserve his stocky, powerfully muscular build, green full-face wrestling mask with a single large gold oval on the forehead, green short cape and gold clasps, long dark green wrestling tights with gold thigh details, and green gold-trimmed laced boots.

Show him defeated, lying flat on his back viewed from the side, his masked head at screen left and boots at screen right. The head tilts slightly toward the left edge. Both arms and legs are slack and splayed and the cape lies underneath. Place the long horizontal figure across the lowest part of the portrait with open transparency above him.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Fit the entire silhouette with clear space on all sides. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/frente/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/gregor/idle.png`

```text
Paint one full-body fighting-game sprite of Gregor, a tall, broad-shouldered fictional European boxer in his forties. He has a shaved head, a thick dark straight mustache, and an impassive expression. He is bare-chested and wears long dark burgundy boxing trunks with a broad matte charcoal waistband and black lace-up boxing boots. His padded gray leather boxing gloves are comically huge, each as wide as two faces.

Show his usual closed boxing stance in a left-facing three-quarter side view, knees lightly flexed. He holds both giant gray gloves vertically side by side right in front of his face. Only his watchful eyes and the top of his bald head peek out above the gloves, eyes fixed toward screen left.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Fit the entire silhouette with clear space on all sides. At standing height the figure is about 85% of the frame, with soles about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting only.
2. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork only.
3. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment only.
4. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only only.
```

### `assets/char/gregor/guard.png`

```text
Paint one full-body sprite of the exact same Gregor in the first reference. Preserve his tall, broad-shouldered build, shaved head, thick dark mustache when visible, huge gray leather gloves (each twice the apparent size of his face), dark burgundy long trunks with a charcoal waistband, and black boxing boots.

Show a tight shell guard in left-facing three-quarter side view. He crouches deeper and hunches his shoulders forward, tucking behind both giant gray gloves. Press the gloves firmly together with their cuffs angled inward, making a single continuous broad shield from eyes down over his chest. The gloves cover both eyes and all of the face. Keep the feet in a short stable boxing stance.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/gregor/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/gregor/telegraph_high.png`

```text
Paint one full-body sprite of the exact same Gregor in the first reference. Preserve his tall, broad-shouldered build, shaved head, thick dark mustache when visible, huge gray leather gloves (each twice the apparent size of his face), dark burgundy long trunks with a charcoal waistband, and black boxing boots.

Show the subtle wind-up just before a high jab. He stays in his standard left-facing close guard, both gloves high. Keep the lead glove beside his face and draw only the other oversized gray glove a short distance back toward the shoulder on screen right, visibly separating it from the lead glove. Show just enough of the eyes between the gloves to see his gaze aimed left.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/gregor/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/gregor/attack_high.png`

```text
Paint one full-body sprite of the exact same Gregor in the first reference. Preserve his tall, broad-shouldered build, shaved head, thick dark mustache when visible, huge gray leather gloves (each twice the apparent size of his face), dark burgundy long trunks with a charcoal waistband, and black boxing boots.

Show a quick short standing jab in a left-facing near-profile three-quarter view. The lead oversized gray glove projects horizontally toward screen left at his own eye height, ahead of his body with the elbow still slightly soft. Keep the other oversized glove tight to his cheek and shoulders tucked. Both feet stay in his short boxing stance. Keep the complete leftmost glove inside the framing.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/gregor/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/gregor/stun.png`

```text
Paint one full-body sprite of the exact same Gregor in the first reference. Preserve his tall, broad-shouldered build, shaved head, thick dark mustache when visible, huge gray leather gloves (each twice the apparent size of his face), dark burgundy long trunks with a charcoal waistband, and black boxing boots.

Show his fortress guard broken open in a left-facing three-quarter side view. Both giant gray gloves are knocked out to opposite sides, one to screen left and one to screen right, fully uncovering his shaved head, dark thick mustache, and wide startled eyes. He leans back, knees unsteady and one heel lifted. His eyes still look left.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/gregor/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/gregor/lose.png`

```text
Paint one full-body sprite of the exact same Gregor in the first reference. Preserve his tall, broad-shouldered build, shaved head, thick dark mustache when visible, huge gray leather gloves (each twice the apparent size of his face), dark burgundy long trunks with a charcoal waistband, and black boxing boots.

Show him lying flat on his back, defeated, in side view with his shaved head at screen left and black boxing boots at screen right. His thick dark mustache and slack profile are visible, his head rolled slightly toward the left edge. His two giant gray gloves lie apart with his arms limp. The long horizontal body lies entirely in the lower portion with empty transparency above.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Fit the entire silhouette with clear space on all sides. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/gregor/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/helmet/idle.png`

```text
Paint one full-body fighting-game sprite of The Helmet, a heavily built fictional male world champion. He wears a shiny gold full-face helmet with an opaque black visor, and an exceptionally thick raised gold forehead reinforcement above it. The helmet covers his whole face. He wears a white knee-length champion's robe with gold piping, a large gold championship belt at the waist with a blank center plate, and white gold-trimmed boots.

Show him cockily standing in a left-facing three-quarter side view, chest out and chin raised, feet planted. One hand holds a small gold two-handled cup trophy on a short dark base. Rest his free hand on his hip. His black visor points toward screen left.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Fit the entire silhouette with clear space on all sides. At standing height the figure is about 85% of the frame, with soles about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting only.
2. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork only.
3. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment only.
4. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only only.
```

### `assets/char/helmet/telegraph_high.png`

```text
Paint one full-body sprite of the exact same The Helmet in the first reference. Preserve his strong build, shiny gold full-face helmet with an exceptionally thick gold forehead reinforcement and an opaque black visor that conceals the entire face, white knee-length champion's robe with gold trim, unlettered large gold belt and white gold-trimmed laced boots.

Show the overhand throw wind-up in left-facing three-quarter side view. He arches back, raises the arm holding the exact small two-handled gold cup trophy far back toward the upper right behind his helmet, and bends that elbow sharply. His empty free hand points ahead toward screen left for balance. His opaque visor still faces left. Keep the entire raised trophy and every boot inside the canvas.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/helmet/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/helmet/attack_high.png`

```text
Paint one full-body sprite of the exact same The Helmet in the first reference. Preserve his strong build, shiny gold full-face helmet with an exceptionally thick gold forehead reinforcement and an opaque black visor that conceals the entire face, white knee-length champion's robe with gold trim, unlettered large gold belt and white gold-trimmed laced boots.

Show the instant just after an overhand throw toward screen left. His upper body and visor face left, with a clear forward weight shift. His throwing arm has swept all the way forward toward screen left near head height, fully extended, and the release hand is open and empty. His back arm trails for balance. The trophy is already off canvas; the sprite contains only the champion.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/helmet/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/helmet/telegraph_low.png`

```text
Paint one full-body sprite of the exact same The Helmet in the first reference. Preserve his strong build, shiny gold full-face helmet with an exceptionally thick gold forehead reinforcement and an opaque black visor that conceals the entire face, white knee-length champion's robe with gold trim, unlettered large gold belt and white gold-trimmed laced boots.

Show the underhand bowling wind-up toward screen left, seen in left-facing three-quarter side view. Bend him low at the waist with knees flexed. One hand grips a plain black bowling ball, drawn far behind his hip to screen right, at roughly knee height. Make the black ball fully visible in silhouette behind him. His empty arm reaches ahead for balance. The opaque visor turns left and slightly down.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/helmet/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/helmet/attack_low.png`

```text
Paint one full-body sprite of the exact same The Helmet in the first reference. Preserve his strong build, shiny gold full-face helmet with an exceptionally thick gold forehead reinforcement and an opaque black visor that conceals the entire face, white knee-length champion's robe with gold trim, unlettered large gold belt and white gold-trimmed laced boots.

Show the low underhand bowling release follow-through toward screen left. He bends low at the waist and knees, reaching the throwing arm down and far to the left with his palm open and fingers just above ground level. The other arm reaches back for balance. His black visor points left in three-quarter side view. Both hands are empty; the ball has already left the frame.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/helmet/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/helmet/retreat.png`

초안

```text
Paint one full-body sprite of the exact same The Helmet in the first reference. Preserve his strong build, shiny gold full-face helmet with an exceptionally thick gold forehead reinforcement and an opaque black visor that conceals the entire face, white knee-length champion's robe with gold trim, unlettered large gold belt and white gold-trimmed laced boots.

Show a frantic run AWAY toward screen right, seen from a three-quarter rear view. The back of his white gold-trimmed robe is prominent, and his torso, hips, boots, bent knees and pumping arms are all running to the right. Twist only the helmet over his left shoulder so the black visor is visible in profile pointing LEFT behind him while the body continues RIGHT. His hands are empty. Visor and gold shell are intact.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/helmet/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

재생성 1회 · 채택

```text
Edit the first sprite, keeping the same figure, rear three-quarter running pose and proportions. The champion and both boots run toward screen right, the back of his white gold-trimmed robe faces the viewer, and only his gold helmet turns back over the shoulder with the black visor pointing screen left.

Correct the belt orientation. The large decorative circular gold championship plate stays on his abdomen on the far side, hidden from this rear view. The middle of the visible lower back has ONLY the dark leather belt strap, with small metal side tabs near the hips. Preserve the rest of the figure, the gold-trimmed robe, and the same paint technique.

Keep the complete sprite in a transparent 2:3 portrait PNG canvas, 1024 × 1536. No text, logos, watermarks, effect lines, floor, or cast shadow.

Input images:
1. assets/char/helmet/retreat.png — exact running pose, camera and silhouette to preserve.
2. assets/char/helmet/idle.png — exact clothing, helmet with opaque visor, and front-mounted gold championship plate.
3. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
4. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
5. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
```

### `assets/char/helmet/stun.png`

```text
Paint one full-body sprite of the exact same The Helmet in the first reference. Preserve his strong build, shiny gold full-face helmet with an exceptionally thick gold forehead reinforcement and an opaque black visor that conceals the entire face, white knee-length champion's robe with gold trim, unlettered large gold belt and white gold-trimmed laced boots.

Show him reeling in alarm in left-facing three-quarter side view, his knees wavering, his two empty hands clutching opposite sides of the gold helmet. A large sharp branching crack crosses the opaque black visor. The face stays fully covered and the intact gold forehead reinforcement keeps its same shape. No trophy or bowling ball.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Keep his physical scale close to the idle and the entire figure in the frame. Put the lowest shoe sole or knee about 5% above the bottom. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/helmet/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/char/helmet/lose.png`

```text
Paint one full-body sprite of the exact same The Helmet in the first reference. Preserve his strong build, shiny gold full-face helmet with an exceptionally thick gold forehead reinforcement and an opaque black visor that conceals the entire face, white knee-length champion's robe with gold trim, unlettered large gold belt and white gold-trimmed laced boots.

Show the defeated champion sprawled flat on his back in side view, with his helmeted head at screen left and his boots at screen right. He still wears the exact gold full-face helmet, its opaque black visor visibly fractured by a large branching crack and the head tilted slightly left. The robe and gold belt stay on, limbs slack, hands empty. Put the whole long horizontal figure across the lower portion with empty transparency above.

Match the references' semi-realistic comic digital painting, visible brushwork, believable materials, slightly exaggerated proportions (head about 1.3 times natural size), and hard sports broadcast lighting.

Use a transparent 2:3 portrait PNG canvas, 1024 × 1536. Fit the entire silhouette with clear space on all sides. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/helmet/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/fx/proj_trophy.png`

```text
Paint one isolated small gold cup trophy caught in flight, tilted slightly with its top leaning toward screen left. Match the exact trophy design held in the first image: two loop handles and a short dark base. Keep it clear and readable, with no hand, character, or motion marks.

Match the reference paintings' semi-realistic brushwork, believable materials, and crisp sports lighting. Center the single object, large in the square frame with a thin transparent margin around every edge. Use a transparent square PNG canvas, 512 × 512. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/helmet/idle.png — exact trophy cup, handles, and base reference.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/fx/proj_bowling.png`

```text
Paint one isolated glossy black bowling ball with three finger holes and subtle painted sports-light reflections. Match the black bowling ball held in the first image. The ball alone fills the square.

Match the reference paintings' semi-realistic brushwork, believable materials, and crisp sports lighting. Center the single object, large in the square frame with a thin transparent margin around every edge. Use a transparent square PNG canvas, 512 × 512. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/helmet/telegraph_low.png — bowling ball shape, colors, and material reference.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```

### `assets/fx/helmet_shard.png`

```text
Paint one isolated irregular broken shard of polished gold helmet shell. Match the gold metal and curvature of the helmet in the first image. Show a single piece, with angular snapped edges, a bright gold outside, and a slim dark exposed inner edge.

Match the reference paintings' semi-realistic brushwork, believable materials, and crisp sports lighting. Center the single object, large in the square frame with a thin transparent margin around every edge. Use a transparent square PNG canvas, 512 × 512. No text, logos, watermarks, effect lines, floor, or cast shadow.

Isolate the sprite on true alpha transparency. All area outside the figure is empty and fully transparent, including between limbs.

Input images:
1. assets/char/helmet/stun.png — helmet shell color, finish, and material reference.
2. assets/char/ajeossi/idle.png — painting style, painted skin and fabric, and lighting.
3. assets/char/gwak/telegraph_high.png — left-facing opponent framing, painted anatomy, and brushwork.
4. assets/char/gwak/stun.png — expressive proportions, brushwork, and edge treatment.
5. assets/bg/dong_gym.jpg — brushwork, material rendering, and palette only.
```
