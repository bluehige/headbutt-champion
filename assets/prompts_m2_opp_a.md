# 박치기 챔피언 상대 캐릭터 2~4 포즈

TASK `0089-headbutt-m2-opp-a`에 사용한 내장 이미지 생성 도구의 영문 프롬프트다. 오순자, 마봉춘, 고회전의 대기 포즈를 먼저 만든 뒤 각 캐릭터의 대기 원본을 나머지 포즈의 인물 참조로 사용했다.

채택한 1024 × 1536 PNG를 리샘플링 없이 1200 × 1800 투명 캔버스로 옮겼다. 서 있는 포즈는 발, 패배 포즈는 실루엣의 하단을 높이 95%에 맞췄다. 최종 파일 22장의 해상도와 네 모서리 알파 0을 스크립트로 확인했다. 회색 배경 위에 각 포즈를 합성해 화면 방향, 자세, 인물 일관성, 그림체와 가장자리를 확인했다.

## 파일별 검수

| 파일 | 판정 | 재생성 | 확인한 포즈 |
| --- | --- | ---: | --- |
| `assets/char/osunja/idle.png` | 통과 | 0회 | 왼쪽을 보며 국자를 어깨에 걸치고 다른 손을 허리에 댐 |
| `assets/char/osunja/telegraph_low.png` | 통과 | 1회 | 몸을 낮추고 무릎 높이의 국자를 화면 오른쪽으로 당김 |
| `assets/char/osunja/attack_low.png` | 통과 | 0회 | 낮게 굽힌 자세에서 국자를 왼쪽 정강이 높이로 휘두름 |
| `assets/char/osunja/telegraph_high.png` | 통과 | 0회 | 국자가 머리 위에 있고 양발로 버팀 |
| `assets/char/osunja/attack_high.png` | 통과 | 0회 | 국자 자루가 왼쪽 아래로 기울며 국자 끝이 몸보다 왼쪽으로 나감 |
| `assets/char/osunja/stun.png` | 통과 | 0회 | 한쪽 발이 들리고 벌린 손과 표정으로 균형을 잃은 상태가 드러남 |
| `assets/char/osunja/lose.png` | 통과 | 0회 | 머리가 왼쪽에 있는 누운 옆모습과 옆에 놓인 국자 |
| `assets/char/mabongchun/idle.png` | 통과 | 0회 | 양손을 무릎에 얹고 낮게 버틴 자세 |
| `assets/char/mabongchun/telegraph_grab.png` | 통과 | 0회 | 두 팔을 좌우로 크게 벌린 자세 |
| `assets/char/mabongchun/attack_grab.png` | 통과 | 0회 | 왼쪽 앞으로 두 팔을 모은 자세와 팔 사이의 빈 공간 |
| `assets/char/mabongchun/guard.png` | 통과 | 0회 | 얼굴과 가슴 앞에 세운 두 팔뚝 |
| `assets/char/mabongchun/telegraph_high.png` | 통과 | 0회 | 한 손바닥이 오른쪽 뒤로 당겨져 있고 다른 손은 가슴 앞에 있음 |
| `assets/char/mabongchun/attack_high.png` | 통과 | 0회 | 한 손바닥이 얼굴 높이로 왼쪽에 뻗음 |
| `assets/char/mabongchun/stun.png` | 통과 | 0회 | 당황한 표정과 높이가 다른 두 손, 들린 뒤꿈치 |
| `assets/char/mabongchun/lose.png` | 통과 | 0회 | 머리가 왼쪽에 있는 누운 옆모습과 붉은 샅바 |
| `assets/char/gohoejeon/idle.png` | 통과 | 0회 | 왼쪽을 보며 한 발을 든 겨루기 자세 |
| `assets/char/gohoejeon/telegraph_high.png` | 통과 | 0회 | 상체를 비틀고 한 다리를 높이 접어 올림 |
| `assets/char/gohoejeon/attack_high.png` | 통과 | 1회 | 왼쪽 발끝이 머리 높이까지 뻗음 |
| `assets/char/gohoejeon/telegraph_low.png` | 통과 | 0회 | 앉은 자세에서 화면 왼쪽 앞발을 살짝 듦 |
| `assets/char/gohoejeon/attack_low.png` | 통과 | 2회 | 왼쪽으로 뻗은 발이 지지 다리의 무릎 높이에 있음 |
| `assets/char/gohoejeon/stun.png` | 통과 | 0회 | 당황한 표정으로 한 발을 들고 두 팔을 다른 높이로 벌림 |
| `assets/char/gohoejeon/lose.png` | 통과 | 0회 | 머리가 왼쪽에 있는 누운 옆모습과 흰 머리띠 |

## 오순자

### 대기

`assets/char/osunja/idle.png`

```text
Paint one full-body sprite of Osunja, a fictional Korean side-dish shop owner in her 60s. She is short and sturdy, with short permed hair, a flower-print apron, rubber gloves, fabric arm sleeves, comfortable trousers, and slippers. Her weapon is one large stainless-steel ladle. Give her a calmly challenging expression.

In a side-on three-quarter stance facing screen left, she rests the ladle across her shoulder, gripping its handle with one gloved hand while planting the other hand on her hip. Her eyes and nose point screen left. Set the standing figure at about 85% of the canvas height, with the lowest sole at about 95%.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow.

Input images:
1. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
2. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
3. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
4. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 하단 휘두르기 예고

`assets/char/osunja/telegraph_low.png`

#### 최초 생성 · 미채택

국자 손잡이는 낮지만 국자 그릇이 무릎보다 높았다.

```text
Paint one full-body sprite of the exact same fictional Korean side-dish shop owner in her 60s, with the same short permed curls, lined face, short sturdy build, flower-print apron, rubber gloves, fabric arm sleeves, trousers, slippers, and large stainless-steel ladle in input 1.

She crouches in a clearly low wind-up, with her knees bent and torso angled toward screen left. She holds the ladle back on screen right at her knee level, with its bowl visibly behind her. Her eyes stay on screen left. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow.

Input images:
1. assets/char/osunja/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

#### 재생성 1회차 · 채택

```text
Paint one full-body sprite of the exact same fictional Korean side-dish shop owner in her 60s, with the same short permed curls, lined face, short sturdy build, flower-print apron, rubber gloves, fabric arm sleeves, trousers, slippers, and large stainless-steel ladle in input 1.

She sinks into a low stance with both knees deeply bent, face and chest turned toward screen left. Draw the ladle far back toward screen right with both gloved hands low beside her rear knee. Hold the steel shaft nearly horizontal so the bowl and the handle are both at the height of her bent knees. The whole ladle is visibly drawn back for a low sweep. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow.

Input images:
1. assets/char/osunja/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 하단 휘두르기

`assets/char/osunja/attack_low.png`

```text
Paint one full-body sprite of the exact same fictional Korean side-dish shop owner in her 60s, with the same short permed curls, lined face, short sturdy build, flower-print apron, rubber gloves, fabric arm sleeves, trousers, slippers, and large stainless-steel ladle in input 1.

She is in the instant of a low sweeping strike. Her knees are bent, and the ladle extends all the way toward screen left below her knees, nearly parallel to the ground and well ahead of her front shin. Keep her face and chest turned toward the left edge. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/osunja/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 상단 내려치기 예고

`assets/char/osunja/telegraph_high.png`

```text
Paint one full-body sprite of the exact same fictional Korean side-dish shop owner in her 60s, with the same short permed curls, lined face, short sturdy build, flower-print apron, rubber gloves, fabric arm sleeves, trousers, slippers, and large stainless-steel ladle in input 1.

She raises the ladle high overhead to wind up an exaggerated downward swing. The bowl and handle rise clearly above her head and her torso and eyes point screen left. Keep both slippers planted in a firm stance. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/osunja/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 상단 내려치기

`assets/char/osunja/attack_high.png`

```text
Paint one full-body sprite of the exact same fictional Korean side-dish shop owner in her 60s, with the same short permed curls, lined face, short sturdy build, flower-print apron, rubber gloves, fabric arm sleeves, trousers, slippers, and large stainless-steel ladle in input 1.

Show the fully extended end of her overhead chop. She leans into a diagonal downward swing toward screen left, with the ladle bowl well ahead of her at upper-torso height on the left, the long handle pointing down-left from her gloved hand. Keep her face and chest toward screen left. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/osunja/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 공격 후 빈틈

`assets/char/osunja/stun.png`

```text
Paint one full-body sprite of the exact same fictional Korean side-dish shop owner in her 60s, with the same short permed curls, lined face, short sturdy build, flower-print apron, rubber gloves, fabric arm sleeves, trousers, slippers, and large stainless-steel ladle in input 1.

Her swing missed. She pitches toward screen left off balance, eyes wide and mouth startled. One slipper lifts, her free rubber-gloved hand opens to steady her, and the ladle stays in her other hand as it drops to the side. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/osunja/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 패배

`assets/char/osunja/lose.png`

```text
Paint one full-body sprite of the exact same fictional Korean side-dish shop owner in her 60s, with the same short permed curls, lined face, short sturdy build, flower-print apron, rubber gloves, fabric arm sleeves, trousers, slippers, and large stainless-steel ladle in input 1.

She lies flat on her back after defeat, seen from the side, with her head at screen left, eyes closed, and both slippered feet extending right. Her arms hang limp and the ladle lies next to her within the frame. Fit her entire horizontal body and ladle across the lower third, with a transparent gap below them of about 5% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/osunja/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

## 마봉춘

### 씨름 준비

`assets/char/mabongchun/idle.png`

```text
Paint one full-body sprite of Mabongchun, a fictional Korean former ssireum wrestler in his 50s. He is exceptionally tall and massive, with a very thick belly and thighs and a short athletic haircut. He wears a short-sleeve T-shirt, shorts, and a traditional red ssireum satba cloth wrapped around his waist and one thigh. He is barefoot. Give him a grave, taciturn expression.

Show a low, braced ssireum ready stance in a left-facing three-quarter side view. He bends his knees wide and puts both palms on his corresponding knees. His chest, nose, and eyes angle toward screen left. Set the standing figure at about 85% of the canvas height, with the lowest sole at about 95%.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow.

Input images:
1. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
2. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
3. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
4. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 잡기 예고

`assets/char/mabongchun/telegraph_grab.png`

```text
Paint one full-body sprite of the exact same fictional Korean former ssireum wrestler in his 50s, with the same massive belly and thighs, short athletic haircut, face, short-sleeve shirt, shorts, red satba around his waist and one thigh, and bare feet in input 1.

He steps toward screen left in a wide, looming grab wind-up. Both open arms spread very far apart at shoulder level, one reaching toward screen left and the other toward screen right. Show the spread clearly in the silhouette and keep his head, chest, and hips angled left. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/mabongchun/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 끌어안아 들기

`assets/char/mabongchun/attack_grab.png`

```text
Paint one full-body sprite of the exact same fictional Korean former ssireum wrestler in his 50s, with the same massive belly and thighs, short athletic haircut, face, short-sleeve shirt, shorts, red satba around his waist and one thigh, and bare feet in input 1.

He squats into a lifting grab and closes both rounded arms in front of him toward screen left, palms turned inward and rising, as if just scooping up an opponent. Leave clear empty space inside the embrace and draw only Mabongchun. Keep his head, torso, and hips angled screen left. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/mabongchun/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 방어

`assets/char/mabongchun/guard.png`

```text
Paint one full-body sprite of the exact same fictional Korean former ssireum wrestler in his 50s, with the same massive belly and thighs, short athletic haircut, face, short-sleeve shirt, shorts, red satba around his waist and one thigh, and bare feet in input 1.

He plants his feet and raises both forearms vertically in front of his face and chest to form a close defensive shield. Keep his forearms side by side, bent elbows down, eyes visible just above or between them, and his whole stance turned toward screen left. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/mabongchun/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 손바닥 밀치기 예고

`assets/char/mabongchun/telegraph_high.png`

```text
Paint one full-body sprite of the exact same fictional Korean former ssireum wrestler in his 50s, with the same massive belly and thighs, short athletic haircut, face, short-sleeve shirt, shorts, red satba around his waist and one thigh, and bare feet in input 1.

He winds up a face-level palm shove. His open striking hand draws far back toward screen right, elbow raised, while his other hand stays near his chest. His weight loads onto the rear leg and his eyes stay fixed toward screen left. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/mabongchun/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 손바닥 밀치기

`assets/char/mabongchun/attack_high.png`

```text
Paint one full-body sprite of the exact same fictional Korean former ssireum wrestler in his 50s, with the same massive belly and thighs, short athletic haircut, face, short-sleeve shirt, shorts, red satba around his waist and one thigh, and bare feet in input 1.

He drives a single open palm all the way toward screen left at his own face height. The palm is well ahead of his face, fingers up, arm extended, and his other hand stays near his chest. Lean the big body into the push while keeping his profile and eyes turned left. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/mabongchun/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 공격 후 빈틈

`assets/char/mabongchun/stun.png`

```text
Paint one full-body sprite of the exact same fictional Korean former ssireum wrestler in his 50s, with the same massive belly and thighs, short athletic haircut, face, short-sleeve shirt, shorts, red satba around his waist and one thigh, and bare feet in input 1.

His attack has missed. In a left-facing side view, his heavy torso tips past his knees, one bare heel lifts, and his open hands flail at different heights as he tries to regain his balance. Give him a visibly startled face. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/mabongchun/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 패배

`assets/char/mabongchun/lose.png`

```text
Paint one full-body sprite of the exact same fictional Korean former ssireum wrestler in his 50s, with the same massive belly and thighs, short athletic haircut, face, short-sleeve shirt, shorts, red satba around his waist and one thigh, and bare feet in input 1.

He lies flat on his back after defeat, seen from the side, with his head at screen left, eyes closed, and both bare feet extending right. His arms rest limp apart and his red waist and thigh wrap stays visible. Fit his entire horizontal body across the lower third, with a transparent gap below him of about 5% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/mabongchun/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

## 고회전

### 겨루기 대기

`assets/char/gohoejeon/idle.png`

```text
Paint one full-body sprite of Gohoejeon, a fictional Korean taekwondo instructor in his 40s. He is lean and muscular with long legs, neatly side-parted hair, and a sharp, confident expression. He wears a white taekwondo dobok, a plain black belt, and a plain white headband across his forehead. He is barefoot.

Show a light mid-bounce sparring stance in a lateral three-quarter view. His guard is loose, one bare foot just off the ground and the other on the ball of the foot. Both his head and his side-on torso point toward screen left. Set the standing figure at about 85% of the canvas height, with the lowest sole at about 95%.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow.

Input images:
1. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
2. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
3. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
4. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 뒤돌려차기 예고

`assets/char/gohoejeon/telegraph_high.png`

```text
Paint one full-body sprite of the exact same fictional Korean taekwondo instructor in his 40s, with the same neatly side-parted hair, sharp face, long legs, lean build, white dobok, plain black belt, plain white headband, and bare feet in input 1.

He twists to wind up a spinning kick, lifting one leg clearly folded at the knee with the thigh high. His upper body coils, arms counterbalance, and he looks over his turning shoulder toward screen left. Keep the knee bent and the foot tucked close to the body. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/gohoejeon/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 상단 돌려차기

`assets/char/gohoejeon/attack_high.png`

#### 최초 생성 · 미채택

차는 발이 어깨 높이에 머물렀다.

```text
Paint one full-body sprite of the exact same fictional Korean taekwondo instructor in his 40s, with the same neatly side-parted hair, sharp face, long legs, lean build, white dobok, plain black belt, plain white headband, and bare feet in input 1.

Show the fully extended high kick from a clear side view. His long kicking leg reaches horizontally toward screen left at head height, with the bare foot at the left end of the silhouette. He balances on the other foot, with his face visible and eyes toward screen left. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/gohoejeon/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

#### 재생성 1회차 · 채택

```text
Paint one full-body sprite of the exact same fictional Korean taekwondo instructor in his 40s, with the same neatly side-parted hair, sharp face, long legs, lean build, white dobok, plain black belt, plain white headband, and bare feet in input 1.

Show a fully extended high roundhouse with the kicking bare foot at the left end of the silhouette and at the same vertical level as his eyes, visibly above his shoulders. His straight kicking leg forms a long upward diagonal from his hips to that foot. His torso leans back toward screen right, his support foot is planted, and his face and eyes turn toward screen left. Leave clear space beyond his raised toes. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/gohoejeon/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 하단 차기 예고

`assets/char/gohoejeon/telegraph_low.png`

```text
Paint one full-body sprite of the exact same fictional Korean taekwondo instructor in his 40s, with the same neatly side-parted hair, sharp face, long legs, lean build, white dobok, plain black belt, plain white headband, and bare feet in input 1.

He sinks into a left-facing crouch to prepare a low kick, weight on his rear foot. The front bare foot lifts just off the ground with its knee slightly bent, distinctly lower than the high kick wind-up. His eyes and torso angle toward screen left. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/gohoejeon/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 하단 쓸어차기

`assets/char/gohoejeon/attack_low.png`

#### 최초 생성 · 미채택

차는 발이 지지 다리의 무릎보다 높았다.

```text
Paint one full-body sprite of the exact same fictional Korean taekwondo instructor in his 40s, with the same neatly side-parted hair, sharp face, long legs, lean build, white dobok, plain black belt, plain white headband, and bare feet in input 1.

He completes a low sweeping kick toward screen left. The long kicking leg extends across the lower silhouette with the bare foot at knee height, while the other leg bends to support him. View him from the side with his torso and eyes aimed toward screen left. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/gohoejeon/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

#### 재생성 1회차 · 미채택

차는 발이 바닥 높이까지 내려갔다.

```text
Paint one full-body sprite of the exact same fictional Korean taekwondo instructor in his 40s, with the same neatly side-parted hair, sharp face, long legs, lean build, white dobok, plain black belt, plain white headband, and bare feet in input 1.

Show the fully extended low sweeping kick in a left-facing side view. He crouches on one bent supporting leg while the other leg extends diagonally down-left. The bare striking foot at the left end of the silhouette is exactly as low as the bent supporting knee, with a clear span of height between his black belt and that foot. Keep his head, eyes, and chest turned toward screen left. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/gohoejeon/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

#### 재생성 2회차 · 채택

```text
Paint one full-body sprite of the exact same fictional Korean taekwondo instructor in his 40s, with the same neatly side-parted hair, sharp face, long legs, lean build, white dobok, plain black belt, plain white headband, and bare feet in input 1.

Show the instant of a low sweeping kick from a left-facing three-quarter side view. His torso is fairly upright, with one foot planted flat near the bottom and its knee bent. The other leg extends in a straight diagonal down toward screen left, with its bare foot suspended well above the planted foot. Place the extended foot at the same vertical height as the support kneecap, halfway between the black belt and his planted foot. His face and chest point screen left. Keep exactly one figure and both bare feet in the frame. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/gohoejeon/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 공격 후 빈틈

`assets/char/gohoejeon/stun.png`

```text
Paint one full-body sprite of the exact same fictional Korean taekwondo instructor in his 40s, with the same neatly side-parted hair, sharp face, long legs, lean build, white dobok, plain black belt, plain white headband, and bare feet in input 1.

His kick missed. He staggers in his left-facing stance, with one bare foot lifted awkwardly and his arms thrown out unevenly to regain balance. His formerly confident face shows wide eyes and a startled mouth. Keep body scale close to input 1 and the lowest sole at about 95% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/gohoejeon/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```

### 패배

`assets/char/gohoejeon/lose.png`

```text
Paint one full-body sprite of the exact same fictional Korean taekwondo instructor in his 40s, with the same neatly side-parted hair, sharp face, long legs, lean build, white dobok, plain black belt, plain white headband, and bare feet in input 1.

He lies flat on his back after defeat, seen from the side, with his head at screen left, eyes closed, and both bare feet extending right. His arms rest limp apart. Fit his entire horizontal body across the lower third, with a transparent gap below him of about 5% of the canvas height.

Match the inputs' semi-realistic comic brushwork and hard, high-contrast sports broadcast lighting. Render believable skin and fabric with visible painted strokes. Use caricature proportions with a head about 1.3 times natural size. Use a transparent 1024 × 1536 portrait canvas. Keep the whole character and all accessories inside the frame with transparent margins. No text, logos, watermarks, action lines, floor, or cast shadow. Leave a clear transparent margin beyond the silhouette on both sides.

Input images:
1. assets/char/gohoejeon/idle.png — exact character identity, outfit, body proportions, and prop design.
2. assets/char/ajeossi/idle.png — visible brushwork, skin and fabric rendering, and caricature proportions.
3. assets/char/gwak/telegraph_high.png — hard sports broadcast lighting and semi-realistic comic finish.
4. assets/char/gwak/stun.png — expressive facial rendering and painterly edges.
5. assets/bg/dong_gym.jpg — brushwork and material rendering.
```
