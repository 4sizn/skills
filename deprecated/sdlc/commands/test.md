---
description: 테스트 — 테스트 계획(test-plan.md)을 세우거나 실행 결과(test-runs/)를 기록한다. 수용 기준 커버리지를 추적.
argument-hint: [계획 | 실행] [범위]
---

# /sdlc:test — SDLC 테스트

`$ARGUMENTS`

## 0. 규약 로드

`sdlc-waterfall` 스킬을 Skill 도구로 로드한다.

## 1. 게이트

**`implementation.md` 존재.** 없으면 계획 수립만 허용하고 실행은 차단한다 (테스트할 것이 아직 없다).

## 2. 모드 판별

인자에 `계획`/`실행`이 있으면 그것을 따른다. 없으면:

- `test-plan.md`가 없다 → **계획 모드**
- 있고 `status: approved` → **실행 모드**
- 있고 `draft` → 계획을 마저 다듬을지 실행할지 사용자에게 묻는다

---

## 3. 계획 모드

### 3-1. 입력

`requirements.md`의 **수용 기준**과 `design.md`의 영향 범위를 읽는다. 테스트 케이스는 수용 기준에서 나온다.

### 3-2. 케이스 설계

- **모든 수용 기준에 최소 1개의 TC를 대응**시킨다. 커버리지 표의 빈 칸은 "검증되지 않음"을 뜻한다.
- 각 TC는 사전 조건·절차·기대 결과를 **관찰 가능한 형태**로 적는다. "정상 동작"은 기대 결과가 아니다.
- 정상 경로만 만들지 않는다. 경계값·실패 경로·권한 없는 접근을 포함한다.
- 자동화 가능 여부를 판정한다. RVS 2.0에서는 `rvs-playwright` 스킬의 자산·규칙을 따른다.

### 3-3. 작성

`templates/test-plan.md.tmpl`에서 출발한다. `status: draft`로 저장한다.

---

## 4. 실행 모드

### 4-1. 위임

| 상황 | 위임 대상 |
|------|----------|
| RVS · 코드 변경 없는 순수 검증 | `rvs-2-0-qa` 에이전트 (격리 워크트리, 소스 미편집이 계약) |
| RVS · Playwright 시나리오 | `rvs-playwright` 스킬 |
| RVS · 수용 기준 자동 검증 | `rvs-acceptance-verify` 스킬 |
| 일반 | `agent-skills:test-engineer` |

**검증 워커에 위임할 때 소스 편집 권한을 주지 않는다.** 테스트가 실패하면 고치는 것은 별도 단계다.

### 4-2. 게이트 실행

```bash
pnpm type:check && pnpm lint && pnpm format:check && pnpm build
```

`type:check`/`build` 실패 시 `rvs-common` 빌드 상태를 먼저 의심한다 (`pnpm --dir ../rvs-common build`).

### 4-3. 기록

`templates/test-run.md.tmpl`에서 출발해 `test-runs/<YYYYMMDD>-<범위>.md`로 저장한다.

- **실제로 실행한 것만 적는다.** 미실행은 `미실행`과 이유를 적는다. "통과 예상"을 PASS로 적지 않는다.
- SKIP은 이유를 반드시 적는다. 이유 없는 SKIP은 FAIL로 취급한다.
- 실패는 출력과 함께 실패로 적는다. 숨기지 않는다.
- UI 변경이면 최종 상태 스크린샷을 캡처하고, **Read로 자체 검증한 뒤** 사용자에게 보여준다. `visual-e2e-proof` 스킬이 있으면 그 절차를 따른다.

### 4-4. 결함 등록

FAIL 케이스는 Redmine 이슈로 등록하고 `/sdlc:defect` 로 처리한다. 등록은 **사용자 승인 후**에 한다.

---

## 5. 마무리

`overview.md` 상태판의 테스트 행을 갱신한다.

```
테스트 {계획 | 실행} 완료
  TC N건 · 미커버 수용 기준 N건            (계획)
  PASS N / FAIL N / SKIP N · 발견 결함 N건  (실행)
```

규약의 완료 보고 규격을 따른다 (RVS는 4블록).
