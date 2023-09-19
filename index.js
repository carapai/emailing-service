const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
// const imgToPDF = require("./createPDF");
const servers = require("./servers.json");
// const fs = require("fs");
// const { default: axios } = require("axios");
class Webpage {
    static async generatePDF(url, dashboard, type, username, password) {
        const additionalUrl =
            type === "dhis2"
                ? `dhis-web-dashboard/#/${dashboard}/printoipp`
                : `api/apps/Visualisation-Studio/index.html#/dashboards/${dashboard}?action=view&category=uDWxMNyXZeo&periods=WyJMQVNUXzEyX01PTlRIUyJd&organisations=WyJJbXNwVFFQd0NxZCJd&groups=W10%3D&levels=WyIzIl0%3D&display=report`;
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
        await page.goto(`${url}/${additionalUrl}`, {
            waitUntil: "networkidle0",
            timeout: 0,
        });
        await page.emulateMediaType("print");
        const html = await page.content();
        const pdf = await page.pdf({
            // path: `${dashboard}.pdf`,
            printBackground: true,
            format: "a4",
        });
        await browser.close();
        return { pdf, html };
    }
}

class Email {
    static sendEmail(to, subject, text, filename, fileContent, html = "") {
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.gmail.com",
            port: 587,
            secure: false,
            ignoreTLS: false,
        });

        const mailOptions = {
            from: "analysis@hispuganda.org",
            to: to,
            name: "DHIS2 Analytics Insights",
            subject: subject,
            text: text,
            html,
            attachments: [
                {
                    filename: filename,
                    content: fileContent,
                },
            ],
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

(async () => {
    for (const server of servers) {
        for (const dashboard of server.dashboards) {
            const { pdf, html } = await Webpage.generatePDF(
                server.url,
                dashboard.id,
                dashboard.type,
                server.username,
                server.password
            );
            Email.sendEmail(
                "colupot@hispuganda.org",
                "Maternal & Child Health",
                "FYI",
                "dashboard.pdf",
                pdf,
                html
            );
        }
    }
})();
