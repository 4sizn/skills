---
description: 구현 — 설계 승인 + 프로젝트 로컬 착수 게이트를 통과한 뒤 코드 작업을 시작하고 implementation.md에 추적한다. 실행은 프로젝트 워크플로에 위임(RVS는 6-Phase).
argument-hint: [Redmine 이슈번호]
---

# /sdlc:implement — SDLC 구현

`$ARGUMENTS`

## 0. 규약 로드

`sdlc-waterfall` 스킬을 Skill 도구로 로드한다.

## 1. 게이트 — 두 개를 모두 통과해야 한다

### 게이트 A — SDLC 단계

**`design.md` · `status: approved`**

### 게이트 B — 프로젝트 로컬 착수 게이트

> [!warning] 게이트 A 통과는 게이트 B의 면제 사유가 아니다
> 설계 승인은 **SDLC 절차상의 승인**일 뿐이다. 코드를 고치기 전에 **그 프로젝트의 규칙 문서를 읽고** 거기서 요구하는 착수 조건을 별도로 통과한다.

먼저 읽는다: 저장소 루트의 `CLAUDE.md` / `AGENTS.md`, `.agents/rules/`, git 컨벤션 문서.

**RVS 2.0 workspace의 착수 8단계**

| # | 단계 | 확인 |
|---|------|------|
| 1 | Live Redmine issue 조회 | 캐시·기억 금지. subject·status·Fixed Version·Category |
| 2 | `wiki/ssot/redmine-solution-workflow.md` 읽기 | |
| 3 | 대상 솔루션 판별 | `wiki/ssot/solution-registry.md` |
| 4 | 대상 repo/branch/worktree 확인 | 레지스트리의 실제 브랜치명 |
| 5 | 유사·선행 작업 검색 | `wiki/solutions/<솔루션>/customizations.md`, git log |
| 6 | 목표·non-goal·제약·수용 기준 정리 | `design.md`·`requirements.md`에서 승계 — 같은 조회를 두 번 하지 않는다 |
| 7 | 승인 패킷 제시 | `repos/rvs-2.0-llm-wiki/templates/work-approval-packet.md.tmpl` |
| 8 | 사용자의 명시적 선택 | `제안된 작업 계획대로 진행` 또는 `scope 수정 후 진행` |

8단계에서 사용자가 직접 위 문구 중 하나를 말해야 한다. 침묵·이모지·"음"은 승인이 아니다. "진행", "ㄱㄱ"는 discovery 시작 승인일 뿐 코드 수정 승인이 아니다.

**작업 분류**를 6단계에서 함께 판정한다 — `common-addition` / `solution-derived` / `new-function`. 단일 솔루션의 요구만으로 공통화하지 않는다. 애매하면 `solution-derived`로 두고 사용자 확인을 받는다.

## 2. 작업 격리

프로젝트가 세션 격리를 요구하면 코드를 고치기 **전에** 격리 환경을 잡는다.

**RVS 2.0** — 공유 체크아웃(`repos/<repo>`)에서 브랜치를 전환하지 않는다. 다른 세션의 작업 트리가 통째로 바뀐다.

```bash
bash scripts/session-worktree.sh new apps work/solution_<솔루션>/redmine_<번호>_<topic> origin/solution_<솔루션>
```

출력된 경로로 `EnterWorktree(path: ...)` 진입한다. 손으로 `git worktree add`를 하지 않는다 — `rvs-common` 심링크·`.env.local`·`pnpm install`이 누락되어 `@rvs/common` 해석이 깨진다.

## 3. 실행 — 위임한다

**이 커맨드는 구현을 재구현하지 않는다.** 실제 실행은 기존 자산이 담당한다.

| 모드 | 위임 대상 |
|------|----------|
| RVS · Redmine 일감 기반 | `rvs-redmine-flow` 스킬의 6-Phase 사이클 (LOOKUP → ANALYZE → EXECUTE → REVIEW↔FIX → VALIDATE → SWEEP → CLOSE) |
| RVS · 일감 없는 작업 | `rvs-executor` 에이전트 + `rvs-code-reviewer` 검증 |
| 그 외 | `agent-skills:incremental-implementation` — 얇은 수직 슬라이스로 진행 |

게이트 B의 1·6단계 산출물은 6-Phase의 LOOKUP·ANALYZE **입력**으로 넘긴다. 같은 조회를 두 번 하지 않는다.

## 4. 추적

`templates/implementation.md.tmpl`에서 출발해 작성한다.

- 게이트 통과 기록(1절)을 실제 확인한 내용으로 채운다. **통과하지 않은 단계를 통과했다고 적지 않는다.**
- 설계와 다르게 구현한 부분은 5절에 이유와 함께 적는다. 설계서를 조용히 어기지 않는다. 차이가 크면 `design.md` 갱신 후 재승인을 받는다.
- 검증 블록에는 **실제로 실행한 명령과 결과만** 적는다.

`overview.md` 상태판의 구현 행을 갱신한다.

## 5. 마무리

```
구현 진행 — implementation.md 갱신
  완료 WBS N/M · 변경 파일 N개 · 설계 대비 변경 N건
  다음: /sdlc:review 또는 /sdlc:test
```

**커밋·push·Redmine 상태 변경은 사용자가 요청할 때만** 한다. 하네스는 자의적으로 커밋하지 않는다.

UI·화면·흐름이 바뀌었으면 완료 선언 전에 최종 상태 스크린샷을 캡처하고, Read로 자체 검증한 뒤 사용자에게 보여준다. 경로만 안내하는 것은 완료가 아니다.

규약의 완료 보고 규격을 따른다 (RVS는 4블록).
