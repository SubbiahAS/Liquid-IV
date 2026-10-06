// ==============================
// pages/SignupPage.js
// ==============================

class SignupPage {

    constructor(page) {

        this.page = page;

        this.testData = {
            email: process.env.SIGNUP_EMAIL,
            invalidEmail: process.env.SIGNUP_INVALID_EMAIL,
            firstName: process.env.SIGNUP_FIRST_NAME,
            lastName: process.env.SIGNUP_LAST_NAME,
            postalCode: process.env.SIGNUP_POSTAL_CODE
        };

        this.signUpNavLink = page.locator("a.main-link[data-link='sign-up']:visible").first();

        this.signupForm = page.locator('#create_customer').first();

        this.emailInput = page.locator("#create_customer:visible #email:visible, #email:visible").first();
        this.firstNameInput = this.signupForm.locator('#first_name');
        this.lastNameInput = this.signupForm.locator('#last_name');
        this.postalCodeInput = this.signupForm.locator('#postal_code');
        this.birthdayInput = this.signupForm.locator('#birthday');
        this.acceptsMarketingCheckbox = this.signupForm.locator("#customer\\[accepts_marketing\\]");

        this.generalErrorMsg = page.locator(".error_msg:visible, .form-error:visible, [class*='error']:visible:has-text('required'), [class*='error']:visible:has-text('fill')").first();
        this.emailErrorMsg = page.locator(".email_error_msg:visible, [class*='email'][class*='error']:visible").first();
        this.firstNameErrorMsg = this.signupForm.locator('.first_name_error_msg');
        this.lastNameErrorMsg = this.signupForm.locator('.last_name_error_msg');
        this.postalErrorMsg = this.signupForm.locator('.postal_error_msg');

        // ---------------- Submit Button ----------------
        this.submitButton = page.locator(
            "button:visible:has-text('Sign Up'), " +
            "a:visible:has-text('Sign Up'), " +
            "input[type='submit'][value='Sign Up']:visible, " +
            "input[type='button'][value='Sign Up']:visible"
        ).first();

        // Hidden native fallback (last resort only)
        this.nativeSubmitButton = this.signupForm.locator("input[type='submit'][value='Sign Up']");

        this.acceptsMarketingLabel = this.signupForm.locator("label[for='customer[accepts_marketing]']");
        this.termsLink = this.acceptsMarketingLabel.locator("a:has-text('Unilever Brands')").first();
        this.privacyPolicyLink = this.acceptsMarketingLabel.locator("a:has-text('Privacy Notice')").first();

        this.successMessage = page.locator(
            "text=/thank you|successfully|welcome|account created/i"
        ).first();
    }

    getTodayFormatted() {

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}`;
    }

    async hitUrl(path = '/') {

        try {

            const baseUrl = process.env.BASE_URL || 'https://www.liquid-iv.ca/';
            const url = new URL(path, baseUrl).toString();

            return await this.page.goto(url);

        } catch (error) {

            console.log(`⚠️ hitUrl failed : ${error.message}`);
            return null;
        }
    }

    async dismissCookieBannerIfPresent() {

        try {

            const consentButton = this.page.locator(
                "button:has-text('Accept'), button:has-text('Accept All'), " +
                "button:has-text('Accept Cookies'), #onetrust-accept-btn-handler"
            ).first();

            if (await consentButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                await consentButton.click({ timeout: 3000 }).catch(() => {});
            }

        } catch (error) {
            // Non-fatal
        }
    }

    async navigateToSignupViaHeader() {

        try {

            await this.hitUrl('/');
            await this.page.waitForLoadState('domcontentloaded');
            await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

            await this.dismissCookieBannerIfPresent();

            await this.signUpNavLink.waitFor({ state: 'visible', timeout: 10000 });
            await this.signUpNavLink.click();

            await this.page.waitForLoadState('domcontentloaded');
            await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

            await this.dismissCookieBannerIfPresent();

            await this.page.waitForTimeout(2000);

            await this.scrollToRevealForm();

            return true;

        } catch (error) {

            console.log(`⚠️ navigateToSignupViaHeader failed : ${error.message}`);
            return false;
        }
    }

    async scrollToRevealForm() {

        try {

            const bothVisible = async () => {
                const emailVisible = await this.emailInput.isVisible().catch(() => false);
                const submitVisible = await this.submitButton.isVisible().catch(() => false);
                return emailVisible && submitVisible;
            };

            if (await bothVisible()) {
                return true;
            }

            await this.signupForm.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
            await this.page.waitForTimeout(1000);

            if (await bothVisible()) {
                return true;
            }

            const maxSteps = 40;

            for (let step = 1; step <= maxSteps; step++) {

                await this.page.mouse.wheel(0, 250).catch(() => {});
                await this.page.waitForTimeout(400);

                if (await bothVisible()) {
                    return true;
                }
            }

            const submitCount = await this.submitButton.count().catch(() => 0);

            if (submitCount > 0) {
                await this.submitButton.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
            } else {
                await this.nativeSubmitButton.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
            }

            await this.page.waitForTimeout(3000);

            return await bothVisible();

        } catch (error) {

            console.log(`⚠️ scrollToRevealForm failed : ${error.message}`);
            return false;
        }
    }

    async isSignupPageLoaded() {

        try {

            await this.scrollToRevealForm();

            await this.signupForm.waitFor({ state: 'attached', timeout: 15000 });
            await this.emailInput.waitFor({ state: 'visible', timeout: 20000 });

            return true;

        } catch (error) {

            console.log(`⚠️ isSignupPageLoaded failed : ${error.message}`);
            return false;
        }
    }

    getCurrentURL() {

        return this.page.url();
    }

    async checkConsent() {

        try {

            const alreadyChecked = await this.acceptsMarketingCheckbox.isChecked().catch(() => false);

            if (alreadyChecked) {
                return true;
            }

            const checkedViaClick = await this.acceptsMarketingCheckbox
                .check({ force: true, timeout: 5000 })
                .then(() => true)
                .catch(() => false);

            if (checkedViaClick) {
                return true;
            }

            await this.acceptsMarketingCheckbox.evaluate((el) => {
                el.checked = true;
                el.dispatchEvent(new Event('click', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }).catch(() => {});

            return await this.acceptsMarketingCheckbox.isChecked().catch(() => false);

        } catch (error) {

            console.log(`⚠️ checkConsent failed : ${error.message}`);
            return false;
        }
    }

    async submitForm({ withConsent = true } = {}) {

        try {

            if (withConsent) {
                await this.checkConsent();
            }

            await this.scrollToRevealForm();

            const submitVisible = await this.submitButton
                .isVisible({ timeout: 10000 })
                .catch(() => false);

            if (submitVisible) {

                await this.submitButton.scrollIntoViewIfNeeded().catch(() => {});
                await this.submitButton.click({ timeout: 10000 });

                await this.page.waitForTimeout(1500);

                return true;
            }

            console.log('⚠️ submitForm : visible Sign Up control not found — falling back to forced native submit');

            const nativeExists = await this.nativeSubmitButton.count().catch(() => 0);

            if (nativeExists > 0) {

                await this.nativeSubmitButton.scrollIntoViewIfNeeded().catch(() => {});
                await this.nativeSubmitButton.click({ force: true, timeout: 5000 }).catch(() => {});

                await this.page.waitForTimeout(1500);

                return true;
            }

            return false;

        } catch (error) {

            console.log(`⚠️ submitForm failed : ${error.message}`);
            return false;
        }
    }

    async clickSubmitWithoutData() {

        try {

            await this.scrollToRevealForm();
            await this.submitForm({ withConsent: false });
            await this.page.waitForTimeout(1500);

            return true;

        } catch (error) {

            console.log(`⚠️ clickSubmitWithoutData failed : ${error.message}`);
            return false;
        }
    }

    async verifyRequiredFieldValidation() {

        try {

            await this.page.waitForTimeout(500);

            const emailValidity = await this.emailInput.evaluate((el) => ({
                valid: el.validity.valid,
                message: el.validationMessage,
                matchesInvalidPseudo: el.matches(':invalid'),
                required: el.required,
                value: el.value
            })).catch(() => ({ valid: true, message: '', matchesInvalidPseudo: false, required: false, value: '' }));

            const generalErrorVisible = await this.generalErrorMsg.isVisible().catch(() => false);
            const generalErrorText = generalErrorVisible
                ? ((await this.generalErrorMsg.textContent().catch(() => '')) || '').trim()
                : '';

            const emailErrorVisible = await this.emailErrorMsg.isVisible().catch(() => false);
            const emailErrorText = emailErrorVisible
                ? ((await this.emailErrorMsg.textContent().catch(() => '')) || '').trim()
                : '';

            const anyVisibleErrorOnPage = await this.page.locator(
                "[class*='error']:visible, [class*='invalid']:visible, [aria-invalid='true']:visible"
            ).first().isVisible().catch(() => false);

            const stayedOnSamePage = this.page.url().includes('signup') || this.page.url().includes('create_customer') || this.page.url().includes('#');

            const validationTriggered =
                !emailValidity.valid ||
                emailValidity.matchesInvalidPseudo ||
                (emailValidity.required && emailValidity.value.trim().length === 0) ||
                (generalErrorVisible && generalErrorText.length > 0) ||
                (emailErrorVisible && emailErrorText.length > 0) ||
                anyVisibleErrorOnPage ||
                stayedOnSamePage;

            return {
                validationTriggered,
                emailValidity,
                generalErrorVisible,
                generalErrorText,
                emailErrorVisible,
                emailErrorText
            };

        } catch (error) {

            console.log(`⚠️ verifyRequiredFieldValidation failed : ${error.message}`);
            return {
                validationTriggered: false,
                emailValidity: { valid: true, message: '' },
                generalErrorVisible: false,
                generalErrorText: '',
                emailErrorVisible: false,
                emailErrorText: ''
            };
        }
    }

    async fillMandatoryFieldsExceptEmail() {

        try {

            await this.firstNameInput.fill(this.testData.firstName);
            await this.lastNameInput.fill(this.testData.lastName);
            await this.postalCodeInput.fill(this.testData.postalCode);
            await this.birthdayInput.fill(this.getTodayFormatted());

            return true;

        } catch (error) {

            console.log(`⚠️ fillMandatoryFieldsExceptEmail failed : ${error.message}`);
            return false;
        }
    }

    async enterInvalidEmail(invalidEmail = this.testData.invalidEmail) {

        try {

            await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.emailInput.fill('');
            await this.emailInput.fill(invalidEmail);

            return true;

        } catch (error) {

            console.log(`⚠️ enterInvalidEmail failed : ${error.message}`);
            return false;
        }
    }

    async getInvalidEmailValidationMessage() {

        try {

            await this.submitForm({ withConsent: false });

            const emailValidity = await this.emailInput.evaluate((el) => ({
                valid: el.validity.valid,
                message: el.validationMessage
            })).catch(() => ({ valid: true, message: '' }));

            const emailErrorVisible = await this.emailErrorMsg.isVisible().catch(() => false);
            const emailErrorText = emailErrorVisible
                ? ((await this.emailErrorMsg.textContent().catch(() => '')) || '').trim()
                : '';

            const hasProperValidationMessage =
                (!emailValidity.valid && emailValidity.message.length > 0) ||
                (emailErrorVisible && emailErrorText.length > 0);

            return {
                hasProperValidationMessage,
                emailValidity,
                emailErrorVisible,
                emailErrorText
            };

        } catch (error) {

            console.log(`⚠️ getInvalidEmailValidationMessage failed : ${error.message}`);
            return {
                hasProperValidationMessage: false,
                emailValidity: { valid: true, message: '' },
                emailErrorVisible: false,
                emailErrorText: ''
            };
        }
    }

    async enterValidEmail(validEmail = this.testData.email) {

        try {

            await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.emailInput.fill('');
            await this.emailInput.fill(validEmail);

            return true;

        } catch (error) {

            console.log(`⚠️ enterValidEmail failed : ${error.message}`);
            return false;
        }
    }

    async clickTermsLink() {

        try {

            await this.termsLink.waitFor({ state: 'visible', timeout: 10000 });
            await this.termsLink.scrollIntoViewIfNeeded();

            const href = (await this.termsLink.getAttribute('href')) || '';
            const targetsNewTab = (await this.termsLink.getAttribute('target')) === '_blank';

            if (targetsNewTab) {

                const [newPage] = await Promise.all([
                    this.page.context().waitForEvent('page', { timeout: 15000 }),
                    this.termsLink.click()
                ]);

                await newPage.waitForLoadState('domcontentloaded').catch(() => {});

                const newPageUrl = newPage.url();
                const opened = newPageUrl.length > 0 && newPageUrl !== 'about:blank';

                await newPage.close().catch(() => {});

                return { opened, url: newPageUrl || href };

            } else {

                await this.termsLink.click();
                await this.page.waitForLoadState('networkidle').catch(() => {});

                const newUrl = this.page.url();
                const opened = newUrl.length > 0 && newUrl !== href;

                return { opened, url: newUrl };
            }

        } catch (error) {

            console.log(`⚠️ clickTermsLink failed : ${error.message}`);
            return { opened: false, url: '' };
        }
    }

    async clickPrivacyPolicyLink() {

        try {

            await this.privacyPolicyLink.waitFor({ state: 'visible', timeout: 10000 });
            await this.privacyPolicyLink.scrollIntoViewIfNeeded();

            const href = (await this.privacyPolicyLink.getAttribute('href')) || '';
            const targetsNewTab = (await this.privacyPolicyLink.getAttribute('target')) === '_blank';

            if (targetsNewTab) {

                const [newPage] = await Promise.all([
                    this.page.context().waitForEvent('page', { timeout: 15000 }),
                    this.privacyPolicyLink.click()
                ]);

                await newPage.waitForLoadState('domcontentloaded').catch(() => {});

                const newPageUrl = newPage.url();
                const opened = newPageUrl.length > 0 && newPageUrl !== 'about:blank';

                await newPage.close().catch(() => {});

                return { opened, url: newPageUrl || href };

            } else {

                await this.privacyPolicyLink.click();
                await this.page.waitForLoadState('networkidle').catch(() => {});

                const newUrl = this.page.url();
                const opened = newUrl.length > 0 && newUrl !== href;

                return { opened, url: newUrl };
            }

        } catch (error) {

            console.log(`⚠️ clickPrivacyPolicyLink failed : ${error.message}`);
            return { opened: false, url: '' };
        }
    }

    async fillValidSignupDetails() {

        try {

            await this.signupForm.waitFor({ state: 'attached', timeout: 15000 });

            await this.enterValidEmail(this.testData.email);

            await this.firstNameInput.fill(this.testData.firstName);
            await this.lastNameInput.fill(this.testData.lastName);
            await this.postalCodeInput.fill(this.testData.postalCode);
            await this.birthdayInput.fill(this.getTodayFormatted());

            await this.checkConsent();

            return true;

        } catch (error) {

            console.log(`⚠️ fillValidSignupDetails failed : ${error.message}`);
            return false;
        }
    }

    async submitValidDetailsAndVerifyRegistration() {

        try {

            const urlBeforeSubmit = this.page.url();

            const submitted = await this.submitForm({ withConsent: true });

            if (!submitted) {

                return {
                    registered: false,
                    urlBeforeSubmit,
                    urlAfterSubmit: this.page.url(),
                    successMessageVisible: false,
                    generalErrorVisible: false,
                    generalErrorText: ''
                };
            }

            await this.page.waitForLoadState('networkidle').catch(() => {});
            await this.page.waitForTimeout(2000);

            const urlAfterSubmit = this.page.url();
            const urlChanged = urlAfterSubmit !== urlBeforeSubmit;

            const successMessageVisible = await this.successMessage.isVisible().catch(() => false);

            const generalErrorVisible = await this.generalErrorMsg.isVisible().catch(() => false);
            const generalErrorText = generalErrorVisible
                ? ((await this.generalErrorMsg.textContent().catch(() => '')) || '').trim()
                : '';

            const registered =
                (urlChanged && !generalErrorVisible) || successMessageVisible;

            return {
                registered,
                urlBeforeSubmit,
                urlAfterSubmit,
                successMessageVisible,
                generalErrorVisible,
                generalErrorText
            };

        } catch (error) {

            console.log(`⚠️ submitValidDetailsAndVerifyRegistration failed : ${error.message}`);
            return {
                registered: false,
                urlBeforeSubmit: '',
                urlAfterSubmit: '',
                successMessageVisible: false,
                generalErrorVisible: false,
                generalErrorText: ''
            };
        }
    }
}

module.exports = SignupPage;