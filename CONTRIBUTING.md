# Contributing to MarkLeft

Thank you for considering contributing to MarkLeft. This document explains how to open issues and pull requests, and how the Copilot Coding Agent is expected to work with the repository.

## Quick checklist (for contributors)

- [ ] Search existing issues before opening a new one.
- [ ] Use an existing template: **Bug Report** or **Copilot Task**.
- [ ] Keep changes small and focused.
- [ ] Add tests when possible.
- [ ] Run linters and formatters before committing.
- [ ] Follow commit message conventions (e.g., `chore:`, `feat:`, `fix:`, `docs:`).

## How to open an issue

- Choose the appropriate template under `.github/ISSUE_TEMPLATE/`.
- For tasks you want Copilot to work on, use the **Copilot Task** template and add the `copilot` label.

## Working with the Copilot Coding Agent

- Label suitable issues with `copilot` and ensure they are small, well-scoped, and contain acceptance criteria.
- Add a short "Steps for the agent" list to guide the agent's implementation.
- The agent will normally:
The agent will normally:
  1. Create a short plan (todo list) and mark it in-progress.
  2. Implement changes on a branch and open a PR.
  3. Run tests and push the branch for review.

## Pull request process

1. Create a branch named `feat/<short-description>` or `fix/<short-description>`.
2. Make changes and ensure the repository builds locally.
3. Push the branch and open a pull request targeting `main`.
4. Reference any related issues (for example, `Closes #17`).
5. Add a clear description and checklist in the PR description.

## Coding standards

- Keep code readable and well-documented.
- Add unit tests for new features.
- Run the project's linters and formatters.

## Commit message conventions

Follow conventional commit format with a type prefix and descriptive message:

- `feat:` - New features (e.g., `feat: add user authentication`)
- `fix:` - Bug fixes (e.g., `fix: resolve memory leak in image processor`)
- `docs:` - Documentation changes (e.g., `docs: update API reference`)
- `chore:` - Maintenance tasks (e.g., `chore: update dependencies`)
- `test:` - Test additions or changes (e.g., `test: add unit tests for auth module`)
- `refactor:` - Code refactoring (e.g., `refactor: simplify database connection logic`)
- `style:` - Code style changes (e.g., `style: format code with prettier`)

Examples:
```
feat: implement dark mode toggle
fix: correct calculation in price component
docs: add contributing guidelines
chore: configure GitHub Actions workflow
```

## Triaging and labels

- Use `.github/labels.yml` to keep labels consistent.
- Use `copilot` for issues the agent should handle.

## Contact

If you need help, open an issue or contact the maintainers through the repository.
