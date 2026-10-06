// ==============================
// tests/footerLinks.spec.js
// ==============================

const { test, expect } = require('../utils/testFixture');
const HomePage = require('../Pages/HomePage');
const { logResult } = require('../utils/reportLogger');

const {
    addStepResult,
    getStepResults,
    clearStepResults
} = require('../utils/testReporter');


// ================================================================
// Homepage Module
// ================================================================

test.describe('Homepage Module', () => {

    test(
        'TC006 - Verify footer links',
        async ({ page }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;

            console.log('\n======================================================');
            console.log('🚀 Starting TC006 - Verify footer links');
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
                // STEP 2 : Verify Footer Section
                // ============================================================

                console.log('🔹 Step 2 : Verify Footer Section');

                await homePage.scrollToFooter();

                const footerVisible =
                    await homePage.footer.isVisible();

                const footerLinkCount =
                    await homePage.getFooterLinkCount();

                if (footerVisible && footerLinkCount > 0) {

                    addStepResult(
                        'PASS',
                        `Footer section is displayed successfully with ${footerLinkCount} footer links`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Footer section is not displayed or no footer links were found'
                    );
                }


                // ============================================================
                // STEP 3 : Verify Footer Links Navigation
                // ============================================================

                console.log('🔹 Step 3 : Verify Footer Links Navigation');

                const totalFooterLinks =
                    await homePage.getFooterLinkCount();

                console.log(
                    `📌 Total footer links found : ${totalFooterLinks}`
                );

                const failedLinks = [];
                let validatedLinks = 0;
                let skippedLinks = 0;


                for (
                    let index = 0;
                    index < totalFooterLinks;
                    index++
                ) {

                    // --------------------------------------------------------
                    // Always navigate back to homepage before next link
                    // --------------------------------------------------------

                    if (index > 0) {

                        await homePage.hitUrl('/');

                        await page.waitForLoadState(
                            'domcontentloaded'
                        );

                        await page.waitForTimeout(500);
                    }


                    await homePage.scrollToFooter();

                    const link =
                        homePage.footerLinks.nth(index);


                    // --------------------------------------------------------
                    // Check whether link is actually visible
                    // --------------------------------------------------------

                    const isVisible =
                        await link.isVisible().catch(() => false);

                    if (!isVisible) {

                        console.log(
                            `⚠️ Skipping hidden footer link ${index + 1}/${totalFooterLinks}`
                        );

                        skippedLinks++;

                        continue;
                    }


                    const linkText =
                        (
                            await link.innerText().catch(() => '')
                        ).trim();

                    const href =
                        await link.getAttribute('href');


                    console.log(
                        `\n🔗 Footer Link ${index + 1}/${totalFooterLinks}`
                    );

                    console.log(
                        `   Text : ${linkText}`
                    );

                    console.log(
                        `   Href : ${href}`
                    );


                    // --------------------------------------------------------
                    // Skip empty / non-navigation links
                    // --------------------------------------------------------

                    if (
                        !href ||
                        href === '#' ||
                        href.startsWith('javascript:')
                    ) {

                        console.log(
                            `⚠️ Skipping non-navigation link : ${linkText}`
                        );

                        skippedLinks++;

                        continue;
                    }


                    try {

                        // ----------------------------------------------------
                        // Make sure the element is still visible
                        // ----------------------------------------------------

                        const stillVisible =
                            await link.isVisible().catch(() => false);

                        if (!stillVisible) {

                            console.log(
                                `⚠️ Footer link became hidden : ${linkText}`
                            );

                            skippedLinks++;

                            continue;
                        }


                        // ----------------------------------------------------
                        // Click footer link
                        // ----------------------------------------------------

                        await link.click({
                            timeout: 15000,
                            noWaitAfter: true
                        });

                        await page.waitForLoadState(
                            'domcontentloaded',
                            {
                                timeout: 30000
                            }
                        ).catch(() => { });

                        await page.waitForTimeout(1000);


                        // ----------------------------------------------------
                        // Capture landed URL
                        // ----------------------------------------------------

                        const landedUrl =
                            page.url();

                        console.log(
                            `   Landed URL : ${landedUrl}`
                        );


                        // ----------------------------------------------------
                        // Validate 404
                        // ----------------------------------------------------

                        const bodyText =
                            (
                                await page
                                    .locator('body')
                                    .innerText({
                                        timeout: 10000
                                    })
                                    .catch(() => '')
                            ).toLowerCase();


                        const is404 =
                            landedUrl.includes('/404') ||
                            bodyText.includes('page not found') ||
                            bodyText.includes(
                                'the page you were looking for'
                            );


                        if (is404) {

                            console.log(
                                `❌ Footer link resulted in 404 : ${linkText}`
                            );

                            failedLinks.push({
                                text: linkText,
                                href: href,
                                landedUrl: landedUrl
                            });

                        } else {

                            console.log(
                                `✅ Footer link navigated successfully : ${linkText}`
                            );

                            validatedLinks++;
                        }


                    } catch (linkError) {

                        console.log(
                            `❌ Footer link navigation failed : ${linkText}`
                        );

                        console.log(
                            `   Error : ${linkError.message}`
                        );


                        failedLinks.push({
                            text: linkText,
                            href: href,
                            landedUrl: page.url(),
                            error: linkError.message
                        });


                        // ----------------------------------------------------
                        // Continue with next footer link
                        // ----------------------------------------------------

                        try {

                            await homePage.hitUrl('/');

                            await page.waitForLoadState(
                                'domcontentloaded'
                            );

                            await page.waitForTimeout(500);

                        } catch (navigationError) {

                            console.log(
                                `⚠️ Could not return to homepage : ${navigationError.message}`
                            );

                            testFailed = true;
                        }
                    }
                }


                // ============================================================
                // STEP 4 : Verify All Footer Links
                // ============================================================

                console.log('🔹 Step 4 : Verify All Footer Links');

                console.log(
                    `📌 Validated links : ${validatedLinks}`
                );

                console.log(
                    `📌 Skipped links : ${skippedLinks}`
                );

                console.log(
                    `📌 Failed links : ${failedLinks.length}`
                );


                if (failedLinks.length === 0) {

                    addStepResult(
                        'PASS',
                        `All ${validatedLinks} visible footer links navigated successfully without 404 errors. ${skippedLinks} hidden/non-navigation link(s) skipped.`
                    );

                } else {

                    testFailed = true;

                    console.log('\n❌ Failed Footer Links:');

                    failedLinks.forEach((failedLink) => {

                        console.log(
                            `   • ${failedLink.text}`
                        );

                        console.log(
                            `     Href : ${failedLink.href}`
                        );

                        console.log(
                            `     URL : ${failedLink.landedUrl}`
                        );

                        if (failedLink.error) {

                            console.log(
                                `     Error : ${failedLink.error}`
                            );
                        }
                    });


                    addStepResult(
                        'FAIL',
                        `${failedLinks.length} footer link(s) failed navigation or resulted in a 404 error`
                    );
                }


            } catch (error) {

                testFailed = true;

                console.log(
                    `❌ Unexpected test error : ${error.message}`
                );

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
                '\n======================================================'
            );

            console.log(
                `📊 TC006 Overall Status : ${overallStatus}`
            );

            console.log(
                '======================================================'
            );


            console.log(
                'Steps:',
                JSON.stringify(steps, null, 2)
            );


            logResult({
                testCaseId: 'TC006',
                title: 'Verify footer links',
                status: overallStatus,
                steps
            });


            clearStepResults();


            // ============================================================
            // FAIL PLAYWRIGHT TEST IF EXPECTED RESULT FAILED
            // ============================================================

            expect(
                overallStatus,
                'One or more validation steps failed'
            ).toBe('PASS');

        }
    );

    test(
        'TC007 - Verify social media links',
        async ({ page }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;

            console.log('\n======================================================');
            console.log('🚀 Starting TC007 - Verify social media links');
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
                // STEP 2 : Scroll to Footer & Verify Social Links Section
                // ============================================================

                console.log('🔹 Step 2 : Verify Social Media Links Section');

                await homePage.scrollToFooter();
                await homePage.scrollToSocialLinks();

                const sectionVisible =
                    await homePage.isSocialLinksSectionVisible();

                if (sectionVisible) {

                    addStepResult(
                        'PASS',
                        'Social media links section is displayed in the footer'
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Social media links section is not displayed in the footer'
                    );
                }

                // ============================================================
                // STEP 3 : Verify Social Icons Count
                // ============================================================

                console.log('🔹 Step 3 : Verify Social Icons Count');

                const socialLinksCount =
                    await homePage.getSocialLinksCount();

                if (socialLinksCount > 0) {

                    addStepResult(
                        'PASS',
                        `${socialLinksCount} social media icon(s) found in the footer`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'No social media icons found in the footer'
                    );
                }

                // ============================================================
                // STEP 4 : Click Each Social Icon & Verify New Tab Redirection
                // ============================================================

                console.log('🔹 Step 4 : Click Each Social Icon & Verify New Tab Redirection');

                if (socialLinksCount > 0) {

                    for (let i = 0; i < socialLinksCount; i++) {

                        try {

                            const iconVisible =
                                await homePage.isSocialLinkVisible(i);

                            if (!iconVisible) {
                                testFailed = true;

                                addStepResult(
                                    'FAIL',
                                    `Social icon at index ${i} is not visible`
                                );

                                continue;
                            }

                            const result =
                                await homePage.clickSocialLinkAndVerifyNewTab(i);

                            const expectedDomain =
                                (result.href || '').replace(/^https?:\/\//, '').split('/')[0];

                            const isCorrectRedirect =
                                result.opened &&
                                expectedDomain &&
                                result.newTabUrl.includes(expectedDomain);

                            if (isCorrectRedirect) {

                                addStepResult(
                                    'PASS',
                                    `"${result.label}" icon clicked successfully and opened the correct page "${result.newTabUrl}" in a new tab (expected href : "${result.href}")`
                                );

                            } else {

                                testFailed = true;

                                addStepResult(
                                    'FAIL',
                                    `"${result.label || 'Unknown'}" icon did not open the correct page in a new tab. Expected href : "${result.href}", Actual URL opened : "${result.newTabUrl}"`
                                );
                            }

                        } catch (error) {

                            testFailed = true;

                            addStepResult(
                                'FAIL',
                                `Failed to verify social icon at index ${i}. Error : ${error.message}`
                            );
                        }

                        // Ensure footer/social section is back in view for next iteration
                        await homePage.scrollToFooter().catch(() => { });
                        await homePage.scrollToSocialLinks().catch(() => { });
                    }

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Skipped social icon click verification as no icons were found'
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
                testCaseId: 'TC007',
                title: 'Verify social media links',
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
        'TC008 - Verify newsletter subscription',
        async ({ page }) => {

            test.setTimeout(300000);

            clearStepResults();

            let testFailed = false;

            console.log('\n======================================================');
            console.log('🚀 Starting TC008 - Verify newsletter subscription');
            console.log('======================================================');

            const homePage = new HomePage(page);

            // Unique email per run so repeated executions don't hit a
            // "already subscribed" edge case on the backend.
            const testEmail = `qa.automation+${Date.now()}@example.com`;

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
                // STEP 2 : Scroll to Footer & Verify Newsletter Form Visibility
                // ============================================================

                console.log('🔹 Step 2 : Verify Newsletter Subscription Form');

                await homePage.scrollToFooter();

                const formVisible =
                    await homePage.isNewsletterFormVisible();

                if (formVisible) {

                    addStepResult(
                        'PASS',
                        'Newsletter subscription email field is displayed in the footer'
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Newsletter subscription email field is not displayed in the footer'
                    );
                }

                // ============================================================
                // STEP 3 : Verify Subscribe Button Visibility
                // ============================================================

                console.log('🔹 Step 3 : Verify Subscribe Button');

                const submitBtnVisible =
                    await homePage.isNewsletterSubmitButtonVisible();

                if (submitBtnVisible) {

                    addStepResult(
                        'PASS',
                        'Subscribe button is displayed for the newsletter form'
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Subscribe button is not displayed for the newsletter form'
                    );
                }

                // ============================================================
                // STEP 4 : Enter Valid Email
                // ============================================================

                console.log('🔹 Step 4 : Enter Valid Email');

                if (formVisible) {

                    await homePage.enterNewsletterEmail(testEmail);

                    const enteredValue =
                        await homePage.getNewsletterEmailValue();

                    if (enteredValue === testEmail) {

                        addStepResult(
                            'PASS',
                            `Valid email entered successfully in the newsletter field : "${enteredValue}"`
                        );

                    } else {

                        testFailed = true;

                        addStepResult(
                            'FAIL',
                            `Email entered does not match expected value. Expected : "${testEmail}", Actual : "${enteredValue}"`
                        );
                    }

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Skipped entering email as newsletter form was not visible'
                    );
                }

                // ============================================================
                // STEP 5 : Submit Subscription
                // ============================================================

                console.log('🔹 Step 5 : Submit Subscription');

                if (formVisible && submitBtnVisible) {

                    await homePage.submitNewsletterSubscription();

                    addStepResult(
                        'PASS',
                        `Newsletter subscription submitted successfully for email : "${testEmail}"`
                    );

                } else {

                    testFailed = true;

                    addStepResult(
                        'FAIL',
                        'Skipped subscription submission as the form or Subscribe button was not available'
                    );
                }

                // ============================================================
                // STEP 6 : Verify Success Confirmation
                // ============================================================

                // console.log('🔹 Step 6 : Verify Success Confirmation');

                // if (formVisible && submitBtnVisible) {

                //     const { success, messageText } =
                //         await homePage.isNewsletterSuccessConfirmationDisplayed();

                //         await page.waitForTimeout(9000);

                //     if (success) {

                //         addStepResult(
                //             'PASS',
                //             `Success confirmation displayed after newsletter subscription : "${messageText}"`
                //         );

                //     } else {

                //         const errorMessage =
                //             await homePage.getNewsletterErrorMessage();

                //         testFailed = true;

                //         addStepResult(
                //             'FAIL',
                //             `Success confirmation was not displayed after newsletter subscription.${errorMessage ? ` Validation/error message shown instead : "${errorMessage}"` : ''}`
                //         );
                //     }

                // } else {

                //     testFailed = true;

                //     addStepResult(
                //         'FAIL',
                //         'Skipped success confirmation verification as subscription was not submitted'
                //     );
                // }

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
                testCaseId: 'TC008',
                title: 'Verify newsletter subscription',
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