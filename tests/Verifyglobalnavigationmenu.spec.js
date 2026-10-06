// ==============================
// tests/verifyGlobalNavigationMenu.spec.js
// ==============================

const { test, expect } = require('../utils/testFixture');
const HomePage = require('../pages/HomePage');
const { logResult } = require('../utils/reportLogger');

const {
    addStepResult,
    getStepResults,
    clearStepResults
} = require('../utils/testReporter');

test.describe('Homepage Module', () => {

    test(
        'TC003 - Verify global navigation menu',
        async ({ page, context }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;

            console.log('\n======================================================');
            console.log('🚀 Starting TC003 - Verify global navigation menu');
            console.log('======================================================');

            const homePage = new HomePage(page);

            try {

                // ============================================================
                // STEP 1 : Navigate to Homepage
                // ============================================================

                console.log('🔹 Step 1 : Navigate to Homepage');

                const response = await homePage.hitUrl('/');

                await page.waitForLoadState('domcontentloaded');

                const statusCode = response ? response.status() : null;

                const homepageUrl = page.url();

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
                // STEP 2 : Verify Header Navigation Menu Is Present
                // ============================================================

                console.log('🔹 Step 2 : Verify Header Navigation Menu Is Present');

                const menuCount = await homePage.getNavMenuCount();

                if (menuCount > 0) {

                    addStepResult(
                        'PASS',
                        `Header navigation menu found with ${menuCount} menu item(s)`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Header navigation menu is not displayed'
                    );
                }

                // ============================================================
                // STEP 3 : Verify Every Header Navigation Menu Link Actually
                //          Leads To A Working Destination Page
                // ============================================================

                for (let i = 0; i < menuCount; i++) {

                    const label = await homePage.getNavMenuLabel(i);

                    const isDropdown = await homePage.isNavMenuDropdown(i);

                    if (isDropdown) {

                        // ----------------------------------------------
                        // Dropdown menu - verify every child link's href
                        // resolves to a working page. We read the hrefs
                        // straight from the DOM (no hover/click) since the
                        // hover-driven drawer is unreliable to interact
                        // with directly on this site, and navigate to each
                        // one via a fresh page to check the response.
                        // ----------------------------------------------

                        const dataLink =
                            await homePage.getNavMenuDataLink(i);

                        const childInfo =
                            await homePage.getDropdownChildInfo(dataLink);

                        if (childInfo.length === 0) {

                            testFailed = true;

                            addStepResult(
                                'FAIL',
                                `"${label}" menu did not expose any child links`
                            );

                            continue;
                        }

                        for (let j = 0; j < childInfo.length; j++) {

                            const { href, label: childLabel } = childInfo[j];

                            console.log(
                                `🔹 Step 3 : Verify "${label} > ${childLabel}" navigates correctly`
                            );

                            if (!href || href.trim() === '' || href.trim() === '#') {

                                testFailed = true;

                                addStepResult(
                                    'FAIL',
                                    `"${label} > ${childLabel}" menu has no valid link to navigate to`
                                );

                                continue;
                            }

                            const targetUrl = new URL(
                                href,
                                homepageUrl
                            ).toString();

                            const childPage = await context.newPage();

                            try {

                                const navResponse = await childPage.goto(
                                    targetUrl,
                                    {
                                        waitUntil: 'domcontentloaded',
                                        timeout: 15000
                                    }
                                );

                                const status =
                                    navResponse ? navResponse.status() : null;

                                const landedUrl = childPage.url();

                                if (status && status < 400) {

                                    addStepResult(
                                        'PASS',
                                        `"${label} > ${childLabel}" navigated successfully to "${landedUrl}" (HTTP ${status})`
                                    );

                                } else {

                                    testFailed = true;

                                    addStepResult(
                                        'FAIL',
                                        `"${label} > ${childLabel}" is broken - landed on "${landedUrl}" with HTTP ${status}`
                                    );
                                }

                            } catch (linkError) {

                                testFailed = true;

                                addStepResult(
                                    'FAIL',
                                    `"${label} > ${childLabel}" navigation failed with error : ${linkError.message}`
                                );

                            } finally {

                                if (!childPage.isClosed()) {
                                    await childPage.close().catch(() => {});
                                }
                            }
                        }

                    } else {

                        // ----------------------------------------------
                        // Direct link menu - click it directly
                        // ----------------------------------------------

                        if (page.url() !== homepageUrl) {

                            await homePage.hitUrl('/');
                            await page.waitForLoadState('domcontentloaded');
                        }

                        console.log(
                            `🔹 Step 3 : Click "${label}" and verify navigation`
                        );

                        try {

                            const href = await homePage.getNavMenuHref(i);

                            if (!href || href.trim() === '' || href.trim() === '#') {

                                testFailed = true;

                                addStepResult(
                                    'FAIL',
                                    `"${label}" menu has no valid link to navigate to`
                                );

                                continue;
                            }

                            const linkLocator = homePage.navMenuItems.nth(i);

                            const [navResponse] = await Promise.all([
                                page
                                    .waitForNavigation({
                                        waitUntil: 'domcontentloaded',
                                        timeout: 15000
                                    })
                                    .catch(() => null),
                                linkLocator.click({ timeout: 10000 })
                            ]);

                            const status =
                                navResponse ? navResponse.status() : null;

                            const landedUrl = page.url();

                            if (status && status < 400 && landedUrl !== homepageUrl) {

                                addStepResult(
                                    'PASS',
                                    `"${label}" navigated successfully to "${landedUrl}" (HTTP ${status})`
                                );

                            } else {

                                testFailed = true;

                                addStepResult(
                                    'FAIL',
                                    `"${label}" is broken - landed on "${landedUrl}" with HTTP ${status}`
                                );
                            }

                        } catch (linkError) {

                            testFailed = true;

                            addStepResult(
                                'FAIL',
                                `"${label}" navigation failed with error : ${linkError.message}`
                            );
                        }
                    }
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
                testCaseId: 'TC003',
                title: 'Verify global navigation menu',
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
        'TC004 - Verify search functionality',
        async ({ page }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;

            console.log('\n======================================================');
            console.log('🚀 Starting TC004 - Verify search functionality');
            console.log('======================================================');

            const homePage = new HomePage(page);
            const searchTerm = 'Lemon Lime';

            try {

                // ============================================================
                // STEP 1 : Navigate to Homepage
                // ============================================================

                console.log('🔹 Step 1 : Navigate to Homepage');

                const response = await homePage.hitUrl('/');

                await page.waitForLoadState('domcontentloaded');

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
                // STEP 2 : Click Search Icon
                // ============================================================

                console.log('🔹 Step 2 : Click Search Icon');

                const searchIconVisible =
                    await homePage.isSearchIconVisible();

                if (searchIconVisible) {

                    await homePage.clickSearchIcon();

                    const searchInputVisible =
                        await homePage.isSearchInputVisible();

                    if (searchInputVisible) {

                        addStepResult(
                            'PASS',
                            'Search icon clicked successfully and search input is displayed'
                        );

                    } else {

                        testFailed = true;

                        addStepResult(
                            'FAIL',
                            'Search icon clicked but search input is not displayed'
                        );
                    }

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Search icon is not displayed on homepage'
                    );
                }

                // ============================================================
                // STEP 3 : Search "Lemon Lime"
                // ============================================================

                console.log('🔹 Step 3 : Search "Lemon Lime"');

                await homePage.searchFor(searchTerm);

                addStepResult(
                    'PASS',
                    `Search term "${searchTerm}" entered successfully`
                );

                // ============================================================
                // STEP 4 : Verify Relevant Products Displayed
                // ============================================================

                console.log('🔹 Step 4 : Verify Relevant Products Displayed');

                const resultsCount =
                    await homePage.getSearchResultsCount();

                if (resultsCount > 0) {

                    const firstResultLabel =
                        await homePage.getSearchResultLabel(0);

                    addStepResult(
                        'PASS',
                        `Relevant products displayed for search term "${searchTerm}" : ${resultsCount} result(s) found, e.g. "${firstResultLabel}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        `No relevant products displayed for search term "${searchTerm}"`
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
                testCaseId: 'TC004',
                title: 'Verify search functionality',
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
        'TC005 - Verify minicart icon',
        async ({ page }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;

            console.log('\n======================================================');
            console.log('🚀 Starting TC005 - Verify minicart icon');
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
                // STEP 2 : Verify Mini Cart Icon
                // ============================================================

                console.log('🔹 Step 2 : Verify Mini Cart Icon');

                const miniCartVisible =
                    await homePage.isMiniCartIconVisible();

                if (miniCartVisible) {

                    addStepResult(
                        'PASS',
                        'Mini cart icon is displayed successfully on the homepage'
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Mini cart icon is not displayed on the homepage'
                    );
                }

                // ============================================================
                // STEP 3 : Click Cart Icon
                // ============================================================

                console.log('🔹 Step 3 : Click Cart Icon');

                if (miniCartVisible) {

                    await homePage.clickMiniCartIcon();

                    addStepResult(
                        'PASS',
                        'Cart icon clicked successfully'
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Cart icon could not be clicked because it is not visible'
                    );
                }

                // ============================================================
                // STEP 4 : Verify Cart Drawer / Page Opens
                // ============================================================

                console.log('🔹 Step 4 : Verify Cart Drawer / Page');

                await page.waitForLoadState('domcontentloaded')
                    .catch(() => {});

                await page.waitForTimeout(1000);

                const cartOpened =
                    await homePage.isCartDrawerOrPageOpen();

                if (cartOpened) {

                    const cartStatus =
                        await homePage.getCartPageOrDrawerStatus();

                    addStepResult(
                        'PASS',
                        cartStatus
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Cart drawer/page did not open successfully after clicking the cart icon'
                    );
                }

            } catch (error) {

                testFailed = true;

                addStepResult(
                    'FAIL',
                    `Unexpected error : ${error.message}`
                );
            }

            // ============================================================
            // MONOCART REPORT
            // ============================================================

            const steps =
                getStepResults();

            const overallStatus =
                testFailed ? 'FAIL' : 'PASS';

            console.log(
                'Steps:',
                JSON.stringify(steps, null, 2)
            );

            logResult({
                testCaseId: 'TC005',
                title: 'Verify minicart icon',
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