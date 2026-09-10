---
description: 리뷰 — 코드·설계·산출물을 다축으로 검토하고 reviews/에 판정과 지적 사항을 남긴다. 어느 시점에나 진입 가능.
argument-hint: [대상: 브랜치 | PR | 파일 | 산출물]
---

# /sdlc:review — SDLC 리뷰

`$ARGUMENTS`

## 0. 규약 로드

`sdlc-waterfall` 스킬을 Skill 도구로 로드한다.

## 1. 게이트

**없다.** 리뷰는 횡단 단계로 어느 시점에나 진입한다.

## 2. 대상 판별

인자에서 리뷰 종류와 대상을 정한다. 불명확하면 **추측하지 말고 사용자에게 묻는다.**

| 종류 | 대상 | 위임 |
|------|------|------|
| 코드 | 브랜치·PR·변경 diff·파일 | `code-review` 스킬 또는 `agent-skills:code-reviewer` |
| 코드 (보안 초점) | 동일 | `agent-skills:security-auditor` |
| 코드 (React 성능) | 동일 | `vercel:react-best-practices` |
| 설계 | `design.md` | `clean-architect` 에이전트 |
| 산출물 | `requirements.md` 등 SDLC 문서 | 직접 — 완결성·추적성·판정 가능성 검토 |

**이 커맨드는 리뷰 로직을 재구현하지 않는다.** 위 자산에 위임하고 결과를 산출물로 정리한다.

## 3. 검증 축

코드 리뷰는 다섯 축을 모두 본다. 한 축만 보고 PASS를 내지 않는다.

| 축 | 보는 것 |
|----|--------|
| 정확성 | 요구사항·수용 기준 충족. 경계값·에러 경로 |
| 가독성 | 주변 코드와 일관된 명명·주석 밀도·관용구 |
| 구조 | FSD 경계, 의존 방향, 모듈 책임, `@rvs/common` 읽기 전용 정책 |
| 보안 | 입력 검증, 권한, 비밀정보 노출 |
| 성능 | 불필요한 렌더·네트워크·번들 증가 |

RVS 2.0에서는 `repos/rvs-apps/.agents/rules/`의 규칙과 `docs/guides/monorepo-contract.md` 계약을 교차 검증한다.

## 4. 판정

**PASS / CONDITIONAL PASS / FAIL** 중 하나를 낸다. 판단을 흐리지 않는다.

지적 사항에는 심각도를 붙인다.

- `blocker` — 머지 불가. 동작이 틀렸거나 보안·데이터 손상 위험
- `major` — 머지 전 수정. 규칙 위반·유지보수성 훼손
- `minor` — 후속 처리 가능

각 지적에 **왜 문제인지**를 함께 적는다. "이렇게 하는 게 낫다"만 적으면 판단 근거가 사라진다.

## 5. 작성

`templates/review.md.tmpl`에서 출발해 `reviews/<YYYYMMDD>-<주제>.md`로 저장한다.

지적이 **제품 결함**이면 Redmine 이슈로 올리고 `/sdlc:defect` 로 처리한다. 리뷰 문서 안에서만 관리하면 추적이 끊긴다.

`overview.md`의 미해결 섹션에 열린 지적 건수를 반영한다.

## 6. 마무리

```
리뷰 완료 — reviews/<파일>
  판정: {PASS | CONDITIONAL PASS | FAIL}
  blocker N · major N · minor N
  → 결함 승격 대상 N건
```

규약의 완료 보고 규격을 따른다 (RVS는 4블록).
