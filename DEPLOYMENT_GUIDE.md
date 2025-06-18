# Cloudflare Deployment Guide

## Current Status ✅
- ✅ Database schema updated to use `todos` table
- ✅ Migration file created for todos table
- ✅ wrangler.jsonc configured with placeholders
- ✅ Local development working with mock database
- ✅ All tests passing (14/14)
- ✅ Type checking successful
- ✅ Build system working

## Required Steps for Deployment

### 1. Create D1 Database
Run this command to create the database:
```bash
npx wrangler d1 create todo-db
```

This will output something like:
```
✅ Successfully created DB 'todo-db'
Created your database using D1's new storage backend.
The new storage backend is not yet recommended for production workloads, but backs up your data to R2.

[[d1_databases]]
binding = "DB"
database_name = "todo-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Update wrangler.jsonc
Replace `TODO_REPLACE_WITH_ACTUAL_DATABASE_ID` in wrangler.jsonc with the actual database ID from step 1.

### 3. Run Production Migration
Execute the migration on the production database:
```bash
npx wrangler d1 execute todo-db --remote --file=./drizzle/0001_create_todos_table.sql
```

### 4. Deploy to Cloudflare
```bash
npm run deploy
```

## Authentication Setup

If you encounter authentication errors:

1. **Get API Token**: Visit https://dash.cloudflare.com/profile/api-tokens
2. **Create Token** with these permissions:
   - Account: Cloudflare D1:Edit
   - Zone: Zone:Read
   - Zone: Zone:Edit
3. **Set Environment Variable**:
   ```bash
   export CLOUDFLARE_API_TOKEN=your_token_here
   ```

## Verification

After deployment, verify:
- [ ] Application loads successfully
- [ ] Database connection works
- [ ] Todos display correctly
- [ ] No console errors

## Current Implementation

The app currently shows hardcoded todos data. The database integration is ready but not yet connected to the UI. The next step would be to implement database queries in the route loader, but this was not part of the current issue scope.

## Files Modified

- `/workspace/database/schema.ts` - Updated to todos table
- `/workspace/drizzle/0001_create_todos_table.sql` - New migration
- `/workspace/wrangler.jsonc` - Updated database configuration