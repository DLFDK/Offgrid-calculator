main();

async function main() {
    const localURL = "js/raw-data.json";
    const dataPicker = {
        fetchButton: document.getElementById("data-picker__button"),
        latitudeInput: document.getElementById("data-picker__latitude"),
        longitudeInput: document.getElementById("data-picker__longitude"),
        angleInput: document.getElementById("data-picker__angle")
    };
    let data = {};
    dataPicker["fetchButton"].addEventListener("click", (async event => {
        const latitude = dataPicker["latitudeInput"].value;
        const longitude = dataPicker["longitudeInput"].value;
        const angle = dataPicker["angleInput"].value;
        const URL = `api/seriescalc?lat=${latitude}&lon=${longitude}&browser=1&outputformat=json&usehorizon=1&angle=${angle}2&startyear=2005&endyear=2005`;
        const rawData = await fetch(localURL).then((response => response.json()));
        data = formatData(rawData);
        draw();
        console.log(data);
    }));
    const container = document.getElementById("chart__canvas-container");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const ranges = {
        solar: document.getElementById("solar"),
        efficiency: document.getElementById("efficiency"),
        htc: document.getElementById("htc"),
        storage: document.getElementById("storage")
    };
    const rangeValues = {
        solar: document.getElementById("controls__solar"),
        efficiency: document.getElementById("controls__efficiency"),
        htc: document.getElementById("controls__htc"),
        storage: document.getElementById("controls__storage")
    };
    const stats = {
        deficit: document.getElementById("chart__deficit"),
        empty: document.getElementById("chart__empty"),
        surplus: document.getElementById("chart__surplus"),
        full: document.getElementById("chart__full")
    };
    const parameters = {
        numOfYears: 11,
        indoorT: 22,
        solar: 20,
        efficiency: .6,
        htc: 250,
        storage: 200
    };
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    const pointSize = 2;
    const baseline = canvas.height - pointSize;
    const scaleFactorWidth = (canvas.width - pointSize) / 365;
    for (const [name, range] of Object.entries(ranges)) {
        range.addEventListener("input", (event => {
            rangeValues[name].textContent = event.target.value;
            parameters[name] = event.target.value / event.target.getAttribute("factor");
            draw();
        }));
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#4CE0D2";
        const state = [];
        const limit = parameters["storage"] * 1e3;
        state.push(limit);
        const scaleFactorHeight = baseline / parameters["storage"];
        let deficit = 0;
        let empty = 0;
        let surplus = 0;
        let full = 0;
        for (let i = 0; i < data["Energy"].length; i++) {
            const gain = parameters["solar"] * data["Energy"][i] * parameters["efficiency"];
            const loss = Math.min(parameters["htc"] * (data["Temperature"][i] - parameters["indoorT"]) * 24, 0);
            const result = gain + loss + state[i];
            if (result > limit) {
                state.push(limit);
                full++;
                surplus += result - limit;
            } else if (result < 0) {
                state.push(0);
                empty++;
                deficit += result;
            } else {
                state.push(result);
            }
            const x = i % 365 * scaleFactorWidth;
            const y = baseline - state[i + 1] / 1e3 * scaleFactorHeight;
            ctx.fillRect(x, y, pointSize, pointSize);
        }
        stats["surplus"].textContent = Math.round(surplus / parameters["numOfYears"] / 1e3);
        stats["deficit"].textContent = Math.round(deficit / parameters["numOfYears"] / -1e3);
        stats["full"].textContent = Math.round(full / parameters["numOfYears"]);
        stats["empty"].textContent = Math.round(empty / parameters["numOfYears"]);
    }
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
//# sourceMappingURL=index.js.map