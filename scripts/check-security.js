/**
 * Comprehensive Security Check Script
 * 
 * This script runs a series of automated security checks on the project.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Starting comprehensive security check...\n');

// Track overall status
let securityIssues = 0;

// ===========================================
// 1. Check for outdated or vulnerable dependencies
// ===========================================
console.log('📦 Checking for vulnerable dependencies...');
try {
  const auditOutput = execSync('npm audit --json', { stdio: 'pipe' }).toString();
  const auditData = JSON.parse(auditOutput);
  
  // Count vulnerabilities by severity
  const vulnerabilities = auditData.metadata?.vulnerabilities || {};
  const totalVulnerabilities = 
    (vulnerabilities.critical || 0) + 
    (vulnerabilities.high || 0) + 
    (vulnerabilities.moderate || 0) + 
    (vulnerabilities.low || 0);
  
  if (totalVulnerabilities > 0) {
    console.log('⚠️ Vulnerabilities found:');
    if (vulnerabilities.critical) console.log(`   Critical: ${vulnerabilities.critical}`);
    if (vulnerabilities.high) console.log(`   High: ${vulnerabilities.high}`);
    if (vulnerabilities.moderate) console.log(`   Moderate: ${vulnerabilities.moderate}`);
    if (vulnerabilities.low) console.log(`   Low: ${vulnerabilities.low}`);
    
    securityIssues += vulnerabilities.critical + vulnerabilities.high;
    console.log('\nRun npm audit fix to attempt to fix these issues automatically.');
    console.log('For more details, run: npm audit');
  } else {
    console.log('✅ No vulnerabilities found in dependencies.');
  }
} catch (error) {
  console.error('❌ Error checking dependencies:', error.message);
  securityIssues++;
}

// ===========================================
// 2. Check for existence and coverage of security utilities
// ===========================================
console.log('\n🛡️ Checking security utilities...');

const securityFiles = [
  { path: 'lib/security.ts', name: 'Security utilities' },
  { path: 'lib/validation.ts', name: 'Validation schemas' },
  { path: 'lib/utils.ts', name: 'Utility functions (sanitization)' },
  { path: 'middleware.ts', name: 'Security middleware' },
];

securityFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file.path);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`✅ ${file.name} (${file.path}) exists`);
    
    // Check for specific security patterns in each file
    if (file.path === 'lib/security.ts') {
      if (!content.includes('rateLimit') || !content.includes('verifyRecaptcha')) {
        console.log(`⚠️ ${file.path} might be missing important security functions`);
        securityIssues++;
      }
    }
    
    if (file.path === 'lib/validation.ts') {
      const requiredSchemas = [
        'captchaSchema',
        'groupSubmissionWithCaptchaSchema',
        'reviewSubmissionWithCaptchaSchema',
        'reportSubmissionWithCaptchaSchema',
        'userProfileWithCaptchaSchema',
        'reviewEditWithCaptchaSchema',
        'reviewDeletionWithCaptchaSchema',
        'categoryWithCaptchaSchema',
        'emailPreferencesWithCaptchaSchema'
      ];
      
      let missingSchemas = [];
      requiredSchemas.forEach(schema => {
        if (!content.includes(schema)) {
          missingSchemas.push(schema);
        }
      });
      
      if (missingSchemas.length > 0) {
        console.log(`⚠️ ${file.path} is missing these validation schemas: ${missingSchemas.join(', ')}`);
        securityIssues++;
      } else {
        console.log(`✅ All required validation schemas are present in ${file.path}`);
      }
    }
    
    if (file.path === 'lib/utils.ts') {
      if (!content.includes('sanitize')) {
        console.log(`⚠️ ${file.path} might be missing sanitization functions`);
        securityIssues++;
      }
    }
    
    if (file.path === 'middleware.ts') {
      if (!content.includes('X-XSS-Protection') || !content.includes('Strict-Transport-Security')) {
        console.log(`⚠️ ${file.path} might be missing important security headers`);
        securityIssues++;
      }
    }
  } else {
    console.log(`❌ ${file.name} (${file.path}) not found`);
    securityIssues++;
  }
});

// ===========================================
// 3. Check for CAPTCHA implementation
// ===========================================
console.log('\n🤖 Checking CAPTCHA implementation...');

// Check for recaptcha component
const recaptchaComponentPath = path.join(__dirname, '..', 'components/ui/recaptcha.tsx');
if (fs.existsSync(recaptchaComponentPath)) {
  console.log('✅ reCAPTCHA component exists');
} else {
  console.log('❌ reCAPTCHA component not found (expected at components/ui/recaptcha.tsx)');
  securityIssues++;
}

// Check for CAPTCHA verification in API routes
try {
  const apiDir = path.join(__dirname, '..', 'app/api');
  if (fs.existsSync(apiDir)) {
    let captchaFound = false;
    
    // Basic recursive search for CAPTCHA verification in API routes
    function searchDirectory(dirPath) {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        
        if (file.isDirectory()) {
          searchDirectory(fullPath);
        } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('verifyRecaptcha') || content.includes('recaptchaToken')) {
            captchaFound = true;
            console.log(`✅ CAPTCHA verification found in ${fullPath.replace(path.join(__dirname, '..'), '')}`);
          }
        }
      }
    }
    
    searchDirectory(apiDir);
    
    if (!captchaFound) {
      console.log('⚠️ No CAPTCHA verification found in API routes');
      securityIssues++;
    }
  } else {
    console.log('⚠️ API directory not found (expected at app/api)');
  }
} catch (error) {
  console.error('❌ Error checking for CAPTCHA in API routes:', error.message);
}

// ===========================================
// 4. Check for sensitive forms using CAPTCHA
// ===========================================
console.log('\n📝 Checking forms for CAPTCHA implementation...');

const formDirectories = [
  path.join(__dirname, '..', 'components/forms'),
  path.join(__dirname, '..', 'app'),
];

let formsWithCaptcha = 0;
let totalForms = 0;

formDirectories.forEach(dirPath => {
  if (fs.existsSync(dirPath)) {
    function searchFormsInDirectory(dirPath) {
      try {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const file of files) {
          const fullPath = path.join(dirPath, file.name);
          
          if (file.isDirectory()) {
            searchFormsInDirectory(fullPath);
          } else if (
            (file.name.includes('form') || file.name.includes('submit')) && 
            (file.name.endsWith('.tsx') || file.name.endsWith('.jsx'))
          ) {
            totalForms++;
            const content = fs.readFileSync(fullPath, 'utf8');
            
            if (content.includes('<Recaptcha') || content.includes('recaptchaToken') || content.includes('captcha')) {
              console.log(`✅ CAPTCHA found in ${fullPath.replace(path.join(__dirname, '..'), '')}`);
              formsWithCaptcha++;
            } else {
              console.log(`⚠️ No CAPTCHA found in ${fullPath.replace(path.join(__dirname, '..'), '')}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error searching directory ${dirPath}:`, error.message);
      }
    }
    
    searchFormsInDirectory(dirPath);
  }
});

if (totalForms > 0) {
  console.log(`\nCAPTCHA implementation: ${formsWithCaptcha}/${totalForms} forms`);
  
  if (formsWithCaptcha === 0) {
    console.log('❌ No forms with CAPTCHA found. This is a security risk.');
    securityIssues++;
  } else if (formsWithCaptcha < totalForms) {
    console.log('⚠️ Some forms may be missing CAPTCHA protection.');
  }
} else {
  console.log('ℹ️ No form components found for analysis.');
}

// ===========================================
// 5. Check Content Security Policy
// ===========================================
console.log('\n🔒 Checking Content Security Policy (CSP)...');

// Check next.config.mjs for CSP
const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (configContent.includes('Content-Security-Policy')) {
    console.log('✅ CSP found in next.config.mjs');
  } else {
    console.log('⚠️ No Content-Security-Policy found in next.config.mjs');
    console.log('   Consider adding a CSP header for enhanced security.');
    securityIssues++;
  }
} else {
  console.log('❌ next.config.mjs not found');
  securityIssues++;
}

// ===========================================
// 6. Check input validation and sanitization
// ===========================================
console.log('\n🧹 Checking input validation and sanitization...');

// Look for sanitization functions in utils.ts
const utilsPath = path.join(__dirname, '..', 'lib/utils.ts');
if (fs.existsSync(utilsPath)) {
  const utilsContent = fs.readFileSync(utilsPath, 'utf8');
  
  if (utilsContent.includes('sanitize')) {
    console.log('✅ Sanitization functions found in utils.ts');
  } else {
    console.log('⚠️ No sanitization functions found in utils.ts');
    securityIssues++;
  }
} else {
  console.log('❌ utils.ts not found');
  securityIssues++;
}

// Look for DOMPurify usage
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.dependencies && (packageJson.dependencies.dompurify || packageJson.dependencies['isomorphic-dompurify'])) {
    console.log('✅ DOMPurify found in dependencies');
  } else {
    console.log('⚠️ DOMPurify not found in dependencies');
    securityIssues++;
  }
} catch (error) {
  console.error('❌ Error checking package.json:', error.message);
}

// ===========================================
// Summary
// ===========================================
console.log('\n📊 Security Check Summary');
console.log('========================');

if (securityIssues === 0) {
  console.log('✅ No major security issues found!');
  console.log('\nRemember that automated checks cannot detect all security issues.');
  console.log('Regular manual security reviews are still recommended.');
} else {
  console.log(`❌ Found ${securityIssues} potential security issues.`);
  console.log('\nPlease address these issues before deploying to production.');
  console.log('Refer to README-security-setup.md for guidance on security configuration.');
}

console.log('\n🔒 Security check complete.');
console.log(`
For a complete security configuration guide, refer to:
- README-security-setup.md for configuration details
- README-security.md for security implementation documentation
`);

// Add exit code to indicate security issues for CI/CD systems
if (securityIssues > 0) {
  process.exitCode = 1;
} 