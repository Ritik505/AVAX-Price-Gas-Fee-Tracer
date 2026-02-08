const priceEl = document.getElementById("avax-price");
const ctx = document.getElementById("gasChart").getContext("2d");
const priceContainer = document.getElementById("price-container");
const arrow = document.getElementById("arrow");

function togglePrice() {
  priceContainer.classList.toggle("active");
  arrow.classList.toggle("rotate");
}

function isMobile() {
  return window.innerWidth <= 768;
}

let gasChart;

async function fetchAvaxPrice() {
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd";
    const proxy = "https://api.allorigins.win/raw?url=";

    const res = await fetch(proxy + encodeURIComponent(url));
    const data = await res.json();

    const price = data["avalanche-2"]?.usd;
    priceEl.textContent = price ? `$${price}` : "Price unavailable";
  } catch (err) {
    priceEl.textContent = "Price fetch failed";
    console.error("Price error:", err);
  }
}

async function fetchGasUsage() {
  try {
    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const latestBlockNumber = await provider.getBlockNumber();
    const labels = [];
    const gasUsedData = [];

    for (let i = 9; i >= 0; i--) {
      const block = await provider.getBlock(latestBlockNumber - i);
      labels.push(block.number.toString());
      gasUsedData.push(parseInt(block.gasUsed.toString()));
    }

    if (gasChart) {
      gasChart.options.indexAxis = isMobile() ? 'y' : 'x';
      gasChart.data.labels = labels;
      gasChart.data.datasets[0].data = gasUsedData;
      gasChart.update();
    } else {
      gasChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Gas Used",
              data: gasUsedData,
              backgroundColor: "rgba(255, 95, 0, 0.6)",
              borderColor: "rgba(255, 95, 0, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: isMobile() ? 'y' : 'x',
          plugins: {
            legend: {
              labels: { color: '#fff' }
            },
          },
          scales: {
            x: {
              ticks: { color: '#fff' },
              grid: { color: '#333' }
            },
            y: {
              ticks: { color: '#fff' },
              grid: { color: '#333' }
            }
          }
        },
      });
    }
  } catch (err) {
    console.error("Error fetching gas usage:", err);
  }
}

window.addEventListener("resize", () => {
  if (gasChart) {
    gasChart.options.indexAxis = isMobile() ? 'y' : 'x';
    gasChart.update();
  }
});

fetchAvaxPrice();
fetchGasUsage();

setInterval(() => {
  fetchAvaxPrice();
  fetchGasUsage();
}, 60000);

document.getElementById("year").textContent = new Date().getFullYear();
