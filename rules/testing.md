# Testing Standards — AI Dental Clinic Receptionist

## General Testing Principles
- All production code must have corresponding tests
- Test coverage threshold: 80% minimum (lines, branches, functions, statements)
- Tests are co-located with source files: `*.test.ts` next to `*.ts`
- Test names: descriptive, start with "should", in English
- Arrange-Act-Assert pattern for all tests
- No test interdependence: each test runs independently
- Clean up after tests: close DB connections, clear mocks

## Unit Testing
- Framework: Jest (backend), Vitest (frontend)
- Test pure functions, utilities, helpers in isolation
- Mock all external dependencies (DB, API, AI)
- No real DB or network calls in unit tests
- Test file naming: `filename.test.ts` (backend), `filename.test.tsx` (frontend)
- Describe blocks: group by function/component
- Assertions: use Jest/Vitest matchers (`toBe`, `toEqual`, `toThrow`)
- Edge cases: test null, undefined, empty, max values

### Backend Unit Test Example
```typescript
// src/services/appointment.service.test.ts
import { AppointmentService } from './appointment.service';
import { FakeAppointmentRepository } from '../repositories/fakes/fake-appointment.repository';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let repo: FakeAppointmentRepository;

  beforeEach(() => {
    repo = new FakeAppointmentRepository();
    service = new AppointmentService(repo);
  });

  describe('createAppointment', () => {
    it('should create appointment with valid data', async () => {
      const data = { clinicId: 'clinic1', patientId: 'patient1', date: new Date(), duration: 30 };
      const result = await service.createAppointment(data);
      expect(result.id).toBeDefined();
      expect(result.clinicId).toBe('clinic1');
    });

    it('should throw ConflictError for double booking', async () => {
      const data = { clinicId: 'clinic1', patientId: 'patient1', date: new Date(), duration: 30 };
      await service.createAppointment(data);
      await expect(service.createAppointment(data)).rejects.toThrow('Time slot already booked');
    });
  });
});
```

### Frontend Unit Test Example
```typescript
// src/components/AppointmentCard.test.tsx
import { render, screen } from '@testing-library/react';
import { AppointmentCard } from './AppointmentCard';

describe('AppointmentCard', () => {
  const mockAppointment = { id: '1', patientName: 'John Doe', date: '2026-05-07', time: '10:00' };

  it('should display patient name', () => {
    render(<AppointmentCard appointment={mockAppointment} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display appointment time', () => {
    render(<AppointmentCard appointment={mockAppointment} />);
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });
});
```

## Integration Testing
- Test interaction between components (service + Supabase client, controller + service)
- Mock Supabase client for DB integration tests (or use Supabase test project)
- Mock external services (AI, Twilio, WhatsApp)
- Test API endpoints with Supertest (backend)
- Test component integration with React Testing Library (frontend)
- Setup/teardown: create/clean Supabase test data for each test
- Test happy path and error cases

### API Integration Test Example
```typescript
// src/routes/appointment.routes.test.ts
import { createApp } from '../app';
import { supertest } from 'supertest';
import { supabase } from '../supabase/client';

describe('Appointment API', () => {
  const app = createApp();
  const request = supertest(app);

  beforeEach(async () => {
    await supabase.from('appointments').delete().neq('id', '');
  });

  describe('POST /api/v1/appointments', () => {
    it('should create appointment with valid token', async () => {
      const token = generateTestToken({ clinicId: 'clinic1' });
      const res = await request
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({ patientId: 'patient1', date: '2026-05-07T10:00:00Z', duration: 30 });
      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
    });

    it('should return 401 without token', async () => {
      const res = await request.post('/api/v1/appointments').send({});
      expect(res.status).toBe(401);
    });
  });
});
```

## API Testing
- Test all endpoints: success, validation error, auth error, not found, conflict
- Use Supertest to simulate HTTP requests
- Verify response status, headers, body format
- Test pagination, filtering, sorting
- Test rate limiting (if applicable)
- Test CORS headers
- Test webhook signature verification

## Frontend Testing
- Framework: Vitest + React Testing Library
- Test component rendering, user interactions, state changes
- Mock API calls with MSW (Mock Service Worker)
- Test form validation, submission, error display
- Test routing with React Router test utilities
- Test Zustand store actions and state changes
- Accessibility: use @testing-library/jest-dom matchers

### Frontend Store Test Example
```typescript
// src/store/appointment.store.test.ts
import { useAppointmentStore } from './appointment.store';
import { mockAppointments } from '../mocks/appointment.mock';

describe('Appointment Store', () => {
  beforeEach(() => {
    useAppointmentStore.getState().reset();
  });

  it('should fetch appointments', async () => {
    const store = useAppointmentStore.getState();
    await store.fetchAppointments('clinic1');
    expect(store.appointments.length).toBeGreaterThan(0);
    expect(store.loading).toBe(false);
  });
});
```

## n8n Workflow Testing
- Export workflows as JSON, validate structure
- Test webhook triggers with curl/Paw/Postman
- Verify workflow execution logs in n8n UI
- Test error branches: invalid input, service downtime
- Test retry logic: force failure, verify retry count
- Test webhook signature verification (Twilio, etc.)
- Mock AI/Twilio services for offline testing

### n8n Workflow Test Checklist
- [ ] Webhook receives correct payload
- [ ] Data transformation steps produce expected output
- [ ] AI node receives correct prompt and context
- [ ] Error branch triggers on failure
- [ ] Success response sent to caller
- [ ] Logs written to backend
- [ ] Retry logic works for failed HTTP requests

## AI Response Testing
- Test prompt engineering: verify AI gets correct context
- Test emergency detection: inputs with "severe pain", "swelling" trigger urgent flag
- Test conversation flow: multi-turn conversation maintains context
- Test token limits: long conversations truncated correctly
- Test fallback: AI failure triggers human handoff
- Test PHI redaction: no patient data in AI logs
- Mock AI API for consistent test responses

## Security Testing
- Test JWT validation: invalid/expired tokens rejected
- Test RBAC: non-admin users cannot access admin endpoints
- Test input validation: SQL injection, XSS attempts blocked
- Test rate limiting: exceed limit, verify 429 response
- Test CORS: unauthorized origins rejected
- Test webhook verification: invalid signatures rejected
- Test password hashing: passwords not stored in plain text

## Performance Testing
- Test API response time: < 200ms for simple queries, < 500ms for complex
- Test DB query performance: add indexes for slow queries
- Test frontend bundle size: < 500KB gzipped
- Test concurrent requests: simulate 100 parallel requests
- Test AI response time: < 3s for Sonnet, < 2s for Haiku
- Test n8n workflow execution time: < 5s per workflow

## Coverage Requirements
- Statements: 80% minimum
- Branches: 80% minimum
- Functions: 80% minimum
- Lines: 80% minimum
- Coverage reports: generated with `--coverage` flag
- Coverage exclusions: `*.test.ts`, `*.mock.ts`, `src/types`, `src/utils/generated`
- Coverage enforced in CI: build fails if below threshold

## Mocking Strategy
- Mock external services: AI API, Twilio, WhatsApp, Email
- Backend mocks: mock Supabase client with `jest.mock('@supabase/supabase-js')`
- Frontend mocks: MSW for API, mock Zustand stores with `jest.spyOn`
- Database: use Supabase test project or mock Supabase client
- No real credentials in tests: use `test_*` values
- Mock time for date-dependent tests: `jest.useFakeTimers()`

## CI/CD Testing Flow
1. Lint: `npm run lint` (ESLint + Prettier check)
2. Type check: `npm run type-check` (TypeScript noEmit)
3. Unit tests: `npm run test:unit` (Jest/Vitest)
4. Integration tests: `npm run test:integration` (Supertest, DB)
5. Coverage check: `npm run test:coverage` (verify thresholds)
6. Build: `npm run build` (verify no build errors)
7. All steps must pass before merge to `dev` or `main`
