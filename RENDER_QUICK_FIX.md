# 🚨 RENDER DEPLOYMENT QUICK FIX

## The Issue
**Error**: `Database sync failed: Database authentication failed`

**Root Cause**: Missing or incorrect `DATABASE_URL` environment variable in Render.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Get Supabase Connection Strings

Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → Database

Copy **Transaction pooler** connection string:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

Copy **Session pooler** connection string (or modify above):
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### Step 2: Add to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your service
3. Go to **Environment** tab
4. Add these variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://...6543/postgres?pgbouncer=true` (pooled) |
| `DIRECT_URL` | `postgresql://...5432/postgres` (direct) |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generate with command below ⬇️ |
| `JWT_REFRESH_SECRET` | Generate with command below ⬇️ |
| `DATA_ENCRYPTION_KEY` | Generate with command below ⬇️ |

5. Click **Save Changes**

### Step 3: Generate Secure Secrets

Run in your terminal:
```bash
# Generate JWT_SECRET (64 chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET (64 chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate DATA_ENCRYPTION_KEY (32 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy each output and paste into Render environment variables.

### Step 4: Redeploy

Render will auto-deploy when you save environment variables.

---

## 🔍 Verify It's Working

Check health endpoint:
```bash
curl https://your-service.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## 🛠️ Build Settings in Render

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run render:build` |
| **Start Command** | `npm start` |
| **Root Directory** | `server` |

---

## 📋 Complete Environment Variables Checklist

### Required
- [x] `DATABASE_URL` (Supabase pooled - port 6543)
- [x] `DIRECT_URL` (Supabase direct - port 5432)
- [x] `NODE_ENV=production`
- [x] `JWT_SECRET` (64+ chars)
- [x] `JWT_REFRESH_SECRET` (64+ chars)
- [x] `DATA_ENCRYPTION_KEY` (32+ chars)

### Optional but Recommended
- [ ] `SENTRY_DSN` (error tracking)
- [ ] `FRONTEND_URL` (CORS)
- [ ] `BASE_URL` (frontend URL)

---

## ❌ Common Mistakes

1. **Wrong Port**: `DATABASE_URL` must use port `6543` (pooled), `DIRECT_URL` must use `5432` (direct)
2. **Missing Password**: Ensure `:password` in connection string is correct
3. **Wrong Project Ref**: `postgres.[project-ref]` must match your Supabase project
4. **Using Default Secrets**: Never use example JWT secrets in production

---

## 🆘 Still Not Working?

### Check Logs
```
Render Dashboard → Your Service → Logs
```

### Common Errors

**"Invalid `prisma.user.findUnique()` invocation"**
- ✅ Fix: Run `prisma generate` - add to build command

**"Can't reach database server"**
- ✅ Fix: Check Supabase is running and connection string is correct

**"JWT_SECRET validation failed"**
- ✅ Fix: Ensure secrets are 64+ characters and not default values

---

## 📞 Need More Help?

See full guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

---

**Last Updated**: January 2, 2026
