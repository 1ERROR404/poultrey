#!/bin/bash

echo "Running database migration..."
npx drizzle-kit push:pg

echo "Seeding database..."
npx tsx scripts/db-push.ts