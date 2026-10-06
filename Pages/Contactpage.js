// ==============================
// pages/ContactPage.js
// ==============================

class ContactPage {

    constructor(page) {

        this.page = page;

        // Handle unexpected browser dialogs so they never hang page.close()
        this.page.on('dialog', async (dialog) => {
            console.log(`⚠️ Unexpected dialog: ${dialog.message()}`);
            await dialog.dismiss().catch(() => { });
        });

        // Inquiry Type / Subject (cascading dropdowns)
        this.inquiryTypeDropdown = page.locator('#contactUs-inquiryType');
        this.inquirySubjDropdown = page.locator('#contactUs-inquirySubj');

        // Name
        this.firstNameInput = page.locator('#givenName');
        this.lastNameInput = page.locator('#familyName');

        // Email
        this.emailInput = page.locator('#email');
        this.emailError = page.locator('#email_Err');

        // Phone
        this.phoneInput = page.locator('input[name="phone"]');
        this.phoneError = page.locator('#phone_Err');

        // Comments
        this.commentsTextarea = page.locator('#comments');

        // Age confirmation
        this.ageConfirmationCheckbox = page.locator('#contact-legalAgeConfirmation');

        // Submit
        this.submitButton = page.locator('#submitButton');

        // "CONFIRM EMAIL" popup that appears after clicking Submit
        this.confirmEmailPopup = page.locator('div.popup-box');
        this.confirmEmailInput = page.locator('div.popup-box input[type="text"], div.popup-box input[type="email"]').first();
        this.confirmButton = page.locator('#confirmButton');

        // Success confirmation (generic - adjust selector to actual success element/text on the site)
        this.successMessage = page.locator('.form-success')
            .or(page.locator('.c-form-success'))
            .or(page.locator('[class*="success"]'))
            .or(page.locator('text=Thank you'))
            .first();
    }

    async hitUrl(path) {

        try {

            const response = await this.page.goto(path, { waitUntil: 'domcontentloaded' });

            return response;

        } catch (error) {

            console.log(`⚠️ hitUrl failed : ${error.message}`);

            return null;
        }
    }

    getCurrentURL() {

        try {

            return this.page.url();

        } catch (error) {

            console.log(`⚠️ getCurrentURL failed : ${error.message}`);

            return '';
        }
    }

    async isContactFormVisible() {

        try {

            await this.inquiryTypeDropdown.waitFor({ state: 'visible', timeout: 15000 });

            return true;

        } catch (error) {

            console.log(`⚠️ isContactFormVisible failed : ${error.message}`);

            return false;
        }
    }

    async selectFirstEnabledOption(dropdownLocator) {

        try {

            await dropdownLocator.waitFor({ state: 'visible', timeout: 15000 });

            const optionValues = await dropdownLocator.locator('option:not([disabled])').evaluateAll(
                options => options.map(option => option.value)
            );

            if (!optionValues || optionValues.length === 0) {

                return false;
            }

            await dropdownLocator.selectOption({ value: optionValues[0] });

            return true;

        } catch (error) {

            console.log(`⚠️ selectFirstEnabledOption failed : ${error.message}`);

            return false;
        }
    }

    async selectFirstInquiryType() {

        return await this.selectFirstEnabledOption(this.inquiryTypeDropdown);
    }

    async selectFirstInquirySubj() {

        return await this.selectFirstEnabledOption(this.inquirySubjDropdown);
    }

    async revealContactForm() {

        try {

            const inquiryTypeSelected = await this.selectFirstInquiryType();

            const inquirySubjSelected = await this.selectFirstInquirySubj();

            await this.emailInput.waitFor({ state: 'visible', timeout: 15000 });

            return inquiryTypeSelected && inquirySubjSelected;

        } catch (error) {

            console.log(`⚠️ revealContactForm failed : ${error.message}`);

            return false;
        }
    }

    async enterEmail(value) {

        try {

            await this.emailInput.waitFor({ state: 'visible', timeout: 15000 });

            await this.emailInput.click();

            await this.emailInput.fill('');

            if (value) {

                await this.emailInput.fill(value);
            }

            await this.emailInput.blur();

        } catch (error) {

            console.log(`⚠️ enterEmail failed : ${error.message}`);
        }
    }

    async clearEmail() {

        try {

            await this.emailInput.fill('');

        } catch (error) {

            console.log(`⚠️ clearEmail failed : ${error.message}`);
        }
    }

    async isEmailErrorVisible() {

        try {

            return await this.emailError.isVisible();

        } catch (error) {

            console.log(`⚠️ isEmailErrorVisible failed : ${error.message}`);

            return false;
        }
    }

    async getEmailErrorText() {

        try {

            return (await this.emailError.textContent() || '').trim();

        } catch (error) {

            console.log(`⚠️ getEmailErrorText failed : ${error.message}`);

            return '';
        }
    }

    async enterPhone(value) {

        try {

            await this.phoneInput.waitFor({ state: 'visible', timeout: 15000 });

            await this.phoneInput.click();

            await this.phoneInput.fill('');

            if (value) {

                await this.phoneInput.fill(value);
            }

            await this.phoneInput.blur();

        } catch (error) {

            console.log(`⚠️ enterPhone failed : ${error.message}`);
        }
    }

    async clearPhone() {

        try {

            await this.phoneInput.fill('');

        } catch (error) {

            console.log(`⚠️ clearPhone failed : ${error.message}`);
        }
    }

    async isPhoneErrorVisible() {

        try {

            return await this.phoneError.isVisible();

        } catch (error) {

            console.log(`⚠️ isPhoneErrorVisible failed : ${error.message}`);

            return false;
        }
    }

    async getPhoneErrorText() {

        try {

            return (await this.phoneError.textContent() || '').trim();

        } catch (error) {

            console.log(`⚠️ getPhoneErrorText failed : ${error.message}`);

            return '';
        }
    }

    async selectInquiryType(value) {

        try {

            await this.inquiryTypeDropdown.waitFor({ state: 'visible', timeout: 15000 });

            await this.inquiryTypeDropdown.selectOption({ value });

        } catch (error) {

            console.log(`⚠️ selectInquiryType failed for "${value}" : ${error.message}`);
        }
    }

    async getSelectedInquiryType() {

        try {

            return await this.inquiryTypeDropdown.inputValue();

        } catch (error) {

            console.log(`⚠️ getSelectedInquiryType failed : ${error.message}`);

            return '';
        }
    }

    async enterFirstName(value) {

        try {

            await this.firstNameInput.waitFor({ state: 'visible', timeout: 15000 });

            await this.firstNameInput.fill(value);

        } catch (error) {

            console.log(`⚠️ enterFirstName failed : ${error.message}`);
        }
    }

    async enterLastName(value) {

        try {

            await this.lastNameInput.waitFor({ state: 'visible', timeout: 15000 });

            await this.lastNameInput.fill(value);

        } catch (error) {

            console.log(`⚠️ enterLastName failed : ${error.message}`);
        }
    }

    async enterComments(value) {

        try {

            await this.commentsTextarea.waitFor({ state: 'visible', timeout: 15000 });

            await this.commentsTextarea.fill('');

            await this.commentsTextarea.fill(value);

        } catch (error) {

            console.log(`⚠️ enterComments failed : ${error.message}`);
        }
    }

    async getCommentsValue() {

        try {

            return await this.commentsTextarea.inputValue();

        } catch (error) {

            console.log(`⚠️ getCommentsValue failed : ${error.message}`);

            return '';
        }
    }

    async getCommentsMaxLength() {

        try {

            return await this.commentsTextarea.getAttribute('maxlength');

        } catch (error) {

            console.log(`⚠️ getCommentsMaxLength failed : ${error.message}`);

            return null;
        }
    }

    async checkAgeConfirmation() {

        try {

            await this.ageConfirmationCheckbox.waitFor({ state: 'visible', timeout: 15000 });

            if (!(await this.ageConfirmationCheckbox.isChecked())) {

                await this.ageConfirmationCheckbox.check({ force: true });
            }

        } catch (error) {

            console.log(`⚠️ checkAgeConfirmation failed : ${error.message}`);
        }
    }

    async clickSubmit() {

        try {

            await this.submitButton.waitFor({ state: 'visible', timeout: 15000 });

            await this.submitButton.click();

        } catch (error) {

            console.log(`⚠️ clickSubmit failed : ${error.message}`);
        }
    }

    async confirmEmailIfPromptVisible() {

        try {

            const isPopupVisible = await this.confirmEmailPopup.isVisible({ timeout: 10000 }).catch(() => false);

            if (!isPopupVisible) {

                return false;
            }

            await this.confirmButton.waitFor({ state: 'visible', timeout: 10000 });

            await this.confirmButton.click();

            await this.confirmEmailPopup.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => { });

            return true;

        } catch (error) {

            console.log(`⚠️ confirmEmailIfPromptVisible failed : ${error.message}`);

            return false;
        }
    }

    async isSuccessMessageVisible() {

        try {

            // The "CONFIRM EMAIL" popup shows up right after Submit and
            // must be confirmed before the success message renders.
            await this.confirmEmailIfPromptVisible();

            // Success confirmation on this site renders ~15-20s after
            // the email is confirmed, so wait up to 25s.
            await this.successMessage.waitFor({ state: 'visible', timeout: 25000 });

            return await this.successMessage.isVisible();

        } catch (error) {

            console.log(`⚠️ isSuccessMessageVisible failed : ${error.message}`);

            return false;
        }
    }

    async getSuccessMessageText() {

        try {

            return (await this.successMessage.textContent() || '').trim();

        } catch (error) {

            console.log(`⚠️ getSuccessMessageText failed : ${error.message}`);

            return '';
        }
    }

    async reloadPage() {

        try {

            return await this.page.reload({ waitUntil: 'domcontentloaded' });

        } catch (error) {

            console.log(`⚠️ reloadPage failed : ${error.message}`);

            return null;
        }
    }

    async isFormResetAfterReload() {

        try {

            const emailValue = await this.emailInput.inputValue().catch(() => '');
            const firstNameValue = await this.firstNameInput.inputValue().catch(() => '');
            const successVisible = await this.successMessage.isVisible().catch(() => false);

            return emailValue === '' && firstNameValue === '' && successVisible === false;

        } catch (error) {

            console.log(`⚠️ isFormResetAfterReload failed : ${error.message}`);

            return false;
        }
    }
}

module.exports = ContactPage;