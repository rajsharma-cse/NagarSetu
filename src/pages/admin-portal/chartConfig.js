import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export const chartDefaults = {
  plugins: {
    legend: {
      labels: {
        color: "#475569",
        font: { size: 11, weight: "600" },
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: "#0f172a",
      titleColor: "#e2e8f0",
      bodyColor: "#cbd5f5",
      borderColor: "rgba(148,163,184,0.2)",
      borderWidth: 1,
      padding: 10,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
};

