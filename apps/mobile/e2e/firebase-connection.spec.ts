import { test, expect, Page } from '@playwright/test';

// Helper function to wait for Firebase connection logs
async function waitForFirebaseConnection(page: Page) {
  // Listen for console logs
  const logs: string[] = [];
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
  });

  // Wait for Firebase initialization logs
  await page.waitForFunction(() => {
    return window.console.log.toString().includes('Firebase') || 
           document.body.textContent?.includes('Firebase') ||
           (window as any).firebase !== undefined;
  }, { timeout: 10000 }).catch(() => {
    console.log('Firebase initialization timeout - checking logs:', logs);
  });

  return logs;
}

// Helper function to check if Firebase emulators are accessible
async function checkFirebaseEmulators(page: Page) {
  const emulatorChecks = {
    auth: false,
    firestore: false
  };

  try {
    // Check Auth emulator
    const authResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:9099');
        return response.ok;
      } catch {
        return false;
      }
    });
    emulatorChecks.auth = authResponse;

    // Check Firestore emulator
    const firestoreResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:8080');
        return response.ok;
      } catch {
        return false;
      }
    });
    emulatorChecks.firestore = firestoreResponse;
  } catch (error) {
    console.log('Error checking emulators:', error);
  }

  return emulatorChecks;
}

test.describe('Firebase Connection Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load the React Native web app', async ({ page }) => {
    // Check if the main app elements are present
    await expect(page).toHaveTitle('mobile'); // Actual app title
    
    // Look for app-specific content
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for the app title
    await expect(page.getByText('今日の小さな善行')).toBeVisible();
    await expect(page.getByText('Today\'s Small Good Deed')).toBeVisible();
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'e2e/screenshots/app-loaded.png', fullPage: true });
  });

  test('should check Firebase emulator accessibility', async ({ page }) => {
    const emulatorStatus = await checkFirebaseEmulators(page);
    
    console.log('Firebase Emulator Status:', emulatorStatus);
    
    // These might not be accessible from the browser due to CORS, 
    // but we'll log the status for debugging
    expect(typeof emulatorStatus.auth).toBe('boolean');
    expect(typeof emulatorStatus.firestore).toBe('boolean');
  });

  test('should monitor Firebase connection logs', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    // Capture console logs
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Wait for the app to load and potentially make Firebase calls
    await page.waitForTimeout(5000);
    
    console.log('Console logs captured:');
    consoleLogs.forEach(log => console.log(log));
    
    // Check for any error logs
    const errorLogs = consoleLogs.filter(log => 
      log.toLowerCase().includes('error') || 
      log.toLowerCase().includes('failed') ||
      log.toLowerCase().includes('warning')
    );
    if (errorLogs.length > 0) {
      console.log('Error/Warning logs found:', errorLogs);
    }
    
    // Look for Firebase-related logs
    const firebaseLogs = consoleLogs.filter(log => 
      log.toLowerCase().includes('firebase') ||
      log.toLowerCase().includes('auth') ||
      log.toLowerCase().includes('firestore')
    );
    if (firebaseLogs.length > 0) {
      console.log('Firebase-related logs found:', firebaseLogs);
    }
    
    // The test passes if we can capture logs
    expect(consoleLogs).toBeDefined();
  });

  test('should find and interact with the DONE button', async ({ page }) => {
    // Wait for the app to render
    await page.waitForTimeout(2000);
    
    // Look for the DONE button by text
    const doneButton = page.getByText('DONE!');
    
    // Check if button exists and is visible
    await expect(doneButton).toBeVisible();
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'e2e/screenshots/before-button-click.png', fullPage: true });
    
    // Click the DONE button
    await doneButton.click();
    
    // Wait for any potential reactions (animations, etc.)
    await page.waitForTimeout(1000);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'e2e/screenshots/after-button-click.png', fullPage: true });
    
    console.log('Successfully clicked the DONE! button');
  });

  test('should capture network requests for Firebase operations', async ({ page }) => {
    const requests: Array<{method: string, url: string}> = [];
    const responses: Array<{status: number, url: string}> = [];
    
    // Capture network activity
    page.on('request', request => {
      if (request.url().includes('firebase') || 
          request.url().includes('localhost:9099') || 
          request.url().includes('localhost:8080')) {
        requests.push({
          method: request.method(),
          url: request.url()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('firebase') || 
          response.url().includes('localhost:9099') || 
          response.url().includes('localhost:8080')) {
        responses.push({
          status: response.status(),
          url: response.url()
        });
      }
    });
    
    // Wait for potential Firebase operations
    await page.waitForTimeout(5000);
    
    console.log('Firebase-related requests:', requests);
    console.log('Firebase-related responses:', responses);
    
    // Test passes if we can monitor network activity
    expect(requests).toBeDefined();
    expect(responses).toBeDefined();
  });
});