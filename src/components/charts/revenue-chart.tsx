'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface RevenueChartProps {
  data: Array<{ date: string; valor: number }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: 'Receita (R$)',
        data: data.map((d) => d.valor),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: 'Receita por Período',
        color: '#f3f4f6',
        font: { size: 14, weight: 600 as any },
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: {
          color: '#9ca3af',
          callback: function (value: any) {
            return `R$ ${value.toFixed(0)}`
          },
        },
      },
      x: {
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { color: '#9ca3af' },
      },
    },
  }

  return <Line data={chartData} options={options} />
}
