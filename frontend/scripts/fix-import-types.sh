#!/bin/bash

# Script to fix import type issues where values are imported as types
# This fixes TS1361 errors: 'X' cannot be used as a value because it was imported using 'import type'

cd "$(dirname "$0")/.."

echo "Fixing import type issues..."

# Fix formatStxAmount imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/import type { \(.*\)formatStxAmount\(.*\) } from/import type { \1} from/g; s/import type {  } from.*liquidity.*//g' {} +

find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "formatStxAmount" {} + | while read file; do
  if ! grep -q "^import.*formatStxAmount.*from.*liquidity" "$file"; then
    sed -i '' '1,/^import.*from.*liquidity/ s|^\(import type { [^}]*\) } from \(.*liquidity.*\)|import { formatStxAmount } from \2\n\1 } from \2|' "$file"
  fi
done

# Fix calculateAPY imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/import type { \(.*\)calculateAPY\(.*\) } from/import type { \1} from/g; s/import type {  } from.*liquidity.*//g' {} +

find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "calculateAPY" {} + | while read file; do
  if ! grep -q "^import.*calculateAPY.*from.*liquidity" "$file"; then
    sed -i '' '1,/^import.*from.*liquidity/ s|^\(import type { [^}]*\) } from \(.*liquidity.*\)|import { calculateAPY } from \2\n\1 } from \2|' "$file"
  fi
done

# Fix NETWORK_CONFIGS imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/import type { \(.*\)NETWORK_CONFIGS\(.*\) } from \(.*network.*\)/import type { \1} from \3\nimport { NETWORK_CONFIGS } from \3/g' {} +

# Fix NetworkType enum imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/import type { NetworkType, NETWORK_CONFIGS }/import { NetworkType, NETWORK_CONFIGS }/g' {} +

# Fix RoleType imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/import type { \(.*\)RoleType\(.*\) } from \(.*rbac.*\)/import { RoleType } from \3\nimport type { \1\2 } from \3/g' {} +

# Fix Permission imports  
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/import type { \(.*\)Permission\(.*\) } from \(.*rbac.*\)/import { Permission } from \3\nimport type { \1\2 } from \3/g' {} +

# Fix formatBlocksToTime imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/import type { \(.*\)formatBlocksToTime\(.*\) } from \(.*oracle.*\)/import type { \1\2 } from \3\nimport { formatBlocksToTime } from \3/g' {} +

# Clean up empty import type lines
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' '/^import type {  } from/d' {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' '/^import type { } from/d' {} +

echo "Done! Fixed import type issues."
