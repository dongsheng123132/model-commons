#!/usr/bin/env bash
# Apply the issue payloads produced by `node scripts/monitor-issues.mjs`.
#
# The monitor owns exactly one issue per (label, title) pair, so an existing issue is
# edited in place with the freshly generated body instead of being skipped. Skipping it
# is what let the overdue report rot: issue #3 kept a body listing 2 entries while
# registry/offers.json already had 5 overdue ones.
#
# usage: GH_TOKEN=... bash .github/scripts/upsert-issues.sh [payload.json]
# Kept bash-3.2 compatible so the script can be dry-run on a stock macOS shell.
set -euo pipefail

payload_file="${1:-monitor-issues.json}"
: "${GH_TOKEN:?GH_TOKEN must be set}"

label_color() {
  case "$1" in
    source-monitor | registry-stale) echo 'B60205' ;;
    *) echo 'ededed' ;;
  esac
}

label_description() {
  case "$1" in
    source-monitor) echo 'Public source observation needs review' ;;
    registry-stale) echo 'Registry entry needs an evidence recheck' ;;
    *) echo 'monitor label' ;;
  esac
}

# Exact-title match instead of `gh issue list --search`, which mangles titles such as
# "[monitor:bai-promotions-en:assertion-hy3-api-zero-credit] official source needs review".
find_issue_number() {
  local label="$1" title="$2" number
  number="$(gh issue list --state open --label "$label" --limit 100 --json number,title --jq '.[] | "\(.number)\t\(.title)"' \
    | awk -F '\t' -v want="$title" '$2 == want {print $1; exit}')"
  printf '%s' "${number:-}"
}

ensured_labels=" "
ensure_label() {
  case "$ensured_labels" in *" $1 "*) return 0 ;; esac
  if gh label create "$1" --color "$(label_color "$1")" --description "$(label_description "$1")" --force >/dev/null; then
    ensured_labels="$ensured_labels$1 "
  fi
}

body_file="$(mktemp)"
trap 'rm -f "$body_file"' EXIT

created=0
updated=0
closed=0
failures=0
while IFS= read -r payload; do
  [ -n "$payload" ] || continue
  action="$(jq -r '.action' <<<"$payload")"
  label="$(jq -r '.label' <<<"$payload")"
  title="$(jq -r '.title' <<<"$payload")"
  number="$(find_issue_number "$label" "$title")"

  case "$action" in
    upsert)
      jq -r '.body' <<<"$payload" >"$body_file"
      if [ -n "$number" ]; then
        if gh issue edit "$number" --body-file "$body_file" >/dev/null; then
          updated=$((updated + 1))
          echo "updated #$number  $title"
        else
          failures=$((failures + 1))
          echo "::error::failed to update #$number ($title)" >&2
        fi
      else
        ensure_label "$label"
        if gh issue create --title "$title" --label "$label" --body-file "$body_file" >/dev/null; then
          created=$((created + 1))
          echo "created         $title"
        else
          failures=$((failures + 1))
          echo "::error::failed to create $title" >&2
        fi
      fi
      ;;
    close)
      if [ -n "$number" ]; then
        jq -r '.comment' <<<"$payload" >"$body_file"
        if gh issue close "$number" --comment "$(cat "$body_file")" >/dev/null; then
          closed=$((closed + 1))
          echo "closed  #$number  $title"
        else
          failures=$((failures + 1))
          echo "::error::failed to close #$number ($title)" >&2
        fi
      else
        echo "no-op           $title (nothing open to close)"
      fi
      ;;
    *)
      failures=$((failures + 1))
      echo "::error::unknown action '$action' for $title" >&2
      ;;
  esac
done < <(jq -c '.[]' "$payload_file")

echo "issue sync done: ${created} created, ${updated} updated, ${closed} closed, ${failures} failed"
[ "$failures" -eq 0 ]
