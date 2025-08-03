#!/usr/bin/env node

/**
 * Multi-tenant Build Script
 * Builds specific client apps with their configurations
 * Usage: node scripts/build-client.js [client] [variant] [platform]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getClientConfig, getAvailableClients, validateClientConfig } = require('../config/clients');

// Parse command line arguments
const args = process.argv.slice(2);
const clientName = args[0];
const variant = args[1] || 'production';
const platform = args[2] || 'all';

// Available variants
const VARIANTS = ['development', 'preview', 'staging', 'production'];
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
  logStep('VALIDATION', 'Validating build parameters...');
  
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

  if (!VARIANTS.includes(variant)) {
    logError(`Invalid variant: ${variant}`);
    log('\nAvailable variants:', 'yellow');
    VARIANTS.forEach(v => {
      log(`  - ${v}`, 'yellow');
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

// Display build information
function displayBuildInfo() {
  const clientConfig = getClientConfig(clientName);
  
  logStep('BUILD INFO', 'Build configuration details:');
  log(`  Client: ${clientConfig.displayName} (${clientName})`, 'cyan');
  log(`  Variant: ${variant}`, 'cyan');
  log(`  Platform: ${platform}`, 'cyan');
  log(`  API Base URL: ${clientConfig.api.baseUrl}`, 'cyan');
  log(`  Bundle ID: ${clientConfig.bundleIdentifier}`, 'cyan');
  log(`  Package: ${clientConfig.androidPackage}`, 'cyan');
}

// Check prerequisites
function checkPrerequisites() {
  logStep('PREREQUISITES', 'Checking build prerequisites...');
  
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
    logWarning('Not logged in to EAS. Please run: eas login');
  }

  // Check if assets exist for the client
  const clientConfig = getClientConfig(clientName);
  const assetPaths = [
    clientConfig.assets.icon,
    clientConfig.assets.adaptiveIcon,
    clientConfig.assets.splash
  ];

  let missingAssets = [];
  assetPaths.forEach(assetPath => {
    if (!fs.existsSync(path.resolve(assetPath))) {
      missingAssets.push(assetPath);
    }
  });

  if (missingAssets.length > 0) {
    logWarning('Missing assets detected:');
    missingAssets.forEach(asset => {
      log(`  - ${asset}`, 'yellow');
    });
    log('\nUsing default assets as fallback...', 'yellow');
  } else {
    logSuccess('All client assets are available');
  }
}

// Execute build
function executeBuild() {
  const profileName = `${clientName}-${variant}`;
  
  logStep('BUILD', `Starting build for profile: ${profileName}`);
  
  try {
    let buildCommand;
    
    if (platform === 'all') {
      buildCommand = `eas build --profile ${profileName} --platform all`;
    } else {
      buildCommand = `eas build --profile ${profileName} --platform ${platform}`;
    }
    
    log(`Executing: ${buildCommand}`, 'cyan');
    log('\nThis may take several minutes...\n', 'yellow');
    
    execSync(buildCommand, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        CLIENT_NAME: clientName,
        APP_VARIANT: variant
      }
    });
    
    logSuccess('Build completed successfully!');
    
  } catch (error) {
    logError('Build failed!');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Generate build summary
function generateBuildSummary() {
  const clientConfig = getClientConfig(clientName);
  const profileName = `${clientName}-${variant}`;
  
  logStep('SUMMARY', 'Build Summary:');
  log(`  Profile: ${profileName}`, 'green');
  log(`  App Name: ${clientConfig.displayName}`, 'green');
  log(`  Bundle ID: ${clientConfig.bundleIdentifier}`, 'green');
  log(`  Package: ${clientConfig.androidPackage}`, 'green');
  log(`  Platform: ${platform}`, 'green');
  log(`  Variant: ${variant}`, 'green');
  
  log('\nNext steps:', 'yellow');
  log('  1. Check build status at: https://expo.dev/builds', 'yellow');
  log('  2. Download the build artifacts when ready', 'yellow');
  log('  3. Test the app on devices/simulators', 'yellow');
  
  if (variant === 'production') {
    log('  4. Submit to app stores using: eas submit', 'yellow');
  }
}

// Main execution
function main() {
  logHeader(`Multi-Tenant App Builder`);
  
  try {
    validateInputs();
    displayBuildInfo();
    checkPrerequisites();
    executeBuild();
    generateBuildSummary();
    
    logHeader('Build Process Completed Successfully! 🎉');
    
  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  log('\n\nBuild process interrupted by user', 'yellow');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  main,
  validateInputs,
  displayBuildInfo,
  checkPrerequisites,
  executeBuild,
  generateBuildSummary
};
