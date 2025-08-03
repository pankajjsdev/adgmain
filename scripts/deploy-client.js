#!/usr/bin/env node

/**
 * Multi-tenant Deployment Script
 * Deploys specific client apps to app stores
 * Usage: node scripts/deploy-client.js [client] [platform]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getClientConfig, getAvailableClients, validateClientConfig } = require('../config/clients');

// Parse command line arguments
const args = process.argv.slice(2);
const clientName = args[0];
const platform = args[1] || 'all';

// Available platforms
const PLATFORMS = ['ios', 'android', 'all'];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Validate inputs
function validateInputs() {
  logStep('VALIDATION', 'Validating deployment parameters...');
  
  if (!clientName) {
    logError('Client name is required!');
    log('\nAvailable clients:', 'yellow');
    getAvailableClients().forEach(client => {
      log(`  - ${client}`, 'yellow');
    });
    process.exit(1);
  }

  if (!getAvailableClients().includes(clientName)) {
    logError(`Invalid client name: ${clientName}`);
    log('\nAvailable clients:', 'yellow');
    getAvailableClients().forEach(client => {
      log(`  - ${client}`, 'yellow');
    });
    process.exit(1);
  }

  if (!PLATFORMS.includes(platform)) {
    logError(`Invalid platform: ${platform}`);
    log('\nAvailable platforms:', 'yellow');
    PLATFORMS.forEach(p => {
      log(`  - ${p}`, 'yellow');
    });
    process.exit(1);
  }

  if (!validateClientConfig(clientName)) {
    logError(`Invalid client configuration for: ${clientName}`);
    process.exit(1);
  }

  logSuccess('All parameters validated successfully');
}

// Display deployment information
function displayDeploymentInfo() {
  const clientConfig = getClientConfig(clientName);
  
  logStep('DEPLOYMENT INFO', 'Deployment configuration details:');
  log(`  Client: ${clientConfig.displayName} (${clientName})`, 'cyan');
  log(`  Platform: ${platform}`, 'cyan');
  log(`  iOS App ID: ${clientConfig.appStore.appleId}`, 'cyan');
  log(`  Android Package: ${clientConfig.appStore.googlePlayId}`, 'cyan');
  log(`  Bundle ID: ${clientConfig.bundleIdentifier}`, 'cyan');
}

// Check prerequisites
function checkPrerequisites() {
  logStep('PREREQUISITES', 'Checking deployment prerequisites...');
  
  try {
    // Check if EAS CLI is installed
    execSync('eas --version', { stdio: 'pipe' });
    logSuccess('EAS CLI is installed');
  } catch (error) {
    logError('EAS CLI is not installed. Please install it with: npm install -g eas-cli');
    process.exit(1);
  }

  // Check if user is logged in to EAS
  try {
    execSync('eas whoami', { stdio: 'pipe' });
    logSuccess('EAS authentication verified');
  } catch (error) {
    logError('Not logged in to EAS. Please run: eas login');
    process.exit(1);
  }

  // Check if production builds exist
  logWarning('Make sure you have completed production builds before deploying');
  log('  Run: node scripts/build-client.js [client] production', 'yellow');
}

// Execute deployment
function executeDeployment() {
  const profileName = `${clientName}-production`;
  
  logStep('DEPLOYMENT', `Starting deployment for profile: ${profileName}`);
  
  try {
    let submitCommand;
    
    if (platform === 'all') {
      // Deploy to both platforms
      log('Deploying to iOS App Store...', 'cyan');
      submitCommand = `eas submit --profile ${profileName} --platform ios`;
      execSync(submitCommand, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          CLIENT_NAME: clientName,
          APP_VARIANT: 'production'
        }
      });
      
      log('Deploying to Google Play Store...', 'cyan');
      submitCommand = `eas submit --profile ${profileName} --platform android`;
      execSync(submitCommand, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          CLIENT_NAME: clientName,
          APP_VARIANT: 'production'
        }
      });
    } else {
      submitCommand = `eas submit --profile ${profileName} --platform ${platform}`;
      log(`Executing: ${submitCommand}`, 'cyan');
      
      execSync(submitCommand, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          CLIENT_NAME: clientName,
          APP_VARIANT: 'production'
        }
      });
    }
    
    logSuccess('Deployment completed successfully!');
    
  } catch (error) {
    logError('Deployment failed!');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Generate deployment summary
function generateDeploymentSummary() {
  const clientConfig = getClientConfig(clientName);
  
  logStep('SUMMARY', 'Deployment Summary:');
  log(`  Client: ${clientConfig.displayName}`, 'green');
  log(`  Platform: ${platform}`, 'green');
  log(`  Status: Submitted for review`, 'green');
  
  log('\nNext steps:', 'yellow');
  log('  1. Monitor app store review status', 'yellow');
  log('  2. Respond to any review feedback', 'yellow');
  log('  3. App will be live after approval', 'yellow');
  
  if (platform === 'ios' || platform === 'all') {
    log('  4. iOS: Check App Store Connect for review status', 'yellow');
  }
  
  if (platform === 'android' || platform === 'all') {
    log('  5. Android: Check Google Play Console for review status', 'yellow');
  }
}

// Main execution
function main() {
  logHeader(`Multi-Tenant App Deployment`);
  
  try {
    validateInputs();
    displayDeploymentInfo();
    checkPrerequisites();
    
    // Confirm deployment
    log('\n⚠️  WARNING: This will submit your app to the app store(s) for review!', 'yellow');
    log('Make sure you have tested the production build thoroughly.', 'yellow');
    
    // In a real scenario, you might want to add a confirmation prompt here
    // For now, we'll proceed with the deployment
    
    executeDeployment();
    generateDeploymentSummary();
    
    logHeader('Deployment Process Completed Successfully! 🚀');
    
  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  log('\n\nDeployment process interrupted by user', 'yellow');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  main,
  validateInputs,
  displayDeploymentInfo,
  checkPrerequisites,
  executeDeployment,
  generateDeploymentSummary
};
