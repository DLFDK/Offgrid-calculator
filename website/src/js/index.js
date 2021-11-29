function input(canvas, ctx, data) {
    const range = document.getElementById("range");
    range.addEventListener("input", (() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(0, data[0] / 100 * (range.value / 100));
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(i, data[i] / 100 * (range.value / 100));
        }
        ctx.stroke();
    }));
}

main();

async function main() {
    const container = document.getElementById("chart__canvas-container");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const value_deficit = document.getElementById("deficitValue");
    const value_empty = document.getElementById("emptyValue");
    const value_surplus = document.getElementById("surplusValue");
    const value_full = document.getElementById("fullValue");
    const parameters = {
        indoorT: 22,
        solarArea: 20,
        efficiency: .6,
        htc: 100,
        storage: 50
    };
    const data = await fetch("js/data.json").then((response => response.json()));
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    const baseline = canvas.height - 5;
    const scaleFactorWidth = (canvas.width - 4) / 365;
    ctx.strokeStyle = "#4CE0D2";
    ctx.fillStyle = "#4CE0D2";
    drawPoint();
    const range_solar = document.getElementById("solar");
    const value_solar = document.getElementById("solarValue");
    range_solar.addEventListener("input", (event => {
        const value = event.target.value;
        value_solar.textContent = `${value < 10 ? "" : ""}${value}`;
        parameters["solarArea"] = event.target.value;
        drawPoint();
    }));
    const range_efficiency = document.getElementById("efficiency");
    const value_efficiency = document.getElementById("efficiencyValue");
    range_efficiency.addEventListener("input", (event => {
        value_efficiency.textContent = event.target.value;
        parameters["efficiency"] = event.target.value / 100;
        drawPoint();
    }));
    const range_htc = document.getElementById("htc");
    const value_htc = document.getElementById("htcValue");
    range_htc.addEventListener("input", (event => {
        value_htc.textContent = event.target.value;
        parameters["htc"] = event.target.value;
        drawPoint();
    }));
    const range_storage = document.getElementById("storage");
    const value_storage = document.getElementById("storageValue");
    range_storage.addEventListener("input", (event => {
        value_storage.textContent = event.target.value;
        parameters["storage"] = event.target.value;
        drawPoint();
    }));
    function drawPoint() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const state = [];
        const limit = parameters["storage"] * 1e3;
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
            ctx.fillRect((i + 1) % 365 * scaleFactorWidth, baseline - state[i + 1] / 1e3 * scaleFactorHeight, 2, 2);
        }
        value_surplus.textContent = Math.round(surplus / 1e3, 0);
        value_deficit.textContent = Math.round(deficit / -1e3, 0);
        value_full.textContent = Math.round(full);
        value_empty.textContent = Math.round(empty);
    }
    function drawPath() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        const state = [];
        state.push(parameters["storage"] * 1e3);
        const scaleFactorHeight = baseline / parameters["storage"];
        ctx.moveTo(0, baseline - parameters["storage"] * scaleFactorHeight);
        let gain;
        let loss;
        let result;
        for (let i = 0; i < data["Energy"].length; i++) {
            gain = parameters["solarArea"] * data["Energy"][i];
            loss = Math.min(parameters["htc"] * (data["Temperature"][i] - parameters["indoorT"]) * 24, 0);
            result = Math.min(state[i] + gain + loss, parameters["storage"] * 1e3);
            result = Math.max(result, 0);
            state.push(result);
            if ((i + 1) % 365 === 0) {
                ctx.moveTo(0, baseline - state[i + 1] / 1e3 * scaleFactorHeight);
            } else {
                ctx.lineTo((i + 1) % 365, baseline - state[i + 1] / 1e3 * scaleFactorHeight);
            }
        }
        ctx.stroke();
    }
}
//# sourceMappingURL=index.js.map