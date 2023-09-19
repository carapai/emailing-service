const puppeteer = require("puppeteer-extra");
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

puppeteer
    .launch({
        headless: true,
        protocolTimeout: 240000,
        devtools: false,
        args: [
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu",
            "--lang=en-US,en",
        ],
    })
    .then(async (browser) => {
        const page = await browser.newPage();
        await page.setViewport({
            width: 3840,
            height: 2160,
            isLandscape: true,
        });
        await page.goto("http://localhost:8080");

        await page.type("#j_username", "admin");
        await page.type("#j_password", "district");
        await page.click("#submit");
        await page.waitForNavigation({
            waitUntil: "networkidle0",
            timeout: 0,
        });
        // await page.waitForSelector(".reactgriditem-i06K10NkglX", {
        //     timeout: 5000,
        // });

        // logo is the element you want to capture
        // await logo.screenshot({
        //     path: "testim.png",
        // });

        await page.screenshot({ path: "api.png" });

        await page.close(); // Close the website
        await browser.close();

        // console.log(`Testing adblocker plugin..`);
        // await page.goto("https://www.vanityfair.com");
        // await page.waitForTimeout(1000);
        // await page.screenshot({ path: "adblocker.png", fullPage: true });

        // console.log(`Testing the stealth plugin..`);
        // await page.goto("https://bot.sannysoft.com");
        // await page.waitForTimeout(5000);
        // await page.screenshot({ path: "stealth.png", fullPage: true });

        // console.log(`All done, check the screenshots. ✨`);
        // await browser.close();
    });
