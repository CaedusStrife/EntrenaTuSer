const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 180000,
  use: {
    baseURL: 'http://localhost:5500',
    headless: true,
    video: 'on',
    trace: 'on'
  },
  reporter: [['list']]
});
