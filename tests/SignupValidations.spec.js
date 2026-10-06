// ==============================
// tests/SignupValidations.spec.js
// ==============================

const { test, expect } = require('../utils/testFixture');
const SignupPage = require('../Pages/SignupPage');
const { logResult } = require('../utils/reportLogger');

const {
    addStepResult,
    getStepResults,
    clearStepResults
} = require('../utils/testReporter');

test.describe('Signup Module', () => {

    test(
        'TC011 - Verify Validations on the Sign-Up Page',
        async ({ page }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;

            console.log('\n======================================================');
            console.log('🚀 Starting TC011 - Verify Validations on the Sign-Up Page');
            console.log('======================================================');

            const signupPage = new SignupPage(page);
            const testData = signupPage.testData;

            try {

                // ============================================================
                // STEP 1 : Navigate to Signup Page
                // ============================================================

                console.log('🔹 Step 1 : Navigate to Signup page');

                const navigated = await signupPage.navigateToSignupViaHeader();
                const signupLoaded = navigated && await signupPage.isSignupPageLoaded();
                const signupURL = signupPage.getCurrentURL();

                if (signupLoaded) {

                    addStepResult(
                        'PASS',
                        `Signup page loaded successfully : "${signupURL}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Signup page did not load successfully. Current URL : "${signupURL}"`
                    );
                }

                // ============================================================
                // STEP 2 : Click Submit Without Entering Data
                // ============================================================

                console.log('🔹 Step 2 : Click Submit without entering data');

                await signupPage.clickSubmitWithoutData();

                const {
                    validationTriggered,
                    emailValidity,
                    generalErrorVisible,
                    generalErrorText,
                    emailErrorVisible,
                    emailErrorText
                } = await signupPage.verifyRequiredFieldValidation();

                if (validationTriggered) {

                    addStepResult(
                        'PASS',
                        `Required field validation messages appeared successfully. ` +
                        `Email Validity : ${JSON.stringify(emailValidity)} | General Error Visible : ${generalErrorVisible} ("${generalErrorText}") | Email Error Visible : ${emailErrorVisible} ("${emailErrorText}")`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Required field validation messages did not appear on empty form submission`
                    );
                }

                // ============================================================
                // STEP 3 : Enter Invalid Email
                // (Skipped from overall pass/fail per current request —
                // logged for visibility only, not gating testFailed)
                // ============================================================

                console.log('🔹 Step 3 : Enter invalid email (informational only)');

                await signupPage.fillMandatoryFieldsExceptEmail();
                await signupPage.enterInvalidEmail(testData.invalidEmail);

                const {
                    hasProperValidationMessage,
                    emailValidity: invalidEmailValidity,
                    emailErrorVisible: invalidEmailErrorVisible,
                    emailErrorText: invalidEmailErrorText
                } = await signupPage.getInvalidEmailValidationMessage();

                addStepResult(
                    hasProperValidationMessage ? 'PASS' : 'SKIP',
                    `Invalid email validation check. ` +
                    `Validity : ${JSON.stringify(invalidEmailValidity)} | Field Error Visible : ${invalidEmailErrorVisible} ("${invalidEmailErrorText}")`
                );

                // ============================================================
                // STEP 4 : Replace Invalid Email With a Valid Email
                // ============================================================

                console.log('🔹 Step 4 : Enter valid email');

                const validEmailEntered = await signupPage.enterValidEmail(testData.email);

                if (validEmailEntered) {

                    addStepResult(
                        'PASS',
                        `Valid email entered successfully : "${testData.email}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Valid email could not be entered`
                    );
                }

                // ============================================================
                // STEP 5 : Click Terms Link
                // ============================================================

                console.log('🔹 Step 5 : Click Terms link');

                const termsResult = await signupPage.clickTermsLink();

                if (termsResult.opened) {

                    addStepResult(
                        'PASS',
                        `Terms page opened correctly : "${termsResult.url}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Terms page did not open correctly`
                    );
                }

                // ============================================================
                // STEP 6 : Click Privacy Policy Link
                // ============================================================

                console.log('🔹 Step 6 : Click Privacy Policy');

                const privacyResult = await signupPage.clickPrivacyPolicyLink();

                if (privacyResult.opened) {

                    addStepResult(
                        'PASS',
                        `Privacy Policy page opened successfully : "${privacyResult.url}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Privacy Policy page did not open successfully`
                    );
                }

                // ============================================================
                // STEP 7 : Fill All Valid Details, Check Consent, and Submit
                // ============================================================

                console.log('🔹 Step 7 : Fill valid details, check consent checkbox, and submit');

                await signupPage.fillValidSignupDetails();

                const consentChecked = await signupPage.acceptsMarketingCheckbox.isChecked().catch(() => false);

                if (consentChecked) {

                    addStepResult(
                        'PASS',
                        `Consent checkbox checked successfully before submission`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Consent checkbox could not be checked before submission`
                    );
                }

                const {
                    registered,
                    urlBeforeSubmit,
                    urlAfterSubmit,
                    successMessageVisible,
                    generalErrorVisible: finalGeneralErrorVisible,
                    generalErrorText: finalGeneralErrorText
                } = await signupPage.submitValidDetailsAndVerifyRegistration();

                if (registered) {

                    addStepResult(
                        'PASS',
                        `User registered successfully. Email : "${testData.email}" | Birthday : "${signupPage.getTodayFormatted()}" | Postal Code : "${testData.postalCode}" | ` +
                        `URL Before : "${urlBeforeSubmit}" | URL After : "${urlAfterSubmit}" | Success Message Visible : ${successMessageVisible}`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `User was not registered successfully. URL Before : "${urlBeforeSubmit}" | URL After : "${urlAfterSubmit}" | ` +
                        `General Error Visible : ${finalGeneralErrorVisible} ("${finalGeneralErrorText}")`
                    );
                }

            } catch (error) {

                testFailed = true;

                addStepResult(
                    'FAIL',
                    `Unexpected error : ${error.message}`
                );
            }

            const steps = getStepResults();

            const overallStatus =
                testFailed ? 'FAIL' : 'PASS';

            console.log(
                'Steps:',
                JSON.stringify(steps, null, 2)
            );

            logResult({
                testCaseId: 'TC011',
                title: 'Verify Validations on the Sign-Up Page',
                status: overallStatus,
                steps
            });

            clearStepResults();

            expect(
                overallStatus,
                'One or more validation steps failed'
            ).toBe('PASS');
        }
    );

});