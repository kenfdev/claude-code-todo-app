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
- **Run migrations (local)**: `npx wrangler d1 execute todo-db --local --file=./migrations/001_init.sql`
- **Run migrations (prod)**: `npx wrangler d1 execute todo-db --remote --file=./migrations/001_init.sql`
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
- **Deploy to staging**: `npx wrangler deploy --env staging`
- **Deploy to production**: `npx wrangler deploy`
- **View logs**: `npx wrangler tail`

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

## Database Schema

```sql
-- todos table
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
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
- Production deployments require manual database migrations
- Use Cloudflare Pages for preview deployments on PRs

## Common Issues & Solutions

1. **React Router v7 + Vitest**: Disable router in test environment
2. **D1 local development**: Use `--local` flag for all D1 commands
3. **TypeScript errors with D1**: Ensure `@cloudflare/workers-types` is installed
4. **E2E test failures**: Check if dev server is running on correct port

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
