#!/usr/bin/env python3
"""
fetch_github_all.py

Fetch GitHub repos (public + private), orgs and contribution summary for a user.

Usage:
  - Set token in environment:
      export GITHUB_TOKEN="ghp_xxx..."
      python fetch_github_all.py --user syed-reza98 > github_output.json
  - Or pass token via --token:
      python fetch_github_all.py --user syed-reza98 --token "ghp_xxx..." > github_output.json
  - Or write output to a file:
      python fetch_github_all.py --user syed-reza98 --output github_output.json

Output: single JSON document printed to stdout (or file) with fields:
  requested_user, token_owner, repos, orgs, contributions_graphql

Notes:
  - Token must have appropriate scopes for private data (repo, read:org).
  - The script will NOT print the token. It will print the token owner's login and id only.
"""
from __future__ import annotations
import os
import sys
import argparse
import json
import requests
from typing import Optional, List, Dict

API = "https://api.github.com"
GRAPHQL = "https://api.github.com/graphql"
PER_PAGE = 100

def error(msg: str, code: int = 1) -> None:
    print(f"Error: {msg}", file=sys.stderr)
    sys.exit(code)

def get_headers(token: str) -> Dict[str, str]:
    return {
        "Authorization": f"bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "GitHubReadTool/1.0"
    }

def requests_get_json(url: str, headers: Dict[str, str], params: Optional[Dict] = None) -> any:
    r = requests.get(url, headers=headers, params=params)
    if r.status_code >= 400:
        error(f"GET {url} failed: {r.status_code} {r.text}")
    try:
        return r.json()
    except ValueError:
        error(f"Invalid JSON returned from {url}")
    return None

def fetch_token_owner(headers: Dict[str, str]) -> Dict[str, any]:
    url = f"{API}/user"
    r = requests.get(url, headers=headers)
    if r.status_code >= 400:
        error(f"Unable to fetch token owner info: {r.status_code} {r.text}")
    info = r.json()
    return {"login": info.get("login"), "id": info.get("id")}

def fetch_all_user_repos(headers: Dict[str, str]) -> List[Dict]:
    repos: List[Dict] = []
    page = 1
    while True:
        params = {"per_page": PER_PAGE, "page": page, "sort": "pushed"}
        url = f"{API}/user/repos"
        r = requests.get(url, headers=headers, params=params)
        if r.status_code >= 400:
            error(f"Error fetching repos: {r.status_code} {r.text}")
        data = r.json()
        if not data:
            break
        for rj in data:
            repos.append({
                "name": rj.get("name"),
                "full_name": rj.get("full_name"),
                "private": rj.get("private"),
                "html_url": rj.get("html_url"),
                "owner": rj.get("owner", {}).get("login"),
                "owner_type": rj.get("owner", {}).get("type"),
                "language": rj.get("language"),
                "stargazers_count": rj.get("stargazers_count"),
                "forks_count": rj.get("forks_count"),
                "open_issues_count": rj.get("open_issues_count"),
                "created_at": rj.get("created_at"),
                "pushed_at": rj.get("pushed_at"),
                "default_branch": rj.get("default_branch"),
            })
        if len(data) < PER_PAGE:
            break
        page += 1
    return repos

def fetch_orgs(headers: Dict[str, str]) -> List[Dict]:
    url = f"{API}/user/orgs"
    r = requests.get(url, headers=headers)
    if r.status_code >= 400:
        error(f"Error fetching orgs: {r.status_code} {r.text}")
    out = []
    for o in r.json():
        out.append({
            "login": o.get("login"),
            "url": o.get("url"),
            "avatar_url": o.get("avatar_url"),
            "description": o.get("description"),
        })
    return out

def fetch_contributions_graphql(username: str, headers: Dict[str, str]) -> Dict:
    query = """
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
    """
    payload = {"query": query, "variables": {"login": username}}
    r = requests.post(GRAPHQL, json=payload, headers=headers)
    if r.status_code >= 400:
        error(f"GraphQL error: {r.status_code} {r.text}")
    try:
        return r.json()
    except ValueError:
        error("Invalid JSON returned from GraphQL")
    return {}

def main() -> None:
    p = argparse.ArgumentParser(description="Fetch GitHub profile data (repos, orgs, contributions).")
    p.add_argument("--user", required=True, help="GitHub username to fetch contributions for (e.g. syed-reza98)")
    p.add_argument("--token", help="GitHub PAT (optional, or set GITHUB_TOKEN env var)")
    p.add_argument("--output", help="Write JSON output to this file (optional). If not set, writes to stdout.")
    args = p.parse_args()

    token = args.token or os.getenv("GITHUB_TOKEN")
    if not token:
        error("A GitHub token is required to fetch private repos and contribution data. Provide via --token or GITHUB_TOKEN env var.", 2)

    # Build headers but DO NOT log token
    headers = get_headers(token)

    # Identify token owner (we only expose login and id)
    token_owner = fetch_token_owner(headers)
    if token_owner.get("login") is None:
        error("Unable to determine token owner login; check token scopes and validity.")

    # Fetch authenticated user's repos (includes private repos for token owner)
    repos = fetch_all_user_repos(headers)

    # Fetch orgs
    orgs = fetch_orgs(headers)

    # Fetch contributions for requested username using GraphQL
    contributions = fetch_contributions_graphql(args.user, headers)

    out = {
        "requested_user": args.user,
        "token_owner": token_owner,
        "repos": repos,
        "orgs": orgs,
        "contributions_graphql": contributions
    }

    out_json = json.dumps(out, indent=2, ensure_ascii=False)

    if args.output:
        try:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(out_json)
        except OSError as e:
            error(f"Failed to write output file: {e}")
    else:
        print(out_json)

if __name__ == "__main__":
    main()