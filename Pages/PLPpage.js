// ==============================
// pages/PLPPage.js
// ==============================

class PLPPage {

    constructor(page) {

        this.page = page;

        // ---------------- Navigation Locators ----------------
        this.productsMenu = page.locator("a[data-link='products']");
        this.shopAllLink = page.locator("li[data-link='shop-all'] a");

        // ---------------- PLP Grid Locators ----------------
        this.productGrid = page.locator('#product-grid');
        this.productCards = page.locator('#product-grid li.grid__item');
    }

    // ================================================
    // Navigate to the site's home page using BASE_URL
    // ================================================
    async hitUrl(path = '/') {

        const baseUrl = process.env.BASE_URL || 'https://www.liquid-iv.ca/';

        const url = new URL(path, baseUrl).toString();

        return await this.page.goto(url);
    }

    // ================================================
    // Navigate to PLP via Home -> Products -> Shop All
    // ================================================
    async navigateToPLP() {

        try {

            await this.hitUrl('/');
            await this.page.waitForLoadState('networkidle');

            await this.productsMenu.waitFor({ state: 'visible', timeout: 10000 });
            await this.productsMenu.click();
            await this.shopAllLink.waitFor({ state: 'visible', timeout: 10000 });
            await this.shopAllLink.click();

            await this.page.waitForLoadState('networkidle');

            return true;

        } catch (error) {

            console.log(`⚠️ navigateToPLP failed : ${error.message}`);
            return false;
        }
    }

    // ================================================
    // Verify PLP has loaded with product cards
    // ================================================
    async isPLPLoaded() {

        try {

            await this.productGrid.waitFor({ state: 'visible', timeout: 15000 });

            const cardCount = await this.productCards.count();

            return cardCount > 0;

        } catch (error) {

            console.log(`⚠️ isPLPLoaded failed : ${error.message}`);
            return false;
        }
    }

    async getProductCardsCount() {

        try {

            return await this.productCards.count();

        } catch (error) {

            console.log(`⚠️ getProductCardsCount failed : ${error.message}`);
            return 0;
        }
    }

    // ================================================
    // Get a single card's scoped locators
    // ================================================
    getCard(index) {

        const card = this.productCards.nth(index);

        return {
            card,
            link: card.locator('a.product-card-link'),
            image: card.locator('.card__media img'),
            title: card.locator('.card__heading, .card__information a, .card__content a').first(),
            price: card.locator('.price-item--regular, .card__price .price-item, .price').first(),
            cta: card.locator('a.product-card-link, button, .quick-add__submit').first()
        };
    }

    // ================================================
    // Get a card's title (heading text, falls back to
    // the product link's aria-label since the anchor
    // itself only wraps the media and has no text)
    // ================================================
    async getCardTitle(index = 0) {

        try {

            const { card, link } = this.getCard(index);

            const headingLocator = card.locator('.card__heading, h3, .card__information a').first();

            let text = ((await headingLocator.textContent().catch(() => '')) || '').trim();

            if (!text) {

                const ariaLabel = (await link.first().getAttribute('aria-label').catch(() => '')) || '';
                text = ariaLabel.replace(/^Shop\s+/i, '').trim();
            }

            return text;

        } catch (error) {

            console.log(`⚠️ getCardTitle failed : ${error.message}`);
            return '';
        }
    }

    // ================================================
    // Verify each card has image, title, price and CTA
    // ================================================
    async verifyAllCardsHaveRequiredElements(sampleSize = 4) {

        const results = [];

        const totalCards = await this.getProductCardsCount();
        const cardsToCheck = Math.min(sampleSize, totalCards);

        for (let i = 0; i < cardsToCheck; i++) {

            const { image, price, cta } = this.getCard(i);

            const hasImage = await image.first().isVisible().catch(() => false);
            const hasTitle = ((await this.getCardTitle(i)) || '').length > 0;
            const hasPrice = ((await price.textContent().catch(() => '')) || '').trim().length > 0;
            const hasCTA = await cta.isVisible().catch(() => false);

            results.push({ index: i, hasImage, hasTitle, hasPrice, hasCTA });
        }

        const allValid = results.every(r => r.hasImage && r.hasTitle && r.hasPrice && r.hasCTA);

        return { allValid, results };
    }

    // ================================================
    // Hover over a product image
    // ================================================
    async hoverOverProductImage(index = 0) {

        try {

            const { image } = this.getCard(index);

            await image.first().scrollIntoViewIfNeeded();
            await image.first().hover();

            return true;

        } catch (error) {

            console.log(`⚠️ hoverOverProductImage failed : ${error.message}`);
            return false;
        }
    }

    // ================================================
    // Verify product image renders without distortion
    // (compares natural aspect ratio vs rendered aspect ratio)
    // ================================================
    async isProductImageWithoutDistortion(index = 0) {

        try {

            const { image } = this.getCard(index);
            const imgHandle = image.first();

            await imgHandle.waitFor({ state: 'visible', timeout: 10000 });

            const dimensions = await imgHandle.evaluate((img) => {

                return {
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    clientWidth: img.clientWidth,
                    clientHeight: img.clientHeight,
                    complete: img.complete
                };
            });

            if (!dimensions.complete || dimensions.naturalWidth === 0 || dimensions.naturalHeight === 0) {
                return false;
            }

            const naturalRatio = dimensions.naturalWidth / dimensions.naturalHeight;
            const renderedRatio = dimensions.clientWidth / dimensions.clientHeight;

            const ratioDifference = Math.abs(naturalRatio - renderedRatio) / naturalRatio;

            // Small tolerance accounts for object-fit cropping, not stretching/distortion
            return ratioDifference <= 0.15;

        } catch (error) {

            console.log(`⚠️ isProductImageWithoutDistortion failed : ${error.message}`);
            return false;
        }
    }

    // ================================================
    // Get title and price text of a card before navigating away
    // ================================================
    async getCardTitleAndPrice(index = 0) {

        try {

            const { price } = this.getCard(index);

            const titleText = await this.getCardTitle(index);
            const priceText = ((await price.textContent().catch(() => '')) || '').trim();

            return { titleText, priceText };

        } catch (error) {

            console.log(`⚠️ getCardTitleAndPrice failed : ${error.message}`);
            return { titleText: '', priceText: '' };
        }
    }

    // ================================================
    // Scroll the PLP down by given pixels
    // ================================================
    async scrollDown(pixels = 800) {

        try {

            await this.page.evaluate((y) => window.scrollTo(0, y), pixels);
            await this.page.waitForTimeout(500);

            return true;

        } catch (error) {

            console.log(`⚠️ scrollDown failed : ${error.message}`);
            return false;
        }
    }

    async getScrollPosition() {

        try {

            return await this.page.evaluate(() => window.scrollY);

        } catch (error) {

            console.log(`⚠️ getScrollPosition failed : ${error.message}`);
            return -1;
        }
    }

    // ================================================
    // Click a product card to navigate to PDP
    // ================================================
    async clickProductCard(index = 0) {

        try {

            const { link } = this.getCard(index);

            await link.first().scrollIntoViewIfNeeded();
            await link.first().click();

            await this.page.waitForLoadState('networkidle');

            return true;

        } catch (error) {

            console.log(`⚠️ clickProductCard failed : ${error.message}`);
            return false;
        }
    }

    // async clickProductCard(index = 0) {

    //     try {

    //         const { link } = this.getCard(index);

    //         await link.first().scrollIntoViewIfNeeded();
    //         await link.first().click();

    //         await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { });
    //         await this.page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => { });

    //         return true;

    //     } catch (error) {

    //         console.log(`⚠️ clickProductCard failed : ${error.message}`);
    //         return false;
    //     }
    // }

    getCurrentURL() {

        return this.page.url();
    }
}

module.exports = PLPPage;