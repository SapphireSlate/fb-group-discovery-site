/**
 * CAPTCHA Coverage Analysis Script
 * 
 * This script analyzes all forms in the application and determines 
 * which ones have CAPTCHA protection and which ones need it.
 */

const fs = require('fs');
const path = require('path');

// Define form types and their security requirements
const FORM_TYPES = {
  CRITICAL: {
    level: 'Critical',
    needsCaptcha: true,
    description: 'Forms that submit content, perform account changes, or handle sensitive actions',
    examples: ['group-submission', 'report-form', 'account-creation']
  },
  MODERATE: {
    level: 'Moderate',
    needsCaptcha: true,
    description: 'Forms that modify content or user preferences',
    examples: ['profile-edit', 'review-submission']
  },
  LOW: {
    level: 'Low',
    needsCaptcha: false,
    description: 'Forms with minimal security impact and low spam risk',
    examples: ['search-form', 'filter-form', 'email-preferences']
  }
};

// Keywords to identify form security level
const securityLevelKeywords = {
  CRITICAL: [
    'submit', 'create', 'register', 'signup', 'sign-up', 'report',
    'reset-password', 'password', 'auth', 'login'
  ],
  MODERATE: [
    'edit', 'review', 'rate', 'profile', 'update', 'reply', 'comment'
  ],
  LOW: [
    'search', 'filter', 'preference', 'setting', 'sort', 'theme'
  ]
};

// Get the appropriate security level for a form based on its name and content
function getFormSecurityLevel(filePath, content) {
  const fileName = path.basename(filePath);
  
  // Check for keywords in the file name
  for (const [level, keywords] of Object.entries(securityLevelKeywords)) {
    for (const keyword of keywords) {
      if (fileName.toLowerCase().includes(keyword)) {
        return level;
      }
    }
  }
  
  // If no match in filename, check the file content for API endpoints and other indicators
  if (content.includes('method="POST"') || content.includes("method='POST'") || 
      content.includes('method: "POST"') || content.includes("method: 'POST'")) {
    
    // Check for content modification or submission patterns
    if (content.includes('/api/groups') || 
        content.includes('/api/reports') || 
        content.includes('/api/users') ||
        content.includes('/api/auth')) {
      return 'CRITICAL';
    }
    
    if (content.includes('/api/reviews') ||
        content.includes('/api/comments') ||
        content.includes('/api/profile')) {
      return 'MODERATE';
    }
  }
  
  // Default to moderate if it's a form but we can't determine the level
  return 'MODERATE';
}

// Check if a form has CAPTCHA implemented
function hasCaptchaImplemented(content) {
  return content.includes('<Recaptcha') || 
         content.includes('recaptchaToken') || 
         content.includes('captcha');
}

// Main analysis function
function analyzeCaptchaImplementation() {
  console.log('🔍 Analyzing CAPTCHA implementation in forms...\n');
  
  const formData = {
    implemented: [],
    missing: [],
    notNeeded: []
  };
  
  // Directories to search for forms
  const searchDirectories = [
    path.join(__dirname, '..', 'components/forms'),
    path.join(__dirname, '..', 'app')
  ];
  
  // Recursive function to search for form files
  function searchFormsInDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      
      if (file.isDirectory()) {
        searchFormsInDirectory(fullPath);
      } else if (
        (file.name.includes('form') || 
         file.name.includes('submit') ||
         file.name.includes('edit') && file.name.includes('tsx')) &&
        (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx'))
      ) {
        // Read file content
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Only process files that appear to be forms
        if (content.includes('<form') || content.includes('onSubmit') || content.includes('handleSubmit')) {
          const relativePath = fullPath.replace(path.join(__dirname, '..'), '');
          const securityLevel = getFormSecurityLevel(fullPath, content);
          const hasCaptcha = hasCaptchaImplemented(content);
          const needsCaptcha = FORM_TYPES[securityLevel]?.needsCaptcha;
          
          const formInfo = {
            path: relativePath,
            securityLevel: FORM_TYPES[securityLevel]?.level || 'Unknown',
            needsCaptcha: needsCaptcha
          };
          
          if (hasCaptcha) {
            formInfo.status = 'Implemented';
            formData.implemented.push(formInfo);
          } else if (needsCaptcha) {
            formInfo.status = 'Missing';
            formData.missing.push(formInfo);
          } else {
            formInfo.status = 'Not Needed';
            formData.notNeeded.push(formInfo);
          }
        }
      }
    }
  }
  
  // Search for form files
  searchDirectories.forEach(dir => {
    if (fs.existsSync(dir)) {
      searchFormsInDirectory(dir);
    }
  });
  
  // Print analysis results
  console.log('📊 CAPTCHA Implementation Status:');
  console.log(`✅ Forms with CAPTCHA implemented: ${formData.implemented.length}`);
  console.log(`❌ Forms missing CAPTCHA: ${formData.missing.length}`);
  console.log(`⚪ Forms that don't need CAPTCHA: ${formData.notNeeded.length}`);
  
  // Print details
  console.log('\n📋 Implementation Details:');
  
  console.log('\n✅ Forms with CAPTCHA implemented:');
  formData.implemented.forEach(form => {
    console.log(`   - ${form.path} (${form.securityLevel})`);
  });
  
  console.log('\n❌ Forms missing CAPTCHA:');
  formData.missing.forEach(form => {
    console.log(`   - ${form.path} (${form.securityLevel})`);
  });
  
  console.log('\n⚪ Forms that don\'t need CAPTCHA:');
  formData.notNeeded.forEach(form => {
    console.log(`   - ${form.path} (${form.securityLevel})`);
  });
  
  // Generate documentation
  generateCaptchaDocumentation(formData);
  
  return formData;
}

// Generate documentation for CAPTCHA implementation
function generateCaptchaDocumentation(formData) {
  console.log('\n📝 Generating CAPTCHA documentation...');
  
  // Create documentation content
  const docContent = `# CAPTCHA Implementation Status

This document outlines the current status of CAPTCHA implementation across forms in the application.

## Overview

- **Implemented**: ${formData.implemented.length} forms
- **Missing**: ${formData.missing.length} forms
- **Not Needed**: ${formData.notNeeded.length} forms

## Forms with CAPTCHA Implemented

${formData.implemented.map(form => `- \`${form.path}\` (${form.securityLevel})`).join('\n')}

## Forms Missing CAPTCHA

${formData.missing.map(form => `- \`${form.path}\` (${form.securityLevel}) ⚠️`).join('\n')}

## Forms That Don't Need CAPTCHA

${formData.notNeeded.map(form => `- \`${form.path}\` (${form.securityLevel})`).join('\n')}

## Implementation Guidelines

### When to Use CAPTCHA

- **Critical Security Level**: Always require CAPTCHA (e.g., group submissions, user registration, password reset)
- **Moderate Security Level**: Require CAPTCHA if the form is publicly accessible (e.g., contact forms, review submissions)
- **Low Security Level**: CAPTCHA usually not needed (e.g., preferences, search forms)

### How to Add CAPTCHA to a Form

1. Import the Recaptcha component:
   \`\`\`tsx
   import { Recaptcha } from '@/components/ui/recaptcha';
   \`\`\`

2. Add state for the CAPTCHA token:
   \`\`\`tsx
   const [captchaToken, setCaptchaToken] = useState<string | null>(null);
   const [captchaError, setCaptchaError] = useState<string | null>(null);
   \`\`\`

3. Add the Recaptcha component to your form:
   \`\`\`tsx
   <Recaptcha 
     onChange={setCaptchaToken}
     errorMessage={captchaError}
     resetOnError={true}
   />
   \`\`\`

4. Validate the token before form submission:
   \`\`\`tsx
   if (!captchaToken) {
     setCaptchaError('Please complete the CAPTCHA verification');
     return;
   }
   \`\`\`

5. Include the token in your API request:
   \`\`\`tsx
   const response = await fetch('/api/your-endpoint', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       ...formData,
       recaptchaToken: captchaToken
     }),
   });
   \`\`\`

6. Verify the token on the server side using \`verifyRecaptcha\`:
   \`\`\`tsx
   import { verifyRecaptcha } from '@/lib/security';

   // In your API route
   const recaptchaResult = await verifyRecaptcha(body.recaptchaToken);
   if (!recaptchaResult.success) {
     return NextResponse.json(
       { error: 'INVALID_CAPTCHA', message: 'CAPTCHA verification failed' },
       { status: 400 }
     );
   }
   \`\`\`

_Generated on ${new Date().toISOString().split('T')[0]}_
`;

  // Write to documentation file
  const docPath = path.join(__dirname, '..', 'docs/captcha-implementation.md');
  
  // Create docs directory if it doesn't exist
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  fs.writeFileSync(docPath, docContent);
  console.log(`✅ CAPTCHA documentation generated at: docs/captcha-implementation.md`);
}

// Run the analysis if this script is executed directly
if (require.main === module) {
  analyzeCaptchaImplementation();
}

module.exports = {
  analyzeCaptchaImplementation,
  getFormSecurityLevel,
  hasCaptchaImplemented
}; 