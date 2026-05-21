# AI Code Review Command

## Command Name
`/review`

## Purpose
Instruct Claude to perform a comprehensive code review of the current changes or specified files.

## Usage
- `/review` — review all uncommitted changes
- `/review path/to/file.ts` — review specific file
- `/review path/to/folder/` — review all files in folder

## Review Instructions
When the user invokes `/review`, perform the following review process:

### 1. Code Quality Review
- Check for readable, maintainable code
- Verify adherence to project coding standards (rules/code-style.md)
- Check for duplicate code, extract to shared utilities if needed
- Verify proper naming conventions (camelCase, PascalCase, UPPER_SNAKE_CASE)
- Check for consistent formatting (Prettier, ESLint)

### 2. Security Issues
- Check for hardcoded secrets, API keys, passwords
- Verify input validation on all API endpoints
- Check for SQL injection risks (use parameterized queries, Prisma)
- Check for XSS risks (sanitize user input, no innerHTML)
- Verify JWT validation, auth middleware usage
- Check CORS configuration, rate limiting
- Verify webhook signature verification
- Check for patient PHI exposure in logs

### 3. Performance Problems
- Check for unnecessary re-renders (React: memo, useMemo, useCallback)
- Check for N+1 queries (database: use include, batch queries)
- Check for missing database indexes (query frequently accessed columns)
- Check for large bundle size (frontend: code splitting, lazy loading)
- Check for blocking operations (use async/await, no sync FS in production)
- Check AI token usage (truncate long inputs, use Haiku for simple tasks)

### 4. Architecture Consistency
- Verify correct folder structure (rules/code-style.md)
- Check service layer usage (no DB access in controllers)
- Check repository pattern adherence
- Verify state management (Zustand, no state in components)
- Check API structure (REST conventions, response format)
- Verify n8n workflow structure (webhook triggers, error branches)

### 5. TypeScript Types
- Verify no `any` types used
- Check explicit return types on functions
- Verify strict null checks handled
- Check interface definitions for props, API requests/responses
- Verify Zod schemas for input validation
- Check type imports (`import type { ... }`)

### 6. Anti-Patterns
- Check for "god objects" (too many responsibilities)
- Verify no nested callbacks (use async/await)
- Check for magic numbers (use named constants)
- Verify no tight coupling (depend on interfaces)
- Check for console.log in production code (use Pino logger)
- Verify no direct DB queries in controllers

### 7. Accessibility (Frontend)
- Check for semantic HTML elements
- Verify aria labels on interactive elements
- Check keyboard navigation (tab order, Enter/Space activation)
- Verify color contrast (WCAG 2.1 AA)
- Check alt text for images, labels for form inputs

### 8. Scalability
- Check for multi-tenant readiness (clinic_id filters)
- Verify stateless services (no mutable class state)
- Check for proper error handling (no unhandled rejections)
- Verify pagination on list endpoints
- Check for Docker best practices (multi-stage builds, no root)

### 9. API Consistency
- Verify endpoint naming (plural nouns, kebab-case)
- Check response format (success, data, error envelope)
- Verify HTTP methods used correctly
- Check error codes match api-conventions.md
- Verify authentication on protected endpoints

## Output Structure
Present the review findings in the following format:

### Review Summary
- Files reviewed: X
- Issues found: Y
- Severity breakdown: Critical (C), High (H), Medium (M), Low (L)

### Findings (Grouped by Severity)

#### Critical (C)
> **File**: `path/to/file.ts:123`
> **Issue**: Hardcoded API key in source code
> **Fix**: Move to environment variable, use `process.env.API_KEY`
> **Code Example**:
> ```typescript
> // Before
> const apiKey = 'sk-ant-12345';
> // After
> const apiKey = process.env.AI_CLAUDE_API_KEY;
> ```

#### High (H)
> **File**: `path/to/file.ts:456`
> **Issue**: Missing input validation on POST /appointments
> **Fix**: Add Zod schema validation middleware
> **Code Example**: [show example]

#### Medium (M)
> [Similar format]

#### Low (L)
> [Similar format]

### Optimization Suggestions
- [Suggestion 1 with reasoning]
- [Suggestion 2 with reasoning]

### Actionable Fixes
1. [ ] Fix critical issue X in file Y
2. [ ] Fix high issue Z in file W
3. [ ] Consider optimization A for better performance

## Severity Classifications
- **Critical (C)**: Security vulnerability, data loss risk, patient PHI exposure
- **High (H)**: Breaking change, missing auth, unhandled error, performance bottleneck
- **Medium (M)**: Code quality issue, missing test, minor anti-pattern
- **Low (L)**: Style inconsistency, naming improvement, documentation gap

## Approval Rules
- Critical issues: Must fix before merge
- High issues: Should fix before merge, can bypass with justification
- Medium issues: Fix before merge to `main`, can merge to `dev`
- Low issues: Nice to fix, not blocking

## Notes
- Be specific with line numbers and file paths
- Provide code examples for fixes
- Explain why something is an issue, not just what
- Prioritize security and patient data privacy above all
- Check against project-specific rules in `/rules` folder
