# shlok-portfolio

## Agent skills

### Issue tracker

Issues live as GitHub issues in `shlok1806/shlok-portfolio`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Living documentation

This project uses per-folder CLAUDE.md files. After any session where you introduce a new
module, dependency, or architectural convention, update the CLAUDE.md closest to where the
change lives - not this file unless the change is project-wide. Write what a future agent
could not derive from reading the code: rules, boundaries, ownership decisions.

Anything adapted from opensourceui.in follows `docs/adr/0001-vendor-opensourceui-through-the-token-layer.md`.
