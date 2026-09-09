# Visual E2E Proof

사용자 가시 결과물을 만들거나 변경한 작업이 실제 화면에서도 완료됐는지 증명하는 스킬입니다.

## 완료 판정 조건

다음 네 조건을 모두 충족해야 시각 검증 완료로 판정합니다.

1. 최종 사용자가 접하는 실행·렌더링 환경에서 캡처
2. 에이전트가 캡처 이미지를 직접 열어 자체 검증
3. 검증된 이미지를 채팅에 인라인 표시
4. 같은 이미지를 운영체제의 기본 미리보기 앱으로 표시

## 지원 대상

웹, 모바일, 데스크톱, 게임, 터미널 UI, 문서, PDF, 슬라이드, 스프레드시트와 정적 디자인을 지원합니다. 환경별 세부 절차는 [`references/`](references/)에서 필요한 문서만 읽도록 구성되어 있습니다.

## 구성

```text
visual-e2e-proof/
├── SKILL.md
└── references/
    ├── web.md               # 브라우저·웹앱
    ├── apps.md              # 모바일·데스크톱 앱
    ├── rendered-artifacts.md # 문서, PDF, 슬라이드, 스프레드시트
    └── godot.md             # Godot 게임
```

## 설치

```bash
cp -R visual-e2e-proof ~/.codex/skills/      # Codex
cp -R visual-e2e-proof ~/.agents/skills/     # 공유 경로
cp -R visual-e2e-proof ~/.claude/skills/     # Claude Code
```
