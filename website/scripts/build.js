build();
async function build() {
    const fs = require("fs");
    const sass = require("sass");
    const { minify } = require("terser");

    fs.mkdirSync("website/dist/", { recursive: true })

    fs.readdirSync("website/dist/", { withFileTypes: true })
        .filter(entry => entry.name != "data")
        .forEach(entry => {
            if (entry.isDirectory){
                fs.rmdirSync(`website/dist/${entry.name}`, { recursive: true })
            } else {
                fs.unlinkSync(`website/dist/${entry.name}`)
            }
    })

    html();

    const scss_files = fs.readdirSync(`website/src/css`)
        .filter(file => file.includes(".scss"))
        .map(file => file.split(".")[0])

    for (file of scss_files) {
        css(file);
    }

    const js_folders = fs.readdirSync(`website/src/js`, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(folder => folder.name);

    for await (folder of js_folders) {
        await js(folder);
    }

    data();

    function html() {
        fs.mkdirSync("website/dist/", { recursive: true })
        fs.copyFileSync("website/src/index.html", "website/dist/index.html");
    }

    function css(file) {
        fs.mkdirSync("website/dist/css/", { recursive: true })
        const result = sass.renderSync({
            file: `website/src/css/${file}.scss`,
            outputStyle: "compressed"
        });
        fs.writeFileSync(`website/dist/css/${file}.css`, result.css)
    }

    async function js(folder){
        fs.mkdirSync("website/dist/js/", { recursive: true })

        const files = fs.readdirSync(`website/src/js/${folder}`).filter(file => !file.startsWith("_"));

        components = {}
        files.forEach(file => {
            components[file] = fs.readFileSync(`website/src/js/${folder}/${file}`, "utf8")
        });

        const result = await minify(components);

        fs.writeFileSync(`website/dist/js/${folder}.js`, result.code, "utf8")
    }

    function data(){
        fs.copyFileSync("website/src/js/data.json", "website/dist/js/data.json");
    }
}
