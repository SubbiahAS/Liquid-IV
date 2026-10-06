// ==============================
// tests/verifyPLPProductDetails.spec.js
// ==============================

const { test, expect } = require('../utils/testFixture');
const PLPPage = require('../Pages/PLPpage');
const ProductPage = require('../Pages/ProductPage');
const { logResult } = require('../utils/reportLogger');

const {
    addStepResult,
    getStepResults,
    clearStepResults
} = require('../utils/testReporter');

test.describe('PLP Module', () => {

    test(
        'TC009 - Verify PLP page and product details',
        async ({ page }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;

            console.log('\n======================================================');
            console.log('🚀 Starting TC009 - Verify PLP page and product details');
            console.log('======================================================');

            const plpPage = new PLPPage(page);
            const productPage = new ProductPage(page);

            const PRODUCT_INDEX = 0;

            try {

                // ============================================================
                // STEP 1 : Navigate to Collection Page
                // ============================================================

                console.log('🔹 Step 1 : Navigate to Collection page');

                const navigated = await plpPage.navigateToPLP();
                const plpLoaded = navigated && await plpPage.isPLPLoaded();
                const collectionURL = plpPage.getCurrentURL();

                if (plpLoaded) {

                    addStepResult(
                        'PASS',
                        `Product listing page loaded successfully : "${collectionURL}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Product listing page did not load successfully'
                    );
                }

                // ============================================================
                // STEP 2 : Observe All Product Cards
                // ============================================================

                console.log('🔹 Step 2 : Observe all product cards');

                const { allValid, results } =
                    await plpPage.verifyAllCardsHaveRequiredElements();

                if (allValid) {

                    addStepResult(
                        'PASS',
                        `All checked product cards display image, title, price and CTA : ${JSON.stringify(results)}`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `One or more product cards are missing required elements : ${JSON.stringify(results)}`
                    );
                }

                // ============================================================
                // STEP 3 : Hover Over Product Image
                // ============================================================

                console.log('🔹 Step 3 : Hover over product image');

                await plpPage.hoverOverProductImage(PRODUCT_INDEX);

                const imageOk =
                    await plpPage.isProductImageWithoutDistortion(PRODUCT_INDEX);

                if (imageOk) {

                    addStepResult(
                        'PASS',
                        'Product image is displayed correctly without distortion'
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Product image is distorted or failed to load correctly'
                    );
                }

                // ============================================================
                // STEP 4 : Click Product and Verify PDP Navigation
                // ============================================================

                console.log('🔹 Step 4 : Click product and verify PDP navigation');

                const { titleText, priceText } =
                    await plpPage.getCardTitleAndPrice(PRODUCT_INDEX);

                // Scroll down before leaving PLP to validate scroll retention later
                await plpPage.scrollDown(800);
                const scrollBeforeNavigation = await plpPage.getScrollPosition();

                const cardClicked = await plpPage.clickProductCard(PRODUCT_INDEX);
                const pdpLoaded = cardClicked && await productPage.isPDPLoaded();
                const pdpURL = plpPage.getCurrentURL();

                if (pdpLoaded && pdpURL.includes('/products/')) {

                    addStepResult(
                        'PASS',
                        `User navigated to corresponding PDP : "${pdpURL}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `User was not navigated to a valid PDP. Current URL : "${pdpURL}"`
                    );
                }

                // ============================================================
                // STEP 5 : Compare Displayed Price
                // ============================================================

                console.log('🔹 Step 5 : Compare displayed price');

                const pdpPriceText = await productPage.getProductPrice();

                const normalize = (text) => (text || '').replace(/[^0-9.]/g, '');

                const priceMatches =
                    normalize(priceText) !== '' &&
                    normalize(priceText) === normalize(pdpPriceText);

                if (priceMatches) {

                    addStepResult(
                        'PASS',
                        `Correct product price is displayed. PLP : "${priceText}" | PDP : "${pdpPriceText}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Product price mismatch. PLP : "${priceText}" | PDP : "${pdpPriceText}"`
                    );
                }

                // ============================================================
                // STEP 6 : Click Add to Cart
                // ============================================================

                console.log('🔹 Step 6 : Click Add to Cart');

                const addedToCart = await productPage.clickAddToCart();
                const cartConfirmed = addedToCart && await productPage.isAddedToCartConfirmed();

                if (cartConfirmed) {

                    addStepResult(
                        'PASS',
                        `Product "${titleText}" added to cart successfully`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Product "${titleText}" was not added to cart successfully`
                    );
                }

                // ============================================================
                // STEP 7 : Open PDP then Click Back - Verify Scroll Retained
                // ============================================================

                console.log('🔹 Step 7 : Open PDP then click Back');

                const wentBack = await productPage.goBackToPLP();
                const scrollAfterBack = await plpPage.getScrollPosition();

                const backOnPLP = wentBack && await plpPage.isPLPLoaded();

                const scrollDifference =
                    Math.abs(scrollBeforeNavigation - scrollAfterBack);

                const scrollRetained = backOnPLP && scrollDifference <= 100;

                if (scrollRetained) {

                    addStepResult(
                        'PASS',
                        `User returned to previous PLP with scroll position retained. Before : ${scrollBeforeNavigation}px, After : ${scrollAfterBack}px`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Scroll position was not retained on returning to PLP. Before : ${scrollBeforeNavigation}px, After : ${scrollAfterBack}px`
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
                testCaseId: 'TC009',
                title: 'Verify PLP page and product details',
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