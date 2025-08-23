# GitHubReadTool

A small, documented toolkit to fetch GitHub profile data locally using a Personal Access Token (PAT). The toolkit fetches:
- All repositories you can access (public and private) for the authenticated user
- Organization memberships
- Contribution stats (via GraphQL contributionsCollection) for a requested username

This project provides:
- fetch_github_all.py — an executable Python script that gathers the data and prints a JSON document
- fetch_github_with_curl.sh — a portable bash script that collects the same data with curl + jq
- A GitHub Actions workflow to lint the Python script (flake8)
- Security guidance for safe use of PATs

Quickstart

1. Create (or reuse) a GitHub Personal Access Token (PAT)
   - Recommended scopes:
     - For public-only data: none strictly required.
     - For private repos, private contribution stats, and organization membership: repo and read:org (classic token) or equivalent read-only scopes for fine-grained token.
   - Create token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (or fine-grained token).
   - IMPORTANT: Do not paste tokens into public places or issue trackers. Revoke tokens you accidentally expose.

2. Run the Python script (recommended)
   - Export token:
     - export GITHUB_TOKEN="ghp_xxx..."
   - Run:
     - python fetch_github_all.py --user your_github_username > github_output.json
   - Or write to a specific file:
     - python fetch_github_all.py --user your_github_username --output github_output.json

3. Or use the bash/curl script
   - Make script executable:
     - chmod +x fetch_github_with_curl.sh
   - Run:
     - GITHUB_TOKEN="ghp_xxx..." ./fetch_github_with_curl.sh your_github_username

Output
- The Python script outputs a single JSON document with keys:
  - requested_user
  - token_owner (login and id)
  - repos (array of repo objects)
  - orgs (array)
  - contributions_graphql (raw GraphQL response)
- The curl script writes:
  - all_repos.json
  - orgs.json
  - contributions.json

Security notes (READ THIS)
- Never paste your PAT into public chat, issues, or comments.
- If you accidentally reveal a PAT, revoke it immediately: GitHub → Settings → Developer settings → Personal access tokens → Revoke.
- For the scripts here, the token is read from either the GITHUB_TOKEN environment variable or the --token argument. The Python script never prints the token to stdout/logs; it only displays the token owner's login and id.
- Prefer using environment variables instead of passing tokens on the command line (command-line arguments can be visible in process lists).

Required software
- Python 3.8+ (3.11 recommended)
- pip
- curl and jq (for the bash script)
- Internet access to api.github.com

Files included
- fetch_github_all.py — main Python script (executable)
- fetch_github_with_curl.sh — curl-based helper script (executable)
- requirements.txt — Python dependencies (requests, flake8)
- .github/workflows/lint.yml — GitHub Actions workflow
- .gitignore
- LICENSE (MIT)

License
- MIT — see LICENSE file

Support / contributions
- Open an issue or PR in this repository with usage suggestions, bug reports, or feature requests.
