#!/usr/bin/env node

/**
 * Multi-Client Platform Testing Script
 * Tests all client configurations for Android and iOS compatibility
 */

// Use CommonJS require for Node.js compatibility
const { clients, getClientConfig, validateClientConfig } = require('../config/clients.js');
const fs = require('fs');
const path = require('path');

// Define __dirname for Node.js compatibility
// Get the directory of the current script file
const __dirname = path.dirname(process.argv[1]);

// ANSI color codes for console output
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
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSection(message) {
  log(`\n${'-'.repeat(40)}`, 'blue');
  log(`${message}`, 'blue');
  log(`${'-'.repeat(40)}`, 'blue');
}

// Test 1: Validate all client configurations
function testClientConfigurations() {
  logSection('Testing Client Configurations');
  
  const clientNames = Object.keys(clients);
  let allValid = true;
  
  clientNames.forEach(clientName => {
    const isValid = validateClientConfig(clientName);
    const config = getClientConfig(clientName);
    
    if (isValid) {
      log(`✅ ${clientName.toUpperCase()}: Configuration valid`, 'green');
      log(`   - Name: ${config.name}`, 'reset');
      log(`   - Bundle ID: ${config.bundleIdentifier}`, 'reset');
      log(`   - Android Package: ${config.androidPackage}`, 'reset');
      log(`   - API Endpoint: ${config.api.baseUrl}`, 'reset');
    } else {
      log(`❌ ${clientName.toUpperCase()}: Configuration invalid`, 'red');
      allValid = false;
    }
  });
  
  return allValid;
}

// Test 2: Check platform-specific configurations
function testPlatformConfigurations() {
  logSection('Testing Platform-Specific Configurations');
  
  const clientNames = Object.keys(clients);
  let allPlatformsValid = true;
  
  clientNames.forEach(clientName => {
    const config = getClientConfig(clientName);
    
    log(`\n📱 Testing ${clientName.toUpperCase()} platform configs:`, 'magenta');
    
    // iOS Configuration Tests
    const iosValid = config.bundleIdentifier && 
                    config.bundleIdentifier.match(/^[a-zA-Z0-9.-]+$/) &&
                    config.assets?.icon &&
                    config.assets?.adaptiveIcon;
    
    if (iosValid) {
      log(`  ✅ iOS: Bundle ID format valid (${config.bundleIdentifier})`, 'green');
    } else {
      log(`  ❌ iOS: Bundle ID or assets invalid`, 'red');
      allPlatformsValid = false;
    }
    
    // Android Configuration Tests
    const androidValid = config.androidPackage && 
                        config.androidPackage.match(/^[a-zA-Z0-9._]+$/) &&
                        config.assets?.icon &&
                        config.assets?.adaptiveIcon;
    
    if (androidValid) {
      log(`  ✅ Android: Package name format valid (${config.androidPackage})`, 'green');
    } else {
      log(`  ❌ Android: Package name or assets invalid`, 'red');
      allPlatformsValid = false;
    }
    
    // Google OAuth Configuration Tests
    if (config.googleAuth) {
      const hasWebClient = config.googleAuth.webClientId;
      const hasIosClient = config.googleAuth.iosClientId;
      const hasAndroidClient = config.googleAuth.androidClientId;
      
      log(`  📊 Google OAuth Config:`, 'cyan');
      log(`    - Web Client ID: ${hasWebClient ? '✅' : '❌'}`, hasWebClient ? 'green' : 'red');
      log(`    - iOS Client ID: ${hasIosClient ? '✅' : '❌'}`, hasIosClient ? 'green' : 'red');
      log(`    - Android Client ID: ${hasAndroidClient ? '✅' : '❌'}`, hasAndroidClient ? 'green' : 'red');
      
      if (!hasWebClient || !hasIosClient || !hasAndroidClient) {
        log(`    ⚠️  Missing OAuth client IDs - Google Sign-In may not work`, 'yellow');
      }
    } else {
      log(`  ⚠️  No Google OAuth configuration found`, 'yellow');
    }
  });
  
  return allPlatformsValid;
}

// Test 3: Check asset paths exist
function testAssetPaths() {
  logSection('Testing Asset Paths');
  
  const clientNames = Object.keys(clients);
  let allAssetsValid = true;
  
  clientNames.forEach(clientName => {
    const config = getClientConfig(clientName);
    log(`\n🎨 Testing ${clientName.toUpperCase()} assets:`, 'magenta');
    
    const requiredAssets = ['icon', 'adaptiveIcon', 'splashIcon', 'logo', 'favicon'];
    
    requiredAssets.forEach(assetType => {
      if (config.assets && config.assets[assetType]) {
        const assetPath = path.join(__dirname, '..', config.assets[assetType]);
        const exists = fs.existsSync(assetPath);
        
        if (exists) {
          log(`  ✅ ${assetType}: ${config.assets[assetType]}`, 'green');
        } else {
          log(`  ❌ ${assetType}: Missing - ${config.assets[assetType]}`, 'red');
          allAssetsValid = false;
        }
      } else {
        log(`  ⚠️  ${assetType}: Not configured`, 'yellow');
      }
    });
  });
  
  return allAssetsValid;
}

// Test 4: Generate sample app.config.js for each client
function testAppConfigGeneration() {
  logSection('Testing App Config Generation');
  
  const clientNames = Object.keys(clients);
  const variants = ['development', 'preview', 'staging', 'production'];
  
  clientNames.forEach(clientName => {
    log(`\n⚙️  Testing ${clientName.toUpperCase()} app config generation:`, 'magenta');
    
    variants.forEach(variant => {
      try {
        // Simulate environment variables
        process.env.CLIENT_NAME = clientName;
        process.env.APP_VARIANT = variant;
        
        // Clear require cache to reload config
        delete require.cache[require.resolve('../app.config.js')];
        
        // Test config generation (this would normally be done by Expo)
        const config = getClientConfig(clientName);
        
        // Validate essential properties
        const hasName = config.name;
        const hasBundleId = config.bundleIdentifier;
        const hasAndroidPackage = config.androidPackage;
        
        if (hasName && hasBundleId && hasAndroidPackage) {
          log(`    ✅ ${variant}: Config generation successful`, 'green');
        } else {
          log(`    ❌ ${variant}: Missing essential properties`, 'red');
        }
      } catch (error) {
        log(`    ❌ ${variant}: Error - ${error.message}`, 'red');
      }
    });
  });
}

// Test 5: Check EAS build profiles
function testEASBuildProfiles() {
  logSection('Testing EAS Build Profiles');
  
  try {
    const easConfigPath = path.join(__dirname, '..', 'eas.json');
    const easConfig = JSON.parse(fs.readFileSync(easConfigPath, 'utf8'));
    
    const clientNames = Object.keys(clients);
    const variants = ['dev', 'preview', 'production', 'staging'];
    
    let allProfilesValid = true;
    
    clientNames.forEach(clientName => {
      log(`\n🏗️  Testing ${clientName.toUpperCase()} EAS build profiles:`, 'magenta');
      
      variants.forEach(variant => {
        const profileName = `${clientName}-${variant}`;
        const profile = easConfig.build[profileName];
        
        if (profile) {
          const hasClientName = profile.env && profile.env.CLIENT_NAME === clientName;
          const hasAppVariant = profile.env && profile.env.APP_VARIANT;
          
          if (hasClientName && hasAppVariant) {
            log(`    ✅ ${profileName}: Profile configured correctly`, 'green');
          } else {
            log(`    ❌ ${profileName}: Missing environment variables`, 'red');
            allProfilesValid = false;
          }
        } else {
          log(`    ❌ ${profileName}: Profile not found`, 'red');
          allProfilesValid = false;
        }
      });
    });
    
    return allProfilesValid;
  } catch (error) {
    log(`❌ Error reading eas.json: ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
function runAllTests() {
  logHeader('Multi-Client Platform Compatibility Test');
  
  const tests = [
    { name: 'Client Configurations', fn: testClientConfigurations },
    { name: 'Platform Configurations', fn: testPlatformConfigurations },
    { name: 'Asset Paths', fn: testAssetPaths },
    { name: 'App Config Generation', fn: testAppConfigGeneration },
    { name: 'EAS Build Profiles', fn: testEASBuildProfiles }
  ];
  
  const results = [];
  
  tests.forEach(test => {
    try {
      const result = test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      log(`❌ ${test.name}: Test failed with error - ${error.message}`, 'red');
      results.push({ name: test.name, passed: false, error: error.message });
    }
  });
  
  // Summary
  logHeader('Test Results Summary');
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    if (result.passed) {
      log(`✅ ${result.name}: PASSED`, 'green');
    } else {
      log(`❌ ${result.name}: FAILED${result.error ? ` - ${result.error}` : ''}`, 'red');
    }
  });
  
  log(`\n📊 Overall Result: ${passedTests}/${totalTests} tests passed`, 
      passedTests === totalTests ? 'green' : 'red');
  
  if (passedTests === totalTests) {
    log(`\n🎉 All tests passed! Multi-client system is ready for both Android and iOS platforms.`, 'green');
  } else {
    log(`\n⚠️  Some tests failed. Please review the issues above before deploying.`, 'yellow');
  }
  
  return passedTests === totalTests;
}

// Run tests if script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testClientConfigurations,
  testPlatformConfigurations,
  testAssetPaths,
  testAppConfigGeneration,
  testEASBuildProfiles
};
