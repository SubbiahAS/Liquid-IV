// ==============================
// tests/verifyHomepageHeroBanner.spec.js
// ==============================

const { test, expect } = require('../utils/testFixture');
const HomePage = require('../Pages/HomePage');
const { logResult } = require('../utils/reportLogger');

const {
    addStepResult,
    getStepResults,
    clearStepResults
} = require('../utils/testReporter');

test.describe('Homepage Module', () => {

    test(
        'TC001 - Verify homepage loads successfully with hero banner section',
        async ({ page }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;

            console.log('\n======================================================');
            console.log('🚀 Starting TC001 - Verify homepage loads successfully with hero banner section');
            console.log('======================================================');

            const homePage = new HomePage(page);

            try {

                // ============================================================
                // STEP 1 : Navigate to Homepage
                // ============================================================

                console.log('🔹 Step 1 : Navigate to Homepage');

                const response = await homePage.hitUrl('/');

                await page.waitForLoadState('networkidle');

                const statusCode = response ? response.status() : null;

                if (statusCode === 200) {

                    addStepResult(
                        'PASS',
                        `Homepage loaded successfully with HTTP Status Code : ${statusCode}`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Homepage returned unexpected HTTP Status Code : ${statusCode}`
                    );
                }

                // ============================================================
                // STEP 2 : Verify Hero Banner Section
                // ============================================================

                console.log('🔹 Step 2 : Verify Hero Banner');

                const bannerVisible =
                    await homePage.isHeroBannerVisible();

                if (bannerVisible) {

                    addStepResult(
                        'PASS',
                        'Hero banner section is displayed successfully'
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Hero banner section is not displayed'
                    );
                }

                // ============================================================
                // STEP 3 : Verify Hero Image / Video
                // ============================================================

                console.log('🔹 Step 3 : Verify Hero Media');

                const mediaVisible =
                    await homePage.isHeroMediaVisible();

                if (mediaVisible) {

                    addStepResult(
                        'PASS',
                        'Hero banner image/video is displayed'
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Hero banner image/video is not displayed'
                    );
                }

                // ============================================================
                // STEP 4 : Verify Hero Heading
                // ============================================================

                console.log('🔹 Step 4 : Verify Hero Heading');

                const heading =
                    await homePage.getHeroHeading();

                if (heading.length > 0) {

                    addStepResult(
                        'PASS',
                        `Hero heading displayed : "${heading}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Hero heading is not displayed'
                    );
                }

                // ============================================================
                // STEP 5 : Verify Promotional Content
                // ============================================================

                console.log('🔹 Step 5 : Verify Promotional Content');

                const promoContent =
                    await homePage.getHeroContent();

                if (promoContent.length > 0) {

                    addStepResult(
                        'PASS',
                        `Promotional content displayed : "${promoContent}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Promotional content is not displayed'
                    );
                }

                // ============================================================
                // STEP 6 : Verify CTA Button
                // ============================================================

                console.log('🔹 Step 6 : Verify CTA Button');

                const ctaVisible =
                    await homePage.isHeroCTAVisible();

                if (ctaVisible) {

                    const ctaText =
                        (await homePage.heroBannerCTA.textContent() || '').trim();

                    addStepResult(
                        'PASS',
                        `CTA button displayed : "${ctaText}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'CTA button is not displayed'
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
                testCaseId: 'TC001',
                title: 'Verify homepage loads successfully with hero banner section',
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


    test(
        'TC002 - Verify Shop Now CTA',
        async ({ page }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;

            console.log('\n======================================================');
            console.log('🚀 Starting TC002 - Verify Shop Now CTA');
            console.log('======================================================');

            const homePage = new HomePage(page);

            try {

                // ============================================================
                // STEP 1 : Navigate to Homepage
                // ============================================================

                console.log('🔹 Step 1 : Navigate to Homepage');

                const response =
                    await homePage.hitUrl('/');

                await page.waitForLoadState('networkidle');

                const statusCode =
                    response ? response.status() : null;

                if (statusCode === 200) {

                    addStepResult(
                        'PASS',
                        `Homepage loaded successfully with HTTP Status Code : ${statusCode}`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `Homepage returned unexpected HTTP Status Code : ${statusCode}`
                    );
                }

                // ============================================================
                // STEP 2 : Verify Shop Now CTA Visibility
                // ============================================================

                console.log('🔹 Step 2 : Verify Shop Now CTA Visibility');

                const ctaVisible =
                    await homePage.isHeroCTAVisible();

                if (ctaVisible) {

                    addStepResult(
                        'PASS',
                        'Shop Now CTA is displayed on hero banner'
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Shop Now CTA is not displayed on hero banner'
                    );
                }

                // ============================================================
                // STEP 3 : Click Shop Now CTA
                // ============================================================

                console.log('🔹 Step 3 : Click Shop Now CTA');

                const urlBeforeClick =
                    homePage.getCurrentURL();

                await homePage.clickHeroCTA();

                await page.waitForLoadState('networkidle');

                addStepResult(
                    'PASS',
                    `Shop Now CTA clicked successfully from : "${urlBeforeClick}"`
                );

                // ============================================================
                // STEP 4 : Verify Redirection
                // ============================================================

                console.log('🔹 Step 4 : Verify Redirection');

                const urlAfterClick =
                    homePage.getCurrentURL();

                const isRedirected =
                    urlAfterClick !== urlBeforeClick &&
                    (
                        urlAfterClick.includes('/products/') ||
                        urlAfterClick.includes('/collections/')
                    );

                if (isRedirected) {

                    addStepResult(
                        'PASS',
                        `User redirected successfully to : "${urlAfterClick}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `User was not redirected to a valid product/collection page. Current URL : "${urlAfterClick}"`
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
                testCaseId: 'TC002',
                title: 'Verify Shop Now CTA',
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