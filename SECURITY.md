# Security Policy

## Supported Versions

This project is currently in active development (v0.1.0). Security updates will be applied to the main branch.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Known Vulnerabilities

### d3-color Dependency (Transitive)

**Status**: Known, Monitoring
**Severity**: Low for this use case
**Dependency Chain**: `d3-hwschematic` → `d3` (<=6.7.0) → `d3-color` (<3.1.0)

**Description**: The d3-hwschematic library depends on an older version of d3, which transitively includes a vulnerable version of d3-color. This is a client-side visualization tool that does not process untrusted data in a way that would exploit this vulnerability.

**Mitigation**:
- The project only visualizes JSON data from trusted sources
- No user-provided color values are processed by d3-color
- Monitoring upstream (d3-hwschematic) for updates

**Resolution Plan**: Will upgrade when d3-hwschematic releases a version with updated dependencies.

### Dependency Management Policy

- **Jest**: Project requires v29+ for ESM support. Do not downgrade to v25.x or older.
- **Vite**: Currently on v5.x. Do not force upgrade to v6+ without testing.
- **Audit Fixes**: Do NOT run `npm audit fix --force` without reviewing changes, as it can break working configurations.

## Reporting a Vulnerability

If you discover a security vulnerability in this project:

1. **Do NOT** open a public issue
2. Email the maintainer at: t.nickels@gmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

**Response Time**: You can expect an initial response within 72 hours.

## Security Best Practices for Users

1. **Validate Input**: Always validate JSON graphs against the provided schema before loading
2. **Trusted Sources**: Only load graph data from trusted sources
3. **Content Security Policy**: Implement appropriate CSP headers when embedding this library
4. **Regular Updates**: Keep dependencies updated, but review changes carefully
5. **Testing**: Run the full test suite after any dependency updates

## Responsible Disclosure

We follow responsible disclosure practices:
- Security issues will be addressed promptly
- Fixes will be released as soon as practical
- Public disclosure only after a fix is available
- Credit given to reporters (unless anonymity is requested)
