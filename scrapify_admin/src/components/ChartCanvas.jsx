import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { translateText } from "../utils/translate.js";

// Chart.js colours and font that match the glass theme.
Chart.defaults.color = "rgba(31,45,39,.6)";
Chart.defaults.borderColor = "rgba(31,45,39,.08)";
Chart.defaults.maintainAspectRatio = false;
Chart.defaults.font.family = "Plus Jakarta Sans";
Chart.defaults.plugins.legend.labels.usePointStyle = true;

// Draws a Chart.js chart on a <canvas>.
// Chart.js is not a React library, so we create the chart in useEffect (after the canvas exists)
// and destroy it in the cleanup function (before the next draw or when the page closes).
export default function ChartCanvas({ type, labels, datasets, options = {}, label }) {
  const canvasRef = useRef(null);
  // Redraw only when the chart's content really changes, not on every render of the page.
  const chartSnapshot = JSON.stringify({ type, labels, datasets, options });

  useEffect(() => {
    const chart = new Chart(canvasRef.current, {
      type,
      data: {
        labels: labels.map(translateText), // canvas text can't be reached by Bangla mode, so translate here
        datasets: datasets.map((dataset) => ({ ...dataset, label: translateText(dataset.label) })),
      },
      options,
    });
    return () => chart.destroy();
  }, [chartSnapshot]);

  return (
    <div className="relative mt-4 h-64">
      <canvas ref={canvasRef} aria-label={label} role="img" />
    </div>
  );
}

// A filled line chart with one series and no legend, used for price trends.
export function LineChart({ labels, values, seriesLabel, color, label }) {
  const datasets = [
    {
      label: seriesLabel,
      data: values,
      borderColor: color,
      backgroundColor: `${color}26`,
      fill: true,
      tension: 0.35,
      pointRadius: 4,
    },
  ];
  const options = { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  return <ChartCanvas type="line" labels={labels} datasets={datasets} options={options} label={label} />;
}
