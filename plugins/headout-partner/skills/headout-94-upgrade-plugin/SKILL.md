---
name: headout-94-upgrade-plugin
description: Support skill for the Headout partner flow. Use to install, reinstall, or upgrade the headout-partner Claude Code plugin, to diagnose why a skill/command isn't found, or to confirm which plugin version is actually active when an older cached version may be shadowing the latest one.
argument-hint: "[symptom: not found / stale version / fresh install]"
---

# Headout 94 Upgrade Plugin

Get the user onto a correctly installed, up-to-date copy of the `headout-partner` plugin. Stale
copies can hide in three independent places at once: the marketplace registry cache, the
per-version plugin cache, and a scope-specific install record (`--scope user` vs `--scope project`,
per repo). Fixing one does not fix the others.

Role boundary: this skill manages the plugin installation itself (marketplace/cache/install state),
not the integration code inside the target repo. Don't touch the user's repo files.

User context:

```text
$ARGUMENTS
```

## Step 1 — Fresh install

Both commands are required, in order. `marketplace add` registers the source; `plugin install`
installs from it. Run this from the repo being integrated (the user's own repo), not from a clone
of the plugin repo — unless the marketplace was added with `--scope user`, it won't be visible when
the user reopens Claude Code elsewhere.

```bash
claude plugin marketplace add https://github.com/asim-headout/distro-integrate --scope user
claude plugin install headout-partner@headout-partner-marketplace --scope user
```

- `--scope user`: available in every repo on this machine.
- `--scope project`: scoped to the current repo only.
- If a previous install used the wrong scope, invoking `/headout-partner:...` from a different repo
  won't find it — that's a scope mismatch, not a bug. Reinstall with the intended scope; no need to
  uninstall first.
- If testing a local checkout instead of GitHub, `marketplace add` needs the absolute repo root path
  (`$(pwd)` from that root) — pointing it at the `plugins/headout-partner` subfolder fails silently.

Confirm wiring by invoking a skill explicitly:

```
/headout-partner:headout-00-plan
```

If Claude doesn't recognize the command, re-run the two install commands and check scope.

## Step 2 — Confirm the version, don't assume

```bash
claude plugin list
```

Check `headout-partner` shows the expected version (e.g. `0.6.0`). If it's behind:

1. Pull latest marketplace metadata first, then reinstall — a plain reinstall alone can just
   re-resolve to the same cached version:

   ```bash
   claude plugin marketplace update headout-partner-marketplace
   claude plugin install headout-partner@headout-partner-marketplace --scope user
   ```

2. If the version still doesn't move, clear cached copies and reinstall clean — old versions under
   `~/.claude/plugins/cache/` aren't always cleaned up automatically:

   ```bash
   rm -rf ~/.claude/plugins/cache/headout-partner-marketplace/headout-partner
   rm -rf ~/.claude/plugins/marketplaces/headout-partner-marketplace
   claude plugin marketplace add https://github.com/asim-headout/distro-integrate --scope user
   claude plugin install headout-partner@headout-partner-marketplace --scope user
   claude plugin list   # confirm the version now
   ```

3. Check scope-specific installs separately. A `--scope project` install in one repo and a
   `--scope user` install elsewhere are independent entries and can be on different versions at the
   same time. If installed in more than one place, run `claude plugin list` from inside each repo —
   updating one does not update the other.

4. Last resort: confirm the version from the skill file itself rather than the CLI. Open `SKILL.md`
   for the skill in question and check it matches the expected behavior — e.g.
   `headout-93-inventory-input-fields` only exists from `0.5.0` onward. If an expected skill is
   missing, the install is still old.

If still stuck after step 2, don't keep retrying variations — collect the exact commands run plus
`claude plugin list` output and escalate.

## Additional diagnostics

- `claude plugin update headout-partner@headout-partner-marketplace` can be used instead of a full
  reinstall after `marketplace update` — same effect, less disruptive.
- `claude plugin prune` removes orphaned old-version directories under
  `~/.claude/plugins/cache/headout-partner-marketplace/headout-partner/<version>/` instead of
  hand-deleting them; prefer it over manual `rm -rf` when just tidying up (still fine as a forced
  clean-reinstall step above).
- After `update`/`install`, Claude Code may report "restart required to apply" — tell the user to
  restart the CLI session before re-checking `claude plugin list`.
- `claude plugin marketplace list` prints registered marketplaces from
  `~/.claude/plugins/known_marketplaces.json` — useful to confirm the marketplace source URL is
  correct if `marketplace update` isn't picking up new commits.
- `claude plugin details headout-partner` and `claude plugin validate <path>` give a second way to
  inspect the resolved version/manifest without relying on cache state.
- If a teammate's setup still looks stale after all of the above, check whether another project's
  `.claude/settings.json` (`enabledPlugins` / `extraKnownMarketplaces`) is pinning a different fork
  or an older marketplace source — this is a separate, per-project pin from the user/project scope
  install itself.
