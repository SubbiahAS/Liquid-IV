// // @ts-check
// import { defineConfig, devices } from '@playwright/test';

// /**
//  * Read environment variables from file.
//  * https://github.com/motdotla/dotenv
//  */
// // import dotenv from 'dotenv';
// // import path from 'path';
// // dotenv.config({ path: path.resolve(__dirname, '.env') });

// /**
//  * @see https://playwright.dev/docs/test-configuration
//  */
// export default defineConfig({
//   testDir: './tests',
//   /* Run tests in files in parallel */
//   fullyParallel: true,
//   /* Fail the build on CI if you accidentally left test.only in the source code. */
//   forbidOnly: !!process.env.CI,
//   /* Retry on CI only */
//   retries: process.env.CI ? 2 : 0,
//   /* Opt out of parallel tests on CI. */
//   workers: process.env.CI ? 1 : undefined,
//   /* Reporter to use. See https://playwright.dev/docs/test-reporters */
//   reporter: [
//     ['html'],

//     ['monocart-reporter', {
//       name: 'BEBE Test Execution Report',
//       outputFile: 'reports/monocart-report/index.html',

//       // ── visitor: runs per test item during report generation ──────────────
//       // Monocart 2.11.2 captures console.log into test.logs[]
//       // We parse our tagged line and build the expectedResults column data
//       visitor: (testItem) => {
//         if (!Array.isArray(testItem.logs) || testItem.logs.length === 0) return;

//         // Find the tagged log line written by reportLogger.js
//         const taggedLog = testItem.logs.find(
//           log => typeof log === 'string' && log.includes('##EXPECTED_RESULTS##')
//         );

//         if (!taggedLog) return;

//         // Parse the JSON after the tag
//         try {
//           const jsonStr = taggedLog.split('##EXPECTED_RESULTS##')[1].trim();
//           testItem.expectedResults = JSON.parse(jsonStr);
//         } catch {
//           // ignore parse errors
//         }
//       },

//       columns: (defaultColumns) => {
//         const titleIdx = defaultColumns.findIndex(c => c.id === 'title');
//         const insertAt = titleIdx !== -1 ? titleIdx + 1 : defaultColumns.length;

//         const expectedResultsCol = {
//           id:    'expectedResults',
//           name:  'Expected Results',
//           width: 480,
//           align: 'left',

//           formatter: (value) => {
//             if (!value) return '';

//             let items = [];
//             if (typeof value === 'string') {
//               try { items = JSON.parse(value); } catch { return value; }
//             } else if (Array.isArray(value)) {
//               items = value;
//             }

//             if (!items.length) return '';

//             const rows = items.map(e => {
//               const status = (e.status || 'N/A').toUpperCase();
//               const palette = {
//                 PASS: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
//                 FAIL: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
//                 SKIP: { bg: '#fff3cd', color: '#856404', border: '#ffeeba' },
//                 'N/A': { bg: '#e9ecef', color: '#495057', border: '#dee2e6' },
//               };
//               const s = palette[status] ?? palette['N/A'];
//               return `<div style="display:flex;align-items:flex-start;gap:8px;` +
//                 `padding:5px 2px;border-bottom:1px solid #f0f0f0;` +
//                 `font-size:12px;line-height:1.5;">` +
//                 `<span style="background:${s.bg};color:${s.color};` +
//                 `border:1px solid ${s.border};font-weight:700;font-size:10px;` +
//                 `padding:2px 6px;border-radius:4px;white-space:nowrap;` +
//                 `min-width:36px;text-align:center;margin-top:2px;flex-shrink:0;">${status}</span>` +
//                 `<span style="color:#333;">${e.point || ''}</span></div>`;
//             }).join('');

//             return `<div style="padding:2px 0;">${rows}</div>`;
//           },
//         };

//         const cols = [...defaultColumns];
//         cols.splice(insertAt, 0, expectedResultsCol);
//         return cols;
//       },

//       summary: {
//         passed:   true,
//         failed:   true,
//         skipped:  true,
//         flaky:    true,
//         duration: true,
//       },

//       trend: { n: 10 },
//     }],
//   ],
//   /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
//   use: {
//     /* Base URL to use in actions like `await page.goto('')`. */
//     // baseURL: 'http://localhost:3000',

//     /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
//     trace: 'on-first-retry',
//   },

//   /* Configure projects for major browsers */
//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     },

//     {
//       name: 'firefox',
//       use: { ...devices['Desktop Firefox'] },
//     },

//     {
//       name: 'webkit',
//       use: { ...devices['Desktop Safari'] },
//     },

//     /* Test against mobile viewports. */
//     // {
//     //   name: 'Mobile Chrome',
//     //   use: { ...devices['Pixel 5'] },
//     // },
//     // {
//     //   name: 'Mobile Safari',
//     //   use: { ...devices['iPhone 12'] },
//     // },

//     /* Test against branded browsers. */
//     // {
//     //   name: 'Microsoft Edge',
//     //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
//     // },
//     // {
//     //   name: 'Google Chrome',
//     //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
//     // },
//   ],

//   /* Run your local dev server before starting the tests */
//   // webServer: {
//   //   command: 'npm run start',
//   //   url: 'http://localhost:3000',
//   //   reuseExistingServer: !process.env.CI,
//   // },
// });

// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html'],
    ['monocart-reporter', {
      name: 'BEBE Test Execution Report',
      outputFile: 'reports/monocart-report/index.html',

      visitor: (testItem) => {
        if (!Array.isArray(testItem.logs) || testItem.logs.length === 0) return;
        const taggedLog = testItem.logs.find(
          log => typeof log === 'string' && log.includes('##EXPECTED_RESULTS##')
        );
        if (!taggedLog) return;
        try {
          const jsonStr = taggedLog.split('##EXPECTED_RESULTS##')[1].trim();
          testItem.expectedResults = JSON.parse(jsonStr);
        } catch {
          // ignore parse errors
        }
      },

      columns: (defaultColumns) => {
        const titleIdx = defaultColumns.findIndex(c => c.id === 'title');
        const insertAt = titleIdx !== -1 ? titleIdx + 1 : defaultColumns.length;

        const expectedResultsCol = {
          id:    'expectedResults',
          name:  'Expected Results',
          width: 480,
          align: 'left',
          formatter: (value) => {
            if (!value) return '';
            let items = [];
            if (typeof value === 'string') {
              try { items = JSON.parse(value); } catch { return value; }
            } else if (Array.isArray(value)) {
              items = value;
            }
            if (!items.length) return '';
            const rows = items.map(e => {
              const status = (e.status || 'N/A').toUpperCase();
              const palette = {
                PASS: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
                FAIL: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
                SKIP: { bg: '#fff3cd', color: '#856404', border: '#ffeeba' },
                'N/A': { bg: '#e9ecef', color: '#495057', border: '#dee2e6' },
              };
              const s = palette[status] ?? palette['N/A'];
              return `<div style="display:flex;align-items:flex-start;gap:8px;` +
                `padding:5px 2px;border-bottom:1px solid #f0f0f0;` +
                `font-size:12px;line-height:1.5;">` +
                `<span style="background:${s.bg};color:${s.color};` +
                `border:1px solid ${s.border};font-weight:700;font-size:10px;` +
                `padding:2px 6px;border-radius:4px;white-space:nowrap;` +
                `min-width:36px;text-align:center;margin-top:2px;flex-shrink:0;">${status}</span>` +
                `<span style="color:#333;">${e.point || ''}</span></div>`;
            }).join('');
            return `<div style="padding:2px 0;">${rows}</div>`;
          },
        };

        const cols = [...defaultColumns];
        cols.splice(insertAt, 0, expectedResultsCol);
        return cols;
      },

      summary: {
        passed:   true,
        failed:   true,
        skipped:  true,
        flaky:    true,
        duration: true,
      },

      trend: { n: 10 },
    }],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});