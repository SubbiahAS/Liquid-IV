// ==============================
// pages/ProductPage.js
// ==============================

class ProductPage {

    constructor(page) {

        this.page = page;

        // ---------------- Core Product Locators ----------------
        this.productTitle = page.locator('.product__title, h1.product-title').first();
        this.productPrice = page.locator('.price__container .price-item--regular, .product__price .price-item, .price').first();
        this.productDescription = page.locator('.product__short-text, .product__description, .metafield-multi_line_text_field').first();

        // ---------------- Media / Thumbnail Locators ----------------
        // Main gallery slides (large images)
        this.mainSlides = page.locator("li[id^='Slide-template']");
        this.mainProductImage = page.locator('.product__media-item img:visible, .product__media img:visible').first();

        // Thumbnail rail buttons (separate slider component from the main slides)
        this.thumbnailButtons = page.locator(
            "li[id^='Slide-Thumbnails-template'] button.thumbnail, .thumbnail-list__item button.thumbnail"
        );

        // ---------------- Quantity Locators ----------------
        this.quantityWrapper = page.locator('.qty_atc_wrapper, .product-form__quantity').first();
        this.quantityInput = page.locator("input.quantity__input, input[name='quantity']").first();
        this.quantityIncreaseButton = page.locator("button[name='plus'], .quantity__button[name='plus']").first();
        this.quantityDecreaseButton = page.locator("button[name='minus'], .quantity__button[name='minus']").first();
        // this.quantityWrapper = page.locator(
        //     "form[action*='/cart/add'] .qty_atc_wrapper, form[action*='/cart/add'] .product-form__quantity"
        // ).first();
        // this.quantityInput = this.quantityWrapper.locator("input.quantity__input, input[name='quantity']").first();
        // this.quantityIncreaseButton = this.quantityWrapper.locator("button[name='plus']").first();
        // this.quantityDecreaseButton = this.quantityWrapper.locator("button[name='minus']").first();

        // ---------------- Add to Cart / Cart Drawer Locators ----------------
        this.addToCartButton = page.locator(
            "form[action*='/cart/add'] button[name='add']:not(.quick-add__submit), button.product-form__submit"
        ).first();
        this.cartNotification = page.locator('#cart-notification, .cart-notification, [class*="cart-drawer"], .cart-notification__heading').first();
        this.cartItemQuantityInput = page.locator(
            'cart-items .quantity__input, .cart-item quantity-input input, .cart-drawer .quantity__input'
        ).first();
        this.cartIconBubble = page.locator('#cart-icon-bubble, .cart-count-bubble').first();
        this.cartDrawer = page.locator('cart-drawer.active, .cart-drawer.active, [class*="cart-drawer"][class*="active"]').first();
        this.cartDrawerCloseButton = page.locator(
            "cart-drawer button[aria-label='Close'], .drawer__close, #CartDrawer-Close, cart-drawer .drawer__header button"
        ).first();
        this.cartDrawerOverlay = page.locator('#CartDrawer-Overlay, .cart-drawer__overlay, .drawer__overlay').first();

        // ---------------- Flavor Pill Locators ----------------
        this.flavorPills = page.locator('.product-pills a.pill_link:visible');

        // ---------------- Tabs Locators ----------------
        // ":visible" avoids matching duplicate hidden accordion instances
        // (mobile / tablet / desktop variants render the same tabs multiple
        // times in the DOM but only one set is visible at a time)
        this.tabHeadings = page.locator('.footer-headings-container h2.footer-block__heading:visible');
    }

    // ================================================
    // Verify PDP has loaded
    // ================================================
    async isPDPLoaded() {

        try {

            await this.productTitle.waitFor({ state: 'visible', timeout: 15000 });
            return true;

        } catch (error) {

            console.log(`⚠️ isPDPLoaded failed : ${error.message}`);
            return false;
        }
    }

    async getProductTitle() {

        try {

            return ((await this.productTitle.textContent()) || '').trim();

        } catch (error) {

            console.log(`⚠️ getProductTitle failed : ${error.message}`);
            return '';
        }
    }

    async getProductPrice() {

        try {

            return ((await this.productPrice.textContent()) || '').trim();

        } catch (error) {

            console.log(`⚠️ getProductPrice failed : ${error.message}`);
            return '';
        }
    }

    async getProductDescription() {

        try {

            return ((await this.productDescription.textContent()) || '').trim();

        } catch (error) {

            console.log(`⚠️ getProductDescription failed : ${error.message}`);
            return '';
        }
    }

    // ================================================
    // Verify title, price, description & images are all
    // displayed together on the PDP
    // ================================================
    async verifyProductDetailsDisplayed() {

        try {

            const title = await this.getProductTitle();
            const price = await this.getProductPrice();
            const description = await this.getProductDescription();
            const mainImageVisible = await this.mainProductImage.isVisible().catch(() => false);

            const allDisplayed =
                title.length > 0 &&
                price.length > 0 &&
                description.length > 0 &&
                mainImageVisible;

            return { allDisplayed, title, price, description, mainImageVisible };

        } catch (error) {

            console.log(`⚠️ verifyProductDetailsDisplayed failed : ${error.message}`);
            return { allDisplayed: false, title: '', price: '', description: '', mainImageVisible: false };
        }
    }

    // ================================================
    // Media / Thumbnail Handling
    // ================================================
    async getThumbnailsCount() {

        try {

            return await this.thumbnailButtons.count();

        } catch (error) {

            console.log(`⚠️ getThumbnailsCount failed : ${error.message}`);
            return 0;
        }
    }

    async getMainImageSrc() {

        try {

            await this.mainProductImage.waitFor({ state: 'visible', timeout: 10000 });
            return (await this.mainProductImage.getAttribute('src')) || '';

        } catch (error) {

            console.log(`⚠️ getMainImageSrc failed : ${error.message}`);
            return '';
        }
    }

    async clickThumbnail(index = 0) {

        try {

            const thumbnail = this.thumbnailButtons.nth(index);

            await thumbnail.waitFor({ state: 'attached', timeout: 10000 });
            await thumbnail.scrollIntoViewIfNeeded({ timeout: 10000 });
            await thumbnail.click({ timeout: 10000, force: true });

            return true;

        } catch (error) {

            console.log(`⚠️ clickThumbnail failed : ${error.message}`);
            return false;
        }
    }

    // ================================================
    // Click a thumbnail and verify the main image src
    // changes accordingly
    // ================================================
    async verifyMainImageChangesOnThumbnailClick(index = 1) {

        try {

            const totalThumbnails = await this.getThumbnailsCount();

            if (totalThumbnails <= 1) {
                return { changed: false, srcBefore: '', srcAfter: '', skipped: true };
            }

            const safeIndex = index < totalThumbnails ? index : totalThumbnails - 1;

            const srcBefore = await this.getMainImageSrc();

            const clicked = await this.clickThumbnail(safeIndex);

            if (!clicked) {
                return { changed: false, srcBefore, srcAfter: '', skipped: false };
            }

            await this.page.waitForTimeout(1000);

            const srcAfter = await this.getMainImageSrc();

            const changed = srcAfter.length > 0 && srcAfter !== srcBefore;

            return { changed, srcBefore, srcAfter, skipped: false };

        } catch (error) {

            console.log(`⚠️ verifyMainImageChangesOnThumbnailClick failed : ${error.message}`);
            return { changed: false, srcBefore: '', srcAfter: '', skipped: false };
        }
    }

    // ================================================
    // Quantity Handling
    // ================================================
    async getQuantityValue() {

        try {

            await this.quantityInput.waitFor({ state: 'visible', timeout: 10000 });
            const value = await this.quantityInput.inputValue();

            return parseInt(value, 10) || 0;

        } catch (error) {

            console.log(`⚠️ getQuantityValue failed : ${error.message}`);
            return 0;
        }
    }

    async increaseQuantity(times = 1) {

        try {

            for (let i = 0; i < times; i++) {

                await this.quantityIncreaseButton.click({ timeout: 10000 });
                await this.page.waitForTimeout(300);
            }

            return true;

        } catch (error) {

            console.log(`⚠️ increaseQuantity failed : ${error.message}`);
            return false;
        }
    }

    async decreaseQuantity(times = 1) {

        try {

            for (let i = 0; i < times; i++) {

                await this.quantityDecreaseButton.click({ timeout: 10000 });
                await this.page.waitForTimeout(300);
            }

            return true;

        } catch (error) {

            console.log(`⚠️ decreaseQuantity failed : ${error.message}`);
            return false;
        }
    }

    async setQuantity(value) {

        try {

            await this.closeCartDrawer();

            await this.quantityInput.waitFor({ state: 'visible', timeout: 10000 });
            await this.quantityInput.fill(String(value), { timeout: 10000 });
            await this.quantityInput.press('Tab');

            return true;

        } catch (error) {

            console.log(`⚠️ setQuantity failed : ${error.message}`);
            return false;
        }
    }

    // async setQuantity(value) {

    //     try {

    //         await this.closeCartDrawer();
    //         await this.quantityWrapper.waitFor({ state: 'visible', timeout: 10000 });

    //         await this.quantityInput.waitFor({ state: 'visible', timeout: 10000 });
    //         await this.quantityInput.fill(String(value), { timeout: 10000 });
    //         await this.quantityInput.press('Tab');

    //         return true;

    //     } catch (error) {

    //         console.log(`⚠️ setQuantity failed : ${error.message}`);
    //         return false;
    //     }
    // }

    // ================================================
    // Add to Cart
    // ================================================
    async clickAddToCart() {

        try {

            await this.addToCartButton.waitFor({ state: 'visible', timeout: 15000 });
            await this.addToCartButton.scrollIntoViewIfNeeded({ timeout: 10000 });
            await this.addToCartButton.click({ timeout: 10000 });

            return true;

        } catch (error) {

            console.log(`⚠️ clickAddToCart failed : ${error.message}`);
            return false;
        }
    }

    async isAddedToCartConfirmed() {

        try {

            await this.cartNotification.waitFor({ state: 'visible', timeout: 10000 });
            return true;

        } catch (error) {

            console.log(`⚠️ isAddedToCartConfirmed failed : ${error.message}`);
            return false;
        }
    }

    // ================================================
    // Read the quantity reflected inside the cart
    // drawer/notification for the last added item
    // ================================================
    async getCartReflectedQuantity() {

        try {

            await this.cartItemQuantityInput.waitFor({ state: 'visible', timeout: 10000 });
            const value = await this.cartItemQuantityInput.inputValue();

            return parseInt(value, 10) || 0;

        } catch (error) {

            console.log(`⚠️ getCartReflectedQuantity failed : ${error.message}`);
            return 0;
        }
    }

    async getCartIconCount() {

        try {

            const text = ((await this.cartIconBubble.textContent().catch(() => '')) || '').trim();
            return parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;

        } catch (error) {

            console.log(`⚠️ getCartIconCount failed : ${error.message}`);
            return 0;
        }
    }

    // ================================================
    // Close the cart drawer/notification if it is open
    // so it does not intercept subsequent clicks on the
    // underlying PDP (flavor pills, tabs, quantity, etc.)
    // ================================================
    async closeCartDrawer() {

        try {

            const isOpen = await this.cartNotification.isVisible().catch(() => false);

            if (!isOpen) {
                return true;
            }

            const closeBtnVisible = await this.cartDrawerCloseButton.isVisible().catch(() => false);

            if (closeBtnVisible) {

                await this.cartDrawerCloseButton.click({ timeout: 5000 }).catch(() => { });

            } else {

                await this.page.keyboard.press('Escape').catch(() => { });
            }

            await this.page.waitForTimeout(500);

            const stillOpen = await this.cartNotification.isVisible().catch(() => false);

            if (stillOpen) {

                const overlayVisible = await this.cartDrawerOverlay.isVisible().catch(() => false);

                if (overlayVisible) {
                    await this.cartDrawerOverlay.click({ timeout: 5000, force: true }).catch(() => { });
                } else {
                    await this.page.keyboard.press('Escape').catch(() => { });
                }

                await this.page.waitForTimeout(500);
            }

            return true;

        } catch (error) {

            console.log(`⚠️ closeCartDrawer failed : ${error.message}`);
            return false;
        }
    }

    // ================================================
    // Flavor Pills Handling
    // ================================================
    async getFlavorPillsCount() {

        try {

            return await this.flavorPills.count();

        } catch (error) {

            console.log(`⚠️ getFlavorPillsCount failed : ${error.message}`);
            return 0;
        }
    }

    async getActiveFlavorName() {

        try {

            const activePill = this.flavorPills.locator('.product-pill.active .product-pill-title').first();
            return ((await activePill.textContent().catch(() => '')) || '').trim();

        } catch (error) {

            console.log(`⚠️ getActiveFlavorName failed : ${error.message}`);
            return '';
        }
    }

    async getFlavorNameAt(index) {

        try {

            const pillTitle = this.flavorPills.nth(index).locator('.product-pill-title').first();
            return ((await pillTitle.textContent().catch(() => '')) || '').trim();

        } catch (error) {

            console.log(`⚠️ getFlavorNameAt failed : ${error.message}`);
            return '';
        }
    }

    // ================================================
    // Select a flavor different from the currently
    // active one (if more than one flavor exists)
    // ================================================
    async selectDifferentFlavor() {

        try {

            await this.closeCartDrawer();

            const totalPills = await this.getFlavorPillsCount();

            if (totalPills <= 1) {
                return { switched: false, reason: 'Only one or no flavor available', flavorName: '' };
            }

            const activeName = await this.getActiveFlavorName();

            let targetIndex = -1;

            for (let i = 0; i < totalPills; i++) {

                const name = await this.getFlavorNameAt(i);

                if (name && name !== activeName) {
                    targetIndex = i;
                    break;
                }
            }

            if (targetIndex === -1) {
                return { switched: false, reason: 'No alternate flavor found', flavorName: '' };
            }

            const targetName = await this.getFlavorNameAt(targetIndex);

            await this.flavorPills.nth(targetIndex).scrollIntoViewIfNeeded({ timeout: 10000 });
            await this.flavorPills.nth(targetIndex).click({ timeout: 10000, force: true });

            await this.page.waitForLoadState('networkidle').catch(() => { });
            await this.isPDPLoaded();

            return { switched: true, reason: '', flavorName: targetName };

        } catch (error) {

            console.log(`⚠️ selectDifferentFlavor failed : ${error.message}`);
            return { switched: false, reason: error.message, flavorName: '' };
        }
    }

    // ================================================
    // Tabs Handling (Benefits / How to use / Nutrition
    // & Ingredients / Storage / Warnings)
    // ================================================
    async getTabsCount() {

        try {

            return await this.tabHeadings.count();

        } catch (error) {

            console.log(`⚠️ getTabsCount failed : ${error.message}`);
            return 0;
        }
    }

    async getTabTitle(index) {

        try {

            return ((await this.tabHeadings.nth(index).textContent().catch(() => '')) || '').trim();

        } catch (error) {

            console.log(`⚠️ getTabTitle failed : ${error.message}`);
            return '';
        }
    }

    async clickTab(index) {

        try {

            await this.closeCartDrawer();

            const tab = this.tabHeadings.nth(index);

            await tab.waitFor({ state: 'visible', timeout: 10000 });
            await tab.scrollIntoViewIfNeeded({ timeout: 10000 });
            await tab.click({ timeout: 10000, force: true });
            await this.page.waitForTimeout(500);

            return true;

        } catch (error) {

            console.log(`⚠️ clickTab failed : ${error.message}`);
            return false;
        }
    }

    // ================================================
    // Get the content text for a tab using its
    // data-tab attribute mapped to the content div id
    // ================================================
    async getTabContent(index) {

        try {

            const tab = this.tabHeadings.nth(index);
            const tabId = (await tab.getAttribute('data-tab')) || '';

            if (!tabId) {
                return '';
            }

            const contentLocator = this.page.locator(`#${tabId}`).first();
            const text = ((await contentLocator.textContent().catch(() => '')) || '').trim();

            return text;

        } catch (error) {

            console.log(`⚠️ getTabContent failed : ${error.message}`);
            return '';
        }
    }

    // ================================================
    // Click through every tab and confirm each shows
    // non-empty content
    // ================================================
    async verifyAllTabsHaveContent() {

        const results = [];

        try {

            await this.closeCartDrawer();

            const totalTabs = await this.getTabsCount();

            for (let i = 0; i < totalTabs; i++) {

                const title = await this.getTabTitle(i);
                await this.clickTab(i);

                const content = await this.getTabContent(i);

                results.push({
                    index: i,
                    title,
                    hasContent: content.length > 0
                });
            }

            const allValid = results.length > 0 && results.every(r => r.hasContent);

            return { allValid, results };

        } catch (error) {

            console.log(`⚠️ verifyAllTabsHaveContent failed : ${error.message}`);
            return { allValid: false, results };
        }
    }

    // ================================================
    // Navigate back to PLP using browser back
    // ================================================
    async goBackToPLP() {

        try {

            await this.page.goBack();
            await this.page.waitForLoadState('networkidle');

            return true;

        } catch (error) {

            console.log(`⚠️ goBackToPLP failed : ${error.message}`);
            return false;
        }
    }

}

module.exports = ProductPage;