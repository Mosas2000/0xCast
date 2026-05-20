import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface SecurityFinding {
    file: string;
    line: number;
    severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    ruleId: string;
    description: string;
    snippet: string;
}

interface ScanRule {
    id: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    description: string;
    matcher: (lineText: string, fileText: string) => boolean;
}

const CONTRACTS_DIR = path.resolve(process.cwd(), 'contracts');

const SCAN_RULES: ScanRule[] = [
    {
        id: 'TX_SENDER_AUTH',
        severity: 'HIGH',
        description: 'Possible authorization bypass. Avoid using "tx-sender" directly for is-eq checks; use "contract-caller" to protect against malicious intermediary contracts.',
        matcher: (lineText) => {
            const clean = lineText.trim().replace(/\s+/g, ' ');
            return clean.includes('is-eq tx-sender') && !clean.includes('contract-caller');
        }
    },
    {
        id: 'UNCHECKED_STX_TRANSFER',
        severity: 'HIGH',
        description: 'Unchecked STX transfer return value. Ensure "stx-transfer?" is wrapped in try! or unwrap! to roll back on failure.',
        matcher: (lineText) => {
            const clean = lineText.trim();
            return clean.includes('stx-transfer?') && !clean.startsWith('(try!') && !clean.startsWith('(unwrap!');
        }
    },
    {
        id: 'UNCHECKED_FT_TRANSFER',
        severity: 'HIGH',
        description: 'Unchecked Fungible Token transfer return value. Wrap "ft-transfer?" in try! or unwrap!.',
        matcher: (lineText) => {
            const clean = lineText.trim();
            return clean.includes('ft-transfer?') && !clean.startsWith('(try!') && !clean.startsWith('(unwrap!');
        }
    },
    {
        id: 'UNCHECKED_NFT_TRANSFER',
        severity: 'HIGH',
        description: 'Unchecked Non-Fungible Token transfer return value. Wrap "nft-transfer?" in try! or unwrap!.',
        matcher: (lineText) => {
            const clean = lineText.trim();
            return clean.includes('nft-transfer?') && !clean.startsWith('(try!') && !clean.startsWith('(unwrap!');
        }
    },
    {
        id: 'DIVISION_BEFORE_MULTIPLICATION',
        severity: 'MEDIUM',
        description: 'Arithmetic division before multiplication can cause integer truncation and precision loss.',
        matcher: (lineText) => {
            const clean = lineText.trim();
            return clean.includes('/') && clean.includes('*') && clean.indexOf('/') < clean.indexOf('*');
        }
    }
];

function getClarityFiles(dir: string): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (item !== 'examples' && item !== 'node_modules') {
                files.push(...getClarityFiles(fullPath));
            }
        } else if (stat.isFile() && item.endsWith('.clar')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

function scanFile(filePath: string): SecurityFinding[] {
    const findings: SecurityFinding[] = [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((lineText, index) => {
        const lineNumber = index + 1;
        if (lineText.trim().startsWith(';;')) return;
        
        for (const rule of SCAN_RULES) {
            if (rule.matcher(lineText, content)) {
                findings.push({
                    file: path.basename(filePath),
                    line: lineNumber,
                    severity: rule.severity,
                    ruleId: rule.id,
                    description: rule.description,
                    snippet: lineText.trim()
                });
            }
        }
    });
    
    return findings;
}

/**
 * Runs npm audit to verify third party packages dependency health.
 */
function auditDependencies(): boolean {
    console.log('Running npm package dependency vulnerability scan...');
    try {
        // Runs npm audit. If vulnerabilities are found, it exits with non-zero exit code.
        execSync('npm audit --audit-level=high', { stdio: 'pipe' });
        console.log('SUCCESS: No high/critical package vulnerabilities detected.');
        return true;
    } catch (error: any) {
        console.log('WARNING: Package vulnerabilities or scan failures detected:');
        if (error.stdout) {
            console.log(error.stdout.toString().split('\n').slice(0, 15).join('\n'));
        } else {
            console.log(error.message);
        }
        return false;
    }
}

function runScanner() {
    console.log('================================================================');
    console.log('        0xCast Clarity Smart Contract Security Scanner          ');
    console.log('================================================================');
    
    if (!fs.existsSync(CONTRACTS_DIR)) {
        console.error(`Contracts directory not found at: ${CONTRACTS_DIR}`);
        process.exit(1);
    }
    
    const clarityFiles = getClarityFiles(CONTRACTS_DIR);
    console.log(`Discovered ${clarityFiles.length} Clarity contract files to scan.\n`);
    
    let totalFindings = 0;
    const allFindings: SecurityFinding[] = [];
    
    for (const file of clarityFiles) {
        const fileFindings = scanFile(file);
        if (fileFindings.length > 0) {
            allFindings.push(...fileFindings);
            totalFindings += fileFindings.length;
        }
    }
    
    if (totalFindings > 0) {
        console.log(`FOUND ${totalFindings} POTENTIAL CONTRACT SECURITY ISSUES:\n`);
        allFindings.forEach((finding) => {
            console.log(`[${finding.severity}] Rule ID: ${finding.ruleId}`);
            console.log(`  File: ${finding.file}:${finding.line}`);
            console.log(`  Description: ${finding.description}`);
            console.log(`  Code snippet: "${finding.snippet}"`);
            console.log('----------------------------------------------------------------');
        });
    } else {
        console.log('SUCCESS: No Clarity contract static analysis vulnerabilities detected.\n');
    }
    
    const auditPassed = auditDependencies();
    
    console.log('\n================================================================');
    const highSeverityIssues = allFindings.filter(f => f.severity === 'HIGH').length;
    console.log(`Scan Summary:`);
    console.log(`  - Clarity Findings: ${allFindings.length} issues (${highSeverityIssues} HIGH)`);
    console.log(`  - Dependency Audit: ${auditPassed ? 'PASSED' : 'VULNERABILITIES DETECTED'}`);
    console.log('================================================================');
    
    if (highSeverityIssues > 0 || !auditPassed) {
        console.log('WARNING: Outstanding security concerns found. Review the reports above.');
    }
}

runScanner();
