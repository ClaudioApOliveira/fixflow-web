'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ServicesChartProps {
  data: Array<{ tipo: string; quantidade: number }>
}

export function ServicesChart({ data }: ServicesChartProps) {
  const chartData = {
    labels: data.map((d) => d.tipo),
    datasets: [
      {
        label: 'Quantidade',
        data: data.map((d) => d.quantidade),
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  }

  const options = {
    indexAxis: 'y' as const,
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
        text: 'Serviços Mais Solicitados',
        color: '#f3f4f6',
        font: { size: 14, weight: 600 as any },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { color: '#9ca3af' },
      },
      y: {
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { color: '#9ca3af' },
      },
    },
  }

  return <Bar data={chartData} options={options} />
}
