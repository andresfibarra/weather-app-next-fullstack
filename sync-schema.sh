#!/bin/bash

# Script to dump all schemas and RPCs from source Supabase project and push to target
# Usage: ./sync-schema.sh <source-project-ref> <target-project-ref>
# Or set environment variables: SOURCE_PROJECT_REF and TARGET_PROJECT_REF

set -e

SOURCE_PROJECT_REF="${1:-${SOURCE_PROJECT_REF}}"
TARGET_PROJECT_REF="${2:-${TARGET_PROJECT_REF}}"

[ -z "$SOURCE_PROJECT_REF" ] || [ -z "$TARGET_PROJECT_REF" ] && {
  echo "Usage: $0 <source-ref> <target-ref>"
  exit 1
}

DUMP_FILE="/tmp/schema-$$.sql"

# Dump from source (public schema only - tables + RPCs)
echo "Linking to source project..."
if [ -n "$SOURCE_DB_PASSWORD" ]; then
  npx supabase link --project-ref "$SOURCE_PROJECT_REF" --password "$SOURCE_DB_PASSWORD" 2>/dev/null || true
else
  echo "Enter database password for source project:"
  npx supabase link --project-ref "$SOURCE_PROJECT_REF" 2>/dev/null || true
fi

echo "Dumping schema..."
npx supabase db dump --schema public -f "$DUMP_FILE"

# Link to target
echo "Linking to target project..."
if [ -n "$TARGET_DB_PASSWORD" ]; then
  npx supabase link --project-ref "$TARGET_PROJECT_REF" --password "$TARGET_DB_PASSWORD" 2>/dev/null || true
else
  echo "Enter database password for target project:"
  npx supabase link --project-ref "$TARGET_PROJECT_REF" 2>/dev/null || true
fi

# Apply to target
echo "Applying schema..."
npx supabase migration new sync_schema 2>/dev/null || true
MIGRATION_FILE=$(find supabase/migrations -name "*sync_schema*.sql" | head -1)
if [ -n "$MIGRATION_FILE" ]; then
  cat "$DUMP_FILE" > "$MIGRATION_FILE"
  npx supabase db push
else
  echo "Error: Could not create migration file"
  exit 1
fi

rm -f "$DUMP_FILE"
echo "✓ Done!"