---
description: 결함 — 이슈로 접수된 결함을 재현·원인분석·수정·회귀방지까지 처리한다. 예: /sdlc:defect 275123
argument-hint: <Redmine 이슈번호 또는 URL>
---

# /sdlc:defect — SDLC 결함 관리

`$ARGUMENTS`

## 0. 규약 로드

`sdlc-waterfall` 스킬을 Skill 도구로 로드한다.

## 1. 게이트

**이슈 ID가 필수다.** 인자에서 번호 또는 URL을 추출한다 (RVS 2.0은 Redmine 일감 번호).

없으면 멈추고 요청한다 — 결함은 추적 가능한 접수 창구가 있어야 관리된다. 사용자가 "일감 없이 우선 조사만"이라고 명시하면 조사까지만 하고 산출물에 `트래커 미등록`을 기록한다.

## 2. 절차

### 2-1. Live 조회

```
mcp__redmine__redmine_request GET /issues/{번호}.json?include=journals,attachments
```

MCP를 못 쓰면 규약의 이슈 트래커 조회 명령을 쓴다. **기억·캐시·이전 세션 요약을 사실로 쓰지 않는다.** `issue_checked`에 조회 날짜를 적는다.

조회 결과에서 확인할 것: subject, 상태, 심각도/우선순위, Fixed Version, Category, 보고자, 첨부(재현 영상·스크린샷·로그).

첨부에 동영상이 있으면 `video-analyst` 스킬로 실제 내용을 확인한다. 이미지는 Read로 직접 본다.

### 2-2. 재현

> [!warning] 재현 없이 코드를 고치지 않는다
> 재현되지 않은 결함의 "원인"은 추측이다. 추측으로 고치면 진짜 원인은 남고 코드만 바뀐다.

- 환경·계정·데이터 조건을 좁힌다.
- 재현율을 기록한다 (항상 / 간헐 N회 중 M회 / 미재현).
- **미재현이면 여기서 멈춘다.** 좁히지 못한 조건을 적고 보고자에게 추가 정보를 요청한다. 진행을 강행하지 않는다.

### 2-3. 원인 분석

| 층 | 적을 것 |
|----|--------|
| 직접 원인 | 어느 코드의 무엇이 잘못되었는가 (`file:line`) |
| 근본 원인 | 왜 그 코드가 그렇게 되었는가 — 설계 누락? 규칙 부재? 회귀? |
| 혼입 시점 | 커밋 SHA 또는 릴리스. 파악 불가면 `미상` |

`git log -S`·`git bisect`로 혼입 시점을 좁힌다. 인과 추적이 복잡하면 `tracer` 에이전트 또는 `systematic-debugging` 스킬에 위임한다.

### 2-4. 영향 범위

**같은 원인으로 다른 곳도 깨지는지 확인한다.** 한 군데만 고치고 끝내면 같은 결함이 다른 경로로 재발한다. 다른 솔루션·다른 앱에 같은 패턴이 있는지 검색한다.

### 2-5. 착수 게이트 — product code를 고치기 전

**프로젝트 로컬 규칙**(`CLAUDE.md`/`AGENTS.md`)의 착수 조건을 통과한다. 결함 수정이라는 이유로 면제되지 않는다.

**RVS 2.0 workspace** — `/sdlc:implement`과 동일한 8단계:

1. Live Redmine 조회 (2-1에서 완료)
2. `wiki/ssot/redmine-solution-workflow.md` 읽기
3. 대상 솔루션 판별 (`wiki/ssot/solution-registry.md`)
4. 대상 repo/branch/worktree 확인
5. 유사·선행 작업 검색 — **같은 결함이 이미 고쳐졌는지** 확인
6. 목표·non-goal·제약·수용 기준 정리
7. 승인 패킷 제시
8. 사용자의 명시적 선택 — `제안된 작업 계획대로 진행` / `scope 수정 후 진행`

승인 후 세션 워크트리를 잡는다.

```bash
bash scripts/session-worktree.sh new apps work/solution_<솔루션>/redmine_<번호>_<topic> origin/solution_<솔루션>
```

### 2-6. 수정 — 위임

| 프로젝트 | 위임 대상 |
|---------|----------|
| RVS 2.0 | `rvs-redmine-flow` 6-Phase 사이클 |
| 그 외 | `agent-skills:debugging-and-error-recovery` |

임시방편·우회로 덮지 않는다. 근본 원인을 고친다. 근본 수정이 이번 범위를 넘으면 **그 사실을 명시하고** 임시 조치임을 산출물과 Redmine 초안에 적는다.

### 2-7. 회귀 방지

> [!warning] 재현 테스트 없이 결함을 닫지 않는다
> 수정 **전에 실패하고** 수정 **후에 통과하는** 테스트를 추가한다. 이 순서를 확인하지 않은 테스트는 회귀를 못 막는다.

자동화가 불가능하면 이유와 수동 검증 절차를 적는다.

같은 실수를 구조적으로 막을 규칙이 필요하면 `.agents/rules/` 추가를 제안한다.

## 3. 작성

`templates/defect.md.tmpl`에서 출발해 `defects/redmine-<번호>.md`로 저장한다.

이슈 본문·댓글을 복제하지 않는다. 링크 + 판정 + 원인 + 반영 결과만 적는다.

`overview.md`의 미해결 섹션에서 열린 결함 수를 갱신한다.

## 4. Redmine 업데이트

**초안만 만든다.** `rsupport-redmine-skill`의 Human-first Textile 형식(원인 → 해결방안 → 결론 → 테스트 → 참조)을 따른다.

사용자 승인 전에 API로 쓰지 않는다. 상태 변경도 마찬가지다.

## 5. 마무리

```
결함 처리 — defects/redmine-<번호>.md
  재현: {항상 | 간헐 | 미재현} · 근본 원인: {요약}
  수정: N파일 · 회귀 테스트: {추가됨 | 없음(이유)}
  Redmine 업데이트 초안 작성 — 승인 후 반영
```

UI에 보이는 결함이었으면 수정 후 최종 상태 스크린샷을 캡처해 Read로 검증하고 사용자에게 보여준다.

규약의 완료 보고 규격을 따른다 (RVS는 4블록).
