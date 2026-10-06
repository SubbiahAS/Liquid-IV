// ==============================
// tests/verifyContactUsPageValidations.spec.js
// ==============================

require('dotenv').config();

const { test, expect } = require('../utils/testFixture');
const ContactPage = require('../Pages/Contactpage');
const { logResult } = require('../utils/reportLogger');

const {
    addStepResult,
    getStepResults,
    clearStepResults
} = require('../utils/testReporter');

// ==============================
// Test Data (from .env)
// ==============================

const INVALID_EMAIL = process.env.CONTACT_INVALID_EMAIL;
const VALID_EMAIL = process.env.CONTACT_VALID_EMAIL;

const INVALID_PHONE = process.env.CONTACT_INVALID_PHONE;
const VALID_PHONE = process.env.CONTACT_VALID_PHONE;

const VALID_FIRST_NAME = process.env.CONTACT_FIRST_NAME;
const VALID_LAST_NAME = process.env.CONTACT_LAST_NAME;

const ALLOWED_COMMENTS_TEXT = process.env.CONTACT_COMMENTS;

const CONTACT_PAGE_PATH = process.env.CONTACT_PAGE_PATH || '/pages/contact-form';

function withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise((resolve) => setTimeout(() => {
            console.log(`⚠️ ${label} did not resolve within ${ms}ms — continuing anyway`);
            resolve();
        }, ms))
    ]);
}

test.describe('Signup Module', () => {

    test(
        'TC011 - Verify Validations on the Contact Us Page',
        async ({ page }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;
            let overallStatus = 'FAIL';

            console.log('\n======================================================');
            console.log('🚀 Starting TC011 - Verify Validations on the Contact Us Page');
            console.log('======================================================');

            const contactPage = new ContactPage(page);

            try {

                // ============================================================
                // STEP 1 : Navigate to Contact Page
                // ============================================================

                console.log('🔹 Step 1 : Navigate to Contact Page');

                const response = await contactPage.hitUrl(CONTACT_PAGE_PATH);

                await page.waitForLoadState('domcontentloaded').catch(() => { });

                const statusCode = response ? response.status() : null;

                const formVisible = await contactPage.isContactFormVisible();

                if (statusCode === 200 && formVisible) {

                    addStepResult(
                        'PASS',
                        `Contact page loaded successfully with HTTP Status Code : ${statusCode}`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Contact page did not load successfully. HTTP Status Code : ${statusCode}`
                    );
                }

                // ------------------------------------------------------------
                // Reveal remaining form fields: select first option in
                // "Please tell us the reason for your enquiry" dropdown,
                // then select first option in "Please give us some more
                // details" dropdown. Only then do email/phone/name/comments
                // fields render on the page.
                // ------------------------------------------------------------

                console.log('🔹 Revealing contact form (selecting inquiry dropdowns)');

                await contactPage.revealContactForm();

                // ============================================================
                // STEP 2 : Enter Invalid Email
                // ============================================================

                console.log('🔹 Step 2 : Enter Invalid Email');

                await contactPage.enterEmail(INVALID_EMAIL);

                const emailErrorVisible = await contactPage.isEmailErrorVisible();

                if (emailErrorVisible) {

                    const emailErrorText = await contactPage.getEmailErrorText();

                    addStepResult(
                        'PASS',
                        `Proper validation message displayed for invalid email : "${emailErrorText}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Validation message is not displayed for invalid email'
                    );
                }

                // ============================================================
                // STEP 3 : Enter Invalid Phone Number
                // ============================================================

                console.log('🔹 Step 3 : Enter Invalid Phone Number');

                await contactPage.enterPhone(INVALID_PHONE);

                const phoneErrorVisible = await contactPage.isPhoneErrorVisible();

                if (phoneErrorVisible) {

                    const phoneErrorText = await contactPage.getPhoneErrorText();

                    addStepResult(
                        'PASS',
                        `Validation message appeared for invalid phone number : "${phoneErrorText}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Validation message did not appear for invalid phone number'
                    );
                }

                // ============================================================
                // STEP 4 : Select Each Inquiry Type
                // ============================================================

                console.log('🔹 Step 4 : Select Each Inquiry Type');

                const inquiryTypes = ['Question', 'Concern'];

                let inquirySelectionFailed = false;

                let inquirySelectionSummary = '';

                for (const inquiryType of inquiryTypes) {

                    await contactPage.selectInquiryType(inquiryType);

                    // Selecting a new inquiry type re-renders the subject
                    // dropdown and the rest of the form - reveal it again.
                    await contactPage.selectFirstInquirySubj();

                    const selectedValue = await contactPage.getSelectedInquiryType();

                    if (selectedValue !== inquiryType) {

                        inquirySelectionFailed = true;
                    }

                    inquirySelectionSummary += `[${inquiryType} => "${selectedValue}"] `;
                }

                if (!inquirySelectionFailed) {

                    addStepResult(
                        'PASS',
                        `Selected option displayed correctly for each inquiry type : ${inquirySelectionSummary}`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Selected option was not displayed correctly : ${inquirySelectionSummary}`
                    );
                }

                // ============================================================
                // STEP 5 : Enter Allowed Characters in Comments
                // ============================================================

                console.log('🔹 Step 5 : Enter Allowed Characters in Comments');

                const maxLength = await contactPage.getCommentsMaxLength();

                await contactPage.enterComments(ALLOWED_COMMENTS_TEXT);

                const commentsValue = await contactPage.getCommentsValue();

                const isWithinAllowedLimit =
                    commentsValue === ALLOWED_COMMENTS_TEXT &&
                    (!maxLength || commentsValue.length <= parseInt(maxLength, 10));

                if (isWithinAllowedLimit) {

                    addStepResult(
                        'PASS',
                        `User was able to enter text within allowed limit : "${commentsValue}" (maxlength : ${maxLength})`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Text entered in comments was not within allowed limit. Entered : "${commentsValue}" (maxlength : ${maxLength})`
                    );
                }

                // ============================================================
                // STEP 6 : Fill Valid Details And Submit
                // ============================================================

                console.log('🔹 Step 6 : Fill Valid Details And Submit');

                // Remove previously entered invalid email / phone and replace with valid values
                await contactPage.clearEmail();
                await contactPage.enterEmail(VALID_EMAIL);

                await contactPage.clearPhone();
                await contactPage.enterPhone(VALID_PHONE);

                await contactPage.enterFirstName(VALID_FIRST_NAME);
                await contactPage.enterLastName(VALID_LAST_NAME);

                await contactPage.checkAgeConfirmation();

                await contactPage.clickSubmit();

                await page.waitForLoadState('domcontentloaded').catch(() => { });

                // Success message on this site can take ~15-20s to render
                // after submit, so give it a generous wait window.
                const successVisible = await contactPage.isSuccessMessageVisible();

                if (successVisible) {

                    const successText = await contactPage.getSuccessMessageText();

                    addStepResult(
                        'PASS',
                        `Success confirmation message displayed after submitting valid details : "${successText}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Success confirmation message was not displayed after submitting valid details'
                    );
                }

                await page.waitForTimeout(10000); 
                
                // ============================================================
                // STEP 7 : Refresh Page After Successful Submission
                // ============================================================

                console.log('🔹 Step 7 : Refresh Page After Successful Submission');

                await contactPage.reloadPage();

                // Use 'domcontentloaded' instead of 'networkidle' - background
                // trackers/chat widgets on this page keep the network busy,
                // so 'networkidle' never resolves and stalls the test/browser.
                await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { });

                const isFormReset = await contactPage.isFormResetAfterReload();

                if (isFormReset) {

                    addStepResult(
                        'PASS',
                        'Previously submitted data was not resubmitted automatically after page refresh'
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Previously submitted data appears to have been resubmitted / retained automatically after page refresh'
                    );
                }

            } catch (error) {

                testFailed = true;

                addStepResult(
                    'FAIL',
                    `Unexpected error : ${error.message}`
                );

            } finally {

            //     const steps = getStepResults();

            //     overallStatus = testFailed ? 'FAIL' : 'PASS';

            //     console.log(
            //         'Steps:',
            //         JSON.stringify(steps, null, 2)
            //     );

            //     logResult({
            //         testCaseId: 'TC011',
            //         title: 'Verify Validations on the Contact Us Page',
            //         status: overallStatus,
            //         steps
            //     });

            //     clearStepResults();

            //     // Ensure the browser page/tab is closed even if a step above
            //     // hung or left a pending navigation, so the run does not
            //     // leave the browser open after the test finishes.
            //     if (!page.isClosed()) {

            //         await page.close().catch(() => { });
            //     }
            // }

                    const steps = getStepResults();

                    overallStatus = testFailed ? 'FAIL' : 'PASS';

                    console.log(
                        'Steps:',
                        JSON.stringify(steps, null, 2)
                    );

                    await withTimeout(
                        (async () => {
                            logResult({
                                testCaseId: 'TC011',
                                title: 'Verify Validations on the Contact Us Page',
                                status: overallStatus,
                                steps
                            });
                        })(),
                        10000,
                        'logResult'
                    );

                    clearStepResults();

                    if (!page.isClosed()) {
                        await withTimeout(page.close().catch(() => { }), 10000, 'page.close');
                    }
                }

                expect(
                    overallStatus,
                    'One or more validation steps failed'
                ).toBe('PASS');
            }
    );

});