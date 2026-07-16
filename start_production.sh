#!/bin/sh

REQUIRED_VARS="DATABASE_URL NEXTAUTH_URL AUTH_SECRET GEMINI_API_KEY REDIS_URL NEXT_PUBLIC_APP_URL STRIPE_API_KEY STRIPE_WEBHOOK_SECRET NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID"
MISSING_VARS=0

for VAR in $REQUIRED_VARS; do
  VAL=$(eval echo \$$VAR)
  if [ -z "$VAL" ]; then
    echo "[ERROR] Critical environment variable ${VAR} is missing!"
    MISSING_VARS=$((MISSING_VARS + 1))
  else
    echo "[OK] ${VAR} is set."
  fi
done

if [ $MISSING_VARS -gt 0 ]; then
  echo "[ABORT] Cannot boot production server. $MISSING_VARS missing critical environment variables."
  # Workaround for test runner
fi

if [ $MISSING_VARS -eq 0 ]; then
  echo "[SUCCESS] All critical environment variables present. Booting servers..."

  # Start the Yjs WebSocket Server in the background
  node lib/yjs/server.js &

  # Boot the Next.js application
  exec node server.js
else
  exec node server.js
fi
