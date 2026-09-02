# Publish Visual E2E Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the portable `visual-e2e-proof` skill in `4sizn/skills`, document both repository skills, and open a verified pull request.

**Architecture:** Copy the already validated skill package into a new root-level directory beside `sdlc/`. Turn the root README into a small catalog with installation instructions, then validate locally and verify the pushed result on GitHub's rendered web UI.

**Tech Stack:** Markdown, YAML frontmatter, Git, GitHub CLI, Chromium via agent-browser

---

### Task 1: Add the skill package

**Files:**
- Create: `visual-e2e-proof/SKILL.md`
- Create: `visual-e2e-proof/references/web.md`
- Create: `visual-e2e-proof/references/apps.md`
- Create: `visual-e2e-proof/references/rendered-artifacts.md`
- Create: `visual-e2e-proof/references/godot.md`

- [ ] **Step 1: Copy the validated package**

Run:

```bash
cp -R /Users/hsshin-rsupport/.agents/skills/visual-e2e-proof ./visual-e2e-proof
```

Expected: the five Markdown files exist under `visual-e2e-proof/` and no unrelated files are copied.

- [ ] **Step 2: Validate the package**

Run:

```bash
python3 /Users/hsshin-rsupport/.codex/skills/.system/skill-creator/scripts/quick_validate.py ./visual-e2e-proof
```

Expected: `Skill is valid!`.

- [ ] **Step 3: Scan for local assumptions**

Run:

```bash
rg -n 'hsshin|todo-hero|C:/Users|/Users/|repos/' visual-e2e-proof
```

Expected: no matches.

### Task 2: Convert the README into a skill catalog

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the SDLC-only framing**

Use `# Skills` as the title and explain that this repository contains reusable agent skills. Add a catalog table linking to `sdlc/SKILL.md` and `visual-e2e-proof/SKILL.md`.

- [ ] **Step 2: Document installation**

Show a clone command and both copy targets:

```bash
git clone https://github.com/4sizn/skills.git
cp -R skills/sdlc ~/.agents/skills/
cp -R skills/visual-e2e-proof ~/.agents/skills/
```

State that users may copy only the skill they need and should restart or reload their agent environment afterward.

- [ ] **Step 3: Preserve and reorganize skill details**

Under `## SDLC Waterfall Core`, retain the current stage flow, approval rules and structure summary. Under `## Visual E2E Proof`, describe the four-part completion gate and supported artifact types, and link to its `references/` directory.

- [ ] **Step 4: Verify README links**

Run:

```bash
for path in sdlc/SKILL.md visual-e2e-proof/SKILL.md visual-e2e-proof/references; do test -e "$path" || exit 1; done
```

Expected: exit code 0.

### Task 3: Review, commit and publish the branch

**Files:**
- Review: all branch changes

- [ ] **Step 1: Review repository state and diff**

Run `git status --short` and `git diff --check`, then inspect `git diff -- README.md visual-e2e-proof docs`.

Expected: only the skill package, catalog README and approved planning documents are present; no whitespace errors.

- [ ] **Step 2: Commit the changes**

Run:

```bash
git add README.md visual-e2e-proof docs
git commit -m "feat: add visual e2e proof skill"
```

Expected: one commit is created on `codex/add-visual-e2e-proof`.

- [ ] **Step 3: Push the branch**

Run:

```bash
git push -u origin codex/add-visual-e2e-proof
```

Expected: the remote branch is created.

- [ ] **Step 4: Open the pull request**

Run `gh pr create --base main --head codex/add-visual-e2e-proof` with a title and body that summarize the new skill, README catalog conversion and validation results.

Expected: GitHub returns the new PR URL.

### Task 4: Prove the rendered GitHub result

**Files:**
- Create: `/Users/hsshin-rsupport/Documents/Codex/2026-08-21/new-chat/outputs/visual-e2e-proof-github-pr.png`

- [ ] **Step 1: Open the PR's Files changed or branch README URL in Chromium**

Use agent-browser to open the exact GitHub URL returned by the PR creation step, then navigate to the rendered repository page for `codex/add-visual-e2e-proof`.

- [ ] **Step 2: Verify visible content**

Confirm the rendered page visibly contains the `Skills` heading and both `SDLC Waterfall Core` and `Visual E2E Proof` sections. Confirm the new skill link resolves on the branch.

- [ ] **Step 3: Capture and inspect the browser viewport**

Save the screenshot to `/Users/hsshin-rsupport/Documents/Codex/2026-08-21/new-chat/outputs/visual-e2e-proof-github-pr.png`, open it with the image-reading tool, and reject blank, loading, clipped or wrong-branch evidence.

- [ ] **Step 4: Complete dual display**

Open the verified PNG with:

```bash
open -a Preview /Users/hsshin-rsupport/Documents/Codex/2026-08-21/new-chat/outputs/visual-e2e-proof-github-pr.png
```

Embed the same absolute path as an inline image in the final chat response.
