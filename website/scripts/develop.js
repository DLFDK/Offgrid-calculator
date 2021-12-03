develop();
async function develop() {
    const fs = require("fs");
    const sass = require("sass");
    const { minify } = require("terser");
    const browserSync = require('browser-sync').create();
    const { createProxyMiddleware } = require('http-proxy-middleware');
    const chokidar = require('chokidar');

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

    server();
    

    function css(file) {
        const result = sass.renderSync({
            file: `website/src/css/${file}.scss`,
            sourceMap: true,
            outFile: `${file}.css`
        });
        fs.writeFileSync(`website/src/css/${file}.css`, result.css);
        fs.writeFileSync(`website/src/css/${file}.css.map`, result.map);
    }

    async function js(folder) {
        const files = fs.readdirSync(`website/src/js/${folder}`).filter(file => !file.startsWith("_"));

        components = {}
        files.forEach(file => {
            components[file] = fs.readFileSync(`website/src/js/${folder}/${file}`, "utf8");
        });

        result = await minify(components, {
            compress: false,
            mangle: false,
            format: {
                beautify: true
            },
            sourceMap: {
                filename: `${folder}.js`,
                url: `${folder}.js.map`
            }
        });

        fs.writeFileSync(`website/src/js/${folder}.js`, result.code, "utf8");
        fs.writeFileSync(`website/src/js/${folder}.js.map`, result.map, "utf8");
    }

    function server() {
        const proxy = createProxyMiddleware('/api', {
            target: 'https://re.jrc.ec.europa.eu/',
            changeOrigin: true,
            // pathRewrite: {
            //     '^/api*': '/' // remove base path
            // }
        });

        browserSync.init({
            server: {
                baseDir: './website/src/',
                port: 3000,
                middleware: [
                    proxy
                ]
            },
            startPath: '/'
        });

        js_folders.forEach(folder => {
            chokidar.watch(`./website/src/js/${folder}/*.js`, { ignoreInitial: true }).on('all', async (event, path) => {
                console.log(event, path);
                process.stdout.write(`Rebuilding ${folder}.js... `)
                await js(folder);
                process.stdout.write("Done!\n")
                browserSync.reload();
            });
        });

        scss_files.forEach(file => {
            chokidar.watch([`./website/src/css/${file}.scss`, `./website/src/css/${file}/*.scss`], { ignoreInitial: true }).on('all', (event, path) => {
                console.log(event, path);
                process.stdout.write(`Rebuilding ${file}.css... `);
                css(file);
                process.stdout.write("Done!\n");
                browserSync.reload();
            });
        })

        chokidar.watch("./website/src/index.html", { ignoreInitial: true }).on('all', (event, path) => {
            console.log(event, path);
            browserSync.reload();
        });
    }
}