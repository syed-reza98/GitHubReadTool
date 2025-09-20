This repository is a small toolkit and documentation hub for gathering GitHub profile/project information and maintaining a portfolio/resume.

Primary goals for an AI coding assistant
- Help implement a GitHub repository extractor that generates per-repository markdown under `docs/projects/`.
- Keep `README.md` and `SyedSalmanRezasResume.html` in sync with `docs/projects/` summaries.

Quick repo map (what matters)
- `README.md` — high-level repo purpose and next steps. Changes here should reflect automation status (if implemented).
- `docs/projects/` — single-file project summaries. New project scans should emit to this folder as `docs/projects/<repo>.md`.
- `SyedSalmanRezasResume.html` — resume; avoid wholesale reformatting. Insert small, idempotent updates (e.g., links or short descriptions) only.

Big-picture architecture and developer intent
- This repo is documentation-first: the canonical output is markdown project summaries used in the resume and portfolio.
- The intended automation is a small script (Python or Node) that calls the GitHub API, inspects repo metadata and README contents, and writes/updates `docs/projects/{repo}.md` files.

Conventions and patterns an AI should follow
- Non-invasive edits: prefer adding new markdown files or appending short paragraphs to `SyedSalmanRezasResume.html`. Do not reformat the HTML or rewrite styling.
- Project summary structure: each `docs/projects/*.md` should include these headings: Overview, Code, Architecture, Tech stack, Status, Notes/Usage. Follow the examples already in `docs/projects/`.
- Filenames: use kebab-case for generated filenames matching repo names (lowercase, hyphens). Escape or remove characters not safe in paths.

Commands / developer workflows (what an AI should mention in PRs)
- When proposing automation, include a small test run and sample output in `docs/projects/` for 1-2 repositories.
- Recommend using a personal access token (PAT) for GitHub API access and explain minimal scopes required (repo: public_repo or read-only scopes for public repos). Never hardcode tokens in code or commits.

Integration points & heuristics
- Detect primary language via GitHub API `language` field or `repo.languages` endpoint and fallback to common files: `package.json`, `requirements.txt`, `pom.xml`, `setup.py`, `composer.json`.
- Detect frameworks/stacks via presence of files or directories: `Dockerfile` (containerized), `package.json` (Node), `composer.json` (PHP/Laravel), `requirements.txt`/`pyproject.toml` (Python), `next.config.js`/`pages`/`app` (Next.js).
- Capture README first paragraph as the project's short description; include a link to the repository if available.

What to avoid
- Big refactors to `SyedSalmanRezasResume.html` or changing inline CSS. Keep HTML edits minimal and idempotent.
- Guessing: only include facts discoverable from repo metadata or README. Do not invent metrics, accuracy numbers, or deployment details.

Examples from this codebase (use these patterns when generating content)
- Real-Time Motorbike Helmet Detection: put dataset and model notes under `Code & Dataset` and `Architecture` sections (see `docs/projects/real-time-motorbike-helmet-detection.md`).
- NSU eKYC: map Laravel + MySQL notes under Tech stack and link to API usage under Code (see `docs/projects/nsu-ekyc.md`).

PR guidance for agents
- Keep PRs small: one feature or one automation script + 1-2 sample generated markdown files.
- Include a short README section or `USAGE.md` for any new scripts describing required env vars (e.g., GITHUB_TOKEN), how to run locally, and expected outputs.

If you update automation behavior
- Add / update `README.md` section to describe the new command (example: `python scripts/generate_docs.py --user syed-reza98 --out docs/projects/`).
- Provide a sample run log and 1-2 example files generated under `docs/projects/` in the PR.

Questions for the maintainer (leave these as PR comments when uncertain)
- Which repositories should be included/excluded from automatic runs (forks, archived, private)?
- Preferred language for automation (Python or Node)?

If anything in these instructions is unclear, ask a focused question referencing a file (for example: "Should generated filenames use repo full_name or repo name? See `docs/projects/` examples").
