main();
async function main() {
    const container = document.getElementById("chart__canvas-container");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');

    const value_deficit = document.getElementById("deficitValue");
    const value_empty = document.getElementById("emptyValue");
    const value_surplus = document.getElementById("surplusValue");
    const value_full = document.getElementById("fullValue");

    const parameters = {
        indoorT: 22, // degC
        solarArea: 20, // m2
        efficiency: 0.6, // Fraction
        htc: 250, // W/degC
        storage: 50 // kWh
    }

    const data = await fetch("js/data.json").then(response => response.json());

    const pointSize = 2;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    const baseline = canvas.height - pointSize;
    const scaleFactorWidth = (canvas.width - pointSize) / 365;

    ctx.fillStyle = '#4CE0D2';
    draw();

    const range_solar = document.getElementById("solar");
    const value_solar = document.getElementById("solarValue");
    range_solar.addEventListener("input", (event) => {
        const value = event.target.value;
        value_solar.textContent = `${value < 10 ? "" : ""}${value}`;
        parameters["solarArea"] = event.target.value;
        draw();
    });
    const range_efficiency = document.getElementById("efficiency");
    const value_efficiency = document.getElementById("efficiencyValue");
    range_efficiency.addEventListener("input", (event) => {
        value_efficiency.textContent = event.target.value;
        parameters["efficiency"] = event.target.value / 100;
        draw();
    });
    const range_htc = document.getElementById("htc");
    const value_htc = document.getElementById("htcValue");
    range_htc.addEventListener("input", (event) => {
        value_htc.textContent = event.target.value;
        parameters["htc"] = event.target.value;
        draw();
    });
    const range_storage = document.getElementById("storage");
    const value_storage = document.getElementById("storageValue");
    range_storage.addEventListener("input", (event) => {
        value_storage.textContent = event.target.value;
        parameters["storage"] = event.target.value;
        draw();
    });

    function drawPoint() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const state = [];
        const limit = parameters["storage"] * 1000;
        state.push(limit);
        const scaleFactorHeight = baseline / parameters["storage"];

        let gain;
        let loss;
        let result;

        let deficit = 0;
        let empty = 0;
        let surplus = 0;
        let full = 0;

        for (let i = 0; i < data["Energy"].length; i++) {
            gain = parameters["solarArea"] * data["Energy"][i] * parameters["efficiency"];
            loss = Math.min(parameters["htc"] * (data["Temperature"][i] - parameters["indoorT"]) * 24, 0);

            result = gain + loss + state[i];

            if (result > limit) {
                full++;
                surplus = surplus + result - limit;
                result = limit;
            } else if (result < 0) {
                empty++;
                deficit = deficit + result;
                result = 0;
            }
            state.push(result);
            const x = i % 365 * scaleFactorWidth;
            const y = baseline - (state[i + 1] / 1000) * scaleFactorHeight
            ctx.fillRect(x, y, pointSize, pointSize);
        }
        value_surplus.textContent = Math.round((surplus / 11) / 1000, 0);
        value_deficit.textContent = Math.round((deficit / 11) / -1000, 0);
        value_full.textContent = Math.round((full / 11), 0);
        value_empty.textContent = Math.round((empty / 11), 0);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const state = [];
        const limit = parameters["storage"] * 1000;
        state.push(limit);
        const scaleFactorHeight = baseline / parameters["storage"];

        let deficit = 0;
        let empty = 0;
        let surplus = 0;
        let full = 0;

        let position = 0;

        for (let i = 0; i < data["Energy"].length; i++) {
            const gain = parameters["solarArea"] * data["Energy"][i] * parameters["efficiency"];
            const loss = Math.min(parameters["htc"] * (data["Temperature"][i] - parameters["indoorT"]) * 24, 0);

            const result = gain + loss + state[i];

            if (result > limit) {
                state.push(limit)
                full++;
                surplus = surplus + result - limit;
            } else if (result < 0) {
                state.push(0)
                empty++;
                deficit = deficit + result;
            } else {
                state.push(result)
            }

            if (i == 0) continue;

            if (state[i + 1] !== state[i]) {
                index = i % 365;
                if (position <= index) {
                    const x = position * scaleFactorWidth;
                    const y = baseline - (state[i] / 1000) * scaleFactorHeight;
                    ctx.fillRect(x, y, index - position + pointSize, pointSize);
                } else {
                    const x = position * scaleFactorWidth;
                    const y = baseline - (state[i] / 1000) * scaleFactorHeight;
                    ctx.fillRect(x, y, 365 - position, pointSize);
                    ctx.fillRect(0, y, index - 0, pointSize);
                }
                position = index;
            }
        }
        value_surplus.textContent = Math.round((surplus / 11) / 1000, 0);
        value_deficit.textContent = Math.round((deficit / 11) / -1000, 0);
        value_full.textContent = Math.round((full / 11), 0);
        value_empty.textContent = Math.round((empty / 11), 0);
    }
}