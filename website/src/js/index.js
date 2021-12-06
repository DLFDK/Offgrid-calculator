main();

async function main() {
    const state = {
        root: document.documentElement,
        title: document.getElementById("overlay__title"),
        text: document.getElementById("overlay__text"),
        loadedText: "Success!",
        unloadedText: "Pick a location to get started",
        fetchingText: "Fetching, please wait...",
        errorText: errorText = "Oops! Looks like there was an error fetching the data",
        state: "unloaded",
        set(newState, message) {
            this.state = newState;
            switch (newState) {
              case "fetching":
                this.title.textContent = this.fetchingText;
                this.text.textContent = "";
                this.root.style.setProperty("--state__fetching--opacity", .5);
                this.root.style.setProperty("--state__calculator--opacity", .5);
                this.root.style.setProperty("--state__overlay--opacity", 1);
                break;

              case "loaded":
                this.title.textContent = this.loadedText;
                this.text.textContent = "";
                this.root.style.setProperty("--state__fetching--opacity", 1);
                this.root.style.setProperty("--state__calculator--opacity", 1);
                this.root.style.setProperty("--state__overlay--opacity", 0);
                break;

              case "error":
                this.title.textContent = this.errorText;
                this.text.textContent = message;
                this.root.style.setProperty("--state__fetching--opacity", 1);
                this.root.style.setProperty("--state__calculator--opacity", .5);
                this.root.style.setProperty("--state__overlay--opacity", 1);
                break;
            }
        }
    };
    const stats = {
        deficit: document.getElementById("chart__deficit"),
        empty: document.getElementById("chart__empty"),
        surplus: document.getElementById("chart__surplus"),
        full: document.getElementById("chart__full")
    };
    const dataPicker = {
        button: document.getElementById("data-picker__button"),
        latitude: document.getElementById("data-picker__latitude"),
        longitude: document.getElementById("data-picker__longitude"),
        angle: document.getElementById("data-picker__angle")
    };
    const parameters = {
        numOfYears: {
            value: 11
        },
        indoorT: {
            value: 22
        },
        solar: {
            min: 10,
            max: 50,
            value: 30,
            step: 1
        },
        efficiency: {
            min: 10,
            max: 100,
            value: 60,
            step: 1
        },
        htc: {
            min: 10,
            max: 300,
            value: 250,
            step: 5
        },
        storage: {
            min: 10,
            max: 1e3,
            value: 200,
            step: 10
        }
    };
    for (const range of document.getElementsByClassName("controls__input")) {
        range.min = parameters[range.id].min;
        range.max = parameters[range.id].max;
        range.step = parameters[range.id].step;
        range.value = parameters[range.id].value;
        document.getElementById(`controls__${range.id}`).textContent = parameters[range.id].value;
        range.addEventListener("input", (event => {
            document.getElementById(`controls__${range.id}`).textContent = event.target.value;
            parameters[range.id].value = event.target.value;
            if (state.state === "loaded") {
                draw();
            }
        }));
    }
    const container = document.getElementById("chart__canvas-container");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const scale = window.devicePixelRatio;
    canvas.style.height = container.offsetHeight + "px";
    canvas.style.width = container.offsetWidth + "px";
    canvas.width = Math.floor(container.offsetWidth * scale);
    canvas.height = Math.floor(container.offsetHeight * scale);
    ctx.scale(scale, scale);
    const pointSize = 2;
    const baseline = container.offsetHeight - pointSize;
    const scaleFactorWidth = (container.offsetWidth - pointSize) / 365;
    state.set("fetching");
    let data = await fetch("js/data.json").then((response => response.json()));
    draw();
    state.set("loaded");
    dataPicker["button"].addEventListener("click", (async () => {
        state.set("fetching");
        const latitude = dataPicker["latitude"].value;
        const longitude = dataPicker["longitude"].value;
        const angle = dataPicker["angle"].value;
        const URL = `https://off-grid.dlfdk.workers.dev/api/seriescalc?lat=${latitude}&lon=${longitude}&browser=1&outputformat=json&usehorizon=1&angle=${angle}&startyear=2005&endyear=2015`;
        const rawData = await fetch(URL).then((response => response.json()));
        if (rawData["message"]) {
            state.set("error", rawData["message"]);
        } else {
            data = formatData(rawData);
            draw();
            state.set("loaded");
        }
    }));
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#4CE0D2";
        const output = [];
        const limit = parameters["storage"].value * 1e3;
        output.push(limit);
        const scaleFactorHeight = baseline / parameters["storage"].value;
        let deficit = 0;
        let empty = 0;
        let surplus = 0;
        let full = 0;
        for (let i = 0; i < data["Energy"].length; i++) {
            const gain = parameters["solar"].value * data["Energy"][i] * (parameters["efficiency"].value / 100);
            const loss = Math.min(parameters["htc"].value * (data["Temperature"][i] - parameters["indoorT"].value) * 24, 0);
            const result = gain + loss + output[i];
            if (result > limit) {
                output.push(limit);
                full++;
                surplus += result - limit;
            } else if (result < 0) {
                output.push(0);
                empty++;
                deficit += result;
            } else {
                output.push(result);
            }
            const x = i % 365 * scaleFactorWidth;
            const y = baseline - output[i + 1] / 1e3 * scaleFactorHeight;
            ctx.fillRect(x, y, pointSize, pointSize);
        }
        stats["surplus"].textContent = Math.round(surplus / parameters["numOfYears"].value / 1e3);
        stats["deficit"].textContent = Math.round(deficit / parameters["numOfYears"].value / -1e3);
        stats["full"].textContent = Math.round(full / parameters["numOfYears"].value);
        stats["empty"].textContent = Math.round(empty / parameters["numOfYears"].value);
    }
    function formatData(rawData) {
        const {inputs: {meteo_data: {radiation_db: database}}, outputs: {hourly: data}} = rawData;
        const numOfDays = Math.round(data.length / 24);
        const formattedData = {
            Energy: [],
            Temperature: []
        };
        for (let i = 0; i < numOfDays; i++) {
            let dailySolarSum = 0;
            let dailyTempSum = 0;
            for (let j = i * 24; j < (i + 1) * 24; j++) {
                dailySolarSum += data[j]["G(i)"];
                dailyTempSum += data[j]["T2m"];
            }
            formattedData["Energy"].push(Math.round(dailySolarSum));
            formattedData["Temperature"].push(dailyTempSum / 24);
        }
        return formattedData;
    }
}
//# sourceMappingURL=index.js.map