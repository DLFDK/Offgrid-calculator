### Step 1

npm install

*This should install all dependencies using their newest versions*


Changes: For project SHR_calculator:
Made the js function ignore files that starts with an underscore.
Changed terser to now beautify the output - it is basically a glorified file-concatonator with sourcemaps now.
    Heads up! Sourcemaps for webworkers are bugged in Firefox - use Chrome to debug instead.