const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://dev.ndpme.go.ug/ndpdb");
    await page.setViewport({ width: 3840, height: 2160 });

    await page.type("#j_username", "manifesto");
    await page.type("#j_password", "Manifesto@123");
    console.log("Logging in");
    await Promise.all([
        page.click("#submit"),
        page.waitForNavigation({
            waitUntil: "networkidle0",
            timeout: 0,
        }),
    ]);
    console.log("Fetching dashboard");
    await page.goto(
        "https://dev.ndpme.go.ug/ndpdb/api/apps/Manifesto-Dashboard/index.html#/dashboards/V7zXpC7oAeQ?action=update&category=NP2Z63pp3ZW&periods=WyJMQVNUXzEyX01PTlRIUyJd&organisations=WyJxamsxdWpkemxzcyJd&groups=W10%3D&levels=WyI0Il0%3D",
        { timeout: 0, waitUntil: "networkidle0" }
    );
    console.log("Taking screenshot");
    await page.screenshot({ path: "system_interface.png" });
    // await page.pdf({
    //     path: "system_interface.pdf",
    //     height: `${2160}px`,
    //     width: `${3840}px`,
    // });

    await browser.close();
})();
