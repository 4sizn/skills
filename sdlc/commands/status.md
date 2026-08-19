---
description: 현황 — 지금 어느 단계이고 무엇이 막혀 있는지 보여준다. 읽기 전용.
argument-hint: (인자 없음)
---

# /sdlc:status — SDLC 진행 현황

`$ARGUMENTS`

## 0. 규약 로드

`sdlc-waterfall` 스킬을 Skill 도구로 로드한다.

## 1. 게이트

**없다.** 이 커맨드는 **읽기 전용**이다 — 산출물을 만들거나 상태를 바꾸지 않는다.

예외: `overview.md` 상태판이 실제 파일과 어긋나면 상태판을 교정한다. **파일이 정본이다.**

## 2. 절차

### 2-1. 대상 확정

`git rev-parse --show-toplevel`로 산출물 루트(`<저장소 루트>/docs/sdlc/`)를 정한다.

`docs/sdlc/`가 없으면 **아직 시작되지 않은 것**이다 — `/sdlc:requirements` 로 시작하라고 안내하고 멈춘다.

### 2-2. 실제 상태 수집

`overview.md`의 상태판을 믿지 말고 **파일을 직접 확인**한다.

| 확인 | 방법 |
|------|------|
| 각 단계 산출물 존재·`status`·`updated` | 산출물 frontmatter 읽기 |
| 열린 결함 | `defects/` — Redmine 상태는 **live 조회**로 확인 |
| 미반영 리뷰 지적 | `reviews/` — `status: open`인 항목 |
| 최근 테스트 결과 | `test-runs/` 중 가장 최근 |
| 코드 작업 상태 | `git status`, `git branch --show-current` (RVS: `bash scripts/session-worktree.sh list`) |

`issue_checked`가 오래된 산출물은 그 사실을 표시한다 — 그 문서의 이슈 관련 서술은 신뢰하지 않는다.

### 2-3. 다음 진입 가능 단계 판정

규약의 게이트 테이블로 지금 무엇을 할 수 있는지 판정한다. 막혀 있으면 **무엇 때문에 막혔는지** 구체적으로 짚는다.

## 3. 출력

```
산출물 루트: <저장소 루트>/docs/sdlc/

단계        산출물              status     updated      비고
─────────────────────────────────────────────────────────────
요구사항    requirements.md     approved   2026-08-10
계획        plan.md             draft      2026-08-10   승인 대기
설계        —                   —          —            계획 승인으로 블록
구현        —                   —          —
테스트      —                   —          —
배포        —                   —          —

미해결
  결함  2건 open   (#275123 major, #275140 minor)
  리뷰  1건 미반영 (reviews/20260810-auth.md)

지금 가능한 것
  ✅ /sdlc:review    plan.md 검토
  ✅ /sdlc:defect    #275123 처리
  ⛔ /sdlc:design    plan.md 승인 필요
  ⛔ /sdlc:implement    설계 미작성

이슈 조회 시점: 2026-08-10 (requirements.md는 2026-08-01 — 재확인 권장)
```

## 4. 마무리

읽기 전용이므로 산출물이 없다. 규약의 완료 보고에서 `산출물`은 `없음 (조회 전용)`으로 적고, `검증`에는 실제로 확인한 경로·명령을 적는다.
