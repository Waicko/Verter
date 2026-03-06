"use client";

import { useEffect, useMemo, useState } from "react";
import type { ElevationPoint } from "@/lib/route-gpx";

interface ElevationProfileProps {
  data: ElevationPoint[];
  className?: string;
}

export default function ElevationProfile({
  data,
  className = "",
}: ElevationProfileProps) {
  const [ChartComponent, setChartComponent] = useState<React.ElementType | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import("chart.js/auto")
      .then(() => import("react-chartjs-2"))
      .then((mod) => setChartComponent(mod.Line as React.ElementType))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load chart");
      });
  }, []);

  const chartData = useMemo(() => {
    const labels = data.map((p) => p.distanceKm.toFixed(2));
    const elevations = data.map((p) => p.elevationM);
    return {
      labels,
      datasets: [
        {
          label: "Elevation (m)",
          data: elevations,
          borderColor: "#228B22",
          backgroundColor: "rgba(34, 139, 34, 0.1)",
          fill: true,
          tension: 0.2,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    };
  }, [data]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" as const },
      plugins: { legend: { display: false } },
      scales: {
        x: {
          title: { display: true, text: "Distance (km)" },
          ticks: { maxTicksLimit: 8 },
        },
        y: {
          title: { display: true, text: "Elevation (m)" },
          beginAtZero: false,
        },
      },
    }),
    []
  );

  if (error) {
    return (
      <div
        className={`flex min-h-[200px] items-center justify-center rounded-card border border-verter-border bg-verter-snow/50 ${className}`}
      >
        <p className="text-sm text-verter-muted">{error}</p>
      </div>
    );
  }

  if (!ChartComponent || data.length < 2) {
    return (
      <div
        className={`flex min-h-[200px] items-center justify-center rounded-card border border-verter-border bg-verter-snow/50 ${className}`}
      >
        <p className="text-sm text-verter-muted">Loading chart…</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-[200px] w-full rounded-card border border-verter-border p-4 ${className}`}
    >
      <div className="h-[200px] w-full">
        <ChartComponent data={chartData} options={options} />
      </div>
    </div>
  );
}
