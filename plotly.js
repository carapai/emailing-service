const fsPromises = require("fs").promises;
const jsdom = require("jsdom");

const pathToPlotly = require.resolve("plotly.js-dist");

const fig = { data: [{ y: [1, 2, 1] }] };
const opts = { format: "svg", imageDataOnly: true };

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.sendTo(console);

const w = new jsdom.JSDOM("", { runScripts: "dangerously", virtualConsole })
    .window;

// mock a few things that JSDOM doesn't support out-of-the-box
w.HTMLCanvasElement.prototype.getContext = function () {
    return null;
};
w.URL.createObjectURL = function () {
    return null;
};

fsPromises
    .readFile(pathToPlotly, "utf-8")
    .then(w.eval)
    .then(() => w.Plotly.toImage(fig, opts))
    .then((img) => fsPromises.writeFile("fig.svg", img))
    .catch(console.warn);
