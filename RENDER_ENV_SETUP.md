# 🚀 Render.com Environment Variables Setup

## Prisma + Supabase PostgreSQL Only

**⚠️ IMPORTANT**: This project uses **Prisma + Supabase PostgreSQL exclusively**. MySQL/Sequelize has been disabled.

This checklist ensures your Render deployment has all necessary environment variables configured.

---

## ✅ **CRITICAL - MUST CONFIGURE**

### 1. Database (Prisma + Supabase)

```bash
# Get from: Supabase Dashboard > Project Settings > Database > Connection String

# Runtime connection (pooled via Supavisor)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection (for migrations)
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

**📝 How to get**:
1. Go to Supabase Dashboard
2. Select your project
3. Settings > Database
4. Copy **Connection pooling** string for DATABASE_URL
5. Copy **Direct connection** string for DIRECT_URL

---

### 2. JWT Secrets

```bash
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-128-character-random-hex-string
JWT_REFRESH_SECRET=your-128-character-random-hex-string
```

**⚠️ SECURITY**: NEVER use default values! Generate unique secrets.

---

### 3. Frontend URL

```bash
FRONTEND_URL=https://your-frontend-domain.com
BASE_URL=https://your-frontend-domain.com
```

---

### 4. Cloudinary (File Storage)

```bash
# Get from: https://console.cloudinary.com/
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

### 5. Email (Nodemailer)

```bash
# For Gmail:
# 1. Enable 2FA on your Google account
# 2. Generate App Password: https://myaccount.google.com/apppasswords
NODEMAILER_GMAIL=your-email@gmail.com
NODEMAILER_GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

---

## ~~🔧 LEGACY MYSQL (DISABLED)~~

**⚠️ MySQL/Sequelize has been completely disabled in this project.**

The following variables are **NOT NEEDED** and will be ignored:
- ~~DB_NAME~~
- ~~DB_USERNAME~~
- ~~DB_PASSWORD~~
- ~~DB_HOST~~
- ~~DB_PORT~~

All database operations now use **Prisma Client** with **Supabase PostgreSQL**.

---

## 📊 **OPTIONAL - MONITORING**

### Sentry (Error Tracking)

```bash
# Get from: https://sentry.io/
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### PostHog (Analytics)

```bash
# Get from: https://posthog.com/
POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
```

---

## 🔐 **OPTIONAL - OAUTH**

### Google OAuth

```bash
# Get from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_CALLBACK_URL=https://your-api-domain.com/api/auth/google/callback
```

### Microsoft OAuth

```bash
# Get from: https://portal.azure.com/
MICROSOFT_CLIENT_ID=xxxxx
MICROSOFT_CLIENT_SECRET=xxxxx
MICROSOFT_CALLBACK_URL=https://your-api-domain.com/api/auth/microsoft/callback
```

---

## 🔄 **SYSTEM CONFIGURATION**

```bash
NODE_ENV=production
PORT=10000  # Render uses 10000 by default
ENABLE_SCHEDULER=true
DATA_ENCRYPTION_KEY=your-32-character-hex-key
```

---

## 📋 **RENDER SETUP STEPS**

### Step 1: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. New > Web Service
3. Connect your GitHub repository
4. Select `server` folder as root directory

### Step 2: Configure Build Settings

```yaml
Build Command: npm install && npx tsc
Start Command: node dist/server.js
```

### Step 3: Add Environment Variables

1. Go to your service > Environment
2. Add all CRITICAL variables from above
3. Click "Save Changes"

### Step 4: Deploy

1. Click "Manual Deploy" > Deploy latest commit
2. Monitor logs for:
   - ✅ "Prisma Client generated"
   - ✅ "Build successful"
   - ✅ "Server running at http://0.0.0.0:10000"

---

## 🐛 **TROUBLESHOOTING**

### ~~Error: "Database authentication failed"~~

**Status**: ✅ **RESOLVED** - MySQL is now completely disabled. You will NOT see this error.

The server logs will show:
```
ℹ️  MySQL/Sequelize DISABLED - Using Prisma + Supabase PostgreSQL only
ℹ️  Legacy sequelize import available for backward compatibility
```

### Error: "DATABASE_URL is not set"

**Cause**: Supabase connection string missing.

**Solution**: Add DATABASE_URL and DIRECT_URL from Supabase dashboard.

### Error: "JWT_SECRET must be at least 32 characters"

**Cause**: JWT secret is too short or using default value.

**Solution**: Generate new secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Build succeeds but app crashes on startup

**Cause**: Missing required environment variables.

**Solution**: Check Render logs for specific missing variables, add them in Environment tab.

---

## ✅ **VERIFICATION CHECKLIST**

Before deploying, ensure:

- [ ] DATABASE_URL is set (Supabase pooled connection)
- [ ] DIRECT_URL is set (Supabase direct connection)
- [ ] JWT_SECRET is 64+ characters and unique
- [ ] JWT_REFRESH_SECRET is 64+ characters and unique
- [ ] FRONTEND_URL matches your frontend domain
- [ ] CLOUDINARY credentials are configured
- [ ] NODEMAILER credentials are configured
- [ ] NODE_ENV=production
- [ ] All secrets are different from .env.example defaults
- [ ] MySQL variables (DB_NAME, etc.) are NOT set (they're ignored)

---

## 📚 **REFERENCES**

- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Supabase Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Prisma 7 with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Cloudinary Setup](https://cloudinary.com/documentation/node_integration)

---

**Last Updated**: January 3, 2026
**Database**: ✅ Prisma + Supabase PostgreSQL ONLY (MySQL disabled)
**Deployment Status**: ✅ Ready for Render
