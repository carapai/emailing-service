const exporter = require("highcharts-export-server");

//Export settings
var exportSettings = {
    type: "SVG",
    options: {
        title: {
            text: "My Chart",
        },
        xAxis: {
            categories: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "Mar",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ],
        },
        series: [
            {
                type: "line",
                data: [1, 3, 2, 4],
            },
            {
                type: "line",
                data: [5, 3, 4, 2],
            },
        ],
    },
};

exporter.initPool();

//Perform an export
/*
    Export settings corresponds to the available CLI arguments described
    above.
*/
exporter.export(exportSettings, function (err, res) {
    //The export result is now in res.
    //If the output is not PDF or SVG, it will be base64 encoded (res.data).
    //If the output is a PDF or SVG, it will contain a filename (res.filename).
    console.log(res, err);
    //Kill the pool when we're done with it, and exit the application
    exporter.killPool();
    process.exit(1);
});
