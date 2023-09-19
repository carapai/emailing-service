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
            // text: text,
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
                `<div id="dhis2-app-root">
		<div class="jsx-1964929281 app-shell-adapter">
			<header class="jsx-3809446089 ">
				<div class="jsx-3809446089 main">
					<div data-test="headerbar-logo" class="jsx-2077637423"><a href="../../.." class="jsx-2077637423">
							<div class="jsx-3930434724"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 182"
									class="jsx-3467673193" data-test="dhis2-uicore-logoiconwhite">
									<defs></defs>
									<path fill="#ffffff"
										d="M191.73,60,109,6.34a19.73,19.73,0,0,0-20.32,0L8.31,58.43a12,12,0,0,0-.25,20.63L88.6,134a19.37,19.37,0,0,0,20.37.25l82.76-53.65a11.88,11.88,0,0,0,0-20.59Zm-91,61.45a4.29,4.29,0,0,1-3.49-.05l-77-52.49L97,19.13a4.76,4.76,0,0,1,3.74,0L179.6,70.28Z">
									</path>
									<path fill="#ffffff"
										d="M88.66,47.82,45.1,76.06l13.61,9.33L97,60.61a4.76,4.76,0,0,1,3.74,0l39.37,25.52,14-9.06L109,47.82A19.76,19.76,0,0,0,88.66,47.82Z">
									</path>
									<path fill="#ffffff"
										d="M191.73,101.46l-8.62-5.59-14.05,9.06,10.53,6.83-78.91,51.15a4.37,4.37,0,0,1-3.49,0l-77-52.5,10-6.47L16.55,94.57,8.31,99.91a12,12,0,0,0-.25,20.63L88.6,175.46a19.34,19.34,0,0,0,20.37.24l82.75-53.65a11.88,11.88,0,0,0,0-20.59Z">
									</path>
								</svg></div>
						</a></div>
					<div data-test="headerbar-title" class="jsx-2721515324">DHIS 2 Demo - Sierra Leone - Visualisation
						Studio</div>
					<div class="jsx-3809446089 right-control-spacer"></div>
					<div data-test="headerbar-notifications" class="jsx-55705730"><a
							href="../../../dhis-web-interpretation" data-test="headerbar-interpretations"
							class="jsx-2209899206 message"><svg height="24" viewBox="0 0 24 24" width="24"
								xmlns="http://www.w3.org/2000/svg" color="#ffffff">
								<path
									d="M20 5a2 2 0 012 2v8a2 2 0 01-2 2h-1v3.826a1 1 0 01-1.65.759L12 17H7a2 2 0 01-2-2V7a2 2 0 012-2zm0 2H7v8h5.74L17 18.652V15h3zm-6-5v2H5a1 1 0 00-.993.883L4 5v7H2V5a3 3 0 012.824-2.995L5 2z"
									fill="currentColor"></path>
							</svg><span data-test="headerbar-interpretations-count"
								class="jsx-2209899206">7</span></a><a href="../../../dhis-web-messaging"
							data-test="headerbar-messages" class="jsx-2209899206 interpretation"><svg height="24"
								viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" color="#ffffff">
								<path
									d="M19 5a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2zm0 3.414L13.414 14a2 2 0 01-2.701.117L10.586 14 5 8.415V17h14zM17.584 7H6.415L12 12.586z"
									fill="currentColor"></path>
							</svg><span data-test="headerbar-messages-count" class="jsx-2209899206">199</span></a></div>
					<div data-test="headerbar-apps" class="jsx-2727136053"><button data-test="headerbar-apps-icon"
							class="jsx-2727136053"><svg height="24" viewBox="0 0 24 24" width="24"
								xmlns="http://www.w3.org/2000/svg" color="#ffffff">
								<path
									d="M7 16a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2a1 1 0 011-1zm6 0a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 011-1zm6 0a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 011-1zM7 10a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2a1 1 0 011-1zm6 0a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 011-1zm6 0a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 011-1zM7 4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm6 0a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V5a1 1 0 011-1zm6 0a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V5a1 1 0 011-1z"
									fill="currentColor" fill-rule="evenodd"></path>
							</svg></button></div>
					<div data-test="headerbar-profile" class="jsx-3442481507 headerbar-profile"><button
							class="jsx-3442481507 headerbar-profile-btn">
							<div data-test="headerbar-profile-icon" class="jsx-3366500546 medium">
								<div data-test="headerbar-profile-icon-text" class="jsx-3732622660 text-avatar">
									<div class="jsx-3732622660 text-avatar-initials medium">JT</div>
								</div>
							</div>
						</button></div>
				</div>
			</header>
			<div class="jsx-1964929281 app-shell-app">
				<div class="chakra-stack css-f8cvb4">
					<div class="chakra-stack css-qx6o1z">
						<div class="chakra-stack css-y29wf7" id="q7WUvqe2h1f" style="break-before: page;">
							<div class="chakra-stack css-1vgmlm6" id="q7WUvqe2h1f" data-testid="viz">
								<div class="chakra-stack css-1qss8do">
									<div class="chakra-stack css-1ooltws">
										<div class="chakra-stack css-1xh3lgw">
											<div data-test="dhis2-uicore-dropdownbutton" class="jsx-3163060161"><button
													name="buttonName" data-test="dhis2-uicore-button" type="button"
													class="jsx-441677069 nrm primary">Filters<svg
														xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"
														class="jsx-2347926856 jsx-3163060161 jsx-736002830">
														<path
															d="m5.29289 8.7071c.39053.3905 1.02369.3905 1.41422 0l2.99999-2.99999c.3905-.39053.3905-1.02369 0-1.41422-.3905-.39052-1.0237-.39052-1.4142 0l-2.2929 2.2929-2.29289-2.2929c-.39053-.39052-1.02369-.39052-1.41422 0-.39052.39053-.39052 1.02369 0 1.41422z"
															class="jsx-2347926856"></path>
													</svg></button></div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="chakra-stack css-y29wf7" id="h5CDNH0vgH5" style="break-before: page;">
							<div class="chakra-stack css-1vgmlm6" id="h5CDNH0vgH5" data-testid="viz">
								<div class="chakra-stack css-1qss8do">
									<div class="chakra-stack css-nr8bhu">
										<div class="chakra-stack css-1b11vcz">
											<div class="chakra-stack css-123wihu">
												<p class="chakra-text css-xbz5w0">This is nice</p>
											</div>
											<div class="chakra-stack css-kdgj8g">
												<div class="js-plotly-plot" style="width: 100%; height: 100%;">
													<div class="plot-container plotly">
														<div class="user-select-none svg-container"
															style="position: relative; width: 100%; height: 450px;"><svg
																class="main-svg" xmlns="http://www.w3.org/2000/svg"
																xmlns:xlink="http://www.w3.org/1999/xlink" width="780"
																height="450" style="background: rgb(255, 255, 255);">
																<defs id="defs-68ed20">
																	<g class="clips">
																		<clipPath id="clip68ed20xyplot"
																			class="plotclip">
																			<rect width="690" height="295"></rect>
																		</clipPath>
																		<clipPath class="axesclip" id="clip68ed20x">
																			<rect x="60" y="0" width="690" height="450">
																			</rect>
																		</clipPath>
																		<clipPath class="axesclip" id="clip68ed20y">
																			<rect x="0" y="0" width="780" height="295">
																			</rect>
																		</clipPath>
																		<clipPath class="axesclip" id="clip68ed20xy">
																			<rect x="60" y="0" width="690" height="295">
																			</rect>
																		</clipPath>
																	</g>
																	<g class="gradients"></g>
																	<g class="patterns"></g>
																</defs>
																<g class="bglayer"></g>
																<g class="draglayer cursor-crosshair">
																	<g class="xy">
																		<rect class="nsewdrag drag" data-subplot="xy"
																			x="60" y="0" width="690" height="295"
																			style="fill: transparent; stroke-width: 0; pointer-events: all;">
																		</rect>
																		<rect class="nwdrag drag cursor-nw-resize"
																			data-subplot="xy" x="40" y="-20" width="20"
																			height="20"
																			style="fill: transparent; stroke-width: 0; pointer-events: all;">
																		</rect>
																		<rect class="nedrag drag cursor-ne-resize"
																			data-subplot="xy" x="750" y="-20" width="20"
																			height="20"
																			style="fill: transparent; stroke-width: 0; pointer-events: all;">
																		</rect>
																		<rect class="swdrag drag cursor-sw-resize"
																			data-subplot="xy" x="40" y="295" width="20"
																			height="20"
																			style="fill: transparent; stroke-width: 0; pointer-events: all;">
																		</rect>
																		<rect class="sedrag drag cursor-se-resize"
																			data-subplot="xy" x="750" y="295" width="20"
																			height="20"
																			style="fill: transparent; stroke-width: 0; pointer-events: all;">
																		</rect>
																		<rect class="ewdrag drag cursor-ew-resize"
																			data-subplot="xy" x="129" y="300.5"
																			width="552" height="20"
																			style="fill: transparent; stroke-width: 0; pointer-events: all;">
																		</rect>
																		<rect class="wdrag drag cursor-w-resize"
																			data-subplot="xy" x="60" y="300.5"
																			width="69" height="20"
																			style="fill: transparent; stroke-width: 0; pointer-events: all;">
																		</rect>
																		<rect class="edrag drag cursor-e-resize"
																			data-subplot="xy" x="681" y="300.5"
																			width="69" height="20"
																			style="fill: transparent; stroke-width: 0; pointer-events: all;">
																		</rect>
																		<rect class="nsdrag drag cursor-ns-resize"
																			data-subplot="xy" x="34.5" y="29.5"
																			width="20" height="236"
																			style="fill: transparent; stroke-width: 0; pointer-events: all;">
																		</rect>
																		<rect class="sdrag drag cursor-s-resize"
																			data-subplot="xy" x="34.5" y="265.5"
																			width="20" height="29.5"
																			style="fill: transparent; stroke-width: 0; pointer-events: all;">
																		</rect>
																		<rect class="ndrag drag cursor-n-resize"
																			data-subplot="xy" x="34.5" y="0" width="20"
																			height="29.5"
																			style="fill: transparent; stroke-width: 0; pointer-events: all;">
																		</rect>
																	</g>
																</g>
																<g class="layer-below">
																	<g class="imagelayer"></g>
																	<g class="shapelayer"></g>
																</g>
																<g class="cartesianlayer">
																	<g class="subplot xy">
																		<g class="layer-subplot">
																			<g class="shapelayer"></g>
																			<g class="imagelayer"></g>
																		</g>
																		<g class="minor-gridlayer">
																			<g class="x"></g>
																			<g class="y"></g>
																		</g>
																		<g class="gridlayer">
																			<g class="x"></g>
																			<g class="y">
																				<path class="ygrid crisp"
																					transform="translate(0,286.6)"
																					d="M60,0h690"
																					style="stroke: rgb(238, 238, 238); stroke-opacity: 1; stroke-width: 1px;">
																				</path>
																				<path class="ygrid crisp"
																					transform="translate(0,241.7)"
																					d="M60,0h690"
																					style="stroke: rgb(238, 238, 238); stroke-opacity: 1; stroke-width: 1px;">
																				</path>
																				<path class="ygrid crisp"
																					transform="translate(0,196.79)"
																					d="M60,0h690"
																					style="stroke: rgb(238, 238, 238); stroke-opacity: 1; stroke-width: 1px;">
																				</path>
																				<path class="ygrid crisp"
																					transform="translate(0,151.88)"
																					d="M60,0h690"
																					style="stroke: rgb(238, 238, 238); stroke-opacity: 1; stroke-width: 1px;">
																				</path>
																				<path class="ygrid crisp"
																					transform="translate(0,106.97)"
																					d="M60,0h690"
																					style="stroke: rgb(238, 238, 238); stroke-opacity: 1; stroke-width: 1px;">
																				</path>
																				<path class="ygrid crisp"
																					transform="translate(0,62.06)"
																					d="M60,0h690"
																					style="stroke: rgb(238, 238, 238); stroke-opacity: 1; stroke-width: 1px;">
																				</path>
																				<path class="ygrid crisp"
																					transform="translate(0,17.15)"
																					d="M60,0h690"
																					style="stroke: rgb(238, 238, 238); stroke-opacity: 1; stroke-width: 1px;">
																				</path>
																			</g>
																		</g>
																		<g class="zerolinelayer"></g>
																		<path class="xlines-below"></path>
																		<path class="ylines-below"></path>
																		<g class="overlines-below"></g>
																		<g class="xaxislayer-below"></g>
																		<g class="yaxislayer-below"></g>
																		<g class="overaxes-below"></g>
																		<g class="plot" transform="translate(60,0)"
																			clip-path="url(#clip68ed20xyplot)">
																			<g class="scatterlayer mlayer">
																				<g class="trace scatter tracec186e3"
																					style="stroke-miterlimit: 2; opacity: 1;">
																					<g class="fills"></g>
																					<g class="errorbars"></g>
																					<g class="lines">
																						<path class="js-line"
																							d="M38.25,214.53L94.02,243.04L149.8,228.9L205.57,252.92L261.34,271.56L317.11,245.96L372.89,249.55L428.66,227.77L484.43,229.57L540.2,228.67L595.98,237.2L651.75,235.41"
																							style="vector-effect: non-scaling-stroke; fill: none; stroke: rgb(31, 119, 180); stroke-opacity: 1; stroke-width: 2px; opacity: 1;">
																						</path>
																					</g>
																					<g class="points">
																						<path class="point"
																							transform="translate(38.25,214.53)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(94.02,243.04)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(149.8,228.9)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(205.57,252.92)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(261.34,271.56)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(317.11,245.96)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(372.89,249.55)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(428.66,227.77)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(484.43,229.57)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(540.2,228.67)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(595.98,237.2)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(651.75,235.41)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																						</path>
																					</g>
																					<g class="text"></g>
																				</g>
																				<g class="trace scatter traceaf9fb8"
																					style="stroke-miterlimit: 2; opacity: 1;">
																					<g class="fills"></g>
																					<g class="errorbars"></g>
																					<g class="lines">
																						<path class="js-line"
																							d="M38.25,160.19L94.02,203.3L149.8,164.9L205.57,216.32L261.34,205.54L317.11,188.48L372.89,198.58L428.66,178.6L484.43,164.68L540.2,159.51L595.98,173.21L651.75,175.46"
																							style="vector-effect: non-scaling-stroke; fill: none; stroke: rgb(255, 127, 14); stroke-opacity: 1; stroke-width: 2px; opacity: 1;">
																						</path>
																					</g>
																					<g class="points">
																						<path class="point"
																							transform="translate(38.25,160.19)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(94.02,203.3)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(149.8,164.9)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(205.57,216.32)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(261.34,205.54)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(317.11,188.48)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(372.89,198.58)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(428.66,178.6)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(484.43,164.68)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(540.2,159.51)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(595.98,173.21)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(651.75,175.46)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																						</path>
																					</g>
																					<g class="text"></g>
																				</g>
																				<g class="trace scatter tracec2a6a0"
																					style="stroke-miterlimit: 2; opacity: 1;">
																					<g class="fills"></g>
																					<g class="errorbars"></g>
																					<g class="lines">
																						<path class="js-line"
																							d="M38.25,102.7L94.02,156.82L149.8,113.71L205.57,166.92L261.34,147.16L317.11,113.03L372.89,135.94L428.66,116.63L484.43,79.35L540.2,69.25L595.98,106.3L651.75,114.38"
																							style="vector-effect: non-scaling-stroke; fill: none; stroke: rgb(44, 160, 44); stroke-opacity: 1; stroke-width: 2px; opacity: 1;">
																						</path>
																					</g>
																					<g class="points">
																						<path class="point"
																							transform="translate(38.25,102.7)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(94.02,156.82)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(149.8,113.71)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(205.57,166.92)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(261.34,147.16)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(317.11,113.03)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(372.89,135.94)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(428.66,116.63)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(484.43,79.35)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(540.2,69.25)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(595.98,106.3)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(651.75,114.38)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																						</path>
																					</g>
																					<g class="text"></g>
																				</g>
																				<g class="trace scatter trace6b0802"
																					style="stroke-miterlimit: 2; opacity: 1;">
																					<g class="fills"></g>
																					<g class="errorbars"></g>
																					<g class="lines">
																						<path class="js-line"
																							d="M38.25,261.01L94.02,255.17L149.8,276.5L205.57,252.25L261.34,240.12L317.11,251.8L372.89,258.09L428.66,250L484.43,226.65L540.2,254.72L595.98,256.52L651.75,256.96"
																							style="vector-effect: non-scaling-stroke; fill: none; stroke: rgb(214, 39, 40); stroke-opacity: 1; stroke-width: 2px; opacity: 1;">
																						</path>
																					</g>
																					<g class="points">
																						<path class="point"
																							transform="translate(38.25,261.01)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(94.02,255.17)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(149.8,276.5)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(205.57,252.25)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(261.34,240.12)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(317.11,251.8)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(372.89,258.09)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(428.66,250)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(484.43,226.65)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(540.2,254.72)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(595.98,256.52)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(651.75,256.96)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																						</path>
																					</g>
																					<g class="text"></g>
																				</g>
																				<g class="trace scatter trace637c46"
																					style="stroke-miterlimit: 2; opacity: 1;">
																					<g class="fills"></g>
																					<g class="errorbars"></g>
																					<g class="lines">
																						<path class="js-line"
																							d="M38.25,81.6L94.02,137.28L149.8,111.01L205.57,153.23L261.34,118.87L317.11,109.66L372.89,134.14L428.66,91.25L484.43,18.5L540.2,70.14L595.98,91.03L651.75,97.76"
																							style="vector-effect: non-scaling-stroke; fill: none; stroke: rgb(148, 103, 189); stroke-opacity: 1; stroke-width: 2px; opacity: 1;">
																						</path>
																					</g>
																					<g class="points">
																						<path class="point"
																							transform="translate(38.25,81.6)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(94.02,137.28)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(149.8,111.01)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(205.57,153.23)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(261.34,118.87)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(317.11,109.66)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(372.89,134.14)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(428.66,91.25)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(484.43,18.5)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(540.2,70.14)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(595.98,91.03)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																						<path class="point"
																							transform="translate(651.75,97.76)"
																							d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																							style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																						</path>
																					</g>
																					<g class="text"></g>
																				</g>
																			</g>
																		</g>
																		<g class="overplot"></g>
																		<path class="xlines-above crisp" d="M0,0"
																			style="fill: none;"></path>
																		<path class="ylines-above crisp" d="M0,0"
																			style="fill: none;"></path>
																		<g class="overlines-above"></g>
																		<g class="xaxislayer-above">
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="September 2022"
																					data-math="N"
																					transform="translate(98.25,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">September
																					2022</text></g>
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="October 2022"
																					data-math="N"
																					transform="translate(154.01999999999998,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">October
																					2022</text></g>
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="November 2022"
																					data-math="N"
																					transform="translate(209.8,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">November
																					2022</text></g>
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="December 2022"
																					data-math="N"
																					transform="translate(265.57,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">December
																					2022</text></g>
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="January 2023"
																					data-math="N"
																					transform="translate(321.34,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">January
																					2023</text></g>
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="February 2023"
																					data-math="N"
																					transform="translate(377.11,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">February
																					2023</text></g>
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="March 2023"
																					data-math="N"
																					transform="translate(432.89,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">March
																					2023</text></g>
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="April 2023"
																					data-math="N"
																					transform="translate(488.66,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">April
																					2023</text></g>
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="May 2023"
																					data-math="N"
																					transform="translate(544.4300000000001,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">May
																					2023</text></g>
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="June 2023"
																					data-math="N"
																					transform="translate(600.2,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">June
																					2023</text></g>
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="July 2023"
																					data-math="N"
																					transform="translate(655.98,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">July
																					2023</text></g>
																			<g class="xtick"><text text-anchor="start"
																					x="0" y="313"
																					data-unformatted="August 2023"
																					data-math="N"
																					transform="translate(711.75,0) rotate(30,0,307)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">August
																					2023</text></g>
																		</g>
																		<g class="yaxislayer-above">
																			<g class="ytick"><text text-anchor="end"
																					x="54" y="4.199999999999999"
																					data-unformatted="20" data-math="N"
																					transform="translate(0,286.6)"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;">20</text>
																			</g>
																			<g class="ytick"><text text-anchor="end"
																					x="54" y="4.199999999999999"
																					data-unformatted="40" data-math="N"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;"
																					transform="translate(0,241.7)">40</text>
																			</g>
																			<g class="ytick"><text text-anchor="end"
																					x="54" y="4.199999999999999"
																					data-unformatted="60" data-math="N"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;"
																					transform="translate(0,196.79)">60</text>
																			</g>
																			<g class="ytick"><text text-anchor="end"
																					x="54" y="4.199999999999999"
																					data-unformatted="80" data-math="N"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;"
																					transform="translate(0,151.88)">80</text>
																			</g>
																			<g class="ytick"><text text-anchor="end"
																					x="54" y="4.199999999999999"
																					data-unformatted="100" data-math="N"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;"
																					transform="translate(0,106.97)">100</text>
																			</g>
																			<g class="ytick"><text text-anchor="end"
																					x="54" y="4.199999999999999"
																					data-unformatted="120" data-math="N"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;"
																					transform="translate(0,62.06)">120</text>
																			</g>
																			<g class="ytick"><text text-anchor="end"
																					x="54" y="4.199999999999999"
																					data-unformatted="140" data-math="N"
																					style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre; opacity: 1;"
																					transform="translate(0,17.15)">140</text>
																			</g>
																		</g>
																		<g class="overaxes-above"></g>
																	</g>
																</g>
																<g class="polarlayer"></g>
																<g class="smithlayer"></g>
																<g class="ternarylayer"></g>
																<g class="geolayer"></g>
																<g class="funnelarealayer"></g>
																<g class="pielayer"></g>
																<g class="iciclelayer"></g>
																<g class="treemaplayer"></g>
																<g class="sunburstlayer"></g>
																<g class="glimages"></g>
															</svg>
															<div class="gl-container"></div><svg class="main-svg"
																xmlns="http://www.w3.org/2000/svg"
																xmlns:xlink="http://www.w3.org/1999/xlink" width="780"
																height="450">
																<defs id="topdefs-68ed20">
																	<g class="clips"></g>
																	<clipPath id="legend68ed20">
																		<rect width="360" height="67" x="0" y="0">
																		</rect>
																	</clipPath>
																</defs>
																<g class="indicatorlayer"></g>
																<g class="layer-above">
																	<g class="imagelayer"></g>
																	<g class="shapelayer"></g>
																</g>
																<g class="selectionlayer"></g>
																<g class="infolayer">
																	<g class="legend" pointer-events="all"
																		transform="translate(277,383)">
																		<rect class="bg" shape-rendering="crispEdges"
																			style="stroke: rgb(68, 68, 68); stroke-opacity: 1; fill: rgb(255, 255, 255); fill-opacity: 1; stroke-width: 0px;"
																			width="360" height="67" x="0" y="0"></rect>
																		<g class="scrollbox" transform=""
																			clip-path="url(#legend68ed20)">
																			<g class="groups">
																				<g class="traces"
																					transform="translate(0,14.5)"
																					style="opacity: 1;"><text
																						class="legendtext"
																						text-anchor="start" x="40"
																						y="4.680000000000001"
																						data-unformatted="ANC => 4 Coverage"
																						data-math="N"
																						style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre;">ANC
																						=&gt; 4 Coverage</text>
																					<g class="layers"
																						style="opacity: 1;">
																						<g class="legendfill"></g>
																						<g class="legendlines">
																							<path class="js-line"
																								d="M5,0h30"
																								style="fill: none; stroke: rgb(31, 119, 180); stroke-opacity: 1; stroke-width: 2px;">
																							</path>
																						</g>
																						<g class="legendsymbols">
																							<g class="legendpoints">
																								<path class="scatterpts"
																									transform="translate(20,0)"
																									d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																									style="opacity: 1; stroke-width: 0px; fill: rgb(31, 119, 180); fill-opacity: 1;">
																								</path>
																							</g>
																						</g>
																					</g>
																					<rect class="legendtoggle"
																						pointer-events="all" x="0"
																						y="-9.5" width="164.4453125"
																						height="19"
																						style="cursor: pointer; fill: rgb(0, 0, 0); fill-opacity: 0;">
																					</rect>
																				</g>
																				<g class="traces"
																					transform="translate(179.8515625,14.5)"
																					style="opacity: 1;"><text
																						class="legendtext"
																						text-anchor="start" x="40"
																						y="4.680000000000001"
																						data-unformatted="ANC 3 Coverage"
																						data-math="N"
																						style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre;">ANC
																						3 Coverage</text>
																					<g class="layers"
																						style="opacity: 1;">
																						<g class="legendfill"></g>
																						<g class="legendlines">
																							<path class="js-line"
																								d="M5,0h30"
																								style="fill: none; stroke: rgb(255, 127, 14); stroke-opacity: 1; stroke-width: 2px;">
																							</path>
																						</g>
																						<g class="legendsymbols">
																							<g class="legendpoints">
																								<path class="scatterpts"
																									transform="translate(20,0)"
																									d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																									style="opacity: 1; stroke-width: 0px; fill: rgb(255, 127, 14); fill-opacity: 1;">
																								</path>
																							</g>
																						</g>
																					</g>
																					<rect class="legendtoggle"
																						pointer-events="all" x="0"
																						y="-9.5" width="140.5859375"
																						height="19"
																						style="cursor: pointer; fill: rgb(0, 0, 0); fill-opacity: 0;">
																					</rect>
																				</g>
																				<g class="traces"
																					transform="translate(0,33.5)"
																					style="opacity: 1;"><text
																						class="legendtext"
																						text-anchor="start" x="40"
																						y="4.680000000000001"
																						data-unformatted="ANC 2 Coverage"
																						data-math="N"
																						style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre;">ANC
																						2 Coverage</text>
																					<g class="layers"
																						style="opacity: 1;">
																						<g class="legendfill"></g>
																						<g class="legendlines">
																							<path class="js-line"
																								d="M5,0h30"
																								style="fill: none; stroke: rgb(44, 160, 44); stroke-opacity: 1; stroke-width: 2px;">
																							</path>
																						</g>
																						<g class="legendsymbols">
																							<g class="legendpoints">
																								<path class="scatterpts"
																									transform="translate(20,0)"
																									d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																									style="opacity: 1; stroke-width: 0px; fill: rgb(44, 160, 44); fill-opacity: 1;">
																								</path>
																							</g>
																						</g>
																					</g>
																					<rect class="legendtoggle"
																						pointer-events="all" x="0"
																						y="-9.5" width="140.5859375"
																						height="19"
																						style="cursor: pointer; fill: rgb(0, 0, 0); fill-opacity: 0;">
																					</rect>
																				</g>
																				<g class="traces"
																					transform="translate(179.8515625,33.5)"
																					style="opacity: 1;"><text
																						class="legendtext"
																						text-anchor="start" x="40"
																						y="4.680000000000001"
																						data-unformatted="ANC 1-3 Dropout Rate"
																						data-math="N"
																						style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre;">ANC
																						1-3 Dropout Rate</text>
																					<g class="layers"
																						style="opacity: 1;">
																						<g class="legendfill"></g>
																						<g class="legendlines">
																							<path class="js-line"
																								d="M5,0h30"
																								style="fill: none; stroke: rgb(214, 39, 40); stroke-opacity: 1; stroke-width: 2px;">
																							</path>
																						</g>
																						<g class="legendsymbols">
																							<g class="legendpoints">
																								<path class="scatterpts"
																									transform="translate(20,0)"
																									d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																									style="opacity: 1; stroke-width: 0px; fill: rgb(214, 39, 40); fill-opacity: 1;">
																								</path>
																							</g>
																						</g>
																					</g>
																					<rect class="legendtoggle"
																						pointer-events="all" x="0"
																						y="-9.5" width="177.3515625"
																						height="19"
																						style="cursor: pointer; fill: rgb(0, 0, 0); fill-opacity: 0;">
																					</rect>
																				</g>
																				<g class="traces"
																					transform="translate(0,52.5)"
																					style="opacity: 1;"><text
																						class="legendtext"
																						text-anchor="start" x="40"
																						y="4.680000000000001"
																						data-unformatted="ANC 1 Coverage"
																						data-math="N"
																						style="font-family: &quot;Open Sans&quot;, verdana, arial, sans-serif; font-size: 12px; fill: rgb(68, 68, 68); fill-opacity: 1; white-space: pre;">ANC
																						1 Coverage</text>
																					<g class="layers"
																						style="opacity: 1;">
																						<g class="legendfill"></g>
																						<g class="legendlines">
																							<path class="js-line"
																								d="M5,0h30"
																								style="fill: none; stroke: rgb(148, 103, 189); stroke-opacity: 1; stroke-width: 2px;">
																							</path>
																						</g>
																						<g class="legendsymbols">
																							<g class="legendpoints">
																								<path class="scatterpts"
																									transform="translate(20,0)"
																									d="M3,0A3,3 0 1,1 0,-3A3,3 0 0,1 3,0Z"
																									style="opacity: 1; stroke-width: 0px; fill: rgb(148, 103, 189); fill-opacity: 1;">
																								</path>
																							</g>
																						</g>
																					</g>
																					<rect class="legendtoggle"
																						pointer-events="all" x="0"
																						y="-9.5" width="140.5859375"
																						height="19"
																						style="cursor: pointer; fill: rgb(0, 0, 0); fill-opacity: 0;">
																					</rect>
																				</g>
																			</g>
																		</g>
																		<rect class="scrollbar" rx="20" ry="3" width="0"
																			height="0"
																			style="fill: rgb(128, 139, 164); fill-opacity: 1;"
																			x="0" y="0"></rect>
																	</g>
																	<g class="g-gtitle"></g>
																	<g class="g-xtitle"></g>
																	<g class="g-ytitle"></g>
																</g>
																<g class="menulayer"></g>
																<g class="zoomlayer"></g>
															</svg>
															<div class="modebar-container"
																style="position: absolute; top: 0px; right: 0px; width: 100%;">
																<div id="modebar-68ed20" class="modebar">
																	<div class="modebar-group"><a rel="tooltip"
																			class="modebar-btn"
																			data-title="Download plot"
																			data-toggle="false" data-gravity="n"><svg
																				viewBox="0 0 1000 1000" class="icon"
																				height="1em" width="1em">
																				<path
																					d="m500 450c-83 0-150-67-150-150 0-83 67-150 150-150 83 0 150 67 150 150 0 83-67 150-150 150z m400 150h-120c-16 0-34 13-39 29l-31 93c-6 15-23 28-40 28h-340c-16 0-34-13-39-28l-31-94c-6-15-23-28-40-28h-120c-55 0-100-45-100-100v-450c0-55 45-100 100-100h800c55 0 100 45 100 100v450c0 55-45 100-100 100z m-400-550c-138 0-250 112-250 250 0 138 112 250 250 250 138 0 250-112 250-250 0-138-112-250-250-250z m365 380c-19 0-35 16-35 35 0 19 16 35 35 35 19 0 35-16 35-35 0-19-16-35-35-35z"
																					transform="matrix(1 0 0 -1 0 850)">
																				</path>
																			</svg></a></div>
																	<div class="modebar-group"></div>
																	<div class="modebar-group"></div>
																</div>
															</div><svg class="main-svg"
																xmlns="http://www.w3.org/2000/svg"
																xmlns:xlink="http://www.w3.org/1999/xlink" width="780"
																height="450">
																<g class="hoverlayer"></g>
															</svg>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="chakra-stack css-15ww6pz" id="QNXvhZkXgfY" style="break-before: page;">
							<div class="chakra-stack css-1vgmlm6" id="QNXvhZkXgfY" data-testid="viz">
								<div class="chakra-stack css-1qss8do">
									<div class="chakra-stack css-nr8bhu">
										<div class="chakra-stack css-49yhrv">
											<div class="css-8atqhb">
												<div class="css-r1yjsm">
													<table role="table" class="chakra-table css-2uu92y">
														<thead class="css-0">
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<th rowspan="1" class="css-1as7ilt">ou</th>
																<th rowspan="1" class="css-1as7ilt">pe</th>
																<th class="font-bold css-d7vemh" colspan="1">This is
																	nice</th>
															</tr>
														</thead>
														<tbody class="css-0">
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	O6uvpzGd5pu</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">169.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa">144.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa">193.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa">110.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">127.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">137.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">124.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">133.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">154.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">142.4</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">170.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">144.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	PMa2VCrupOd</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">101.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa">115.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa">100.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa">111.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">114.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">87.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">90.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">89.4</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">125.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">115.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">99.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">88.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	TEQlaapDQoK</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">105.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa">89.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa">104.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa"></td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">99.4</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">96.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">82.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">94.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">164.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">137.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">115.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">110.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	Vth0fbpFcsO</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">62.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa"></td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa"></td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa">78.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">49.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">89.1</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">65.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">66.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">54.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">63.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">58.1</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">50.1</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	at6UHUQatSo</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">123.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa">118.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa">132.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa">115.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">92.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">96.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">89.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">151.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">200.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">142.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">119.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">123.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	bL4ooGhyHRQ</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">106.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa">0.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa">0.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa">0.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">121.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">109.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">98.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">132.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">133.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">136.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">123.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">104.1</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	eIQbndfxQMb</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">153.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa">144.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa">148.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa">125.4</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">89.4</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">104.1</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">91.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">98.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">162.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">140.4</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">111.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">135.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	fdc6uOvgoji</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">79.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa">79.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa"></td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa">81.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">86.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">87.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">78.4</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">92.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">120.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">100.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">90.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">92.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	jUb8gELQApl</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">79.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa">73.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa">84.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa">74.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">77.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">80.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">77.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">82.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">95.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">89.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">86.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">84.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	jmIPBj66vD6</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">130.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa">111.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa">113.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa">99.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">124.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">135.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">100.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">129.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">130.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">123.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">128.4</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">105.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	kJq2mPyFEHo</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">97.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa">94.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa">96.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa">88.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">89.3</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">89.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">81.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">97.9</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">137.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">97.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">84.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">84.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	lc3eMKXaEfw</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">118.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa"></td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa">109.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa"></td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">97.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">94.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">82.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">87.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">136.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">130.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">118.4</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">112.1</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="12" class="css-1ovb7lv">
																	qhqAxPSTUXp</td>
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202209</td>
																<td role="gridcell" class="css-gdsjxa">98.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202210</td>
																<td role="gridcell" class="css-gdsjxa"></td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202211</td>
																<td role="gridcell" class="css-gdsjxa">115.6</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202212</td>
																<td role="gridcell" class="css-gdsjxa"></td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202301</td>
																<td role="gridcell" class="css-gdsjxa">72.8</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202302</td>
																<td role="gridcell" class="css-gdsjxa">76.2</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202303</td>
																<td role="gridcell" class="css-gdsjxa">73.0</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202304</td>
																<td role="gridcell" class="css-gdsjxa">73.5</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202305</td>
																<td role="gridcell" class="css-gdsjxa">90.4</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202306</td>
																<td role="gridcell" class="css-gdsjxa">58.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202307</td>
																<td role="gridcell" class="css-gdsjxa">64.7</td>
															</tr>
															<tr role="row" class="css-0" style="break-inside: avoid;">
																<td role="gridcell" rowspan="1" class="css-1ovb7lv">
																	202308</td>
																<td role="gridcell" class="css-gdsjxa">87.1</td>
															</tr>
														</tbody>
													</table>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>`
            );
        }
    }
})();
