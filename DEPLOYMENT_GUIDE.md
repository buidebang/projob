# Absolute Production Deployment Guide (Phase 21)

This deployment guide ensures that your ProJob application architecture will compile, build, and run flawlessly on a bare-metal Ubuntu VPS (e.g. 2 Cores, 4GB RAM) without Docker build failures or runtime resets.

## Root Causes Fixed
- **Pnpm version incompatibility:** Using `corepack enable pnpm` installs v10/11 which is incompatible with `node:20-alpine`. The Dockerfile now strictly pins `pnpm@9` globally via `npm install -g pnpm@9`.
- **Prisma postinstall crashes:** Installing `--prod` dependencies during the standalone runner generation invoked a `prisma generate` post-hook. By utilizing `--ignore-scripts`, Prisma generation is deliberately bypassed during the production node module extraction.
- **Yjs Module Crash (`ERR_PACKAGE_PATH_NOT_EXPORTED`):** Older versions of `y-websocket` require an explicit `.js` suffix if node package exports aren't perfectly mapped. Modified `lib/yjs/server.ts` to `require('y-websocket/bin/utils.js')`.
- **Nginx Reverse Proxy Resets:** The `start_production.sh` script previously possessed a severe edge case that would execute `kill -s TERM $$` upon missing environment variables, terminating the daemon prior to HTTP proxy initialization resulting in `Connection Reset By Peer`. Furthermore, Next.js was binding strictly to `localhost` inside Docker, making Nginx fail. Next.js is now bound safely via `ENV HOSTNAME="0.0.0.0"` in the Dockerfile.

## Pre-requisites (Ubuntu Server)
Ensure you have Docker and Docker Compose installed.

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
```

## Step-by-Step Execution

### 1. Setup Environment Variables
Clone your project repository on the server. Inside the root directory, create your `.env` file:
```bash
cat << 'ENV_EOF' > .env
DATABASE_URL="postgresql://user:password@localhost:5432/projob?sslmode=require"
NEXTAUTH_URL="https://your-domain.com"
AUTH_SECRET="super-secret-key-123"
GEMINI_API_KEY="your-gemini-key"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
STRIPE_API_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID="price_..."
ENV_EOF
```

*(Note: Change values accordingly)*

### 2. Configure Database and Redis via Docker Compose
In your root repository, utilize the `docker-compose.yml` to spin up your persistence infrastructure:

```bash
docker-compose up -d db redis
```

### 3. Synchronize Database (Prisma)
Before compiling Next.js, the database schema must be initialized:
```bash
# Requires local node/pnpm to sync the external DB prior to Docker building.
npm install -g pnpm@9
pnpm install
npx prisma db push
```

### 4. Build & Deploy the Core App
With the database prepared, build the Next.js standalone container. We use `--build` to ensure the patched `Dockerfile` layers compile cleanly.

```bash
# Set DOCKER_BUILDKIT=0 if you encounter overlayfs mount errors on your specific Ubuntu VPS.
DOCKER_BUILDKIT=0 docker-compose up -d --build app
```

### 5. Validate the Next.js Standalone Runner
Verify the logs to ensure Next.js booted in 0.0.0.0:
```bash
docker logs projob-app-1
```
You should see:
```text
✓ Ready in XXXms
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Network:      http://0.0.0.0:3000
Yjs WebSocket Server running on port 1234
```

### 6. Setup Nginx Reverse Proxy
Finally, configure Nginx to route external traffic to your Docker container binding on `0.0.0.0:3000`.

```bash
sudo apt install -y nginx
cat << 'NGINX_EOF' | sudo tee /etc/nginx/sites-available/projob
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # For Yjs Real-Time CRDT (Optional but recommended)
    location /yjs/ {
        proxy_pass http://127.0.0.1:1234;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
NGINX_EOF

sudo ln -s /etc/nginx/sites-available/projob /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

You are now successfully deployed.
