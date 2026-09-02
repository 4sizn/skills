# Visual E2E Proof 공개 설계

## 목표

범용화한 `visual-e2e-proof` 스킬을 `4sizn/skills` 저장소에 재사용 가능한 독립 스킬로 추가하고, 루트 README를 여러 스킬을 발견하고 설치할 수 있는 카탈로그로 개편한다.

## 저장소 구조

`visual-e2e-proof/`를 기존 `sdlc/`와 같은 루트 수준에 둔다. 공통 완료 계약과 라우팅은 `SKILL.md`에 두고, 환경별 캡처 지침은 `references/`에서 필요할 때만 읽도록 유지한다.

```text
visual-e2e-proof/
├── SKILL.md
└── references/
    ├── web.md
    ├── apps.md
    ├── rendered-artifacts.md
    └── godot.md
```

## README

루트 제목을 `Skills`로 바꾸고 저장소 목적, 스킬 카탈로그, 설치 방법, 각 스킬의 구성과 핵심 특징을 안내한다. 기존 SDLC 규약 설명은 보존하되 저장소 전체 설명이 아닌 `sdlc` 항목 아래로 재배치한다. `visual-e2e-proof`에는 최종 사용자 표면 캡처, 에이전트 자체 검증, 채팅 인라인 표시, OS 미리보기 표시의 네 단계 완료 계약을 설명한다.

## 배포 방식

- 브랜치: `codex/add-visual-e2e-proof`
- 변경을 검증한 뒤 하나의 기능 커밋으로 기록한다.
- 원격 브랜치에 푸시하고 `main` 대상 PR을 생성한다.

## 검증

- 공식 `quick_validate.py`로 새 스킬 구조와 frontmatter를 검사한다.
- 특정 사용자명, 로컬 저장소와 절대경로가 포함되지 않았는지 검색한다.
- README의 상대 링크와 참조 문서가 모두 존재하는지 확인한다.
- PR 생성 후 실제 GitHub 웹페이지에서 변경된 README와 스킬 링크가 보이는지 캡처한다.
- 캡처를 직접 검사한 후 채팅과 macOS Preview 양쪽에 표시한다.
