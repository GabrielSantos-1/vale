# Security Policy

## Scope

This policy applies to the source code, workflows, and dependencies in this repository.
It covers vulnerabilities that can impact confidentiality, integrity, or availability of the system.

## Supported Versions

Security fixes are provided for:

- `main` (latest state)

Older snapshots, forks, or historical commits may not receive fixes.

## How to Report a Vulnerability

Please do **not** open a public issue for sensitive security reports.

Use one of the channels below:

1. GitHub Security Advisories: use **"Report a vulnerability"** in the repository security tab.
2. If private reporting is unavailable, contact the maintainer through the repository profile and request a private channel before sharing technical details.

When reporting, include:

- affected component/path
- reproduction steps
- impact assessment
- suggested mitigation (if available)

## Expected Response Timeline

- Acknowledgement: up to **72 hours**
- Initial triage: up to **14 days**
- Remediation target: up to **90 days**, depending on severity and complexity

Critical issues are prioritized and can be handled on an expedited timeline.

## Responsible Disclosure

Please allow the maintainer to validate and fix the issue before public disclosure.

Do **not**:

- publish exploit details before a fix window is agreed
- run disruptive tests against production services
- access, modify, or exfiltrate user/admin data

After remediation, coordinated disclosure can be discussed when appropriate.
