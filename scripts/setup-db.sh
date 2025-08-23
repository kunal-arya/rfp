#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h localhost -p 5432 -U rfp_user -d rfp_db; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is ready!"

# Run database migrations
echo "Running database migrations..."
cd backend
pnpm prisma migrate deploy

# Run database seeding
echo "Running database seeding..."
pnpm prisma db seed

echo "Database setup complete!"
