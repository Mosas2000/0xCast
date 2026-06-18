#!/usr/bin/env node
/**
 * Script to fix type-only imports for verbatimModuleSyntax compliance
 * 
 * This script converts regular imports of types to type-only imports
 * Example: import { Type } from 'module' -> import type { Type } from 'module'
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript errors related to type imports
function getTypeImportErrors() {
  try {
    execSync('npx tsc -b 2>&1', { stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = error.stdout.toString();
    const errors = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS1484: '(.+?)' is a type/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          col: parseInt(match[3]),
          typeName: match[4]
        });
      }
    }
    
    return errors;
  }
}

// Fix a single file's type imports
function fixTypeImports(filePath, typeNames) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is an import line with types that need fixing
    if (line.trim().startsWith('import ')) {
      for (const typeName of typeNames) {
        // Pattern: import { ..., TypeName, ... } from '...'
        const regex = new RegExp(`(import\\s+{[^}]*)(\\b${typeName}\\b)([^}]*}\\s+from)`, 'g');
        
        if (regex.test(line)) {
          // Check if we need to split the import
          const hasRuntimeImports = line.match(/import\s+{([^}]+)}/);
          if (hasRuntimeImports) {
            const imports = hasRuntimeImports[1].split(',').map(s => s.trim());
            const types = imports.filter(imp => typeNames.includes(imp));
            const runtime = imports.filter(imp => !typeNames.includes(imp));
            
            if (types.length > 0 && runtime.length > 0) {
              // Split into two imports
              const fromMatch = line.match(/from\s+['"]([^'"]+)['"]/);
              if (fromMatch) {
                const module = fromMatch[1];
                lines[i] = `import type { ${types.join(', ')} } from '${module}';\nimport { ${runtime.join(', ')} } from '${module}';`;
              }
            } else if (types.length > 0) {
              // Convert entire import to type-only
              lines[i] = line.replace(/^import\s+{/, 'import type {');
            }
          }
        }
      }
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
}

// Main execution
console.log('🔍 Scanning for type import errors...\n');
const errors = getTypeImportErrors();

if (errors.length === 0) {
  console.log('✅ No type import errors found!');
  process.exit(0);
}

console.log(`Found ${errors.length} type import errors\n`);

// Group errors by file
const fileErrors = {};
for (const error of errors) {
  if (!fileErrors[error.file]) {
    fileErrors[error.file] = [];
  }
  fileErrors[error.file].push(error.typeName);
}

// Fix each file
let fixed = 0;
for (const [file, typeNames] of Object.entries(fileErrors)) {
  try {
    console.log(`📝 Fixing ${file}...`);
    fixTypeImports(file, [...new Set(typeNames)]);
    fixed++;
  } catch (err) {
    console.error(`❌ Error fixing ${file}:`, err.message);
  }
}

console.log(`\n✅ Fixed ${fixed} files`);
console.log('\n🔄 Re-running TypeScript check...\n');

try {
  execSync('npx tsc -b', { stdio: 'inherit' });
  console.log('\n✅ All type import errors fixed!');
} catch (error) {
  console.log('\n⚠️  Some errors remain. Running fix script again may help.');
  process.exit(1);
}
