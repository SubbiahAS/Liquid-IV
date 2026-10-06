# Playwright Local Setup & Execution Guide for BeBeautiful

## 1. Prerequisites

- Node.js (Latest LTS recommended – v20+)
- npm (included with Node.js)
- VS Code (Recommended)

### Verify installation

```bash
node -v
npm -v

```
## 2. Install Dependencies

```bash
npm install
npx playwright install
```

`npx playwright install` downloads the required browser binaries.


## 3. Configure Environment

Create a `.env` file in the project root if required.

Example:

```text
BASE_URL=https://www.liquid-iv.ca/
```

## 4. Running Tests
### Run a specific test

```bash
npx playwright test PDPproductDetails.spec.js
npx playwright test PLPproductDetails.spec.js
npx playwright test SignupValidations.spec.js
```
### Run a specific test with headed mode with specific browser
```bash
npx playwright test SignupValidations.spec.js --project=chromium --headed
```

### Run all test cases:
``` bash
npx playwright test
```


## 5. Generate Reports
### HTML Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

### Monocart Report
```bash
npm install monocart-reporter
npx monocart show-report monocart-report/index.html
```

## 6. Debug Mode
```bash
npx playwright test --debug
```

## 7. Codegen (Recorder)
```bash
npx playwright codegen https://www.liquid-iv.ca/
```

## 8. Best Practices

- Follow the Page Object Model (POM).
- Keep locators inside page classes.
- Keep business logic inside page classes.
- Keep test assertions and test flow inside spec files.
- Store environment-specific values in a `.env` file.
- Reuse fixtures and helper utilities where possible.
- Review HTML or Monocart reports after execution.


## 9. Optional (Recommended)
### Run all sanity tests

``` bash
npx playwright test
```
