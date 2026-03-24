const puppeteer = require('puppeteer');
const fs = require('fs');

const URLS = [
  { path: '/', name: 'Home page' },
  { path: '/auth', name: 'Login/Register' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/upload', name: 'Resume Analyze' },
  { path: '/interview', name: 'Interview Prep' },
  { path: '/cover-letter', name: 'Cover Letter' },
  { path: '/resume-builder', name: 'Resume Builder' },
  { path: '/salary', name: 'Salary Predictor' },
  { path: '/linkedin', name: 'LinkedIn Optimizer' },
  { path: '/roast', name: 'Resume Roast' },
  { path: '/mock-interview', name: 'Mock Interview' },
  { path: '/skill-gap', name: 'Skill Gap' },
  { path: '/job-tracker', name: 'Job Tracker' },
  { path: '/campus', name: 'Campus Data' },
  { path: '/history', name: 'History' },
  { path: '/profile', name: 'Profile' }
];

async function runTests() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const results = [];

  for (const { path, name } of URLS) {
    const url = `http://localhost:5173${path}`;
    let status = '✅ WORKING';
    let errorMessage = '';
    
    // Catch console errors
    const pageErrors = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.toString());
    });
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if(!text.includes('Failed to load resource: the server responded with a status of 404')) {
           pageErrors.push(text);
        }
      }
    });

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
      
      // Give React time to render or crash
      await page.evaluate(() => new Promise(res => setTimeout(res, 2000)));

      // Check Vite error overlay
      const hasViteError = await page.evaluate(() => {
        return !!document.querySelector('vite-error-overlay');
      });

      // Check for blank body (fatal React crash without Error Boundary)
      const bodyText = await page.evaluate(() => document.body.innerText.trim());

      if (hasViteError) {
        status = '❌ BROKEN';
        errorMessage = 'Vite Error Overlay appeared (SSR or Compilation Crash)';
      } else if (!bodyText) {
        status = '❌ BROKEN';
        errorMessage = 'Blank white screen (Fatal React render crash)';
      } else if (pageErrors.length > 0) {
        // filter out warnings or known safe errors
        const severeErrors = pageErrors.filter(e => e.includes('Uncaught') || e.includes('TypeError') || e.includes('DOMMatrix'));
        if (severeErrors.length > 0) {
          status = '❌ BROKEN';
          errorMessage = `Console error: ${severeErrors[0].substring(0, 100)}...`;
        } else {
          status = '⚠️ PARTIAL';
          errorMessage = 'Page loads but contains console errors or warnings.';
        }
      }
    } catch (err) {
      status = '❌ BROKEN';
      errorMessage = `Failed to load page: ${err.message}`;
    }

    // Reset listeners for next page
    page.removeAllListeners('pageerror');
    page.removeAllListeners('console');

    results.push(`${status} - ${name} (${url})${errorMessage ? `\n    Error: ${errorMessage}` : ''}`);
    console.log(`Tested ${path}: ${status}`);
  }

  await browser.close();
  
  const report = `FINAL TEST REPORT\n\n${results.join('\n\n')}\n`;
  fs.writeFileSync('test_report.txt', report);
  console.log('Done! Generated test_report.txt');
}

runTests().catch(console.error);
