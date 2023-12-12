const width = 800, height = 690; //esto es para el mapa de la izquierda

/*Escala de colores que vamos a usar en el mapa*/
const legendColors = ["#E7D041", "#CA8A00", "#B54900", "#9A1100", "#780000"];
const barchartColors = ["#BCEE68", "#FFB90F", "#FF6A6A"];


/*SVG para el mapa de la izquierda*/
var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

/*SVG para el diagrama de barras de la derecha*/
const margin2 = { top: 30, right: 30, bottom: 70, left: 60 };
const width2 = 500 - margin2.left - margin2.right;
const height2 = 500 - margin2.top - margin2.bottom;
var svg2 = d3
    .select("body")
    .append("svg")
    .attr("width", 600)
    .attr("height", 600)
    .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

/*tooltip para que cuando pase el ratón por encima de un pais salga la información detallada*/
var Tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("display", "none")
    .style("font-family", "sans-serif");

/*Proyección de los paises*/
var projection = d3
    .geoMercator()
    .center([0, 55])
    .scale(400)
    .translate([width / 2, height / 2]);

/*Path de los paises*/
var path = d3.geoPath().projection(projection);

/*Escala de colores con los intervalos en los que divimos para cada color*/
var colorScale = d3
    .scaleThreshold()
    .domain([32, 64, 96, 128, 160])
    .range(legendColors);

var selectedMonth = 1; //mes por defecto va a ser enero
var monthlyData = []; //array con los datos mensuales
var selectedData; //datos seleccionados
var mapa = new Map(); //mapa
var promises = []; //array que contendrá las promesas

/*Meto en una variable promesas los csv que abro para cada mes*/
for (var i = 1; i <= 12; i++) {
    promises.push(d3.csv("datos-mapa/datos-" + getMonthName(i) + ".csv"));
}
promises.push(d3.json("europe.geojson"));

/**
 * Funcion que actualiza el texto bajo el slider con el mes que se ha elegido en el slider.
 */
function updateSelectedMonthIndicator() {
    var indicator = d3.select("#selectedMonthIndicator");
    indicator.text("Mes seleccionado: " + getMonthName(selectedMonth))
        .style("font-family", "sans-serif");;
}

/**
 * Funcion que actualiza el mapa con los datos del mes correspondiente que obtenemos del slider.
 */
function updateMap() {
    var selectedData = monthlyData[selectedMonth - 1];
    mapa.clear();
    selectedData.forEach((d) => {
        mapa.set(d.country, +d.flights);
    });

    svg
        .selectAll("path")
        .transition()
        .duration(500)
        .attr("fill", function (d) {
            var flights = mapa.get(d.properties.name) || 0;
            return colorScale(flights);
        });
}

/**
 * Funcion para obtener el nombre del mes dado su numero
 * @param {number} monthNumber - El numero del mes [1-12]
 * @returns {string} monthNames - El nombre del mes [enero, febrero, ..., diciembre]
 */
function getMonthName(monthNumber) {
    var monthNames = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
    ];
    return monthNames[monthNumber - 1];
}

/*Promesa con los datos por cada mes del mapa y el iniciador del slider*/
Promise.all(promises).then(function (data) {
    for (var i = 0; i < 12; i++) {
        monthlyData.push(data[i]);
    }

    var selectedData = monthlyData[0]; //por defecto tenemos los datos de enero, por eso está en 0
    var initialMonth = 1; //por defecto vamos a tener los datos de enero
    document.getElementById("dataSlider").value = initialMonth; //para que cuando refrescamos la pagina se resetee el slider a enero

    ready(data[12]);
    updateMap();
    updateSelectedMonthIndicator();
});

function ready(europe) {
    /**
     * Funcion que maneja cuando pasamos el ratón por encima de un pais del mapa, mostrará una ayuda indicando el pais señalado y
     * el número de vuelos con destino a ese pais, cambiará el color del país por el que pasamos encima a uno más intenso y al resto
     * les cambia la opacidad.
     */
    let mouseOver = function (d) {
        d3.selectAll(".Country")
            .transition()
            .duration(100)
            .style("opacity", 0.5);
        d3.select(this).transition().duration(100).style("opacity", 1);
        Tooltip.style("display", "inline");
    };

    /**
     * Función que maneja cuando el ratón deja de estar encima de un país del mapa, desaparecerá la ayuda que indica el país y el número de vuelos
     * con destino a ese pais, cambiará al color y opacidad original a todos los países.
     * @param {event} event - Evento de movimiento del ratón fuera del pais
     */
    let mouseLeave = function (d) {
        d3.selectAll(".Country")
            .transition()
            .style("opacity", 0.9)
            .attr("fill", function (d) {
                var flights = mapa.get(d.properties.name) || 0;
                return colorScale(flights);
            });
        d3.select(this)
            .transition()
            .duration(100)
            .attr("fill", function (d) {
                var flights = mapa.get(d.properties.name) || 0;
                return colorScale(flights);
            });
        Tooltip.style("display", "none");
    };

    /**
     * Función que maneja cuando movemos el ratón, la ayuda que indica el país en el que estamos encima seguirá al ratón.
     * @param {event} event - Evento de movimiento del ratón dentro del pais
     */
    let mouseMove = function (event, d) {
        var d = d3.select(this).data();
        //d[0].properties.name: es el nombre del país en el que estamos encima
        Tooltip.style("opacity", 1)
            .html(
                "Pais: " +
                d[0].properties.name +
                "<br> Vuelos: " +
                (mapa.has(d[0].properties.name)
                    ? mapa.get(d[0].properties.name)
                    : 0)
            )
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 20 + "px");
    };

    /**
     * Función que maneja cuando hacemos click a un país.
     * @param {event} event - Evento de click del ratón
     */
    let mouseClick = function (event, d) {
        //d3.select("#clickInfo").style("display", "none"); //Cuando clicamos no s emuestra la ayuda de las indicaciones
        svg2.selectAll(".bar").remove();
        svg2.selectAll(".bar-text").remove();
        var d = d3.select(this).data();

        // Seleccionar datos correspondientes al país y mes
        d3.csv("datos-detalle-vuelo/output_" + d[0].properties.name + "_" + selectedMonth + ".csv").then(function (data2) {
            const allStatuses = ["On Time", "Delayed", "Cancelled"];

            // Para los estados faltantes en los csv, lo inicializamos a 0
            const completeData = allStatuses.map((status) => ({
                status: status,
                count: data2.find((d) => d.status === status)
                    ? +data2.find((d) => d.status === status).count
                    : 0,
            }));

            const x = d3
                .scaleBand()
                .range([0, width2])
                .domain(completeData.map((d) => d.status))
                .padding(0.2);

            const y = d3.scaleLinear().domain([0, 50]).range([height2, 0]);

            // Barras
            const bars = svg2
                .selectAll(".bar")
                .data(completeData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", (d) => x(d.status))
                .attr("width", x.bandwidth())
                .attr("y", height2)  // Inicialmente, las barras estarán en la parte inferior
                .attr("height", 0)   // Altura inicial 0
                .attr("fill", (d, i) => barchartColors[i % barchartColors.length]);

            // Transición de entrada de las barras
            bars
                .transition()
                .duration(500)
                .attr("y", (d) => y(d.count))
                .attr("height", (d) => height2 - y(d.count));

            // Texto encima de las barras
            svg2
                .selectAll(".bar-text")
                .data(completeData)
                .enter()
                .append("text")
                .attr("class", "bar-text")
                .attr("x", (d) => x(d.status) + x.bandwidth() / 2)
                .attr("y", (d) => y(d.count) - 5)
                .attr("text-anchor", "middle")
                .text((d) => d.count)
                .style("font-size", "10px")
                .style("fill", "black");


            // Vertical line
            svg2
                .append("line")
                .attr("x1", x(1))
                .attr("y1", 0)
                .attr("x2", x(1))
                .attr("y2", height2)
                .attr("stroke", "black");

            // Horizontal line
            svg2
                .append("line")
                .attr("x1", 0)
                .attr("y1", y(0))
                .attr("x2", width2)
                .attr("y2", y(0))
                .attr("stroke", "black");

            // Indicador del pais debajo del diagrama de barras
            svg2
                .append("text")
                .attr("id", "clickInfo")
                .attr("x", width2 / 2)
                .attr("y", height2 + 100)
                .attr("text-anchor", "middle")
                .attr("class", "bar-text")
                .style("font-family", "sans-serif")
                .style("font-size", "14px")
                .text(d[0].properties.name);
        });
    };

    let barrasDefault = function () {

        // Indicacion para funcionamiento del grafico de barras
        svg2
            .append("text")
            .attr("id", "clickInfo")
            .attr("x", width2 / 2)
            .attr("y", height2 + 100)
            .attr("text-anchor", "middle")
            .attr("class", "bar-text")
            .style("font-family", "sans-serif")
            .style("font-size", "14px")
            .text("Haz click en el país para ver los datos detallados");

        // Vertical line
        svg2
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height2)
            .attr("stroke", "black");

        // Horizontal line
        svg2
            .append("line")
            .attr("x1", 0)
            .attr("y1", 400)
            .attr("x2", width2)
            .attr("y2", 400)
            .attr("stroke", "black");

        //ticks horizontales por defecto
        const horizontalTicks = svg2.append("g").attr("class", "horizontal-ticks");
        const tickWidthArray = [76.875, 205, 333.125];
        const rangoX = ["On Time", "Delayed", "Cancelled"];
        for (let i = 0; i < 3; i++) {
            const tickWidth = tickWidthArray[i];
            horizontalTicks.append("line")
                .attr("class", "tick")
                .attr("x1", tickWidth)
                .attr("y1", 395) // Ajustamos la posicion de los ticks manualmente
                .attr("x2", tickWidth)
                .attr("y2", 405)
                .attr("stroke", "black");

            //Etiquetas de los ticks horizontales
            horizontalTicks.append("text")
                .attr("x", tickWidth)
                .attr("y", 395) // Ajustamos la posicion de las etiquetas manualmente
                .attr("dy", 20)
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-45, " + tickWidth + ", 415)") // Rotamos el texto de las etiquetas
                .text(rangoX[i])
                .style("font-family", "sans-serif")
                .style("font-size", "10px");
        }

        //ticks verticales
        const verticalTicks = svg2.append("g").attr("class", "vertical-ticks");
        const rangoY = [50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0];
        for (let i = 0; i <= 10; i++) {
            const tickHeight = (i / 10) * height2;
            verticalTicks.append("line")
                .attr("class", "tick")
                .attr("x1", -5) // Ajustamos la posicion de los ticks manualmente
                .attr("y1", tickHeight)
                .attr("x2", 5)
                .attr("y2", tickHeight)
                .attr("stroke", "black");

            //Etiquetas de los ticks verticales
            verticalTicks.append("text")
                .attr("x", -10) // Ajustamos la posicion de las etiquetas manualmente
                .attr("y", tickHeight)
                .attr("dy", "0.35em")
                .attr("text-anchor", "end")
                .text(rangoY[i])
                .style("font-family", "sans-serif")
                .style("font-size", "10px");
        }
    };
    barrasDefault(); // Por defecto se muestran los ejes, los ticks y las etiquetas



    /*Dibujamos el mapa*/
    svg
        .selectAll("path")
        .data(europe.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            var flights = mapa.get(d.properties.name) || 0;
            return colorScale(flights);
        })
        .style("stroke", "white")
        .attr("class", function (d) {
            return "Country";
        })
        .style("opacity", 0.8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .on("mousemove", mouseMove)
        .on("click", mouseClick);

    /*Añadimos la leyenda para los colores del mapa*/
    var legend = svg
        .append("g")
        .attr("class", "key")
        .attr("transform", "translate(0, 40)")
        .attr("fill", "none")
        .attr("font-size", "10")
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle");

    legend
        .append("text")
        .attr("class", "caption")
        .attr("x", 600)
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Número de vuelos");

    /*Muestro los colores de la leyenda*/
    for (var i = 0; i < legendColors.length; i++) {
        var color = legendColors[i];
        var x = 600 + 29 * i;

        legend
            .append("rect")
            .attr("height", 16)
            .attr("x", x)
            .attr("width", 29)
            .attr("fill", color);
    }

    /*Indicadores de los intervalos de la leyenda*/
    var legendTicks = ["0", "32", "64", "96", "128", "160"];

    /*Imprimo los ticks de la leyenda en su sitio "|"*/
    for (var i = 0; i < legendTicks.length; i++) {
        var tickLabel = legendTicks[i];
        var x = 600 + 29 * i;
        var y = 16;

        legend
            .append("g")
            .attr("class", "tick")
            .attr("opacity", 1)
            .attr("transform", "translate(" + x + ", 0)")
            .append("line")
            .attr("stroke", "black")
            .attr("y2", 20);
    }

    /*Imprimo los valores de los intervalos de la leyenda en su sitio*/
    for (var i = 0; i < legendTicks.length; i++) {
        var tickLabel = legendTicks[i];
        var x = 597 + 28 * i;
        var y = 32;

        legend
            .append("text")
            .attr("class", "caption")
            .attr("x", x)
            .attr("y", y)
            .attr("fill", "#000")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(tickLabel);
    }

    /*Cambiamos los datos cuando cambio de mes en el slider*/
    d3.select("#dataSlider").on("input", function () {
        svg2.selectAll("*").remove();
        selectedMonth = +this.value;
        updateMap();
        updateSelectedMonthIndicator();
        barrasDefault();
    });
}