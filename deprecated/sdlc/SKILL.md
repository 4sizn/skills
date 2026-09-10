---
name: sdlc-waterfall
description: SDLC 폭포수 프로젝트 운영의 공통 규약 — 산출물 위치, 단계 게이트 규칙, frontmatter 스키마, 상태판 갱신, 프로젝트 로컬 규칙 존중. /sdlc:requirements /sdlc:plan /sdlc:design /sdlc:implement /sdlc:review /sdlc:test /sdlc:defect /sdlc:deploy /sdlc:status 커맨드가 진입 직후 로드한다. 사용자가 직접 호출하는 스킬이 아니며, 이 스킬만 단독으로 읽고 작업을 진행하지 않는다.
---

# SDLC 폭포수 운영 규약

폭포수 SDLC 커맨드 9종이 공유하는 규약이다. 각 커맨드는 진입 직후 이 문서를 로드하고, 자기 단계 절차만 추가로 수행한다.

**이 규약은 프로젝트 중립이다.** 특정 저장소·문서 시스템에 종속되지 않는다.

## 1. 단계 모델

```
[순차 — 폭포수 본류]
요구사항 → 계획 → 설계 → 구현 → 테스트 → 배포

[횡단 — 임의 시점 진입]
리뷰 · 결함

[조회]
현황
```

| 커맨드 | 단계 | 산출물 | 실행 위임 |
|--------|------|--------|----------|
| `/sdlc:requirements` | Requirements | `requirements.md` | 이슈 트래커 live 조회 |
| `/sdlc:plan` | Planning | `plan.md` | — |
| `/sdlc:design` | Design | `design.md` | `design-doc-mermaid`, `clean-architect` |
| `/sdlc:implement` | Implementation | `implementation.md` | 프로젝트 구현 워크플로 (RVS: `rvs-redmine-flow`) |
| `/sdlc:review` | Review (횡단) | `reviews/<날짜>-<주제>.md` | `code-review`, `agent-skills:code-reviewer` |
| `/sdlc:test` | Testing | `test-plan.md`, `test-runs/<날짜>-<범위>.md` | 프로젝트 QA 자산 |
| `/sdlc:defect` | Defect (횡단) | `defects/<이슈-id>.md` | 이슈 live 조회 → 구현 워크플로 |
| `/sdlc:deploy` | Deployment | `releases/<버전>.md` | 프로젝트 릴리스 절차 |
| `/sdlc:status` | Status | 조회 전용 (쓰기 없음) | — |

**이 커맨드들은 얇은 게이트다.** 실행 자체를 재구현하지 않는다. 단계 진입 조건을 검사하고, 산출물을 쓰고, 실제 작업은 위임 대상에 넘긴다.

## 2. 산출물 위치

**세션을 연 저장소가 곧 대상 프로젝트다.**

```bash
git rev-parse --show-toplevel     # → <저장소 루트>
```

산출물 루트 = **`<저장소 루트>/docs/sdlc/`**

- git 저장소가 아니면 현재 작업 디렉토리 기준으로 같은 경로를 쓴다.
- 판별 결과를 사용자에게 한 줄로 알린다.
- 저장소를 잘못 짚으면 산출물이 엉뚱한 곳에 쌓인다. 세션 위치가 의도한 프로젝트인지 애매하면 **묻는다.**

> [!warning] git worktree 안에서 작업할 때
> 워크트리 루트가 나온다. 산출물은 그 브랜치에 커밋해야 남는다 — **커밋하지 않은 채 워크트리를 제거하면 사라진다.** 요구사항·계획·설계처럼 코드 작업 전에 만드는 산출물은 주 저장소에서 작성하는 편이 안전하다.

커밋은 **사용자가 요청할 때만** 한다. 자의적으로 커밋·push하지 않는다.

## 3. 디렉토리 배치

```
<저장소 루트>/docs/sdlc/
├── overview.md              # 개요 + 단계 상태판 ← `/sdlc:status` 가 읽는다
├── requirements.md
├── plan.md
├── design.md
├── implementation.md
├── test-plan.md
├── reviews/     <YYYYMMDD>-<주제>.md
├── defects/     <이슈-id>.md
├── test-runs/   <YYYYMMDD>-<범위>.md
└── releases/    <버전>.md
```

한 저장소에 폭포수 흐름은 **하나**다. 파일명은 영문 kebab-case, 내용은 한글로 쓴다.

## 4. 산출물 frontmatter

```yaml
---
title: <문서 제목>
stage: requirements | plan | design | implementation | test | deploy | review | defect
status: draft | review | approved      # 게이트 판정의 근거
created: YYYY-MM-DD
updated: YYYY-MM-DD
# --- 해당될 때만 ---
issue: ["#275123"]                     # 관련 이슈 (본문은 복제하지 않는다)
issue_checked: YYYY-MM-DD              # live 조회 날짜
solution: <slug>
repo: <레포명>
branch: <실제 브랜치명>
---
```

**`status`는 사람이 올린다.** agent가 자기 산출물을 `approved`로 바꾸지 않는다. 작성 직후는 항상 `draft`이며, 사용자가 승인 의사를 명시하면 그때 `approved`로 바꾸고 `updated`를 갱신한다.

> 프로젝트가 자체 frontmatter 스키마를 요구하면(예: 문서 저장소의 필수 필드) 그 스키마를 **추가로** 만족시킨다.

## 5. 게이트 규칙

| 진입 커맨드 | 필요 조건 |
|------------|----------|
| `/sdlc:requirements` | 없음 (시작점) |
| `/sdlc:plan` | `requirements.md` · `status: approved` |
| `/sdlc:design` | `plan.md` · `status: approved` |
| `/sdlc:implement` | `design.md` · `status: approved` **+ 프로젝트 로컬 착수 게이트**(6절) |
| `/sdlc:test` | `implementation.md` 존재 |
| `/sdlc:deploy` | `test-plan.md` approved + `test-runs/`에 PASS 결과 1건 이상 |
| `/sdlc:review` | 없음 (횡단) |
| `/sdlc:defect` | 이슈 ID 필수 (횡단) |
| `/sdlc:status` | 없음 |

### 게이트 위반 시

**차단한다.** 무엇이 없는지, 어느 파일의 어떤 상태가 문제인지 구체적으로 보고하고 멈춘다. 조용히 진행하지 않는다.

```
게이트 미통과 — /sdlc:design 진입 불가
  필요: plan.md status: approved
  실제: plan.md status: draft (updated 2026-08-10)
  → 계획서를 검토하고 승인하시거나, `게이트 생략 후 진행`이라고 알려주세요.
```

사용자가 **`게이트 생략 후 진행`**이라고 명시하면 통과시키되, 해당 단계 산출물에 생략 사실을 기록한다.

```markdown
> [!warning] 게이트 생략
> 2026-08-10 사용자 지시로 `plan.md` 승인 없이 설계 단계에 진입했다.
```

## 6. 프로젝트 로컬 규칙이 우선한다

> [!warning] 이 규약은 프로젝트 규칙을 대체하지 않는다
> 코드에 닿는 단계(`/sdlc:implement`·`/sdlc:defect`)에 들어가기 전에 **그 프로젝트의 규칙 문서를 먼저 읽는다** — `CLAUDE.md`, `AGENTS.md`, `.agents/rules/`, `docs/` 하위 계약 문서. SDLC 단계 게이트를 통과한 것이 프로젝트 착수 게이트의 면제 사유가 아니다. **둘 다** 통과해야 코드를 고친다.

프로젝트마다 확인할 것:

| 항목 | 어디서 |
|------|--------|
| 코드 수정 착수 조건 | 루트 `CLAUDE.md` / `AGENTS.md` |
| 브랜치·커밋 규칙 | git 컨벤션 문서 |
| 세션 격리 요구 (워크트리 등) | 오케스트레이션 문서 |
| 검증 명령 | 빌드·테스트 계약 문서 |
| 완료 보고 규격 | 보고 규격 문서 |

### 예 — RVS 2.0 workspace

이 프로젝트에서 `/sdlc:implement`·`/sdlc:defect` 는 **Redmine 착수 8단계**를 추가로 통과해야 한다.

1. Live Redmine issue 확인 (기억·캐시 금지)
2. `repos/rvs-2.0-llm-wiki/wiki/ssot/redmine-solution-workflow.md` 읽기
3. 대상 솔루션 판별 (`wiki/ssot/solution-registry.md`)
4. 대상 repo/branch/worktree 확인
5. 같은 솔루션 범위 유사 작업 검색
6. 목표·non-goal·제약·수용 기준 정리
7. 승인 패킷 제시 (`templates/work-approval-packet.md.tmpl`)
8. 사용자의 명시적 선택 — `제안된 작업 계획대로 진행` 또는 `scope 수정 후 진행`

또한 파일을 수정하는 세션은 공유 체크아웃에서 브랜치를 전환하지 않고 워크트리를 잡는다.

```bash
bash scripts/session-worktree.sh new apps <work-branch> [<base-ref>]
```

## 7. 상태판 갱신

모든 쓰기 커맨드는 작업 후 `overview.md`의 상태판을 갱신한다. `/sdlc:status` 는 이 표를 읽는다.

```markdown
## 단계 상태판

| 단계 | 산출물 | status | updated | 비고 |
|------|--------|--------|---------|------|
| 요구사항 | requirements.md | approved | 2026-08-10 | |
| 계획 | plan.md | draft | 2026-08-10 | 일정 미확정 |
| 설계 | — | — | — | 계획 승인 대기로 블록 |
| 구현 | — | — | — | |
| 테스트 | — | — | — | |
| 배포 | — | — | — | |

## 미해결
- 결함 3건 open (`defects/`)
- 리뷰 지적 2건 미반영
```

상태판과 실제 파일이 어긋나면 **파일이 정본**이다. `/sdlc:status` 는 파일을 직접 확인해 상태판을 교정한다.

## 8. 이슈 트래커 취급

이슈 트래커(Redmine·Jira·GitHub Issues 등)를 쓰는 프로젝트에서:

- **트래커가 이슈 사실의 SSOT다.** 이슈 본문·댓글·수락 기준을 산출물에 **복제하지 않는다.** 링크 + 판정 + 반영 결과만 적는다.
- 이슈 사실이 필요하면 그 시점에 **live 조회**한다. 기억·이전 세션 요약을 사실로 쓰지 않는다. `issue_checked`에 조회 날짜를 적는다.
- 트래커 **쓰기**(상태 변경·코멘트)는 초안만 만들고 **사용자 승인 후** 반영한다.

RVS 2.0에서는 Redmine이 SSOT이며, `mcp__redmine__redmine_request` 또는 다음 명령을 쓴다. 이슈 본문·작업 노트 서식은 `rsupport-redmine-skill`을 따른다.

```bash
source .env
curl -s -H "X-Redmine-API-Key: $REDMINE_API_KEY" \
  "$REDMINE_URL/issues/{id}.json?include=journals,attachments" | python3 -m json.tool
```

## 9. 완료 보고

프로젝트가 완료 보고 규격을 정의하면 **그것을 따른다.**

RVS 2.0 workspace는 4블록을 요구한다 (`wiki/ssot/agent-completion-reporting.md`). 쓰지 않은 블록은 지우지 말고 `사용 안 함`으로 남긴다.

```markdown
## 협의/동원한 agent
## 사용한 skill
## 산출물
## 검증
```

규격이 없는 프로젝트에서도 **`검증` 블록에는 실제로 실행한 것만 적는다.** 실행하지 않은 것을 "통과 예상"으로 적지 않는다.

## 10. 템플릿

산출물은 이 스킬의 템플릿에서 출발한다. 자기 단계 템플릿만 읽는다.

| 단계 | 템플릿 |
|------|--------|
| 개요 | `templates/overview.md.tmpl` |
| 요구사항 | `templates/requirements.md.tmpl` |
| 계획 | `templates/plan.md.tmpl` |
| 설계 | `templates/design.md.tmpl` |
| 구현 | `templates/implementation.md.tmpl` |
| 리뷰 | `templates/review.md.tmpl` |
| 테스트 (계획) | `templates/test-plan.md.tmpl` |
| 테스트 (실행 결과) | `templates/test-run.md.tmpl` |
| 결함 | `templates/defect.md.tmpl` |
| 배포 | `templates/release.md.tmpl` |
