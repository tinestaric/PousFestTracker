'use client'

import { useEffect, useState } from 'react'

interface ChartData {
  labels: string[]
  datasets: any[]
}

interface ChartProps {
  type: 'pie' | 'line'
  data: ChartData
  title: string
  icon: React.ReactNode
}

export default function Chart({ type, data, title, icon }: ChartProps) {
  const [ChartComponent, setChartComponent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Dynamically import Chart.js only when needed
    const loadChart = async () => {
      try {
        const [
          ChartJS,
          { CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler },
          { Pie, Line }
        ] = await Promise.all([
          import('chart.js').then(mod => mod.Chart),
          import('chart.js'),
          import('react-chartjs-2')
        ])

        // Register only the components we need (including Filler for filled line charts)
        ChartJS.register(
          CategoryScale,
          LinearScale,
          BarElement,
          Title,
          Tooltip,
          Legend,
          ArcElement,
          PointElement,
          LineElement,
          Filler
        )

        setChartComponent(type === 'pie' ? Pie : Line)
        setLoading(false)
      } catch (error) {
        console.error('Failed to load chart:', error)
        setLoading(false)
      }
    }

    loadChart()
  }, [type])

  if (loading || !ChartComponent) {
    return (
      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 sm:p-6 shadow-xl">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-white drop-shadow-lg">
          {icon}
          {title}
        </h3>
        <div className={`bg-white/10 rounded-xl p-2 sm:p-4 flex items-center justify-center ${
          type === 'pie' ? 'h-80' : 'h-64'
        }`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  const chartOptions = type === 'pie' 
    ? {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom' as const,
            labels: {
              padding: 8,
              usePointStyle: true,
              color: '#ffffff',
              boxWidth: 12,
              boxHeight: 12,
              font: {
                size: 12
              },
              // Enable text wrapping and truncation
              generateLabels: function(chart: any) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label: string, i: number) => {
                    const dataset = data.datasets[0];
                    return {
                      text: label.length > 15 ? label.substring(0, 15) + '...' : label,
                      fillStyle: dataset.backgroundColor[i],
                      strokeStyle: dataset.borderColor?.[i] || dataset.backgroundColor[i],
                      lineWidth: dataset.borderWidth || 0,
                      hidden: false,
                      index: i,
                      fontColor: '#ffffff'
                    };
                  });
                }
                return [];
              }
            },
            maxHeight: 120,
            onClick: function(e: any, legendItem: any, legend: any) {
              const index = legendItem.index;
              const chart = legend.chart;
              const meta = chart.getDatasetMeta(0);
              meta.data[index].hidden = !meta.data[index].hidden;
              chart.update();
            }
          }
        }
      }
    : {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function(value: any) {
                return Number.isInteger(value) ? value : null;
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }

  return (
    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 sm:p-6 shadow-xl">
      <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2 text-white drop-shadow-lg">
        {icon}
        {title}
      </h3>
      <div className={`bg-white/10 rounded-xl p-2 sm:p-4 ${
        type === 'pie' 
          ? 'h-80 overflow-y-auto overflow-x-hidden' 
          : 'h-64 overflow-hidden'
      }`}>
        <ChartComponent data={data} options={chartOptions} />
      </div>
    </div>
  )
} 