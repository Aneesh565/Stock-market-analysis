const listContainer = document.getElementById("list");

let chart;

// FETCH STOCK LIST
async function getStockList() {

    const response = await fetch(
        "https://stock-market-api-k9vl.onrender.com/api/stocksstatsdata"
    );

    const data = await response.json();

    const stocks = data.stocksStatsData[0];

    for (const stock in stocks) {

        if (stock === "_id") continue;

        const stockData = stocks[stock];

        const profit = (stockData.profit * 100).toFixed(2);

        const row = document.createElement("div");

        row.classList.add("stock-row");

        row.innerHTML = `
            <button class="stock-btn">${stock}</button>

            <span class="book-value">
                $${stockData.bookValue}
            </span>

            <span class="${profit > 0 ? "profit" : "loss"}">
                ${profit}%
            </span>
        `;

        // BUTTON CLICK EVENT
        row.querySelector(".stock-btn").addEventListener("click", () => {
            loadChart(stock);
        });

        listContainer.appendChild(row);
    }
}

// FETCH CHART DATA
async function loadChart(stockName) {

    const response = await fetch(
        "https://stock-market-api-k9vl.onrender.com/api/stocksdata"
    );

    const data = await response.json();

    const stockData = data.stocksData[0][stockName]["1y"];

    const values = stockData.value;

    const timestamps = stockData.timeStamp;

    // Convert timestamps to dates
    const labels = timestamps.map((time) => {
        return new Date(time * 1000).toLocaleDateString();
    });

    createChart(labels, values, stockName);
}

// CREATE CHART
function createChart(labels, values, stockName) {

    const ctx = document.getElementById("stockChart");

    // Destroy old chart
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: stockName,

                data: values,

                borderColor: "#39ff14",

                borderWidth: 3,

                tension: 0.3,

                pointRadius: 0,

                pointHoverRadius: 7,

                pointHoverBackgroundColor: "#39ff14",

                fill: false
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {
                    enabled: true,

                    backgroundColor: "#000033",

                    titleColor: "white",

                    bodyColor: "#39ff14",

                    borderColor: "#39ff14",

                    borderWidth: 1
                }
            },

            scales: {

                x: {
                    ticks: {
                        color: "white"
                    },

                    grid: {
                        display: false
                    }
                },

                y: {
                    ticks: {
                        color: "white"
                    },

                    grid: {
                        color: "#222"
                    }
                }
            },

            // CURSOR LINE EFFECT
            onHover: (event, chartElement) => {
                event.native.target.style.cursor =
                    chartElement[0] ? "crosshair" : "default";
            }
        },

        plugins: [verticalLinePlugin]
    });
}

// CUSTOM VERTICAL LINE PLUGIN
const verticalLinePlugin = {

    id: "verticalLinePlugin",

    afterDraw(chart) {

        if (chart.tooltip?._active?.length) {

            const ctx = chart.ctx;

            const activePoint = chart.tooltip._active[0];

            const x = activePoint.element.x;

            const topY = chart.scales.y.top;

            const bottomY = chart.scales.y.bottom;

            ctx.save();

            ctx.beginPath();

            ctx.moveTo(x, topY);

            ctx.lineTo(x, bottomY);

            ctx.lineWidth = 2;

            ctx.strokeStyle = "white";

            ctx.stroke();

            ctx.restore();
        }
    }
};

// LOAD INITIAL DATA
getStockList();

// DEFAULT CHART
loadChart("AAPL");