// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15000,
  retries: 0,
  use: {
    browserName: 'chromium',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
