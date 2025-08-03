/**
 * Comprehensive Integration Test for Fullscreen Orientation Feature
 * Tests the complete flow across Android and iOS platforms
 */

import { Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import {
  initializePortraitOrientation,
  enterFullscreenOrientation,
  exitFullscreenOrientation,
  getCurrentOrientation,
  isLandscapeOrientation,
  testOrientationFunctionality,
} from '@/utils/orientationUtils';

export interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  platform: string;
  timestamp: Date;
}

export class OrientationIntegrationTest {
  private results: TestResult[] = [];

  /**
   * Run comprehensive integration test suite
   */
  async runFullTestSuite(): Promise<TestResult[]> {
    console.log('🧪 Starting Fullscreen Orientation Integration Tests...');
    console.log(`📱 Platform: ${Platform.OS}`);
    
    this.results = [];

    // Test 1: Basic orientation utilities
    await this.testOrientationUtilities();

    // Test 2: Portrait initialization
    await this.testPortraitInitialization();

    // Test 3: Fullscreen entry (portrait → landscape)
    await this.testFullscreenEntry();

    // Test 4: Fullscreen exit (landscape → portrait)
    await this.testFullscreenExit();

    // Test 5: Rapid orientation changes
    await this.testRapidOrientationChanges();

    // Test 6: Error handling and recovery
    await this.testErrorHandling();

    // Test 7: Platform-specific behavior
    await this.testPlatformSpecificBehavior();

    console.log('✅ Integration test suite completed!');
    this.printTestSummary();
    
    return this.results;
  }

  /**
   * Test basic orientation utilities
   */
  private async testOrientationUtilities(): Promise<void> {
    try {
      console.log('🔧 Testing orientation utilities...');
      
      // Test getCurrentOrientation
      const currentOrientation = await getCurrentOrientation();
      this.addResult('Get Current Orientation', currentOrientation !== null, 
        `Current orientation: ${currentOrientation}`);

      // Test isLandscapeOrientation
      const isLandscape = await isLandscapeOrientation();
      this.addResult('Landscape Detection', typeof isLandscape === 'boolean',
        `Is landscape: ${isLandscape}`);

      // Test orientation functionality
      await testOrientationFunctionality();
      this.addResult('Orientation Functionality Test', true, 'All utility functions working');

    } catch (error) {
      this.addResult('Orientation Utilities', false, `Error: ${error}`);
    }
  }

  /**
   * Test portrait initialization
   */
  private async testPortraitInitialization(): Promise<void> {
    try {
      console.log('📱 Testing portrait initialization...');
      
      const success = await initializePortraitOrientation();
      await this.wait(1000); // Wait for orientation change
      
      const currentOrientation = await getCurrentOrientation();
      const isPortrait = currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP;
      
      this.addResult('Portrait Initialization', success && isPortrait,
        `Portrait init success: ${success}, Current: ${currentOrientation}`);

    } catch (error) {
      this.addResult('Portrait Initialization', false, `Error: ${error}`);
    }
  }

  /**
   * Test fullscreen entry (portrait → landscape)
   */
  private async testFullscreenEntry(): Promise<void> {
    try {
      console.log('🔄 Testing fullscreen entry...');
      
      // Ensure we start in portrait
      await initializePortraitOrientation();
      await this.wait(1000);
      
      // Enter fullscreen
      const success = await enterFullscreenOrientation();
      await this.wait(2000); // Wait for orientation change
      
      const isLandscape = await isLandscapeOrientation();
      
      this.addResult('Fullscreen Entry', success && isLandscape,
        `Entry success: ${success}, Is landscape: ${isLandscape}`);

    } catch (error) {
      this.addResult('Fullscreen Entry', false, `Error: ${error}`);
    }
  }

  /**
   * Test fullscreen exit (landscape → portrait)
   */
  private async testFullscreenExit(): Promise<void> {
    try {
      console.log('🔄 Testing fullscreen exit...');
      
      // Ensure we're in landscape
      await enterFullscreenOrientation();
      await this.wait(1000);
      
      // Exit fullscreen
      const success = await exitFullscreenOrientation();
      await this.wait(2000); // Wait for orientation change
      
      const currentOrientation = await getCurrentOrientation();
      const isPortrait = currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP;
      
      this.addResult('Fullscreen Exit', success && isPortrait,
        `Exit success: ${success}, Is portrait: ${isPortrait}`);

    } catch (error) {
      this.addResult('Fullscreen Exit', false, `Error: ${error}`);
    }
  }

  /**
   * Test rapid orientation changes
   */
  private async testRapidOrientationChanges(): Promise<void> {
    try {
      console.log('⚡ Testing rapid orientation changes...');
      
      let allSuccessful = true;
      
      // Rapid sequence: Portrait → Landscape → Portrait → Landscape → Portrait
      for (let i = 0; i < 3; i++) {
        const landscapeSuccess = await enterFullscreenOrientation();
        await this.wait(500);
        
        const portraitSuccess = await exitFullscreenOrientation();
        await this.wait(500);
        
        if (!landscapeSuccess || !portraitSuccess) {
          allSuccessful = false;
          break;
        }
      }
      
      this.addResult('Rapid Orientation Changes', allSuccessful,
        `Rapid changes ${allSuccessful ? 'successful' : 'failed'}`);

    } catch (error) {
      this.addResult('Rapid Orientation Changes', false, `Error: ${error}`);
    }
  }

  /**
   * Test error handling and recovery
   */
  private async testErrorHandling(): Promise<void> {
    try {
      console.log('🛡️ Testing error handling...');
      
      // Test with invalid orientation (should handle gracefully)
      let errorHandled = false;
      try {
        // This should not crash the app
        await ScreenOrientation.lockAsync(-1 as any);
      } catch (error) {
        errorHandled = true;
      }
      
      // Test recovery - should still work after error
      const recoverySuccess = await initializePortraitOrientation();
      
      this.addResult('Error Handling', errorHandled && recoverySuccess,
        `Error handled: ${errorHandled}, Recovery: ${recoverySuccess}`);

    } catch (error) {
      this.addResult('Error Handling', false, `Error: ${error}`);
    }
  }

  /**
   * Test platform-specific behavior
   */
  private async testPlatformSpecificBehavior(): Promise<void> {
    try {
      console.log('🔧 Testing platform-specific behavior...');
      
      if (Platform.OS === 'ios') {
        // Test iOS-specific landscape left preference
        await enterFullscreenOrientation();
        await this.wait(1000);
        
        const orientation = await getCurrentOrientation();
        const isCorrectLandscape = orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
                                  orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
        
        this.addResult('iOS Landscape Behavior', isCorrectLandscape,
          `iOS landscape orientation: ${orientation}`);
        
      } else if (Platform.OS === 'android') {
        // Test Android-specific flexible landscape
        await enterFullscreenOrientation();
        await this.wait(1000);
        
        const orientation = await getCurrentOrientation();
        const isLandscape = await isLandscapeOrientation();
        
        this.addResult('Android Landscape Behavior', isLandscape,
          `Android landscape orientation: ${orientation}`);
      }

    } catch (error) {
      this.addResult('Platform-Specific Behavior', false, `Error: ${error}`);
    }
  }

  /**
   * Add test result
   */
  private addResult(testName: string, success: boolean, message: string): void {
    const result: TestResult = {
      testName,
      success,
      message,
      platform: Platform.OS,
      timestamp: new Date(),
    };
    
    this.results.push(result);
    
    const status = success ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
  }

  /**
   * Print test summary
   */
  private printTestSummary(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log(`Platform: ${Platform.OS}`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`- ${r.testName}: ${r.message}`));
    }
    
    console.log('\n🎉 Integration testing completed!');
  }

  /**
   * Wait helper function
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return this.results;
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    if (this.results.length === 0) return 0;
    const passed = this.results.filter(r => r.success).length;
    return (passed / this.results.length) * 100;
  }
}

// Export singleton instance for easy use
export const orientationIntegrationTest = new OrientationIntegrationTest();
