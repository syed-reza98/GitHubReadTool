#!/usr/bin/env bash
# Portable helper script to fetch GitHub data with curl + jq.
# Usage:
#   Make executable: chmod +x fetch_github_with_curl.sh
#   Run: GITHUB_TOKEN="ghp_xxx..." ./fetch_github_with_curl.sh syed-reza98
#
# Output:
#   all_repos.json     -- aggregated list of repos (all pages)
#   orgs.json          -- organization memberships
#   contributions.json -- GraphQL contributions output for the provided username
#
# Notes:
# - TOKEN may be provided via env var GITHUB_TOKEN or as first argument.
# - Requires 'jq' installed for JSON processing.

set -euo pipefail

USERNAME="$1"
if [ -z "$USERNAME" ]; then
  echo "Usage: GITHUB_TOKEN=ghp_xxx... $0 <github_username>"
  exit 2
fi

TOKEN="${GITHUB_TOKEN:-${2:-}}"
if [ -z "$TOKEN" ]; then
  echo "Error: Provide GITHUB_TOKEN environment variable or pass token as second argument."
  exit 2
fi

AUTH_HEADER="Authorization: token ${TOKEN}"
GRAPHQL_HEADER="Authorization: bearer ${TOKEN}"

# Fetch /user/repos paginated
page=1
per_page=100
tmpdir="$(mktemp -d)"
trap 'rm -rf "${tmpdir}"' EXIT

echo "Fetching repositories (this may include private repos for the token owner)..."
while true; do
  out="${tmpdir}/repos_page_${page}.json"
  curl -s -H "${AUTH_HEADER}" "https://api.github.com/user/repos?per_page=${per_page}&page=${page}&sort=pushed" -o "${out}"
  if [ ! -s "${out}" ]; then
    break
  fi
  # If empty array, stop
  len=$(jq 'length' "${out}" 2>/dev/null || echo "0")
  if [ "${len}" -eq 0 ]; then
    break
  fi
  page=$((page+1))
done

# Combine pages
if ls "${tmpdir}"/repos_page_*.json >/dev/null 2>&1; then
  jq -s 'add' "${tmpdir}"/repos_page_*.json > all_repos.json
  echo "Wrote all_repos.json"
else
  echo "No repos fetched."
  echo "[] " > all_repos.json
fi

# Fetch orgs
echo "Fetching organization memberships..."
curl -s -H "${AUTH_HEADER}" "https://api.github.com/user/orgs" -o orgs.json
echo "Wrote orgs.json"

# Fetch contributions via GraphQL for the given username
echo "Fetching contributions via GraphQL for user ${USERNAME}..."
read -r -d '' QUERY <<'GRAPHQL'
{"query":"query ($login: String!) { user(login: $login) { contributionsCollection { totalCommitContributions totalIssueContributions totalPullRequestContributions totalPullRequestReviewContributions restrictedContributionsCount contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }","variables":{"login":"'${USERNAME}'"}}
GRAPHQL

curl -s -H "${GRAPHQL_HEADER}" -X POST -d "${QUERY}" https://api.github.com/graphql -o contributions.json
echo "Wrote contributions.json"

echo "Done. Files: all_repos.json, orgs.json, contributions.json"