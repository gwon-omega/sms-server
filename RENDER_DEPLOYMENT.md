# 🚀 Render Deployment Guide - EduFlow Server

## Prerequisites

1. ✅ Supabase PostgreSQL database configured
2. ✅ Render account created
3. ✅ GitHub repository connected to Render

---

## 🔧 Environment Variables for Render

Add these in Render Dashboard → Environment:

### Critical (Required)

```bash
# Database - Supabase
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Security - JWT
JWT_SECRET=<generate-64-char-random-string>
JWT_REFRESH_SECRET=<generate-64-char-random-string>

# Encryption
DATA_ENCRYPTION_KEY=<generate-32-char-random-string>

# Environment
NODE_ENV=production
PORT=4000
```

### Optional (Recommended)

```bash
# Frontend URL
BASE_URL=https://your-client-domain.com
FRONTEND_URL=https://your-client-domain.com

# Error Tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_ENVIRONMENT=production

# Analytics
POSTHOG_API_KEY=your-posthog-key
POSTHOG_HOST=https://app.posthog.com

# Email (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@yourdomain.com

# OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-api.render.com/api/auth/google/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=https://your-api.render.com/api/auth/microsoft/callback

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🔨 Render Build Configuration

### Build Command
```bash
npm run render:build
```

This command does:
1. `npm install` - Install dependencies
2. `prisma generate` - Generate Prisma Client
3. `prisma migrate deploy` - Run pending migrations
4. `npm run build` - Compile TypeScript to JavaScript

### Start Command
```bash
npm start
```

Runs: `node dist/server.js`

---

## 📋 Step-by-Step Deployment

### 1. Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `eduflow-server`
   - **Region**: Choose closest to your users
   - **Branch**: `main` or `production`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm run render:build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Starter` (or higher)

### 2. Add Environment Variables

In Render Dashboard → your service → **Environment**:

1. Click **Add Environment Variable**
2. Add all required variables from above
3. Click **Save Changes**

### 3. Deploy

1. Render will automatically deploy on save
2. Monitor logs for any errors
3. Wait for build to complete (~3-5 minutes)

---

## 🔍 Troubleshooting

### Error: "DATABASE_URL not set"

**Solution**: Add both `DATABASE_URL` and `DIRECT_URL` in Render environment variables.

```bash
DATABASE_URL=postgresql://...6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...5432/postgres
```

### Error: "Database authentication failed"

**Solutions**:
1. Verify Supabase password is correct
2. Check project-ref matches your Supabase project
3. Ensure region is correct (e.g., `us-east-1`, `eu-west-1`)
4. Test connection string locally first

### Error: "prisma migrate deploy failed"

**Solutions**:
1. Ensure `DIRECT_URL` uses port `:5432` (not pooled)
2. Run migrations locally first: `npm run prisma:migrate:prod`
3. Check Supabase database is accessible

### Error: "JWT_SECRET validation failed"

**Solution**: Generate secure secrets:

```bash
# In terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Build Times Out

**Solutions**:
1. Upgrade to higher Render tier
2. Optimize dependencies in package.json
3. Use caching strategies

---

## 🔐 Security Checklist

- [ ] `DATABASE_URL` and `DIRECT_URL` configured
- [ ] `JWT_SECRET` is 64+ characters (not default)
- [ ] `JWT_REFRESH_SECRET` is 64+ characters (not default)
- [ ] `DATA_ENCRYPTION_KEY` is 32+ characters
- [ ] `NODE_ENV=production`
- [ ] `SENTRY_DSN` configured for error tracking
- [ ] OAuth secrets secured (if using)
- [ ] Frontend CORS origins whitelisted

---

## 🧪 Verify Deployment

### Health Check
```bash
curl https://your-api.render.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-02T...",
  "uptime": 123.45,
  "database": "connected"
}
```

### API Test
```bash
curl https://your-api.render.com/api/auth/health
```

---

## 📊 Monitoring

1. **Render Dashboard**: View logs and metrics
2. **Sentry**: Track errors and performance
3. **PostHog**: Analytics and user tracking

---

## 🔄 CI/CD

Render auto-deploys on push to `main` branch:

1. Push code to GitHub
2. Render detects changes
3. Runs build command
4. Deploys if successful
5. Rolls back on failure

### Manual Deploy
```bash
# In Render Dashboard
Services → eduflow-server → Manual Deploy → Deploy latest commit
```

---

## 📚 Additional Resources

- [Render Docs](https://render.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

## 🆘 Getting Help

1. Check Render logs: Dashboard → Logs
2. Review [ARCHITECTURE_RLS_ANALYSIS.md](./ARCHITECTURE_RLS_ANALYSIS.md)
3. Check [PRISMA_SUPABASE_GUIDE.md](./PRISMA_SUPABASE_GUIDE.md)

---

**Last Updated**: January 2, 2026
