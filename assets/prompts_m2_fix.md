# 박치기 챔피언 상대 포즈 교정

TASK 0092-headbutt-m2-fix

`image-creator`의 내장 이미지 생성 도구에서 투명 배경을 지정해 기존 포즈를 각각 한 번 재생성했다. 생성본의 가장자리 알파를 정리하고 인물 비율을 유지하며 `idle.png`의 인물 높이 1310px와 하단 여백 77px에 맞췄다.

| 파일 | 판정 | 재생성 | 확인 사항 |
| --- | --- | ---: | --- |
| `assets/char/gregor/telegraph_high.png` | 통과 | 1 | 왼쪽 글러브가 얼굴 앞을 가드하고 오른쪽 글러브가 어깨 뒤로 크게 빠진다. 축소 실루엣에서도 대기 자세와 구별된다. |
| `assets/char/helmet/retreat.png` | 통과 | 1 | 오른쪽으로 달리면서 왼쪽을 돌아보는 자세를 유지한다. 글자 없는 월계수 장식 금색 벨트, 금색 헬멧, 흰 가운이 다른 포즈와 일치한다. |

`style-reference-sheet.png`는 그림체 참조를 묶은 임시 이미지다. 위쪽 왼쪽은 아저씨 대기 자세, 위쪽 오른쪽은 곽두팔 빈틈 자세, 아래는 동네 체육관 배경이다. 더 헬멧의 첫 번째 참조는 교체 전 `retreat.png`였다.

## `assets/char/gregor/telegraph_high.png`

```text
Paint one full-body fighting-game sprite of Gregor from references 1–3. Preserve his shaved head, thick dark mustache, massive bare torso, oversized weathered gray leather boxing gloves, burgundy trunks with a charcoal waistband, and black lace-up boxing boots.

Show an exaggerated high-punch wind-up in a left-facing three-quarter side view. Keep his anatomical left glove up in front of his face, toward screen left. Twist his upper body back toward screen right against a planted stance. Pull his right elbow far out to screen right and cock the bent right glove well behind his shoulder, clear of the torso outline at shoulder height. Leave visible space between the cocked glove and his head. Keep his eyes and hips aimed left and let his stern face and mustache show beside the guard glove. The silhouette should read immediately as one glove guarding forward and one drawn far back to strike.

Match the semi-realistic comic painting, visible brushwork, slightly exaggerated proportions, believable materials, and hard sports broadcast lighting of the references. Fit the whole figure on a true transparent 1024 × 1536 PNG canvas, with character height matching the idle and the lowest sole about 5% above the bottom. Keep open areas fully transparent, with no floor, shadow, lettering, logos, watermarks, or effect lines.

Input images:
1. assets/char/gregor/idle.png — exact character identity, costume, proportions, and scale.
2. assets/char/gregor/attack_high.png — facial features, gloves, and left-facing attack orientation.
3. assets/char/gregor/stun.png — unobstructed face, shaved head, mustache, and anatomy.
4. assets/char/gwak/telegraph_high.png — painted style and exaggerated rear-arm wind-up silhouette.
5. style-reference-sheet.png — assets/char/ajeossi/idle.png, assets/char/gwak/stun.png, and assets/bg/dong_gym.jpg for brushwork, materials, and lighting only.
```

## `assets/char/helmet/retreat.png`

```text
Edit the first sprite as the exact same full-body The Helmet. Preserve the three-quarter rear running pose, empty pumping hands, and wind-swept robe. His back stays toward the viewer as his torso, hips, and boots flee toward screen right. Only his helmet turns back toward screen left, with the intact opaque black visor visible. Match the gold full-face helmet, white gold-trimmed robe, and white gold-trimmed boots to references 2 and 3.

Replace the visible brown waist band with the large blank gold championship belt in references 2 and 3. Show the same hammered gold center medallion with its raised laurel border foreshortened around the forward hip. Wrap broad hammered gold side plates across the visible waist so the belt reads clearly as gold in this rear view. Keep the belt fitted to the running figure and leave all plates free of lettering and logos.

Match the references' semi-realistic comic painting, visible brushwork, believable materials, and hard sports broadcast lighting. Fit the entire figure in a true transparent 1024 × 1536 portrait PNG, close to idle height with the lowest boot sole about 5% above the bottom. Keep open areas fully transparent, with no floor, shadow, text, watermarks, or effect lines.

Input images:
1. assets/char/helmet/retreat.png — exact rear running pose, viewpoint, empty hands, and silhouette to preserve.
2. assets/char/helmet/idle.png — exact character, gold championship belt, helmet and visor, white robe, boots, and scale.
3. assets/char/helmet/telegraph_high.png — gold championship belt, helmet and visor, and white robe continuity.
4. assets/char/gwak/telegraph_high.png — painted anatomy and brushwork only.
5. style-reference-sheet.png — assets/char/ajeossi/idle.png, assets/char/gwak/stun.png, and assets/bg/dong_gym.jpg for brushwork, materials, and lighting only.
```
