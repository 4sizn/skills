---
description: 설계 — 구조·인터페이스·데이터 흐름·설계 결정을 담은 design.md를 만든다. 계획 승인이 선행 조건.
argument-hint: (인자 없음)
---

# /sdlc:design — SDLC 설계

`$ARGUMENTS`

## 0. 규약 로드

`sdlc-waterfall` 스킬을 Skill 도구로 로드한다.

## 1. 게이트

**`plan.md` · `status: approved`**

미통과 시 차단하고 멈춘다.

## 2. 절차

### 2-1. 입력 읽기

`requirements.md`(수용 기준)와 `plan.md`(WBS)를 읽는다.

### 2-2. 코드베이스 확인

**기존 구조를 먼저 읽는다.** 설계는 빈 종이에서 시작하지 않는다.

RVS 2.0에서 확인할 것:

| 대상 | 목적 |
|------|------|
| `repos/rvs-apps/docs/guides/monorepo-contract.md` | 의존 방향·검증 계약·`@rvs/common` 소비 방식 |
| `repos/rvs-apps/.agents/rules/` | 코딩 규칙 |
| `repos/rvs-apps/.agents/skills/remotevs-v2/references/` | MQTT·프로토콜·인증 흐름 |
| `wiki/solutions/<slug>/AGENTS.md` | 솔루션 금지선 |
| 실제 관련 소스 파일 | 현재 구조 |

### 2-3. 설계

구조가 복잡하거나 판단이 갈리면 위임한다.

| 상황 | 위임 대상 |
|------|----------|
| 계층·의존 방향·모듈 경계 판단 | `clean-architect` 에이전트 |
| 다이어그램 작성 | `design-doc-mermaid` 스킬 |

다이어그램은 **실제 동작 메커니즘**을 그린다. 박스와 화살표만 있는 장식용 그림은 그리지 않는다.

### 2-4. 반드시 확인할 것

- **`@rvs/common` 변경이 필요한가?** 필요하면 별도 레포·별도 PR로 분리한다. `rvs-apps`에서 고치지 않는다.
- **FSD 경계를 넘는가?** host/viewer는 슬라이스 경계를 지킨다.
- **admin에 host/viewer 패턴을 이식하려 하는가?** 하지 않는다. admin은 antd/Recoil 기존 패턴을 유지한다.
- **요구사항 추적표에 빈 칸이 있는가?** 있으면 설계가 덜 된 것이다.

### 2-5. 설계 결정 기록

채택안뿐 아니라 **버린 대안과 그 이유**를 적는다. 나중에 되돌릴 때 이 칸을 읽는다.

### 2-6. 작성 · 상태판 갱신

`templates/design.md.tmpl`에서 출발한다. `overview.md` 상태판의 설계 행을 갱신한다.

## 3. 마무리

`status: draft`로 저장하고 보고한다.

```
design.md 작성 완료 (status: draft)
  컴포넌트 N개 · 설계 결정 N건 · 미추적 요구사항 N건
  검토 후 승인하시면 /sdlc:implement 으로 진행합니다.
```

> `/sdlc:implement` 는 설계 승인만으로 시작되지 않는다. Redmine 착수 게이트 8단계를 추가로 통과해야 한다.

규약의 완료 보고 규격을 따른다 (RVS는 4블록).
