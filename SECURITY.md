# Security

This is a personal portfolio project. If you find a problem, open a GitHub issue without any sensitive details, or use GitHub's private vulnerability reporting on this repository.

What the pipeline checks on every push and pull request: type check and tests, a secret scan (our own script plus gitleaks), `npm audit` for high severity issues, CodeQL static analysis, and a dependency review on pull requests. Dependabot opens weekly update pull requests.
