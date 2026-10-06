// utils/testFixture.js
// Drop-in replacement for require('@playwright/test').
// No longer needs to wire testInfo — reportLogger now uses console.log
// which Monocart 2.11.2 captures directly into test logs.

const { test: base, expect } = require('@playwright/test');

const test = base.extend({
  // Keep fixture for future use — currently a passthrough
  _monocartExpected: [async ({}, use) => {
    await use();
  }, { auto: true }],
});

module.exports = { test, expect };