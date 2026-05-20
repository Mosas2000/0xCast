import * as fs from 'fs';
import * as path from 'path';

interface FrontendVulnerability {
    file: string;
    line: number;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    ruleId: string;
    description: string;
    snippet: string;
}

interface PenTestRule {
    id: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    matcher: (lineText: string) => boolean;
}

const FRONTEND_SRC_DIR = path.resolve(process.cwd(), 'frontend', 'src');

const PEN_TEST_RULES: PenTestRule[] = [
    {
        id: 'HARDCODED_KEY',
        severity: 'HIGH',
        description: 'Possible hardcoded private key, secret, or mnemonic string detected. Audit for committed credentials.',
        matcher: (lineText) => {
            const clean = lineText.toLowerCase();
            // Check for assignment of hexadecimal string sequences or mnemonic-like strings
            return (
                (clean.includes('privatekey') || clean.includes('secret_key') || clean.includes('mnemonic')) &&
                /['"`][a-f0-9]{32,}['"`]/i.test(lineText)
            );
        }
    },
    {
        id: 'INSECURE_XSS_RENDER',
        severity: 'HIGH',
        description: 'Usage of "dangerouslySetInnerHTML" detected. Ensure inputs are rigorously sanitized using DOMPurify.',
        matcher: (lineText) => {
            return lineText.includes('dangerouslySetInnerHTML');
        }
    },
    {
        id: 'LOCAL_STORAGE_SENSITIVE',
        severity: 'MEDIUM',
        description: 'Direct browser LocalStorage or SessionStorage write. Ensure no PII or cryptographic keys are saved.',
        matcher: (lineText) => {
            const clean = lineText.trim();
            return (clean.includes('localStorage.setItem') || clean.includes('sessionStorage.setItem')) && 
                   (clean.includes('key') || clean.includes('token') || clean.includes('auth') || clean.includes('profile'));
        }
    },
    {
        id: 'INSECURE_EVAL',
        severity: 'HIGH',
        description: 'Dangerous "eval()" or "Function()" constructor usage detected. Avoid dynamic code execution.',
        matcher: (lineText) => {
            return /eval\(|new\s+Function\(/.test(lineText) && !lineText.trim().startsWith('//');
        }
    }
];

function getFrontendFiles(dir: string): string[] {
    const files: string[] = [];
    if (!fs.existsSync(dir)) return [];
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (item !== 'node_modules' && item !== 'dist' && item !== 'build' && item !== 'tests') {
                files.push(...getFrontendFiles(fullPath));
            }
        } else if (stat.isFile() && /\.(tsx|ts|js|jsx)$/.test(item)) {
            files.push(fullPath);
        }
    }
    
    return files;
}

function auditFile(filePath: string): FrontendVulnerability[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const findings: FrontendVulnerability[] = [];
    
    lines.forEach((lineText, index) => {
        const lineNumber = index + 1;
        
        // Skip comment lines
        if (lineText.trim().startsWith('//') || lineText.trim().startsWith('/*')) return;
        
        for (const rule of PEN_TEST_RULES) {
            if (rule.matcher(lineText)) {
                findings.push({
                    file: path.relative(process.cwd(), filePath),
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

function auditEnvFiles(): FrontendVulnerability[] {
    const findings: FrontendVulnerability[] = [];
    const rootEnvPath = path.resolve(process.cwd(), '.env');
    const frontendEnvPath = path.resolve(process.cwd(), 'frontend', '.env');
    
    const checkEnv = (envPath: string) => {
        if (!fs.existsSync(envPath)) return;
        const content = fs.readFileSync(envPath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((lineText, index) => {
            const clean = lineText.trim();
            if (!clean || clean.startsWith('#')) return;
            
            const parts = clean.split('=');
            if (parts.length > 1) {
                const key = parts[0].trim();
                const value = parts[1].trim();
                
                // Expose warning if raw private keys or mnemonic secrets are saved in dynamic build env
                if (value.length > 20 && (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret'))) {
                    findings.push({
                        file: path.relative(process.cwd(), envPath),
                        line: index + 1,
                        severity: 'HIGH',
                        ruleId: 'ENV_SECRET_EXPOSURE',
                        description: `Environment variable "${key}" appears to hold a private secret. Verify it is not built into client packages.`,
                        snippet: `${key}=[REDACTED]`
                    });
                }
            }
        });
    };
    
    checkEnv(rootEnvPath);
    checkEnv(frontendEnvPath);
    return findings;
}

function runFrontendPenTest() {
    console.log('================================================================');
    console.log('            0xCast Frontend Penetration Check Scanner           ');
    console.log('================================================================');
    
    if (!fs.existsSync(FRONTEND_SRC_DIR)) {
        console.warn(`Frontend src directory not found at: ${FRONTEND_SRC_DIR}`);
        console.warn('Skipping execution.');
        return;
    }
    
    const files = getFrontendFiles(FRONTEND_SRC_DIR);
    console.log(`Discovered ${files.length} frontend source files to audit.\n`);
    
    const allFindings: FrontendVulnerability[] = [];
    
    for (const file of files) {
        allFindings.push(...auditFile(file));
    }
    
    allFindings.push(...auditEnvFiles());
    
    if (allFindings.length === 0) {
        console.log('SUCCESS: No critical frontend penetration vulnerabilities detected.');
        console.log('================================================================');
        return;
    }
    
    console.log(`FOUND ${allFindings.length} POTENTIAL FRONTEND CONCERNS:\n`);
    
    allFindings.forEach((finding) => {
        console.log(`[${finding.severity}] Rule ID: ${finding.ruleId}`);
        console.log(`  File: ${finding.file}:${finding.line}`);
        console.log(`  Description: ${finding.description}`);
        console.log(`  Snippet: "${finding.snippet}"`);
        console.log('----------------------------------------------------------------');
    });
    
    const highSeverity = allFindings.filter(f => f.severity === 'HIGH').length;
    console.log(`Summary: ${highSeverity} HIGH severity concerns, ${allFindings.length - highSeverity} other concerns.`);
    console.log('================================================================');
}

runFrontendPenTest();
