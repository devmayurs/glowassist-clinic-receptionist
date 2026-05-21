# Code Style Guidelines — AI Dental Clinic Receptionist

## Frontend Standards (React + TypeScript + Tailwind)

### React
- Functional components only, no class components
- Use arrow function syntax: `const Component = () => { ... }`
- Props interface defined above component: `interface ComponentProps { ... }`
- Default props via destructuring: `const Component = ({ prop = defaultValue }: Props) => { ... }`
- Event handlers prefixed with `handle`: `handleClick`, `handleSubmit`
- Custom hooks prefixed with `use`: `useAppointment`, `usePatient`
- No `useEffect` for data fetching — use custom hooks with `fetch`/`axios`
- Key prop: always use stable unique IDs, no array index
- Conditional rendering: use ternary or `&&`, no complex logic in JSX

### TypeScript
- Strict mode enabled, no `any` type
- Explicit type annotations for function parameters and return types
- Interfaces for object shapes, `type` for unions/intersections
- Avoid enums, use const objects: `const Role = { ADMIN: 'admin', STAFF: 'staff' } as const`
- Nullable types: `string | null`, not `string?` (unless in Supabase generated types)
- Type guards for unknown values: `if (typeof value === 'string') { ... }`
- Import types: `import type { User } from './types'` for type-only imports

### Hooks
- Only call hooks at top level, not inside loops/conditions
- Custom hooks must start with `use`, return clear state/actions
- State: `useState` for simple state, `useReducer` for complex state
- Effects: cleanup functions for subscriptions, timers, event listeners
- Memoization: `useMemo` for expensive calculations, `useCallback` for stable function references
- Ref: `useRef` for DOM access or stable mutable values, not for state

### Folder Structure (Frontend)
```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Basic UI elements (Button, Input, Modal)
│   ├── appointment/ # Appointment-related components
│   ├── patient/     # Patient-related components
│   └── layout/     # Layout components (Header, Sidebar, Footer)
├── pages/           # Route pages (Dashboard, Appointments, Patients)
├── services/        # API call functions (appointment.service.ts)
├── store/           # Zustand state stores
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
└── App.tsx          # Root component with routes
```

### State Management (Zustand)
- One store per domain: `useAppointmentStore`, `usePatientStore`
- Store interface defined with TypeScript
- Actions defined in store, not in components
- Select specific state in components: `const appointments = useAppointmentStore(s => s.appointments)`
- No nested stores, keep flat state where possible

### Naming Conventions
- Components: PascalCase (`AppointmentCard.tsx`)
- Files/folders: camelCase (`appointment.service.ts`, `patientUtils.ts`)
- CSS classes: Tailwind utilities, no custom CSS files (unless absolutely necessary)
- Variables/functions: camelCase (`getAppointment`, `patientName`)
- Constants: UPPER_SNAKE_CASE (`MAX_APPOINTMENTS_PER_DAY`)
- Interfaces: PascalCase with `I` prefix optional (`Appointment`, `IPatient`)

### Reusable Components
- Props interface for every component
- Default props via destructuring
- Children prop explicitly typed: `children?: React.ReactNode`
- No inline styles, use Tailwind classes
- Accessibility: aria labels, roles, focus management
- Component composition over prop drilling

### Accessibility
- Semantic HTML elements: `<button>`, `<nav>`, `<main>`, not `<div onClick>`
- Aria attributes: `aria-label`, `aria-describedby` for interactive elements
- Keyboard navigation: tab order, Enter/Space to activate
- Focus management: focus trap in modals, return focus on close
- Color contrast: minimum 4.5:1 ratio (Tailwind default colors compliant)
- Alt text for images, labels for form inputs

## Backend Standards (Node.js + TypeScript + Express)

### API Architecture
- Express.js as web framework
- Route definitions in `/src/routes`, handlers in `/src/controllers`
- Service layer: business logic in `/src/services`, database access via Supabase client
- Middleware: `/src/middleware` (auth, validation, logging, rateLimit)
- All async handlers return Promise, use async/await

### Service Layer
- One service per domain: `AppointmentService`, `PatientService`
- Service methods are async, return typed results
- Database access via Supabase client (`@supabase/supabase-js`)
- Error handling: throw `AppError` subclasses, not generic Error
- Stateless services, no class-level mutable state
- Row Level Security (RLS) enforced via Supabase, clinic_id filtering in queries

### DTO Validation
- Zod schemas for all input validation
- DTO types inferred from Zod schemas: `type CreateAppointmentDTO = z.infer<typeof CreateAppointmentSchema>`
- Validation in middleware, before controller
- Standard schemas in `/src/schemas` folder
- Error response: 400 with Zod error details
- Database access via Supabase client in services, not repositories

### Middleware Structure
- Order: cors → logging → auth → validation → rateLimit → route handler
- Auth middleware: verify JWT, attach `request.clinic`, `request.user`
- Logging middleware: log request/response with Pino
- Validation middleware: run Zod schema on body/query/params
- Rate limit middleware: per-IP and per-clinic limits
- Error middleware: catch all errors, send formatted response

### Async Handling
- Async/await only, no Promise chains (`.then`, `.catch`)
- All async functions return `Promise<T>`
- Try/catch in controllers, throw `AppError` subclasses
- No floating promises: await all async calls or attach `.catch()`
- Use `Promise.all` for parallel async operations, `Promise.allSettled` for independent ones

## General Standards

### ESLint Rules
- Extends: `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `plugin:react/recommended`
- No unused variables: `@typescript-eslint/no-unused-vars: error`
- No `any`: `@typescript-eslint/no-explicit-any: error`
- Consistent imports: `import/order` rule with alphabetic sorting
- React hooks rules: `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`
- No console.log in production: `no-console: warn` (allow in development)

### Prettier Rules
- Single quotes: `false` (use double quotes)
- Semicolons: `true`
- Trailing commas: `all`
- Tab width: `2`
- Print width: `100`
- Bracket spacing: `true`
- Arrow function parentheses: `always`

### Import Ordering
1. External libraries (`react`, `express`, `zod`, `@supabase/supabase-js`)
2. Internal absolute imports (`@/services`, `@/types`)
3. Relative parent imports (`../`)
4. Relative sibling imports (`./`)
5. Type imports (with `import type`)

### Error Handling
- Custom error classes: `AppError` base, `ValidationError`, `AuthError`, `NotFoundError`
- Error properties: `code`, `message`, `statusCode`, `details?`
- Centralized error handler: formats error response, logs appropriately
- User-facing errors: generic in production, detailed in development
- Never expose stack traces or internal errors to clients

### Logging Standards
- Pino logger for structured JSON logs
- Log levels: `trace`, `debug`, `info`, `warn`, `error`, `fatal`
- Required fields: `timestamp`, `level`, `service`, `clinic_id`, `request_id`
- Redact sensitive fields: `password`, `token`, `ssn`, `phone` (last 4 digits only)
- Log all API requests (method, URL, status, duration)
- Log all errors with stack trace (development only)
