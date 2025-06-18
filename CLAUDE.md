# Todo App - Claude Development Guide

## Project Overview

A modern Todo application built with React Router v7, using Cloudflare D1 (SQLite) for data persistence, and deployed to Cloudflare Workers. The app features full-stack type safety, server-side rendering, and comprehensive testing with Vitest and Playwright.

## Tech Stack

- **Frontend**: React Router v7, React 19, TypeScript
- **Database**: Cloudflare D1 (SQLite)
- **Runtime**: Cloudflare Workers
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Styling**: CSS Modules / Tailwind CSS
- **Build**: Vite

## Commands

### Development

- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev`
- **Start dev with D1 local**: `npm run dev:local`
- **Type check**: `npm run typecheck`
- **Lint**: `npm run lint`
- **Format code**: `npm run format`

### Database

- **Create D1 database**: `npx wrangler d1 create todo-db`
- **Generate migrations**: `npm run db:generate`
- **Run migrations (local)**: `npm run db:migrate`
- **Run migrations (production)**: `npm run db:migrate:production`
- **Query database (local)**: `npx wrangler d1 execute todo-db --local --command "SELECT * FROM todos"`

### Testing

- **Unit tests**: `npm run test`
- **Unit tests (watch)**: `npm run test:watch`
- **Unit tests (coverage)**: `npm run test:coverage`
- **E2E tests**: `npm run test:e2e`
- **E2E tests (headed)**: `npm run test:e2e:ui`
- **All tests**: `npm run test:all`

### Build & Deploy

- **Build**: `npm run build`
- **Preview build locally**: `npm run preview`
- **Deploy to production**: `npm run deploy` (includes migrations + deployment + verification)
- **Deploy to staging**: `npm run deploy:staging`
- **View logs**: `npm run logs`
- **Manual deploy (advanced)**: `wrangler deploy`

## Project Structure

```
todo-app/
├── app/
│   ├── routes/          # React Router v7 file-based routes
│   ├── components/      # Reusable React components
│   ├── lib/            # Utilities and shared logic
│   ├── db/             # Database queries and schema
│   └── root.tsx        # Root layout component
├── migrations/         # D1 database migrations
├── tests/
│   ├── unit/          # Vitest unit tests
│   └── e2e/           # Playwright E2E tests
├── public/            # Static assets
├── wrangler.toml      # Cloudflare Workers configuration
├── vitest.config.ts   # Vitest configuration
└── playwright.config.ts # Playwright configuration
```

## Code Style

- Use TypeScript strict mode
- Prefer function components with hooks
- Use named exports for components
- Follow React Router v7 conventions for loaders/actions
- Use Zod for runtime validation
- Implement proper error boundaries
- Use semantic HTML and ARIA labels

## Development Workflow

### Mandatory Quality Checks
Before considering any task complete, you MUST run the following commands and ensure they ALL pass:

1. **TypeScript Type Checking**: `npm run typecheck`
   - Must pass with zero errors
   - Catches compatibility issues (e.g., Node.js vs Cloudflare Workers APIs)
   - Validates route types and component interfaces

2. **Unit Tests**: `npm run test`
   - All tests must pass
   - Validates component behavior and integration
   - Ensures no regressions in existing functionality

3. **Build Validation**: `npm run build`
   - Must complete successfully
   - Validates production build compatibility
   - Catches runtime environment issues

### Development Server Testing
After making changes, always verify:
- `npm run dev` starts without errors
- Application loads correctly in browser
- New functionality works as expected
- No console errors or warnings

### Critical Environment Considerations
- **Cloudflare Workers Runtime**: Use Web APIs instead of Node.js APIs
  - ✅ Use `crypto.randomUUID()` (Web Crypto API)
  - ❌ Avoid `import { randomUUID } from "crypto"` (Node.js)
  - ✅ Use `fetch()` for HTTP requests
  - ❌ Avoid Node.js built-in modules in component code

### Pre-Commit Checklist
Before committing code, verify:
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes  
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] New functionality tested manually
- [ ] No breaking changes to existing features

## Database Schema

```sql
-- todos table
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Testing Guidelines

- **Unit tests**: Test business logic, utilities, and hooks
- **Integration tests**: Test React Router loaders/actions
- **E2E tests**: Test critical user flows
- Mock D1 database in tests using Miniflare
- Use React Testing Library for component tests

## Deployment Notes

- Environment variables are configured in Cloudflare dashboard
- D1 database bindings configured in wrangler.toml
- Staging environment uses separate D1 database
- **One-command deployment**: `npm run deploy` handles build, migrations, and deployment automatically
- Production migrations are applied automatically during deployment
- Use Cloudflare Pages for preview deployments on PRs
- Deployment verification runs automatically after each deploy

## Common Issues & Solutions

1. **Cloudflare Workers Runtime Errors**: 
   - **Issue**: "Failed to load url crypto" or "Unexpected Node.js imports"
   - **Solution**: Use Web APIs instead of Node.js modules
   - **Example**: Use `crypto.randomUUID()` instead of `import { randomUUID } from "crypto"`

2. **React Router v7 + Vitest**: 
   - **Issue**: Router hooks fail in tests
   - **Solution**: Wrap components in `MemoryRouter` or mock React Router components

3. **D1 local development**: 
   - **Issue**: Database operations fail locally
   - **Solution**: Use `--local` flag for all D1 commands

4. **TypeScript errors with D1**: 
   - **Issue**: Missing type definitions
   - **Solution**: Ensure `@cloudflare/workers-types` is installed and run `npm run cf-typegen`

5. **E2E test failures**: 
   - **Issue**: Tests can't connect to dev server
   - **Solution**: Check if dev server is running on correct port

6. **Missing Route Types**:
   - **Issue**: Cannot find module './+types/routename'
   - **Solution**: Add route to `app/routes.ts` and run `npx react-router typegen`

## Security Considerations

- Validate all user inputs on the server
- Use prepared statements for D1 queries
- Implement CSRF protection for mutations
- Set appropriate CORS headers
- Never expose database credentials

## Performance Optimization

- Use React Router's defer for non-critical data
- Implement optimistic UI updates
- Cache static assets with Cloudflare
- Use D1's prepared statements for repeated queries
- Minimize JavaScript bundle size

## Useful Links

- [React Router v7 Docs](https://reactrouter.com)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Vitest Docs](https://vitest.dev)
- [Playwright Docs](https://playwright.dev)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)