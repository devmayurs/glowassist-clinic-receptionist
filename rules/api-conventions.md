# API Conventions — AI Dental Clinic Receptionist

## REST API Standards
- Use REST architectural style, JSON for request/response
- Base URL: `https://your-backend.onrender.com/api/v1` (production)
- Local URL: `http://localhost:5000/api/v1`
- Resource naming: plural nouns, lowercase (`/patients`, `/appointments`, `/clinics`)
- Sub-resources: nested if owned (`/patients/:patientId/appointments`)
- HTTP methods:
  - `GET`: Retrieve resource(s)
  - `POST`: Create new resource
  - `PUT`: Full update of resource
  - `PATCH`: Partial update of resource
  - `DELETE`: Delete resource (soft delete)

## Endpoint Naming
- Use kebab-case for multi-word endpoints: `/appointment-slots`, not `/appointmentSlots`
- Actions as sub-resources: `/appointments/:id/reschedule`, `/appointments/:id/cancel`
- No verbs in endpoint names: use `POST /appointments` not `POST /create-appointment`
- Consistent naming across all endpoints

### Examples
```
GET    /api/v1/clinics
GET    /api/v1/clinics/:id
POST   /api/v1/clinics
PUT    /api/v1/clinics/:id
DELETE /api/v1/clinics/:id

GET    /api/v1/appointments?clinicId=xxx&date=2026-05-07
GET    /api/v1/appointments/:id
POST   /api/v1/appointments
PUT    /api/v1/appointments/:id
PATCH  /api/v1/appointments/:id/reschedule
DELETE /api/v1/appointments/:id

GET    /api/v1/patients?clinicId=xxx
GET    /api/v1/patients/:id
POST   /api/v1/patients
PUT    /api/v1/patients/:id
GET    /api/v1/patients/:id/appointments

POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

POST   /api/v1/webhooks/twilio/incoming-call
POST   /api/v1/webhooks/twilio/status-callback
POST   /api/v1/webhooks/whatsapp/incoming-message
```

## Response Format
- Consistent JSON response envelope:
```json
{
  "success": true,
  "data": { ... } | [ ... ],
  "error": null,
  "meta": {
    "timestamp": "2026-05-07T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

- Error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "APPOINTMENT_CONFLICT",
    "message": "Time slot already booked",
    "details": { "slotStart": "2026-05-07T10:00:00Z", "conflictingId": "apt_123" }
  },
  "meta": {
    "timestamp": "2026-05-07T10:00:00Z",
    "requestId": "req_abc123"
  }
}
```

## Error Format
- Standard HTTP status codes:
  - `200`: Success
  - `201`: Created
  - `400`: Bad Request (validation error)
  - `401`: Unauthorized (invalid/missing token)
  - `403`: Forbidden (insufficient permissions)
  - `404`: Not Found
  - `409`: Conflict (duplicate, double booking)
  - `422`: Unprocessable Entity (semantic validation error)
  - `429`: Too Many Requests (rate limit)
  - `500`: Internal Server Error
  - `503`: Service Unavailable (AI/Twilio down)

- Error codes (string, snake_case):
  - `VALIDATION_ERROR`
  - `AUTHENTICATION_FAILED`
  - `INVALID_TOKEN`
  - `INSUFFICIENT_PERMISSIONS`
  - `RESOURCE_NOT_FOUND`
  - `RESOURCE_CONFLICT`
  - `RATE_LIMIT_EXCEEDED`
  - `AI_SERVICE_UNAVAILABLE`
  - `TWILIO_ERROR`
  - `DATABASE_ERROR`

## Pagination
- Query params: `?page=1&limit=20`
- Default: `page=1`, `limit=20`, max `limit=100`
- Response includes `meta.pagination`:
```json
{
  "success": true,
  "data": [ ... ],
  "error": null,
  "meta": {
    "pagination": {
      "total": 156,
      "page": 1,
      "limit": 20,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Filtering
- Query params for filtering: `?status=scheduled&date=2026-05-07`
- Multiple values: `?status=scheduled&status=confirmed`
- Date ranges: `?startDate=2026-05-01&endDate=2026-05-31`
- String search: `?q=john` (search name, phone, email)
- Filter validation: invalid values return 400

## Authentication (Supabase Auth)
- Supabase Auth handles authentication (signup, login, session management, password reset)
- JWT token from Supabase in `Authorization` header: `Authorization: Bearer <supabase_token>`
- Token payload includes `sub` (user ID), `role`, `clinic_id`, `email`
- Session refresh handled by Supabase client (`supabase.auth.refreshSession()`)
- Public endpoints: `POST /api/v1/auth/login`, `POST /api/v1/webhooks/*`
- All other endpoints require valid Supabase JWT
- Backend verifies JWT using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

## Rate Limiting
- Per clinic: 100 requests/minute for API endpoints
- Per patient (public endpoints): 10 requests/minute
- Per IP: 200 requests/minute global
- Rate limit headers:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1715078400` (Unix timestamp)
- Exceeded: 429 status, `RATE_LIMIT_EXCEEDED` error code

## Validation
- Request body: Zod schema validation, 400 on failure
- Path params: validate UUID format, 400 on invalid
- Query params: validate types and ranges, 400 on invalid
- Response: validate with Zod schema before sending (dev only)
- Validation error response includes field-level errors:
- Database queries use Supabase client with Row Level Security (RLS)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "date": "Required, must be future date",
      "duration": "Must be 15, 30, 45, or 60"
    }
  }
}
```

## OpenAPI/Swagger Standards
- OpenAPI 3.0 specification in `/docs/openapi.yaml`
- Generated from code comments or Zod schemas
- Includes all endpoints, request/response schemas, error codes
- Secured with Bearer auth (Supabase JWT) in spec
- Access Swagger UI at `/docs` in development (if using swagger-express)
- Example:
```yaml
openapi: 3.0.0
info:
  title: Clinic Receptionist API
  version: 1.0.0
  description: API for clinic AI receptionist system
servers:
  - url: http://localhost:5000/api/v1
    description: Local development
  - url: https://your-backend.onrender.com/api/v1
    description: Production
paths:
  /appointments:
    get:
      summary: List appointments
      parameters:
        - name: clinicId
          in: query
          required: true
          schema:
            type: string
        - name: date
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: List of appointments
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Appointment'
```

## Versioning Strategy
- URL path versioning: `/api/v1/...`, `/api/v2/...`
- Breaking changes: new version (v2)
- Non-breaking changes: same version, update minor version
- Deprecation: mark old version as deprecated in OpenAPI spec
- Sunset headers: `Sunset: Wed, 07 May 2027 00:00:00 GMT` for deprecated endpoints
- Migration guide: provided in `/docs/migration-v1-to-v2.md`

## Webhook Conventions
- Webhook endpoints: `POST /api/v1/webhooks/{source}/{event}`
- Sources: `twilio`, `whatsapp`, `ai`, `n8n`
- Events: `incoming-call`, `incoming-message`, `status-callback`, `appointment-reminder`
- Signature verification: HMAC-SHA256 header (`X-Twilio-Signature`)
- Response: 200 status with `{ "received": true }` (Twilio expects 200)
- Retry logic: Twilio retries on non-200, n8n retries on failure
- Webhook secrets: stored in env vars, never in code
- Example Twilio webhook verification:
```typescript
import { validateRequest } from 'twilio';
const isValid = validateRequest(authToken, signature, url, params);
if (!isValid) throw new AuthError('Invalid webhook signature');
```

## Request/Response Examples

### Create Appointment
Request:
```
POST /api/v1/appointments
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "patientId": "pat_abc123",
  "date": "2026-05-07T10:00:00Z",
  "duration": 30,
  "reason": "Regular checkup",
  "notes": "Patient has mild sensitivity"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": "apt_xyz789",
    "patientId": "pat_abc123",
    "clinicId": "clinic_123",
    "date": "2026-05-07T10:00:00Z",
    "duration": 30,
    "status": "scheduled",
    "reason": "Regular checkup",
    "notes": "Patient has mild sensitivity",
    "createdAt": "2026-05-07T09:30:00Z"
  },
  "error": null
}
```

### Error Response (409 Conflict)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "APPOINTMENT_CONFLICT",
    "message": "Time slot 2026-05-07T10:00:00Z is already booked",
    "details": { "conflictingAppointmentId": "apt_conflict123" }
  }
}
```
