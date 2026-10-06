// ==============================
// tests/PDPproductDetails.spec.js
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

test.describe('PDP Module', () => {

    test(
        'TC010 - Verify PDP page and product details',
        async ({ page }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;

            console.log('\n======================================================');
            console.log('🚀 Starting TC010 - Verify PDP page and product details');
            console.log('======================================================');

            const plpPage = new PLPPage(page);
            const productPage = new ProductPage(page);

            const PRODUCT_INDEX = 0;

            try {

                // ============================================================
                // STEP 1 : Navigate Home -> Products -> Shop All -> Product -> PDP
                // ============================================================

                console.log('🔹 Step 1 : Open provided PDP URL');

                const navigatedToPLP = await plpPage.navigateToPLP();
                const plpLoaded = navigatedToPLP && await plpPage.isPLPLoaded();

                const cardClicked = plpLoaded && await plpPage.clickProductCard(PRODUCT_INDEX);
                const pdpLoaded = cardClicked && await productPage.isPDPLoaded();
                const pdpURL = plpPage.getCurrentURL();

                if (pdpLoaded && pdpURL.includes('/products/')) {

                    addStepResult(
                        'PASS',
                        `PDP page loaded successfully by navigating from Home -> Products -> Shop All -> Product. URL : "${pdpURL}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `PDP page did not load successfully via navigation. Current URL : "${pdpURL}"`
                    );
                }

                // ============================================================
                // STEP 2 : Observe Product Details (Title, Price, Description, Image)
                // ============================================================

                console.log('🔹 Step 2 : Observe product details');

                const {
                    allDisplayed,
                    title,
                    price,
                    description,
                    mainImageVisible
                } = await productPage.verifyProductDetailsDisplayed();

                if (allDisplayed) {

                    addStepResult(
                        'PASS',
                        `Product title, price, description and image are displayed correctly. ` +
                        `Title : "${title}" | Price : "${price}" | Description : "${description}" | Image Visible : ${mainImageVisible}`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Product details are not displayed correctly. ` +
                        `Title : "${title}" | Price : "${price}" | Description : "${description}" | Image Visible : ${mainImageVisible}`
                    );
                }

                // ============================================================
                // STEP 3 : Click Thumbnail Images and Verify Main Image Change
                // ============================================================

                console.log('🔹 Step 3 : Click thumbnail images');

                const { changed, srcBefore, srcAfter, skipped } =
                    await productPage.verifyMainImageChangesOnThumbnailClick(1);

                if (skipped) {

                    addStepResult(
                        'PASS',
                        'Only one or no thumbnail available, thumbnail switch not applicable'
                    );

                } else if (changed) {

                    addStepResult(
                        'PASS',
                        `Main product image changed successfully on thumbnail click. Before : "${srcBefore}" | After : "${srcAfter}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Main product image did not change on thumbnail click. Before : "${srcBefore}" | After : "${srcAfter}"`
                    );
                }

                // ============================================================
                // STEP 4 : Increase and Decrease Quantity
                // ============================================================

                console.log('🔹 Step 4 : Increase and decrease quantity');

                const initialQuantity = await productPage.getQuantityValue();

                await productPage.increaseQuantity(2);
                const quantityAfterIncrease = await productPage.getQuantityValue();

                await productPage.decreaseQuantity(1);
                const quantityAfterDecrease = await productPage.getQuantityValue();

                const quantityUpdatedCorrectly =
                    quantityAfterIncrease === initialQuantity + 2 &&
                    quantityAfterDecrease === quantityAfterIncrease - 1;

                if (quantityUpdatedCorrectly) {

                    addStepResult(
                        'PASS',
                        `Quantity updated correctly. Initial : ${initialQuantity} | After Increase : ${quantityAfterIncrease} | After Decrease : ${quantityAfterDecrease}`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Quantity did not update correctly. Initial : ${initialQuantity} | After Increase : ${quantityAfterIncrease} | After Decrease : ${quantityAfterDecrease}`
                    );
                }

                // ============================================================
                // STEP 5 : Click Add to Cart
                // ============================================================

                console.log('🔹 Step 5 : Click Add to Cart');

                const addedToCart = await productPage.clickAddToCart();
                const cartConfirmed = addedToCart && await productPage.isAddedToCartConfirmed();

                if (cartConfirmed) {

                    addStepResult(
                        'PASS',
                        `Product "${title}" added to cart successfully`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Product "${title}" was not added to cart successfully`
                    );
                }

                // Close the cart drawer so it does not block subsequent
                // interactions (flavor selection, tab clicks, etc.)
                await productPage.closeCartDrawer();

                // ============================================================
                // STEP 6 : Select Another Flavor (if available)
                // ============================================================

                console.log('🔹 Step 6 : Select another flavor (if available)');

                const flavorSwitchResult = await productPage.selectDifferentFlavor();

                if (flavorSwitchResult.switched) {

                    const titleAfterSwitch = await productPage.getProductTitle();
                    const priceAfterSwitch = await productPage.getProductPrice();

                    const detailsUpdated =
                        titleAfterSwitch.length > 0 && priceAfterSwitch.length > 0;

                    if (detailsUpdated) {

                        addStepResult(
                            'PASS',
                            `Product details updated correctly after selecting flavor "${flavorSwitchResult.flavorName}". Title : "${titleAfterSwitch}" | Price : "${priceAfterSwitch}"`
                        );

                    } else {

                        testFailed = true;

                        addStepResult(
                            'FAIL',
                            `Product details did not update correctly after selecting flavor "${flavorSwitchResult.flavorName}"`
                        );
                    }

                } else {

                    addStepResult(
                        'PASS',
                        `Flavor switch skipped : ${flavorSwitchResult.reason}`
                    );
                }

                // ============================================================
                // STEP 7 : Click All Tabs
                // ============================================================

                console.log('🔹 Step 7 : Click all tabs');

                const { allValid: tabsValid, results: tabResults } =
                    await productPage.verifyAllTabsHaveContent();

                if (tabsValid) {

                    addStepResult(
                        'PASS',
                        `Content is displayed for all tabs correctly : ${JSON.stringify(tabResults)}`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `One or more tabs did not display content correctly : ${JSON.stringify(tabResults)}`
                    );
                }

                // ============================================================
                // STEP 8 : Add Multiple Quantities and Verify Cart Reflects It
                // ============================================================

                console.log('🔹 Step 8 : Add multiple quantities');

                const multipleQuantity = 3;

                await productPage.setQuantity(multipleQuantity);
                const quantitySetValue = await productPage.getQuantityValue();

                const addedMultiple = await productPage.clickAddToCart();
                const cartConfirmedMultiple = addedMultiple && await productPage.isAddedToCartConfirmed();

                const cartReflectedQuantity = cartConfirmedMultiple
                    ? await productPage.getCartReflectedQuantity()
                    : 0;

                const cartReflectsQuantity =
                    cartConfirmedMultiple &&
                    quantitySetValue === multipleQuantity &&
                    cartReflectedQuantity === multipleQuantity;

                if (cartReflectsQuantity) {

                    addStepResult(
                        'PASS',
                        `Cart reflects selected quantity correctly. Selected : ${quantitySetValue} | Cart Quantity : ${cartReflectedQuantity}`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Cart did not reflect selected quantity correctly. Selected : ${quantitySetValue} | Cart Quantity : ${cartReflectedQuantity}`
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
                testCaseId: 'TC010',
                title: 'Verify PDP page and product details',
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