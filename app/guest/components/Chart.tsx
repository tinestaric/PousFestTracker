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
  yTickStep?: number
  showDecimalYTicks?: boolean
  caption?: string
  xTickLabelFilter?: 'halfHour' | 'hour'
}

export default function Chart({ type, data, title, icon, yTickStep, showDecimalYTicks, caption, xTickLabelFilter }: ChartProps) {
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
                    const backgroundArray = Array.isArray(dataset.backgroundColor)
                      ? dataset.backgroundColor
                      : new Array(data.labels.length).fill(dataset.backgroundColor || '#ffffff')
                    const borderArray = Array.isArray(dataset.borderColor)
                      ? dataset.borderColor
                      : new Array(data.labels.length).fill(dataset.borderColor || backgroundArray[i])
                    return {
                      text: label.length > 15 ? label.substring(0, 15) + '...' : label,
                      fillStyle: backgroundArray[i],
                      strokeStyle: borderArray[i] || backgroundArray[i],
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
              stepSize: yTickStep || (showDecimalYTicks ? 0.01 : 1),
              callback: function(value: any) {
                if (showDecimalYTicks) return value
                return Number.isInteger(value) ? value : null;
              },
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 24,
              autoSkipPadding: 4,
              maxRotation: 0,
              minRotation: 0,
              color: '#ffffff',
              callback: function(this: any, value: any, index: number, ticks: any[]) {
                const resolvedLabel = (this && typeof this.getLabelForValue === 'function')
                  ? this.getLabelForValue(value)
                  : (typeof value === 'string' ? value : (ticks[index]?.label || ''))
                if (!xTickLabelFilter) {
                  return resolvedLabel
                }
                const label = resolvedLabel
                // Expect HH:MM
                const m = /:(\d{2})/.exec(label)
                const mm = m ? m[1] : null
                if (!mm) return ''
                if (xTickLabelFilter === 'halfHour') {
                  return (mm === '00' || mm === '30') ? label : ''
                }
                if (xTickLabelFilter === 'hour') {
                  return mm === '00' ? label : ''
                }
                return label
              }
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
      {caption && (
        <p className="text-xs text-white/70 mt-2">{caption}</p>
      )}
    </div>
  )
} 