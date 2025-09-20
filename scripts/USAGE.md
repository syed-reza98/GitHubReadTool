Node.js GitHub repo-to-markdown generator (minimal)

Usage

1. Set environment variable (optional but recommended for rate limits):

   - On Windows (cmd.exe):

     set GITHUB_TOKEN=ghp_xxx

2. Run the script:

   node scripts/generate_docs.js --user syed-reza98 --out docs/projects --limit 5

What it does

- Fetches public repositories for the given user (up to `--limit`).
- Attempts to fetch each repo's README and writes a short markdown summary to `docs/projects/{repo}.md`.

Notes

- This is a minimal scaffold. It is intentionally dependency-free to make it easy to run.
- For production, consider using `@octokit/rest` and robust rate-limit/error handling.
