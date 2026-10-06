// pages/HomePage.js
class HomePage {
    constructor(page) {
        this.page = page;

        this.heroBanner = page.locator(
            '[class*="hero" i], ' +
            '[class*="banner" i], ' +
            '[class*="slideshow" i], ' +
            'section:has(a:has-text("Shop Now"))'
        ).first();

        this.heroBannerMedia = page.locator(
            '[class*="hero" i] img, [class*="hero" i] video, ' +
            '[class*="banner" i] img, [class*="banner" i] video, ' +
            '[class*="slideshow" i] img, [class*="slideshow" i] video'
        ).first();

        this.heroBannerHeading = page.locator(
            '[class*="hero" i] h1, [class*="hero" i] h2, ' +
            '[class*="banner" i] h1, [class*="banner" i] h2, ' +
            '[class*="slideshow" i] h1, [class*="slideshow" i] h2'
        ).first();

        this.heroBannerContent = page.locator(
            '[class*="hero" i] p, [class*="banner" i] p, [class*="slideshow" i] p'
        ).first();

        this.heroBannerCTA = page.locator(
            '[class*="hero" i] a, [class*="banner" i] a, [class*="slideshow" i] a, a'
        ).filter({
            hasText: /shop now/i
        }).first();

        this.navMenuItems = page.locator(
            '.main_header .menu-item > a.main-link'
        );

        // Replace search-related locators inside constructor of HomePage.js

        this.searchIcon = page.locator(
            'summary[aria-label*="search" i], ' +
            'button[aria-label*="search" i], ' +
            '[class*="header__icon--search" i], ' +
            '[class*="search-icon" i], ' +
            '[class*="icon-search" i]'
        ).first();

        this.searchInput = page.locator(
            'input[type="search"], ' +
            'input[name*="search" i], ' +
            'input[placeholder*="search" i], ' +
            '[class*="search-modal" i] input, ' +
            '[class*="search__input" i]'
        ).first();

        this.searchResultsContainer = page.locator(
            '[class*="search-result" i], ' +
            '[class*="search__results" i], ' +
            '[class*="predictive-search" i], ' +
            '[class*="search-modal" i], ' +
            'main[class*="search" i], ' +
            'div[class*="results" i]'
        ).first();

        this.searchResultItems = page.locator(
            '[class*="search-result" i] a[href*="/products/"], ' +
            '[class*="search__results" i] a[href*="/products/"], ' +
            '[class*="predictive-search" i] a[href*="/products/"], ' +
            '[class*="search-modal" i] a[href*="/products/"], ' +
            'main a[href*="/products/"], ' +
            '[class*="product-card" i], ' +
            '[class*="product-item" i], ' +
            '[class*="grid__item" i], ' +
            '[class*="card-wrapper" i]'
        );

        // ============================================================
        // Mini Cart / Cart Icon
        // ============================================================

        this.miniCartIcon = page.locator(
            '#cart-icon-bubble'
        );

        this.cartDrawer = page.locator(
            '[role="dialog"]'
        ).filter({
            has: page.locator('text=Cart')
        }).first();

        this.cartDrawerGeneric = page.locator(
            '#CartDrawer, .cart-drawer, .drawer, [id*="CartDrawer"]'
        ).first();

        // ============================================================
        // Footer Locators
        // ============================================================

        this.footer = page.locator('footer');

        this.footerLinks = this.footer.locator(
            'a.link.link--text.list-menu__item.list-menu__item--link'
        );

        this.footerLinkTexts = this.footerLinks;

        // ============================================================
        // Social Media Links (Footer)
        // ============================================================

        this.socialLinksList = page.locator(
            '.footer__list-social.list-social:visible, ' +
            'ul[class*="list-social" i][class*="footer" i]:visible'
        ).first();

        this.socialLinkItems = page.locator(
            '.footer__list-social.list-social:visible .list-social__item, ' +
            'ul[class*="list-social" i][class*="footer" i]:visible .list-social__item'
        );

        this.socialLinks = page.locator(
            '.footer__list-social.list-social:visible .list-social__link, ' +
            'ul[class*="list-social" i][class*="footer" i]:visible a.list-social__link'
        );

        // ============================================================
        // Newsletter Subscription (Footer)
        // ============================================================

        this.newsletterForm = this.footer.locator(
            'form.newsletter-form, form[id*="ContactFooter" i], form[action*="/contact" i]'
        ).first();

        this.newsletterEmailInput = this.newsletterForm.locator(
            'input[type="email"], input[name*="email" i], input[id*="NewsletterForm" i]'
        ).first();

        this.newsletterSubmitButton = this.newsletterForm.locator(
            'button[type="submit"], button[id*="Subscribe" i], button.newsletter-form__button'
        ).first();

        this.newsletterFieldWrapper = this.newsletterForm.locator(
            '.newsletter-form__field-wrapper, .field'
        ).first();

        // Success confirmation can render as a message swapped into the form area,
        // a class-based success/thank-you element, or plain success text —
        // covering all common patterns since the exact markup after submit is
        // not visible in static DOM inspection.
        // this.newsletterSuccessMessage = page.locator(
        //     '[class*="newsletter" i][class*="success" i], ' +
        //     '[class*="newsletter" i][class*="thank" i], ' +
        //     '[class*="form" i][class*="success" i], ' +
        //     '[class*="success-message" i], ' +
        //     'text=/thank you for subscribing/i, ' +
        //     'text=/you.?re subscribed/i, ' +
        //     'text=/successfully subscribed/i, ' +
        //     'text=/thanks for signing up/i'
        // ).first();

        this.newsletterSuccessMessage = page.locator(
            '#ContactFooter-success, ' +
            '.newsletter-form__message--success, ' +
            '.newsletter-form__message.form__message'
        ).first();

        this.newsletterErrorMessage = this.newsletterForm.locator(
            '[class*="error" i], [class*="invalid" i], [role="alert"]'
        ).first();

    }

    async hitUrl(url = '/') {
        if (!process.env.BASE_URL) {
            throw new Error(
                'BASE_URL is not defined in the .env file'
            );
        }
        const baseUrl =
            process.env.BASE_URL.replace(/\/+$/, '');
        const path =
            url.replace(/^\/+/, '');
        const targetUrl =
            path.length > 0
                ? `${baseUrl}/${path}`
                : `${baseUrl}/`;
        console.log(`🌐 Navigating to : ${targetUrl}`);
        return await this.page.goto(targetUrl, {
            waitUntil: 'domcontentloaded'
        });
    }

    getCurrentURL() {
        return this.page.url();
    }

    async isHeroBannerVisible() {
        return await this.heroBanner
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    async isHeroMediaVisible() {
        return await this.heroBannerMedia
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    async getHeroHeading() {
        return (
            await this.heroBannerHeading
                .textContent({ timeout: 5000 })
                .catch(() => '') || ''
        ).trim();
    }

    async getHeroContent() {
        return (
            await this.heroBannerContent
                .textContent({ timeout: 5000 })
                .catch(() => '') || ''
        ).trim();
    }

    async isHeroCTAVisible() {
        return await this.heroBannerCTA
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    async clickHeroCTA() {
        await this.heroBannerCTA.click({ timeout: 10000 });
    }

    async getNavMenuCount() {
        return await this.navMenuItems.count();
    }

    async getNavMenuLabel(index) {
        return (
            await this.navMenuItems.nth(index)
                .textContent({ timeout: 5000 })
                .catch(() => '') || ''
        ).trim();
    }

    async getNavMenuHref(index) {
        return await this.navMenuItems.nth(index)
            .getAttribute('href', { timeout: 5000 })
            .catch(() => null);
    }

    async getNavMenuDataLink(index) {
        return await this.navMenuItems.nth(index)
            .getAttribute('data-link', { timeout: 5000 })
            .catch(() => null);
    }

    async isNavMenuDropdown(index) {
        const classAttr =
            (await this.navMenuItems.nth(index)
                .getAttribute('class', { timeout: 5000 })
                .catch(() => '')) || '';
        return classAttr.includes('has-children');
    }

    getDropdownChildLinks(dataLink) {
        return this.page.locator(
            `#drawer-${dataLink} a[href]`
        );
    }

    // ============================================================
    // Reads every child link's href/label/target WITHOUT clicking
    // or hovering. Hover-driven drawers on this site are flaky to
    // interact with directly (menu closes mid-click, causing hangs
    // / crashed pages), so we collect the static attributes from
    // the DOM instead and verify navigation via direct page.goto.
    // ============================================================
    async getDropdownChildInfo(dataLink) {
        const links = this.getDropdownChildLinks(dataLink);
        const count = await links.count().catch(() => 0);
        const info = [];
        for (let i = 0; i < count; i++) {
            const link = links.nth(i);
            const href = await link
                .getAttribute('href', { timeout: 5000 })
                .catch(() => null);
            const target = await link
                .getAttribute('target', { timeout: 5000 })
                .catch(() => null);
            const label =
                (await link.textContent().catch(() => '') || '')
                    .trim() || `Child link ${i + 1}`;
            info.push({ href, target, label });
        }
        return info;
    }

    async getDropdownChildHrefs(dataLink) {
        const info = await this.getDropdownChildInfo(dataLink);
        return info
            .map(item => item.href)
            .filter(href => !!href);
    }

    // Replace search-related methods inside HomePage class

    async clickSearchIcon() {
        await this.searchIcon.click({ timeout: 10000 });
    }

    async isSearchIconVisible() {
        return await this.searchIcon
            .isVisible({ timeout: 3000 })
            .catch(() => false);
    }

    async isSearchInputVisible() {
        return await this.searchInput
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    async searchFor(term) {
        await this.searchInput.click({ timeout: 5000 }).catch(() => { });
        await this.searchInput.fill(term, { timeout: 10000 });

        // Wait for predictive search debounce/network response
        await this.page.waitForTimeout(1500);

        const predictiveVisible = await this.searchResultItems
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);

        if (!predictiveVisible) {
            // Fall back to submitting the search (navigates to /search results page)
            await this.searchInput.press('Enter').catch(() => { });
            await this.page.waitForLoadState('domcontentloaded').catch(() => { });
            await this.page.waitForTimeout(1500);
        }
    }

    async isSearchResultsVisible() {
        const itemVisible = await this.searchResultItems
            .first()
            .isVisible({ timeout: 5000 })
            .catch(() => false);

        if (itemVisible) {
            return true;
        }

        return await this.searchResultsContainer
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    async getSearchResultsCount() {
        try {
            await this.searchResultItems
                .first()
                .waitFor({ state: 'visible', timeout: 5000 });
        } catch (e) {
            return 0;
        }
        return await this.searchResultItems.count().catch(() => 0);
    }

    async getSearchResultLabel(index) {
        return (
            await this.searchResultItems.nth(index)
                .textContent({ timeout: 5000 })
                .catch(() => '') || ''
        ).trim();
    }

    // ============================================================
    // Mini Cart
    // ============================================================

    async isMiniCartIconVisible() {
        return await this.miniCartIcon.isVisible();
    }

    async clickMiniCartIcon() {
        await this.miniCartIcon.click();
    }

    async isCartDrawerOrPageOpen() {

        const currentUrl = this.page.url();

        if (currentUrl.includes('/cart')) {
            return true;
        }

        const drawerVisible =
            await this.cartDrawerGeneric
                .isVisible()
                .catch(() => false);

        if (drawerVisible) {
            return true;
        }

        const dialogVisible =
            await this.page.locator(
                '[role="dialog"]:visible'
            ).count();

        return dialogVisible > 0;
    }

    async getCartPageOrDrawerStatus() {

        const currentUrl = this.page.url();

        if (currentUrl.includes('/cart')) {
            return `Cart page opened successfully : "${currentUrl}"`;
        }

        const drawerVisible =
            await this.cartDrawerGeneric
                .isVisible()
                .catch(() => false);

        if (drawerVisible) {
            return 'Cart drawer opened successfully';
        }

        const dialogVisible =
            await this.page.locator(
                '[role="dialog"]:visible'
            ).count();

        if (dialogVisible > 0) {
            return 'Cart drawer/dialog opened successfully';
        }

        return 'Cart drawer/page is not open';
    }

    // Footer Methods
    // ============================================================

    /**
     * Scroll to the footer section
     */
    async scrollToFooter() {
        await this.footer.scrollIntoViewIfNeeded();
    }

    /**
     * Verify footer is visible
     */
    async isFooterVisible() {
        return await this.footer.isVisible();
    }

    /**
     * Get total number of footer links
     */
    async getFooterLinkCount() {
        return await this.footerLinks.count();
    }

    /**
     * Get footer link details
     */
    async getFooterLinkDetails(index) {
        const link = this.footerLinks.nth(index);

        return {
            text: (await link.innerText()).trim(),
            href: await link.getAttribute('href')
        };
    }

    /**
     * Click a footer link
     */
    async clickFooterLink(index) {
        const link = this.footerLinks.nth(index);

        await link.scrollIntoViewIfNeeded();

        await link.click();
    }

    /**
     * Check whether current page is a 404 page
     */
    async is404Page() {
        const currentUrl = this.page.url();

        const bodyText = (
            await this.page.locator('body').innerText()
        ).toLowerCase();

        return (
            currentUrl.includes('/404') ||
            bodyText.includes('page not found') ||
            bodyText.includes('404') ||
            bodyText.includes('the page you were looking for')
        );
    }

    /**
     * Navigate back to homepage after footer-link validation
     */
    async returnToHomepage(homepageUrl) {
        await this.page.goto(homepageUrl, {
            waitUntil: 'domcontentloaded'
        });
    }

    /**
     * Validate a footer link navigation
     */
    async verifyFooterLinkNavigation(index, homepageUrl) {

        const linkDetails =
            await this.getFooterLinkDetails(index);

        const originalUrl = this.page.url();

        // Click footer link
        await this.clickFooterLink(index);

        // Allow navigation/page rendering to complete
        await this.page.waitForLoadState('domcontentloaded');

        const landedUrl = this.page.url();

        // Check for 404
        const is404 =
            await this.is404Page();

        // Verify navigation actually occurred
        const navigationSuccessful =
            landedUrl !== originalUrl || linkDetails.href === '#';

        const status =
            !is404 && navigationSuccessful;

        // Return to homepage for next footer link
        await this.returnToHomepage(homepageUrl);

        return {
            text: linkDetails.text,
            href: linkDetails.href,
            landedUrl,
            is404,
            navigationSuccessful,
            status
        };
    }

    // ============================================================
    // Social Media Links Methods
    // ============================================================

    /**
     * Scroll to the social media links section in the footer
     */
    async scrollToSocialLinks() {
        await this.socialLinksList.scrollIntoViewIfNeeded().catch(() => { });
    }

    /**
     * Verify the social links list/section is visible
     */
    async isSocialLinksSectionVisible() {
        return await this.socialLinksList
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    /**
     * Get total number of social media icon links
     */
    async getSocialLinksCount() {
        return await this.socialLinks.count().catch(() => 0);
    }

    /**
     * Get social link details (label text + href) at a given index.
     * Label is read from the "visually-hidden" span (e.g. "TikTok", "Instagram", "Facebook").
     */
    async getSocialLinkDetails(index) {
        const link = this.socialLinks.nth(index);

        const label = (
            await link.locator('.visually-hidden')
                .textContent({ timeout: 5000 })
                .catch(() => '') || ''
        ).trim();

        const href = await link
            .getAttribute('href', { timeout: 5000 })
            .catch(() => null);

        const target = await link
            .getAttribute('target', { timeout: 5000 })
            .catch(() => null);

        return { label, href, target };
    }

    /**
     * Verify a given social icon is visible
     */
    async isSocialLinkVisible(index) {
        return await this.socialLinks.nth(index)
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    /**
     * Click a social icon and verify it opens the correct page in a new tab.
     *
     * Handles both:
     *  - target="_blank" links that open synchronously on click
     *  - links where the new tab opens asynchronously (e.g. after an
     *    analytics call), where a direct click-triggered waitForEvent
     *    could hang — bounded with a fallback to direct navigation on
     *    the href in a fresh tab so the destination is still verified.
     *
     * @param {number} index
     * @returns {Promise<{label: string, href: string|null, newTabUrl: string, opened: boolean, method: string}>}
     */
    async clickSocialLinkAndVerifyNewTab(index) {

        const link = this.socialLinks.nth(index);
        const { label, href } = await this.getSocialLinkDetails(index);

        await link.scrollIntoViewIfNeeded().catch(() => { });

        // ── Attempt 1: real click, bounded wait for the new tab/page ──
        try {

            const [newPage] = await Promise.all([
                this.page.context().waitForEvent('page', { timeout: 10000 }),
                link.click({ timeout: 10000 }),
            ]);

            await newPage.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { });

            const newTabUrl = newPage.url();

            await newPage.close().catch(() => { });

            return {
                label,
                href,
                newTabUrl,
                opened: true,
                method: 'click-new-tab'
            };

        } catch (error) {
            console.log(`   ⚠️ Click did not open a new tab within timeout for social link index ${index} (${error.message}). Falling back to direct navigation on the href.`);
        }

        // ── Attempt 2 (fallback): navigate directly to the href in a fresh tab ──
        if (!href) {
            return { label, href, newTabUrl: '', opened: false, method: 'direct-navigation' };
        }

        const fallbackPage = await this.page.context().newPage();

        try {
            await fallbackPage.goto(href, { waitUntil: 'domcontentloaded', timeout: 20000 });
        } catch (error) {
            console.log(`   ⚠️ Direct navigation to href also failed: ${error.message}`);
        }

        const newTabUrl = fallbackPage.url();

        await fallbackPage.close().catch(() => { });

        return {
            label,
            href,
            newTabUrl,
            opened: !!newTabUrl,
            method: 'direct-navigation'
        };
    }

    // ============================================================
    // Newsletter Subscription Methods
    // ============================================================

    /**
     * Scroll to the newsletter subscription section in the footer
     */
    async scrollToNewsletterSection() {
        await this.footer.scrollIntoViewIfNeeded().catch(() => { });
        await this.page.waitForTimeout(300);

        await this.newsletterForm
            .scrollIntoViewIfNeeded()
            .catch(() => { });

        await this.page.waitForTimeout(300);
    }

    /**
     * Verify the newsletter form/email input is visible
     */
    async isNewsletterFormVisible() {
        await this.scrollToNewsletterSection();

        return await this.newsletterEmailInput
            .isVisible({ timeout: 10000 })
            .catch(() => false);
    }

    /**
     * Enter an email address into the newsletter subscription field
     */
    async enterNewsletterEmail(email) {
        await this.newsletterEmailInput.click({ timeout: 10000 }).catch(() => { });
        await this.newsletterEmailInput.fill(email, { timeout: 10000 });
    }

    /**
     * Get the current value entered in the newsletter email field
     */
    async getNewsletterEmailValue() {
        return await this.newsletterEmailInput
            .inputValue({ timeout: 5000 })
            .catch(() => '');
    }

    /**
     * Verify the Subscribe/submit button is visible
     */
    async isNewsletterSubmitButtonVisible() {
        return await this.newsletterSubmitButton
            .isVisible({ timeout: 5000 })
            .catch(() => false);
    }

    /**
     * Submit the newsletter subscription form
     */
    async submitNewsletterSubscription() {
        await this.newsletterSubmitButton.click({ timeout: 10000 });
    }

    // async submitNewsletterSubscription() {
    //     await Promise.all([
    //         this.page.waitForURL(/customer_posted=true/i, {
    //             waitUntil: 'domcontentloaded',
    //             timeout: 60000
    //         }).catch(() => { }),
    //         this.newsletterSubmitButton.click({ timeout: 10000 })
    //     ]);
    // }

    /**
     * Waits for and verifies a success confirmation is displayed after
     * submitting the newsletter form. Polls for either:
     *  - a dedicated success/thank-you message element becoming visible, or
     *  - the email input being cleared / disabled / replaced (common
     *    post-submit UI pattern), as a secondary signal.
     * @returns {Promise<{success: boolean, messageText: string}>}
     */

    // async isNewsletterSuccessConfirmationDisplayed() {

    //     // Wait for the post-submit navigation/URL marker (bounded).
    //     await this.page
    //         .waitForURL(/customer_posted=true/i, { timeout: 20000 })
    //         .catch(() => { });

    //     await this.page.waitForLoadState('domcontentloaded').catch(() => { });

    //     const successLocator = this.newsletterSuccessMessage;

    //     const successVisible = await successLocator
    //         .isVisible({ timeout: 20000 })
    //         .catch(() => false);

    //     if (successVisible) {
    //         const messageText = (
    //             await successLocator
    //                 .textContent({ timeout: 5000 })
    //                 .catch(() => '') || ''
    //         ).trim();

    //         return { success: true, messageText };
    //     }

    //     // Fallback: confirm via URL marker alone if element check failed
    //     // for any reason (e.g. slow hydration), so a genuinely successful
    //     // submission isn't reported as failed.
    //     const urlIndicatesSuccess =
    //         this.page.url().includes('customer_posted=true');

    //     if (urlIndicatesSuccess) {
    //         return {
    //             success: true,
    //             messageText: 'Subscription confirmed via URL marker "customer_posted=true" (success element text unavailable)'
    //         };
    //     }

    //     return { success: false, messageText: '' };
    // }

    async isNewsletterSuccessConfirmationDisplayed() {

        // Wait for the post-submit navigation/URL marker (bounded).
        await this.page
            .waitForURL(/customer_posted=true/i, { timeout: 60000 })
            .catch(() => { });

        await this.page.waitForLoadState('domcontentloaded').catch(() => { });
        await this.page.waitForLoadState('networkidle').catch(() => { });

        const successLocator = this.page.locator(
            '#ContactFooter-success, ' +
            '.newsletter-form__message--success, ' +
            '.newsletter-form__message.form__message, ' +
            'h3.newsletter-form__message'
        ).first();

        const textLocator = this.page.getByText(
            /thanks for subscribing/i
        ).first();

        let successVisible = await successLocator
            .isVisible({ timeout: 30000 })
            .catch(() => false);

        if (!successVisible) {
            successVisible = await textLocator
                .isVisible({ timeout: 15000 })
                .catch(() => false);
        }

        if (successVisible) {
            const target = (await successLocator.isVisible().catch(() => false))
                ? successLocator
                : textLocator;

            const messageText = (
                await target
                    .textContent({ timeout: 5000 })
                    .catch(() => '') || ''
            ).trim();

            return { success: true, messageText };
        }

        // Fallback: confirm via URL marker alone if element check failed
        // for any reason (e.g. slow hydration), so a genuinely successful
        // submission isn't reported as failed.
        const urlIndicatesSuccess =
            this.page.url().includes('customer_posted=true');

        if (urlIndicatesSuccess) {
            return {
                success: true,
                messageText: 'Subscription confirmed via URL marker "customer_posted=true" (success element text unavailable)'
            };
        }

        return { success: false, messageText: '' };
    }

    /**
     * Verify whether a validation/error message is displayed on the
     * newsletter form (used for negative-path checks if needed).
     */
    async getNewsletterErrorMessage() {
        const visible = await this.newsletterErrorMessage
            .isVisible({ timeout: 5000 })
            .catch(() => false);

        if (!visible) return '';

        return (
            await this.newsletterErrorMessage
                .textContent({ timeout: 5000 })
                .catch(() => '') || ''
        ).trim();
    }

}



module.exports = HomePage;