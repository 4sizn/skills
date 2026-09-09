# Skills

여러 프로젝트와 에이전트 환경에서 재사용할 수 있는 스킬 모음입니다.

## 스킬 목록

| 스킬 | 설명 |
|---|---|
| [`sdlc`](sdlc/SKILL.md) | 요구사항부터 배포까지 승인 게이트와 정형 산출물을 사용하는 SDLC 폭포수 운영 규약 |
| [`visual-e2e-proof`](visual-e2e-proof/SKILL.md) | 사용자에게 보이는 결과물을 실제 실행 환경에서 캡처하고 채팅과 OS 미리보기 양쪽에 증거로 표시하는 완료 검증 |

각 스킬의 상세 규약, 구성, 흐름은 스킬 폴더의 README에서 설명합니다.

- [`sdlc/README.md`](sdlc/README.md)
- [`visual-e2e-proof/README.md`](visual-e2e-proof/README.md)

## 설치

저장소를 복제한 뒤 필요한 스킬 폴더만 에이전트의 스킬 경로로 복사합니다.

```bash
git clone https://github.com/4sizn/skills.git
```

Codex 기본 경로:

```bash
mkdir -p ~/.codex/skills
cp -R skills/sdlc ~/.codex/skills/
cp -R skills/visual-e2e-proof ~/.codex/skills/
```

`~/.agents/skills`를 공유 경로로 사용하는 환경:

```bash
mkdir -p ~/.agents/skills
cp -R skills/sdlc ~/.agents/skills/
cp -R skills/visual-e2e-proof ~/.agents/skills/
```

설치 후 에이전트 환경을 다시 시작하거나 스킬 목록을 새로고침하세요.

## 관련 문서

- [전역 필수 스킬 목록](docs/global-essential-skills.md) — 개발 머신에 전역(`~/.claude/skills/`)으로 설치해 두는 스킬 인벤토리
