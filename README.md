# Off-grid Calculator

Super simple calculator for visualizing and estimating the prospects for going off-grid.

[Hosted on Netlify](https://off-grid-calculator.netlify.app)

Based on solar radiation data acquired via [PVGIS](https://ec.europa.eu/jrc/en/pvgis) and fetched through a Cloudflare Worker. See the [PVGIS users manual](https://ec.europa.eu/jrc/en/PVGIS/docs/usermanual) for details on the used databases. PVGIS gets data on the Americas from [NSRDB](https://nsrdb.nrel.gov/) as collected by [NREL](https://www.nrel.gov/).

## The model
The calculator is based on an extremely simple model with only a handful of inputs.
Each retrieved dataset consists of 96,408 datapoints covering the hours between 1/1-2005 and 12/31-2015. After retrieval, the data is remapped into 24 hour intervals. Each datapoint has two values for that 24 hour period:

- The total solar insolation (based on global irradiance) at the optimal angle for December at the given location
- The average outdoor temperature at a height of 2 meters

The two values are used to calculate the energy-gain and energy-loss for that day.

> Energy<sub>gain</sub> *Wh* = Collector‑area *m<sup>2</sup>* × Total‑solar‑insolation *Wh/m<sup>2</sup>* × Collector‑efficiency

> Energy<sub>loss</sub> *Wh* = Whole‑house‑heat‑transfer‑coefficient *W/°C* × ( Average‑outdoor‑temperature − Indoor‑temperature ) *°C* × 24 *s Wh/J*

The indoor temperature is set at 22 °C. Change it in main.js with the `IndoorT` parameter.

At the simulation outset, the energy-storage is full. The net-gain (or loss) for each day is then added to the storage, either increasing or decreasing its level. The storage level is not allowed to exceed the chosen maximum or fall below 0 kWh

> Storage<sub>tomorrow</sub> *Wh* = Energy<sub>gain</sub> *Wh* + Energy<sub>loss</sub> *Wh* + Storage<sub>today</sub> *Wh*

Due to the model's simplicity there's naturally a long list of factors which it does not account for.

To name just a few:

- Energy losses from the storage tank or battery
- Conversion losses between collector and tank or battery
- Solar heat gain through windows
- Internal gains not powered by the collectors

As the model is based on historical solar and weather data without any additional statistical treatment it cannot make any predicitions on future conditions

## Project structure
This project uses simple development- and build-scripts contained in `website/scripts`. See those files and package.json for dependencies.