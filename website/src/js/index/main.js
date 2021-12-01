main();
async function main() {
    const container = document.getElementById("chart__canvas-container");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');

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
        storage: document.getElementById("controls__storage"),
    }

    const stats = {
        deficit: document.getElementById("chart__deficit"),
        empty: document.getElementById("chart__empty"),
        surplus: document.getElementById("chart__surplus"),
        full: document.getElementById("chart__full")
    }

    const parameters = {
        numOfYears: 11,
        indoorT: 22, // degC
        solar: 20, // m2
        efficiency: 0.6, // Fraction
        htc: 250, // W/degC
        storage: 200 // kWh
    };
    
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    const pointSize = 2;
    const baseline = canvas.height - pointSize;
    const scaleFactorWidth = (canvas.width - pointSize) / 365;
    
    const data = await fetch("js/data.json").then(response => response.json());
    
    for(const [name, range] of Object.entries(ranges)){
        range.addEventListener("input", event => {
            rangeValues[name].textContent = event.target.value ;
            parameters[name] = event.target.value / event.target.getAttribute("factor");
            draw();
        })
    }
    
    draw();
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#4CE0D2';

        const state = [];
        const limit = parameters["storage"] * 1000;
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
                state.push(limit)
                full++;
                surplus += result - limit;
            } else if (result < 0) {
                state.push(0)
                empty++;
                deficit += result;
            } else {
                state.push(result)
            }

            const x = i % 365 * scaleFactorWidth;
            const y = baseline - (state[i + 1] / 1000) * scaleFactorHeight
            ctx.fillRect(x, y, pointSize, pointSize);
        }
        stats["surplus"].textContent = Math.round((surplus / parameters["numOfYears"]) / 1000, 0);
        stats["deficit"].textContent = Math.round((deficit / parameters["numOfYears"]) / -1000, 0);
        stats["full"].textContent = Math.round((full / parameters["numOfYears"]), 0);
        stats["empty"].textContent = Math.round((empty / parameters["numOfYears"]), 0);
    }

    // function drawOptimized() {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);

    //     const state = [];
    //     const limit = parameters["storage"] * 1000;
    //     state.push(limit);
    //     const scaleFactorHeight = baseline / parameters["storage"];

    //     let deficit = 0;
    //     let empty = 0;
    //     let surplus = 0;
    //     let full = 0;

    //     let position = 0;

    //     for (let i = 0; i < data["Energy"].length; i++) {
    //         const gain = parameters["solar"] * data["Energy"][i] * parameters["efficiency"];
    //         const loss = Math.min(parameters["htc"] * (data["Temperature"][i] - parameters["indoorT"]) * 24, 0);

    //         const result = gain + loss + state[i];

    //         if (result > limit) {
    //             state.push(limit)
    //             full++;
    //             surplus = surplus + result - limit;
    //         } else if (result < 0) {
    //             state.push(0)
    //             empty++;
    //             deficit = deficit + result;
    //         } else {
    //             state.push(result)
    //         }

    //         if (i === 0) continue;

    //         if (state[i + 1] !== state[i]) {
    //             index = i % 365;
    //             if (position <= index) {
    //                 const x = position * scaleFactorWidth;
    //                 const y = baseline - (state[i] / 1000) * scaleFactorHeight;
    //                 ctx.fillRect(x, y, index - position + pointSize, pointSize);
    //             } else {
    //                 const x = position * scaleFactorWidth;
    //                 const y = baseline - (state[i] / 1000) * scaleFactorHeight;
    //                 ctx.fillRect(x, y, 365 - position, pointSize);
    //                 ctx.fillRect(0, y, index - 0, pointSize);
    //             }
    //             position = index;
    //         }
    //     }
    //     value_surplus.textContent = Math.round((surplus / 11) / 1000, 0);
    //     value_deficit.textContent = Math.round((deficit / 11) / -1000, 0);
    //     value_full.textContent = Math.round((full / 11), 0);
    //     value_empty.textContent = Math.round((empty / 11), 0);
    // }
}