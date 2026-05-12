#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ValidationResult {
    file: string;
    hasHardcodedHeights: boolean;
    issues: string[];
}

const HARDCODED_PATTERNS = [
    /const\s+\w*BLOCK\w*\s*=\s*\d{6,}/,
    /uintCV\(\s*\d{6,}\s*\)/,
    /endBlock\s*=\s*\d{6,}/,
    /resolutionBlock\s*=\s*\d{6,}/,
];

const REQUIRED_IMPORTS = [
    'fetchCurrentBlockHeight',
    'calculateMarketBlocks',
    'getCurrentBlockHeight',
];

function validateFile(filePath: string): ValidationResult {
    const content = fs.readFileSync(filePath, 'utf-8');
    const issues: string[] = [];
    
    for (const pattern of HARDCODED_PATTERNS) {
        if (pattern.test(content)) {
            const match = content.match(pattern);
            issues.push(`Found hardcoded block height: ${match?.[0]}`);
        }
    }
    
    const hasBlockHeightUsage = /endBlock|resolutionBlock|END_BLOCK|RESOLUTION_BLOCK/.test(content);
    
    if (hasBlockHeightUsage && !content.includes('block-height-config')) {
        const hasDynamicFetch = REQUIRED_IMPORTS.some(imp => content.includes(imp));
        
        if (!hasDynamicFetch) {
            issues.push('Uses block heights but missing dynamic fetch imports');
        }
    }
    
    return {
        file: path.basename(filePath),
        hasHardcodedHeights: issues.length > 0,
        issues
    };
}

function scanDirectory(dir: string): ValidationResult[] {
    const results: ValidationResult[] = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'docs') {
                results.push(...scanDirectory(filePath));
            }
        } else if (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.includes('validate-block-heights')) {
            results.push(validateFile(filePath));
        }
    }
    
    return results;
}

function main() {
    console.log('🔍 Validating Block Height Usage in Scripts\n');
    console.log('=' .repeat(60));
    
    const scriptsDir = path.join(__dirname, '..');
    const results = scanDirectory(scriptsDir);
    
    const filesWithIssues = results.filter(r => r.hasHardcodedHeights);
    const cleanFiles = results.filter(r => !r.hasHardcodedHeights);
    
    if (filesWithIssues.length === 0) {
        console.log('\n✅ All scripts are using dynamic block heights!\n');
        console.log(`Validated ${results.length} files:`);
        cleanFiles.forEach(r => console.log(`   ✓ ${r.file}`));
    } else {
        console.log(`\n⚠️  Found ${filesWithIssues.length} file(s) with potential issues:\n`);
        
        filesWithIssues.forEach(result => {
            console.log(`❌ ${result.file}`);
            result.issues.forEach(issue => {
                console.log(`   - ${issue}`);
            });
            console.log('');
        });
        
        console.log(`\n✅ ${cleanFiles.length} file(s) are clean:\n`);
        cleanFiles.forEach(r => console.log(`   ✓ ${r.file}`));
        
        console.log('\n📚 Migration Guide: scripts/docs/MIGRATION_GUIDE.md');
        console.log('📖 Block Height Guide: scripts/docs/BLOCK_HEIGHT_GUIDE.md\n');
        
        process.exit(1);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ Validation complete!\n');
}

main();
