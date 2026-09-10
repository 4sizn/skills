# SDLC Waterfall Core

전역 SDLC 폭포수 운영 규약과 단계 명령의 정본입니다.

## 구성

```text
sdlc/
├── SKILL.md                 # 공통 규약: 게이트·산출물·frontmatter·상태판
├── commands/                # 9개 단계 명령 정의
│   ├── requirements.md
│   ├── plan.md
│   ├── design.md
│   ├── implement.md
│   ├── review.md
│   ├── test.md
│   ├── defect.md
│   ├── deploy.md
│   └── status.md
├── templates/               # 단계별 산출물 템플릿
└── docs/
    └── sdlc-waterfall-flow.html  # MermaidJS 기반 흐름·게이트 UI 문서
```

## 단계 흐름

```text
requirements → plan → design → implement → test → deploy
                     ↘ review / defect (횡단)
                     ↘ status (조회 전용)
```

- 산출물은 대상 저장소의 `docs/sdlc/` 아래에 둡니다.
- 다음 단계 진입에는 이전 단계 문서의 `status: approved`가 필요합니다.
- `approved` 전환은 사용자의 명시적 승인 후에만 수행합니다.
- 구현에는 SDLC 게이트와 프로젝트 로컬 `AGENTS.md`/`CLAUDE.md` 착수 게이트가 모두 적용됩니다.
- agent는 자동 commit, push, merge, deploy를 하지 않습니다.

## 설치

```bash
cp -R sdlc ~/.codex/skills/      # Codex
cp -R sdlc ~/.agents/skills/     # 공유 경로
cp -R sdlc ~/.claude/skills/     # Claude Code
```

## 이력

초기 버전은 기존 global `sdlc-waterfall` skill, `~/.claude/commands/sdlc/`, 그리고 해당 템플릿을 이관했습니다. 이후 이 저장소의 `sdlc/`를 정본으로 유지합니다.
