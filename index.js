const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
// const imgToPDF = require("./createPDF");
const servers = require("./servers.json");
// const fs = require("fs");
// const { default: axios } = require("axios");
class Webpage {
    // static async generatePDF(url) {
    //     const browser = await puppeteer.launch({ headless: true }); // Puppeteer can only generate pdf in headless mode.
    //     const page = await browser.newPage();
    //     await page.goto(url, {
    //         waitUntil: "networkidle0",
    //         networkIdleTimeout: 5000,
    //     }); // Adjust network idle as required.
    //     const pdfConfig = {
    //         format: "A4",
    //         printBackground: true,
    //         margin: {
    //             // Word's default A4 margins
    //             top: "2.54cm",
    //             bottom: "2.54cm",
    //             left: "2.54cm",
    //             right: "2.54cm",
    //         },
    //     };
    //     await page.emulateMedia("screen");
    //     const pdf = await page.pdf(pdfConfig);

    //     await browser.close();

    //     return pdf;
    // }

    static async createDHIS2Dashboard(url, dashboard, username, password) {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--start-maximized",
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 2048,
            height: 1280,
            deviceScaleFactor: 1,
        });

        await page.goto(url, { waitUntil: "networkidle0" });
        await page.type("#j_username", username);
        await page.type("#j_password", password);
        console.log("Logging in");
        await page.click("#submit");
        await page.waitForNavigation();
        console.log("Getting the page");
        await page.goto(`${url}/dhis-web-dashboard/#/${dashboard}/printoipp`, {
            waitUntil: "networkidle0",
            timeout: 0,
        });
        await page.emulateMediaType("print");
        const pdf = await page.pdf({
            printBackground: true,
            format: "a4",
        });
        await browser.close();

        return pdf;
    }
}

class Email {
    static sendEmail(to, subject, text, filename, fileContent) {
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.gmail.com",
            port: 587,
            // secureConnection: true, // Used for Office 365
            // tls: { ciphers: "SSLv3" }, // Used for Office 365
            // auth: {
            //     user: "user", // Update username
            //     pass: "pass", // Update password
            // },
        });

        const mailOptions = {
            from: "analysis@hispuganda.org", // Update from email
            to: to,
            subject: subject,
            text: text,
            // attachments: [
            //     {
            //         filename: filename,
            //         content: fileContent,
            //     },
            // ],
        };
        console.log("sending email");
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }

            console.log("Message sent: %s", info.messageId);
        });
    }
}

// async function createVSDashboard() {
//     const browser = await puppeteer.launch({
//         headless: false,
//         args: ["--start-maximized", "--no-sandbox", "--disable-setuid-sandbox"],
//     });
//     for (const server of servers) {
//         const page = await browser.newPage();
//         await page.setViewport({
//             width: 2048,
//             height: 5000,
//             deviceScaleFactor: 1,
//         });

//         await page.goto(server.url);
//         await page.type("#j_username", server.username);
//         await page.type("#j_password", server.password);
//         console.log("Logging in");
//         await page.click("#submit");
//         await page.waitForNavigation();

//         await page.goto(
//             "http://localhost:8080/dhis-web-dashboard/#/TAMlzYkstb7/printoipp",
//             {
//                 waitUntil: "networkidle0",
//             }
//         );

//         // for (const dashboard of server.dashboards) {
//         //     console.log(`Working on dashboard ${dashboard.id}`);
//         //     await page.goto(
//         //         `${server.url}/api/apps/Visualisation-Studio/index.html#/dashboards/${dashboard.id}?action=view&category=uDWxMNyXZeo&periods=WyJMQVNUXzEyX01PTlRIUyJd&organisations=WyJJbXNwVFFQd0NxZCJd&groups=W10%3D&levels=WyIzIl0%3D&display=report`,
//         //         {
//         //             waitUntil: "networkidle0",
//         //         }
//         //     );
//         await page.emulateMediaType("print");
//         await page.pdf({
//             path: "result.pdf",
//             // margin: {
//             //     top: "100px",
//             //     right: "50px",
//             //     bottom: "100px",
//             //     left: "50px",
//             // },
//             printBackground: true,
//             format: "a4",
//             // height: `${5000}px`,
//         });
//         // }
//         await page.close();
//     }
//     await browser.close();
// }
// async function createDHIS2Dashboard() {
//     const browser = await puppeteer.launch({ headless: false });
//     for (const server of servers) {
//         const page = await browser.newPage();
//         await page.setViewport({ width: 2048, height: 1280 });
//         await page.goto(server.url);

//         await page.type("#j_username", server.username);
//         await page.type("#j_password", server.password);
//         console.log("Logging in");
//         await page.click("#submit");
//         await page.waitForNavigation();
//         for (const dashboard of server.dashboards) {
//             console.log(`Working on dashboard ${dashboard.id}`);
//             await page.goto(
//                 `${server.url}/dhis-web-dashboard/#/${dashboard.id}`,
//                 {
//                     timeout: 0,
//                     waitUntil: "networkidle0",
//                 }
//             );
//             console.log(`Querying dashboard items`);
//             const {
//                 data: { dashboardItems },
//             } = await axios.get(
//                 `${server.url}/api/dashboards/${dashboard.id}.json?fields=dashboardItems[id]`,
//                 {
//                     auth: {
//                         username: server.username,
//                         password: server.password,
//                     },
//                 }
//             );

//             console.log(`Found ${dashboardItems.length} items`);

//             console.log(`Waiting for ${dashboardItems.length} selectors`);
//             const pages = [];
//             for (const { id } of dashboardItems) {
//                 console.log(`Waiting for selector ${id}`);
//                 try {
//                     await page.waitForSelector(
//                         `[data-test="dashboarditem-${id}"]`,
//                         { timeout: 0 }
//                     );
//                     const s = await page.$(`[data-test="dashboarditem-${id}"]`);
//                     await s.scrollIntoView();
//                     const props = await s.getProperties();
//                     console.log(JSON.stringify(props));
//                     console.log(`Getting snapshot for ${id}`);
//                     const image = await s.screenshot();
//                     pages.push(image);
//                 } catch (error) {}
//             }
//             console.log(`Generating pdf from dashboard ${dashboard.id}`);
//             imgToPDF(pages, imgToPDF.sizes.A4).pipe(
//                 fs.createWriteStream(`${dashboard.id}.pdf`)
//             );
//         }
//         await page.close();
//     }
//     await browser.close();
// }

// createVSDashboard();

(async () => {
    for (const server of servers) {
        for (const dashboard of server.dashboards) {
            const buffer = await Webpage.createDHIS2Dashboard(
                server.url,
                dashboard.id,
                server.username,
                server.password
            );
            Email.sendEmail(
                "socaya@hispuganda.org",
                "FYI",
                "This is nice dashboard",
                "dashboard.pdf",
                buffer
            );
        }
    }
})();
