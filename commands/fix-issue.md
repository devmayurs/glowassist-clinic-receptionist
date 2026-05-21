# AI Issue Fix Command

## Command Name
`/fix-issue`

## Purpose
Instruct Claude to identify, analyze, and fix a specific issue in the codebase.

## Usage
- `/fix-issue` — Fix the current issue/bug in context
- `/fix-issue description of issue` — Fix specific issue (e.g., `/fix-issue appointment booking fails for past dates`)
- `/fix-issue path/to/file.ts` — Fix issues in specific file

## Fix Workflow Instructions
When the user invokes `/fix-issue`, follow this workflow:

### Step 1: Identify Root Cause
- Read the relevant code files completely before making changes
- Reproduce the issue mentally: trace the code path that leads to the bug
- Identify the root cause, not just the symptom
- Check if the issue is in:
  - Frontend (component, state, API call)
  - Backend (controller, service, repository, middleware)
  - Database (schema, query, migration)
  - n8n workflow (trigger, node, webhook)
  - Configuration (env vars, Docker, CORS)

### Step 2: Explain Issue
Provide a clear explanation of:
- What the issue is (1-2 sentences)
- Why it happens (root cause)
- Impact (what breaks, who is affected)
- Example: "Appointment booking allows past dates because `AppointmentService.createAppointment` does not validate that `date` is in the future. This causes invalid appointments in the DB and confuses patients."

### Step 3: Propose Fix
- Explain the fix approach (what needs to change)
- Show the files that need modification
- Show the code changes (before/after)
- Consider alternatives, pick the best one with reasoning
- Example: "Add a date validation in `AppointmentService.createAppointment` to check `date > new Date()`. Return 400 error if past date."

### Step 4: Validate Architecture
- Ensure fix follows project architecture (rules/code-style.md)
- Check service layer usage (no DB access in controllers)
- Verify repository pattern adhered to
- Check API conventions (response format, error codes)
- Verify multi-tenant: fix includes `clinic_id` filter if needed
- Check that fix doesn't break other features

### Step 5: Implement Fix
- Use `Edit` tool for modifying existing files
- Use `Write` tool only for new files
- Make minimal, focused changes
- No unnecessary refactoring while fixing
- Follow existing code style (indentation, quotes, semicolons)
- Add comments only if the why is non-obvious

### Step 6: Update Tests
- Add/update unit tests for the fix
- Add/update integration tests if API behavior changed
- Test happy path (fix works)
- Test error path (prevents the bug)
- Test edge cases (null, undefined, max values)
- Run tests to verify they pass: `npm test`
- Example test:
```typescript
it('should reject past dates for appointment booking', async () => {
  const pastDate = new Date('2025-01-01');
  await expect(service.createAppointment({ date: pastDate, ... })).rejects.toThrow('Cannot book past dates');
});
```

### Step 7: Prevent Regression
- Add test case that would have caught the original bug
- Check if similar bug exists elsewhere (search codebase)
- Add validation/sanitization to prevent similar issues
- Example: if date validation was missing, check all date inputs in the codebase

### Step 8: Validate Types
- Check TypeScript types for the modified code
- Add/Update interfaces for new/changed props
- Verify no `any` types introduced
- Run type check: `npm run type-check`
- Fix any type errors

### Step 9: Verify Linting
- Run ESLint: `npm run lint`
- Fix any lint errors/warnings
- Format code with Prettier: `npm run format`
- Verify no style issues

### Step 10: Document Changes
- Explain what was changed and why
- List files modified
- Note any new dependencies added
- Note any env vars changed/added
- This goes in the conversation response, not a separate file

## Output Structure
Present the fix in the following format:

### Issue Identified
[Brief description of the issue and root cause]

### Root Cause
[Detailed explanation of why the issue occurs, with code references]

### Proposed Fix
[Explanation of the fix approach, files to change, code examples]

### Implementation
[Summary of changes made, files modified]

### Tests Added/Updated
[Description of tests, what they cover]

### Type/Lint Check
[Results of type check and linting]

### Regression Prevention
[How the fix prevents similar issues, any additional checks made]

## Example Fix Output
### Issue Identified
Appointment booking allows past dates, causing invalid appointments.

### Root Cause
`AppointmentService.createAppointment` does not validate that the provided `date` is in the future. The Zod schema `CreateAppointmentSchema` only checks type (Date), not value.

File: `backend/src/services/appointment.service.ts:45`

### Proposed Fix
Add a date validation check in the service method to reject past dates. Update Zod schema to include date validation.

Files to modify:
- `backend/src/schemas/appointment.schema.ts` (add date validation)
- `backend/src/services/appointment.service.ts` (add check)

### Implementation
Modified `appointment.schema.ts`:
```typescript
export const CreateAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  date: z.date().refine(d => d > new Date(), { message: 'Date must be in the future' }),
  duration: z.enum([15, 30, 45, 60]),
  reason: z.string().min(1).max(500),
});
```

Modified `appointment.service.ts`:
```typescript
async createAppointment(data: CreateAppointmentDTO) {
  if (data.date <= new Date()) {
    throw new ValidationError('Cannot book appointment in the past');
  }
  // ... rest of method
}
```

### Tests Added/Updated
- Added `should reject past dates` test in `appointment.service.test.ts`
- Added `should validate future date` test in `appointment.schema.test.ts`
- All tests pass.

### Type/Lint Check
- Type check: passed
- Lint: passed
- Format: applied Prettier

### Regression Prevention
- Searched codebase for other date inputs, added similar validation to `rescheduleAppointment`
- Added date validation to all appointment-related schemas

## Notes
- Always read the full file before editing
- Make minimal changes to fix the issue
- Do not refactor unrelated code
- Test the fix locally if possible
- Ask user if unsure about the fix approach
