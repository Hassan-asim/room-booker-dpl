# Troubleshooting Guide

## Common Issues and Solutions

### 1. TypeScript Errors in admin.ts or seed.ts

**Error**: `Property 'admin' does not exist on type 'PrismaClient'`

**Solution**:
```bash
cd server
npx prisma generate
```

Then **restart your IDE/TypeScript server** (in VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server")

### 2. Database Not Found

**Error**: `Can't reach database server` or `Database not found`

**Solution**:
```bash
cd server
npx prisma db push
npx ts-node seed.ts
```

### 3. Port Already in Use

**Error**: `Port 3000 is already in use` or `Port 8080 is already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change ports in:
# - server/src/index.ts (line ~26)
# - vite.config.ts (line 10)
```

### 4. npm Scripts Disabled (Windows)

**Error**: `running scripts is disabled on this system`

**Solution**:
Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or use `cmd /c "npm install"` instead of `npm install`

### 5. Module Not Found Errors

**Solution**:
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 6. Prisma Client Out of Sync

**Error**: Schema changes not reflected in code

**Solution**:
```bash
cd server
npx prisma generate
npx prisma db push
```

### 7. Socket.IO Connection Failed

**Error**: WebSocket connection errors in browser console

**Solution**:
- Ensure backend is running on port 3000
- Check CORS settings in `server/src/index.ts`
- Clear browser cache

### 8. Admin Login Not Working

**Solution**:
```bash
cd server
npx ts-node seed.ts
```

This recreates the admin user with credentials:
- Email: `admin@dplit.com`
- Password: `123456789`

### 9. Calendar Not Showing

**Solution**:
- Check browser console for errors
- Ensure FullCalendar CSS is loaded
- Verify bookings API is returning data

### 10. Dark Mode Not Working

**Solution**:
- Clear localStorage: `localStorage.clear()`
- Refresh the page
- Check if ThemeProvider is wrapping the app

## Quick Fixes

### Reset Everything
```bash
# Delete databases
cd server
del dev.db

# Reinstall dependencies
cd ..
rmdir /s /q node_modules
rmdir /s /q server\node_modules

npm install
cd server
npm install

# Recreate database
npx prisma db push
npx ts-node seed.ts
```

### Restart TypeScript Server (VS Code)
1. Press `Ctrl+Shift+P`
2. Type "TypeScript: Restart TS Server"
3. Press Enter

### Clear Browser Cache
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Click "Clear data"

## Development Tips

### Hot Reload Not Working
- Backend: Restart `npm run dev` in server folder
- Frontend: Restart `npm run dev` in root folder

### Database Changes
After modifying `schema.prisma`:
```bash
cd server
npx prisma db push
npx prisma generate
```

### Adding New Dependencies
```bash
# Frontend
npm install <package>

# Backend
cd server
npm install <package>
```

## Need Help?

1. Check the browser console (F12)
2. Check the terminal output for errors
3. Verify all servers are running
4. Ensure database is initialized

## Useful Commands

```bash
# View database
cd server
npx prisma studio

# Check Prisma schema
npx prisma validate

# Format Prisma schema
npx prisma format

# View database migrations
npx prisma migrate status
```
