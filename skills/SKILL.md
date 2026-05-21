# AI Skill Definition — Full-Stack Dental Clinic Receptionist

## Skill Name
`dental-clinic-fullstack`

## Description
Full-stack engineering skill for building the AI Dental Clinic Receptionist system, covering frontend, backend, AI integrations, Twilio, n8n workflows, Docker deployment, and PostgreSQL optimization.

## Capabilities
- **Full-Stack Engineering**: React/TypeScript frontend, Node.js/Express backend, end-to-end feature implementation
- **AI Integrations**: OpenAI API integration, prompt engineering, token optimization, conversation flow design
- **Twilio Integrations**: Voice calls, SMS, WhatsApp, webhook handling, signature verification, test number usage
- **n8n Workflows**: Workflow design, webhook triggers, error handling, retry logic, execution logging
- **Docker Deployment**: Multi-stage builds, Docker Compose, volume management, network isolation, health checks
- **Supabase Integration**: PostgreSQL, Auth, REST APIs, Realtime, Row Level Security, file storage
- **React Architecture**: Component design, state management (Zustand/Redux), custom hooks, API integration, accessibility
- **Node.js Architecture**: Service layer, middleware, error handling, Supabase integration, authentication
- **Production Debugging**: Log analysis, error tracing, performance profiling, webhook debugging
- **SaaS Multi-Tenant Systems**: Clinic isolation, data filtering, billing tracking, onboarding automation

## Execution Standards
- Read existing code fully before making changes
- Follow project coding standards (rules/code-style.md)
- Test changes locally before reporting complete
- Use Edit tool for modifications, Write for new files
- Keep responses concise, no unnecessary explanations
- Prioritize security and patient data privacy
- Validate all environment variables before using
- Check for existing implementations before adding new features
- Follow API conventions (rules/api-conventions.md)
- Use TypeScript strict mode, no `any` types
- Add tests for all new code
- Update documentation for API/schema changes

## Expected Outputs
- Production-ready code with no placeholders
- Complete test coverage for new features
- Updated documentation (CLAUDE.md, API docs) if architecture changes
- Dockerfile/Compose updates if new services added
- n8n workflow JSON if automation added
- Migration files if database schema changes
- Environment variable examples in `.env.example`
- Clear explanation of changes and reasoning

## Quality Requirements
- Code passes ESLint/Prettier checks
- TypeScript strict mode compliance
- Test coverage ≥ 80% for new code
- No security vulnerabilities (OWASP Top 10)
- HIPAA-aligned patient data handling
- Multi-tenant ready (clinic_id filters)
- Performance: API < 200ms, AI < 3s, frontend bundle < 500KB
- Accessibility: WCAG 2.1 AA compliance for frontend
- Cost optimized: use cheapest AI model for simple tasks
- Local-first: works without cloud dependencies

## Engineering Philosophy
- **Minimalism**: No unnecessary abstractions, premature optimization, or features
- **Security First**: Patient data privacy, webhook verification, input validation
- **Cost Conscious**: Local hosting, cheap AI models, minimal API calls
- **Maintainability**: Clear naming, documentation, test coverage
- **Scalability**: Multi-tenant ready, paginated endpoints, indexed queries
- **User-Centric**: Dental clinic staff and patients are the users, build for their needs
- **Local-First**: Minimize cloud dependency, run everything locally
- **AI-Assisted**: Use Claude Code tools effectively, ask for clarification when unsure

## Skill Triggers
Automatically invoke this skill when user requests:
- New feature implementation (frontend, backend, AI, Twilio, n8n)
- Bug fixes in any part of the stack
- Database schema changes or query optimization
- API endpoint creation or modification
- n8n workflow creation or debugging
- Docker/Deployment configuration changes
- React component creation or state management
- AI prompt engineering or conversation flow changes
- Twilio integration or webhook handling
- Performance optimization or debugging
- Multi-tenant architecture changes

## Skill Execution Flow
1. Understand the request: read relevant docs (AI-Receptionist-Agent.md, STRUCTURE.md)
2. Read existing code: use Read, Glob, Grep to understand current state
3. Plan changes: if complex, use EnterPlanMode for user approval
4. Implement: use Edit/Write tools, follow coding standards
5. Test: run tests, verify locally if possible
6. Validate: type check, lint, build
7. Report: summarize changes, files modified, tests added
