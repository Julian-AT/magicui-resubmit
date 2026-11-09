# magicui-resubmit

Opens Julian's MagicUI component PRs one at a time, as the maintainers asked
on magicuidesign/magicui#1051: each PR is a single commit on current main,
and its description states the AI assistance. GitHub Actions runs it every
day, so no laptop needs to be on.

## How it paces itself

- At most 3 of these PRs are open at once. A new one opens only when a slot
  frees up (a merge), at most one a day, in the order of
  `state/resubmit.json`.
- No new PR opens while an open one has a maintainer comment you haven't
  answered, changes requested, or failing checks.
- A PR closed without merging pauses everything until you run `resume`.
- When a merge makes an open PR conflict, its single commit is rebuilt on the
  new main, but only if the PR still holds just that commit.
- Each commit is built from the closed PR's branch on the fork
  (`feat/<slug>`), so keep those branches. The screenshots live on the
  fork's `pr-media` branch; keep it too.

## Where to look

- **Notices:** the issue "Resubmit notifications" gets a comment, and
  GitHub emails you, when a PR opens, merges, or needs you. A failed run
  also emails you.
- **Queue:** `state/resubmit.json`. Each run commits it back. Reorder the
  items to change what goes next.
- **Descriptions:** the approved text is in `runs/<slug>/pr-body.final.md`.
  The AI note is `AI_NOTE` in `harness/scripts/lib/resubmit.ts`.

## Running it by hand

```sh
gh workflow run resubmit.yml -f command=start   # first batch, now
gh workflow run resubmit.yml -f command=tick -f dry_run=true
gh workflow run resubmit.yml -f command=resume  # after a pause
gh workflow disable resubmit.yml                # stop it
```

## Secret

`RESUBMIT_TOKEN` pushes the branches to the fork and opens the PRs
upstream. It only reaches the Run step, never the install step or git
config.

At setup it was Julian's GitHub CLI token. That token has broad scopes
(`repo`, `delete_repo`, ...), and logging in to gh again can revoke it.
Replace it with a classic token (github.com/settings/tokens/new) that has
only `public_repo` and `workflow`:

```sh
gh secret set RESUBMIT_TOKEN --repo Julian-AT/magicui-resubmit
```

- **Why classic:** fine-grained tokens can't open PRs on a repo you don't
  own.
- **Why `workflow`:** it's needed when upstream main has changed
  `.github/workflows` files that the fork doesn't have yet.
