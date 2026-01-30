# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL (Supabase) configured
- Redis server
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)

---

## Option 1: Deploy to VPS (DigitalOcean, AWS EC2, etc.)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Redis
sudo apt install redis-server -y
sudo systemctl enable redis-server
```

### Step 2: Clone and Setup Application

```bash
# Clone repository
git clone <your-repo-url>
cd real-estate-backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
nano .env  # Edit with your credentials

# Build application
npm run build

# Create logs directory
mkdir -p logs
```

### Step 3: PM2 Process Manager

```bash
# Start application
pm2 start dist/index.js --name real-estate-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor application
pm2 monit

# View logs
pm2 logs real-estate-api
```

### Step 4: Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/real-estate-api
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/real-estate-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 5: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured by default
# Test renewal
sudo certbot renew --dry-run
```

---

## Option 2: Deploy with Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    env_file:
      - .env
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  redis-data:
```

### Build and Run

```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

---

## Option 3: Deploy to Cloud Platforms

### Heroku

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Add Redis addon
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key
# ... set all other env vars

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Railway

1. Connect your GitHub repository
2. Add environment variables in dashboard
3. Deploy automatically on git push

### Render

1. Connect GitHub repository
2. Configure build command: `npm run build`
3. Configure start command: `npm start`
4. Add environment variables
5. Deploy

### AWS ECS (Elastic Container Service)

1. Build Docker image
2. Push to ECR (Elastic Container Registry)
3. Create ECS task definition
4. Create ECS service
5. Configure load balancer

---

## Environment Variables for Production

```env
NODE_ENV=production
PORT=5000

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Redis
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# AI Service
AI_SERVICE_URL=https://your-ai-service.com
AI_SERVICE_API_KEY=your_production_api_key

# Security
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=warn
```

---

## Database Migration

### Run SQL Scripts in Supabase

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run scripts from `docs/SUPABASE_SCHEMA.md` in order:
   - Helper functions
   - Table creation
   - Indexes
   - RLS policies

### Verify Setup

```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test RLS policies
-- (Login as different users and test access)
```

---

## Performance Optimization

### 1. Enable Redis Caching

Ensure Redis is properly configured and connected.

### 2. Database Indexing

All necessary indexes are created in the schema. Monitor slow queries:

```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### 3. Nginx Caching (Optional)

Add to Nginx configuration:

```nginx
# Cache static responses
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

location /api/properties {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$request_uri";
    # ... other proxy settings
}
```

### 4. PM2 Cluster Mode

```bash
# Use all CPU cores
pm2 start dist/index.js -i max --name real-estate-api
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# Install PM2 Plus (optional)
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Application Logs

Logs are stored in `logs/` directory:
- `error.log` - Error logs
- `combined.log` - All logs

### Health Checks

```bash
# Check application health
curl http://localhost:5000/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-30T12:00:00.000Z",
  "environment": "production"
}
```

---

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables properly set (no hardcoded secrets)
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers configured
- [ ] RLS policies tested and enabled
- [ ] Service role key never exposed to frontend
- [ ] Regular dependency updates (`npm audit`)
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] SSH key-based authentication (disable password)
- [ ] Regular backups configured

---

## Backup Strategy

### Database Backups (Supabase)

Supabase automatically backs up your database. Configure:
- Daily backups (automatic)
- Point-in-time recovery enabled
- Download manual backups periodically

### Redis Backups

```bash
# Manual backup
redis-cli SAVE

# Backup file location
/var/lib/redis/dump.rdb

# Automated backups (cron)
0 2 * * * redis-cli SAVE && cp /var/lib/redis/dump.rdb /backup/redis-$(date +\%Y\%m\%d).rdb
```

---

## Rollback Strategy

### PM2 Rollback

```bash
# List deployments
pm2 list

# Stop current
pm2 stop real-estate-api

# Checkout previous version
git checkout <previous-commit>
npm install
npm run build

# Restart
pm2 restart real-estate-api
```

### Docker Rollback

```bash
# Pull previous image
docker pull your-registry/real-estate-api:previous-tag

# Update docker-compose.yml with previous tag

# Restart
docker-compose up -d
```

---

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs real-estate-api --lines 100

# Check environment variables
pm2 env 0

# Test build
npm run build
node dist/index.js
```

### Redis connection issues

```bash
# Test Redis connection
redis-cli ping

# Check Redis status
sudo systemctl status redis-server

# Restart Redis
sudo systemctl restart redis-server
```

### Database connection issues

```bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" https://YOUR_PROJECT.supabase.co/rest/v1/

# Check environment variables
echo $SUPABASE_URL
```

### High memory usage

```bash
# Check memory
free -h

# Monitor PM2 processes
pm2 monit

# Restart application
pm2 restart real-estate-api
```

---

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or AWS ALB
2. **Multiple Instances**: Run on multiple servers
3. **Shared Redis**: Use managed Redis (AWS ElastiCache, Redis Cloud)
4. **Database**: Supabase handles scaling automatically

### Vertical Scaling

- Upgrade server resources (CPU, RAM)
- Use PM2 cluster mode
- Optimize database queries

---

## Post-Deployment

1. Test all API endpoints
2. Monitor error logs for first 24 hours
3. Set up uptime monitoring (UptimeRobot, Pingdom)
4. Configure alerts for downtime
5. Document API URL and share with frontend team

---

## Support

For deployment issues:
- Check logs: `pm2 logs`
- Review Supabase dashboard
- Test health endpoint
- Contact DevOps team
