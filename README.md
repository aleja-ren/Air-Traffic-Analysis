# FlightAnalysis

## Description
Visualization of travelers flying to European countries using data from a simulated [dataset](https://www.kaggle.com/datasets/iamsouravbanerjee/airline-dataset/data) created with a synthetic data generation tool, closely resembling real-world data. The visualization includes a choropleth map where each country is colored based on the number of travelers arriving each month.

To the right of the map, a bar chart provides detailed information on how many travelers arrived on time, faced delays, or experienced cancellations.

## View
![Data Visualization of Spain in January](captura-visualizacion.jpg)

## Tools
This visualization was created using the D3 library. For more details, visit [D3's website](https://d3js.org/). Additionally, HTML and CSS were used.

## Usage
At the top, a slider allows selection of the month to visualize, updating the map data automatically. Text under the slider indicates the displayed month.

Hovering over a country shows a tooltip with the country name and the number of incoming travelers. Clicking on a country displays detailed data in the bar chart for that country. Changing the month resets the chart to avoid confusion. A hint at the bottom of the bar chart indicates the functionality for selecting a country.

When displaying a country’s data in the bar chart, the selected country name appears below.

## Author and References
Alejandra Gavino-Dias González (alejandra.gavino-dias@estudiantes.uva.es)

### Sources
- [Flightradar24](https://www.flightradar24.com)
- [Kaggle Airline Dataset](https://www.kaggle.com/datasets/iamsouravbanerjee/airline-dataset/data)
- [Airplane Icon](https://icons8.com/icon/15121/airplane-take-off)

### References
- [Choropleth Map Example](https://d3-graph-gallery.com/graph/choropleth_basic.html)
- [Tooltip Interactivity Example](https://d3-graph-gallery.com/graph/interactivity_tooltip.html)
- [Europe GeoJSON Map](https://github.com/leakyMirror/map-of-europe/tree/master/GeoJSON)
- [Color Legend](https://observablehq.com/@d3/color-legend)
- [Bar Chart Animation](https://d3-graph-gallery.com/graph/barplot_animation_start.html)

### Tools Used
- [Color Scale Tool](https://hihayk.github.io/scale/#4/3/49/76/96/13/7/1/DCCE00/227/73/119/white)
- [Coolors](https://coolors.co/)
