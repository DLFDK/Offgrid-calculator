inline();
function inline() {
    const fs = require("fs");

    let html, css, js;
    try {
        html = fs.readFileSync("website/dist/index.html", "utf8");
        css = fs.readFileSync("website/dist/css/index.css", "utf8");
        js = fs.readFileSync("website/dist/js/index.js", "utf8");
    } catch (error) {
        console.log(error.message);
        return;
    }

    html = html.replace('<link rel="stylesheet" href="css/index.css">', `<style>${css}</style>`);
    html = html.replace('<script defer src="js/index.js"></script>', `<script>${js}</script>`);
    fs.writeFileSync("website/dist/index.html", html, "utf8")
    // fs.rmdirSync("website/dist/css", { recursive: true });
    // fs.rmdirSync("website/dist/js", { recursive: true });
}