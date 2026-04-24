#!/bin/bash

# ============================================
# AI Pet Health Monitor - Start Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════╗"
echo "║     🐕 AI Pet Health Monitor             ║"
echo "║     Smart Pet Care Powered by AI         ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Project root
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Load environment
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✅ Environment loaded${NC}"
else
  echo -e "${RED}❌ .env file not found! Please create one from .env.example${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# ============================================
# Step 1: Kill processes on used ports
# ============================================
echo -e "\n${YELLOW}🔧 Cleaning up ports...${NC}"

kill_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null)
  if [ -n "$pids" ]; then
    echo -e "${YELLOW}  Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo -e "${GREEN}  Port $port is free${NC}"
  fi
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# ============================================
# Step 2: Check PostgreSQL
# ============================================
echo -e "\n${YELLOW}🐘 Checking PostgreSQL...${NC}"

if command -v pg_isready &> /dev/null; then
  if pg_isready -q 2>/dev/null; then
    echo -e "${GREEN}  PostgreSQL is running${NC}"
  else
    echo -e "${YELLOW}  Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
    if ! pg_isready -q 2>/dev/null; then
      echo -e "${RED}  ❌ PostgreSQL is not running. Please start it manually.${NC}"
      exit 1
    fi
  fi
else
  echo -e "${YELLOW}  pg_isready not found, assuming PostgreSQL is running${NC}"
fi

# ============================================
# Step 3: Create database and user if needed
# ============================================
echo -e "\n${YELLOW}🗄️  Setting up database...${NC}"

# Extract DB name, user, password from DATABASE_URL
DB_NAME=$(echo $DATABASE_URL | sed 's/.*\///' | sed 's/?.*//')
DB_USER=$(echo $DATABASE_URL | sed 's|postgresql://||' | sed 's/:.*||')
DB_PASS=$(echo $DATABASE_URL | sed 's|.*://[^:]*:||' | sed 's|@.*||')

# Create user and database
psql postgres -c "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null | grep -q 1 || \
  psql postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' CREATEDB;" 2>/dev/null || true

psql postgres -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null | grep -q 1 || \
  psql postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true

echo -e "${GREEN}  Database '$DB_NAME' ready${NC}"

# ============================================
# Step 4: Install dependencies
# ============================================
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"

if [ ! -d "backend/node_modules" ]; then
  echo -e "${CYAN}  Installing backend dependencies...${NC}"
  cd backend && npm install && cd ..
else
  echo -e "${GREEN}  Backend dependencies already installed${NC}"
fi

if [ ! -d "frontend/node_modules" ]; then
  echo -e "${CYAN}  Installing frontend dependencies...${NC}"
  cd frontend && npm install && cd ..
else
  echo -e "${GREEN}  Frontend dependencies already installed${NC}"
fi

# ============================================
# Step 5: Seed the database
# ============================================
echo -e "\n${YELLOW}🌱 Seeding database...${NC}"
cd backend && node src/seeds/seed.js && cd ..
echo -e "${GREEN}  Database seeded successfully${NC}"

# ============================================
# Step 6: Start services with hot reload
# ============================================
echo -e "\n${YELLOW}🚀 Starting services...${NC}"

# Start backend with nodemon (hot reload)
echo -e "${CYAN}  Starting backend on port $BACKEND_PORT with hot reload (nodemon)...${NC}"
cd backend && npx nodemon src/index.js &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo -e "${CYAN}  Waiting for backend...${NC}"
for i in $(seq 1 30); do
  if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}  Backend is ready!${NC}"
    break
  fi
  sleep 1
done

# Start frontend with hot reload (default React behavior)
echo -e "${CYAN}  Starting frontend on port $FRONTEND_PORT with hot reload...${NC}"
cd frontend && PORT=$FRONTEND_PORT BROWSER=none npm start &
FRONTEND_PID=$!
cd ..

# ============================================
# Cleanup on exit
# ============================================
cleanup() {
  echo -e "\n${YELLOW}🛑 Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  kill_port $BACKEND_PORT
  kill_port $FRONTEND_PORT
  echo -e "${GREEN}✅ All services stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# ============================================
# Display info
# ============================================
sleep 3
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║  🎉 AI Pet Health Monitor is running!            ║"
echo "║                                                  ║"
echo "║  Frontend:  http://localhost:$FRONTEND_PORT              ║"
echo "║  Backend:   http://localhost:$BACKEND_PORT/api          ║"
echo "║                                                  ║"
echo "║  Demo Login:                                     ║"
echo "║    Email:    demo@petmonitor.com                  ║"
echo "║    Password: password123                          ║"
echo "║                                                  ║"
echo "║  ✨ Hot reload enabled for both services          ║"
echo "║  Press Ctrl+C to stop                            ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Keep script running
wait
