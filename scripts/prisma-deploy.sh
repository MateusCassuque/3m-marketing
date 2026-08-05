#!/usr/bin/env bash
set -e

echo "🔹 Prisma: migrate deploy"
npx prisma migrate deploy

echo "🔹 Prisma: generate client"
npx prisma generate

echo "✅ Prisma ready"
