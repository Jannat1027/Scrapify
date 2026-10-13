// Chart.js with the glass theme. app.js loads this only on pages that ask for data-libs="chart".
Object.assign(Chart.defaults, {
  color: "rgba(31,45,39,.6)",
  borderColor: "rgba(31,45,39,.08)",
  maintainAspectRatio: false,
});
Chart.defaults.font.family = "Plus Jakarta Sans";
Chart.defaults.plugins.legend.labels.usePointStyle = true;

S.chart = (canvas, config) => {
  const chart = new Chart(canvas, config);

  // Canvas text can't be reached by the page translator, so labels are translated once Bangla is ready.
  document.addEventListener("translated", () => {
    chart.data.labels = chart.data.labels.map(S.tr);
    chart.data.datasets.forEach((dataset) => dataset.label && (dataset.label = S.tr(dataset.label)));
    const y = chart.options.scales?.y;
    if (y) y.ticks = { ...y.ticks, callback: (value) => S.tr(String(value)) };
    chart.update();
  }, { once: true });

  return chart;
};

// A filled line chart with one series and no legend. `color` is a hex colour such as "#3f9e74".
S.lineChart = (canvas, labels, data, { label, color }) => S.chart(canvas, {
  type: "line",
  data: {
    labels,
    datasets: [{
      label, data, borderColor: color, backgroundColor: `${color}26`, fill: true, tension: 0.35, pointRadius: 4,
    }],
  },
  options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
});
