---
name: dependency-audit
description: Run pnpm audit, remediate high and critical dependency vulnerabilities where supported, remove obsolete package resolutions, and open a PR that reports fixed and unresolved advisories.
---

You are a dependency security maintainer for Trading Hub. Run a complete `pnpm audit`, resolve every **high** and **critical** advisory that can be fixed without introducing an unsupported or breaking change, review package resolutions for continued necessity, and create a pull request with an exact remediation report.

## Scope and safety

- Use `pnpm` only. Do not use `npm` or `yarn`.
- Do not edit generated source files or application code unless a dependency upgrade requires a small compatibility adjustment. Prefer dependency upgrades, then lockfile updates.
- Do not use `--force`, suppress advisories, ignore audit findings, or replace a dependency with an unmaintained fork.
- Do not lower a dependency version or loosen a version range to silence an advisory.
- Treat major-version upgrades as breaking unless the dependency's release notes and project validation demonstrate otherwise. Do not apply them automatically; report them as unresolved with the required version.
- Keep unrelated dependency updates out of the PR.
- Preserve the existing package-manager metadata and the lockfile format.

## 1. Prepare the work

1. Inspect `git status --short`. If existing changes touch `package.json`, `pnpm-lock.yaml`, or dependency configuration, stop and report the conflict; do not overwrite user work.
2. Create a branch named `chore/dependency-audit-<yyyy-mm-dd>`.
3. Install the locked dependency graph without running lifecycle scripts:

   ```bash
   pnpm install --frozen-lockfile --ignore-scripts
   ```

4. Capture the baseline audit in a durable temporary file outside the repository:

   ```bash
   pnpm audit --json > "$TMPDIR/trading-hub-audit-before.json" || true
   pnpm audit
   ```

   `pnpm audit --json` exits non-zero when advisories exist. Preserve its output and continue. Extract the advisory ID, severity, affected package, dependency path, vulnerable range, patched versions, and whether the issue is direct or transitive.

## 2. Remediate high and critical advisories

1. Work only on high and critical findings. Record lower-severity findings for the PR report, but do not change dependencies solely for them.
2. First attempt the smallest supported remediation:

   ```bash
   pnpm audit --fix
   ```

   Inspect the `package.json` and `pnpm-lock.yaml` diff immediately. Retain only updates that address high or critical findings and are compatible with the project constraints.

3. If an advisory remains, determine whether it is a direct or transitive dependency:
   - For a direct dependency, update it to the first non-vulnerable compatible release using `pnpm update <package>@<safe-version>`.
   - For a transitive dependency, update the direct parent when that produces a safe graph. Use `pnpm.overrides` only when a safe, compatible transitive version exists and no direct-parent upgrade is available.
   - Before adding an override, use `pnpm why <package>` to identify every affected path and verify that the override version satisfies each consumer's declared compatibility range.
4. Run `pnpm audit --json` after each coherent remediation. Do not claim an issue is fixed until its advisory no longer appears in that output.
5. If a fix requires a major upgrade, lacks a patched release, conflicts with a parent package's supported range, or fails validation, restore that attempted change and record the advisory as unresolved. Include the exact constraint in the final PR body.

## 3. Review existing resolutions

`pnpm` uses `pnpm.overrides`; repositories may also contain a legacy `resolutions` field. Review both fields if present.

For every existing override or resolution:

1. Identify its package and the version it pins, then run `pnpm why <package>`.
2. Check whether the current resolved version is already selected naturally by the declared dependency ranges and whether the override still corresponds to an active audit finding.
3. Test removal one entry at a time:
   - Remove only that entry from the file that defines it (`pnpm-workspace.yaml` for this repository's `overrides`, or `package.json` for a legacy `resolutions` field).
   - Run `pnpm install --lockfile-only --ignore-scripts`.
   - Run `pnpm audit --json` and compare high/critical findings with the pre-removal audit.
   - Restore the entry if installation changes an unrelated dependency graph, reintroduces a high/critical finding, or selects a version outside a consumer's compatible range.
4. Keep the removal only when the dependency graph remains compatible and no high/critical finding returns. Remove the parent `overrides` or `resolutions` object when it becomes empty.

Do not remove a resolution merely because its original rationale is unavailable. The graph and audit must demonstrate that it is unnecessary.

## 4. Validate the final dependency graph

Run all of the following after the final changes:

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm audit --json > "$TMPDIR/trading-hub-audit-after.json" || true
pnpm audit
pnpm run format
pnpm run lint
pnpm run ts-check
```

If dependency changes affect runtime tooling, tests, code generation, or build output, run the smallest relevant command first, then run `pnpm run pr-validate` before opening the PR. Revert any remediation that fails validation and report it as unresolved.

Compare the before and after audit JSON files. The final report must distinguish:

- **Fixed:** high/critical advisories present before and absent after, with the dependency and version change that remediated each.
- **Unresolved:** high/critical advisories still present after remediation, with advisory ID, affected path, severity, and precise reason no safe fix was applied.
- **Resolution changes:** every removed or retained override/resolution and the audit/graph evidence supporting the decision.

## 5. Create the pull request

Only after validation succeeds:

1. Review the diff to ensure it contains only dependency, lockfile, and strictly necessary compatibility changes.
2. Commit with:

   ```bash
   git add package.json pnpm-workspace.yaml pnpm-lock.yaml
   git add <necessary compatibility files>
   git commit -m "chore: remediate dependency audit findings"
   ```

3. Push the branch and create a pull request using `gh pr create --label "auto-cab"` against `main`. Use this body, replacing every placeholder with the actual audit result:

```markdown
## Dependency audit

Ran `pnpm audit` on <date>.

## Fixed high/critical warnings

| Advisory | Severity   | Package/path                  | Remediation                                   |
| -------- | ---------- | ----------------------------- | --------------------------------------------- |
| <id>     | <severity> | <package and dependency path> | <updated package from/to or override removed> |

Write `None` if no high or critical warnings were fixed.

## High/critical warnings without a fix

| Advisory | Severity   | Package/path                  | Why it remains                                                                         |
| -------- | ---------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| <id>     | <severity> | <package and dependency path> | <no patched release / requires incompatible major upgrade / other verified constraint> |

Write `None` only when no high or critical warnings remain.

## Resolution review

- Removed: <each obsolete `pnpm.overrides` or `resolutions` entry, or `None`>.
- Retained: <each necessary entry and supporting audit/graph reason, or `None`>.

## Verification

- [x] `pnpm install --frozen-lockfile --ignore-scripts`
- [x] `pnpm audit`
- [x] `pnpm run format`
- [x] `pnpm run lint`
- [x] `pnpm run ts-check`
- [x] `<additional validation command, if run>`
```

4. In the final response, provide the pull-request URL first, then list the fixed warnings and the high/critical warnings with no available safe fix. Never say all warnings are fixed if the final audit contains any high or critical advisory.

## Pull-request fallback

If creating the commit, pushing the branch, or running `gh pr create` fails because commit signing, GitHub authentication, permissions, or another environment restriction is unavailable:

1. Do not retry with signing disabled, bypass a required signature, or use another identity.
2. Keep the validated dependency changes in the working tree and report the exact failed step and error.
3. Prompt the user with `ask_user` to create the pull request themselves. State the branch name, the required `auto-cab` label, and provide the exact commit, push, and `gh pr create --label "auto-cab"` commands needed to finish it.
4. Provide a copy-paste PR title and complete Markdown description using the template in Step 5. Fill in the fixed warnings, unresolved high/critical warnings, resolution-review results, and successful validation commands. This lets the user create the PR without rerunning the audit.
