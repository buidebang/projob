kill $(lsof -t -i :3000) 2>/dev/null || true
pnpm dev > dev.log 2>&1 &
sleep 15
