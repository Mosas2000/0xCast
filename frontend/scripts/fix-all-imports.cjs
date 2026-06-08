#!/usr/bin/env node

/**
 * Script to fix import type issues where values/enums/constants are imported as types
 * This fixes TS1361 errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Map of items that should NOT be imported as types (they are runtime values)
const VALUE_IMPORTS = {
  // From @/types/market
  'MarketStatus': '@/types/market',
  'MarketOutcome': '@/types/market',
  'CATEGORY_METADATA': '@/types/market',
  'MARKET_CATEGORIES': '@/types/market',
  'MARKET_DURATIONS': '@/types/market',
  'CATEGORY_COLORS': '@/types/market',
  'getMarketOutcomeLabel': '@/types/market',
  'isMarketStatus': '@/types/market',
  'isMarketOutcome': '@/types/market',
  
  // From @/types/liquidity
  'formatStxAmount': '@/types/liquidity',
  'calculateAPY': '@/types/liquidity',
  'calculateSharePercentage': '@/types/liquidity',
  'calculatePositionValue': '@/types/liquidity',
  'DEFAULT_FEE_CONFIG': '@/types/liquidity',
  
  // From @/types/oracle
  'formatBlocksToTime': '@/types/oracle',
  'formatDisputeStatus': '@/types/oracle',
  'getDisputeStatusColor': '@/types/oracle',
  'DISPUTE_STATUS': '@/types/oracle',
  
  // From @/types/network
  'NetworkType': '@/types/network',
  'NETWORK_CONFIGS': '@/types/network',
  
  // From @/types/rbac
  'RoleType': '@/types/rbac',
  'Permission': '@/types/rbac',
  
  // From @/types/export
  'ExportFormat': '@/types/export',
  
  // From @/utils/marketValidation
  'QUESTION_VALIDATION_RULES': '@/utils/marketValidation',
};

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [itemName, modulePath] of Object.entries(VALUE_IMPORTS)) {
    // Pattern 1: import type { ..., itemName, ... } from 'module'
    const typeImportRegex = new RegExp(
      `import type \\{([^}]*\\b${itemName}\\b[^}]*)\\} from ['"]${modulePath.replace(/\//g, '\\/')}['"]`,
      'g'
    );
    
    if (typeImportRegex.test(content)) {
      content = content.replace(typeImportRegex, (match, imports) => {
        const items = imports.split(',').map(s => s.trim()).filter(Boolean);
        const typeItems = items.filter(item => !item.includes(itemName));
        const valueItems = items.filter(item => item.includes(itemName));
        
        let result = '';
        if (typeItems.length > 0) {
          result += `import type { ${typeItems.join(', ')} } from '${modulePath}';\n`;
        }
        result += `import { ${valueItems.join(', ')} } from '${modulePath}'`;
        
        modified = true;
        return result;
      });
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      callback(filePath);
    }
  }
}

console.log('Fixing import type issues...');

const srcDir = path.join(__dirname, '..', 'src');
let filesFixed = 0;

walkDir(srcDir, (filePath) => {
  if (fixImportsInFile(filePath)) {
    filesFixed++;
    console.log(`Fixed: ${path.relative(srcDir, filePath)}`);
  }
});

console.log(`\nDone! Fixed ${filesFixed} files.`);
