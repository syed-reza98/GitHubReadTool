# GitHub Copilot agent web task prompt

Create a professional, A4-printable resume PDF from the repository’s content, using a modern, carefully reviewed UI/UX design. Use the existing repository structure, data, and documentation to ensure accuracy and consistency.

---

## Context and objectives

- **Goal:** Review the entire repository, synthesize the most relevant achievements, roles, and projects, and produce a polished, single-page A4 resume as a PDF suitable for job applications. The resume should have a modern, typographically clean, recruiter-friendly UI with print-safe styling.
- **Repository:** https://github.com/syed-reza98/GitHubReadTool
- **Existing assets you must leverage:**
  - HTML resume templates already exist: SyedSalmanRezaResume_Professional.html (web) and SyedSalmanRezaResume_PDF.html (A4 print-optimized). Use these as your baseline and improve visual design, content clarity, and print CSS.
  - Auto-generated project summaries in docs/projects/ should inform the “Selected Projects” section with accurate links and concise impact statements.
  - A docs generator script exists at scripts/generate_docs.js and setup instructions in README (Node 18+, env, npm install). If project data is stale, regenerate and incorporate updates.

- **Execution environment:** GitHub Copilot Agents can run tasks against a repo and report progress. Treat this as a background task with clear deliverables and acceptance criteria.

---

## Deliverables

- **Primary PDF:** A single A4 PDF resume file saved at the repository root:
  - File: SyedSalmanRezaResume_A4.pdf
- **Updated HTML source:** A single source-of-truth HTML file for print export:
  - File: SyedSalmanRezaResume_PDF.html (update and improve, don’t create duplicates)
- **Preview image:** A 1200px-wide PNG preview of the final resume for quick review:
  - File: improved-resume-screenshot.png (replace if already present)
- **Commit:** One atomic PR with a clear summary of design and content changes.

---

## Inputs to use

- **Resume templates:** SyedSalmanRezaResume_Professional.html, SyedSalmanRezaResume_PDF.html
- **Project summaries:** docs/projects/ (18 files generated)
- **Repo stats and labels:** Use README highlights to select representative projects and tech stacks that reflect breadth and depth.

---

## Tasks

1. Content audit and synthesis
   - **Extract highlights:** Identify top 6–8 projects from docs/projects/ with business impact, role, stack, and measurable outcomes. Include direct GitHub links.
   - **Experience timeline:** Create a concise experience section prioritizing leadership, architecture, and ownership signals. Summarize responsibilities in 2–3 bullets per role with outcomes.
   - **Skills matrix:** Group skills by categories (Languages, Frameworks, Cloud/DevOps, Data/ML, Tooling), reflecting the repository’s documented tech stacks. Keep tight and scannable.
   - **Achievements:** Add 3–5 quantifiable achievements tied to shipped work or impact.

2. UI/UX design improvements in print HTML (A4)
   - **Typography:** Use a clean professional pairing (e.g., Inter/Source Sans for body; weight contrast for headings). Ensure 10.5–11.5pt body size for print.
   - **Layout:** Two-column layout on desktop/print (sidebar width ~28–32%). Use consistent spacing scale (4/8/12px multiples).
   - **Visual hierarchy:** Strong H1 name, compact title/subtitle, subtle separators, ample white space. Restrained color palette with print-safe contrast.
   - **Scanability:** Section headers, bullet brevity (max 2 lines), consistent verbs, and emphasized outcomes.
   - **Accessibility:** Sufficient contrast, semantic structure, and logical reading order.
   - **Print CSS:** Proper A4 sizing, margins, page-break control, hiding non-print elements, and link footnotes for URLs. The repo notes a print-optimized PDF version exists—improve it rather than reinvent.

3. Implement print styles and structure
   - **Update SyedSalmanRezaResume_PDF.html:** Preserve semantic HTML, refine section structure, improve class naming, and inject print-specific CSS.
   - **Ensure A4 correctness:** @page size A4; margins 16–20mm; avoid content clipping; handle page-break-inside rules for sections and lists.

4. PDF export
   - **Generate:** Produce SyedSalmanRezaResume_A4.pdf from the updated HTML. Use a headless browser pipeline (e.g., Chrome print-to-PDF) or a node-based renderer consistent with the project’s Node 18+ setup. Validate embedded fonts and crisp rendering at 300 DPI-equivalent. The README emphasizes a PDF-ready flow; keep alignment with that intent.

5. Validation and QA
   - **Visual QA:** No widows/orphans, balanced columns, consistent spacing, no overflows, correct link targets.
   - **ATS sanity:** Minimal graphics, actual text (no images of text), standard section headings, single-column fallback in small screens if applicable.
   - **Content QA:** No outdated projects or links; reflect the latest docs/projects content. If stale, run the docs generator.

6. Commit and PR
   - **Commit:** Update SyedSalmanRezaResume_PDF.html, add SyedSalmanRezaResume_A4.pdf, refresh improved-resume-screenshot.png.
   - **PR description:** Summarize content changes, design upgrades, and print optimizations with before/after notes.

---

## Implementation notes

- **Setup (if regenerating docs):**
  - **Env and install:**
    ```
    # .env
    GITHUB_TOKEN=your_github_token_here

    npm install
    node scripts/generate_docs.js
    ```
  - This script fetches repositories, filters for meaningful contributions, and populates docs/projects/. Use the outputs to update the resume’s project section.

- **Minimal print CSS to include/improve:**
  ```css
  @page {
    size: A4;
    margin: 18mm;
  }
  @media print {
    html, body { height: auto; }
    body { color: #111; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    a[href^="http"]:after { content: " (" attr(href) ")"; font-size: 9pt; color: #666; }
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
    h1, h2, h3 { break-after: avoid; }
    .section { break-inside: avoid; }
    ul, li { break-inside: avoid; }
    .col { break-inside: avoid; }
  }
  ```

- **Section ordering (recommended):**
  - **Header:** Name, title, location, contact, portfolio/GitHub.
  - **Summary:** 2–3 lines emphasizing architecture, leadership, and outcomes.
  - **Skills:** Categorized and concise (aligned with repo stacks).
  - **Selected projects:** 6–8 entries with role, stack, and 1-line impact; link to repo/docs.
  - **Experience:** Roles with 2–3 outcome bullets each.
  - **Education & certifications:** Compact.
  - **Awards/publications (optional):** If high-signal.

---

## Acceptance criteria

- **A4-perfect:** PDF is exactly A4 with professional margins, no overflow, and crisp typography.
- **Modern, restrained design:** Strong hierarchy, consistent spacing, print-safe colors, no decorative clutter.
- **High-signal content:** Focus on ownership, architecture, measurable impact, and representative projects from docs/projects/.
- **Accessibility & ATS-friendly:** Real text, semantic structure, readable contrast, bullet brevity.
- **Repo-integrated:** Uses and updates the existing SyedSalmanRezaResume_PDF.html, generates SyedSalmanRezaResume_A4.pdf, and includes a preview image.
- **Single PR:** Clear, audited change summary.

---

## Notes for the agent

- **Leverage existing resume templates and print intent already in the repo** instead of creating new parallel files. The repository explicitly includes SyedSalmanRezaResume_Professional.html for web and SyedSalmanRezaResume_PDF.html optimized for A4 prints—build on these with better layout, spacing, and content selections.
- **Use the project documentation pipeline** (scripts/generate_docs.js and docs/projects/*) as the source of truth for project details and links to maintain consistency between portfolio and resume.
- **Treat this as a background task with progress updates** since Agents are designed to take delegated tasks and report back with revisions.
