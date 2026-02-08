'use client'

import { Doughnut } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface StatusChartProps {
    data: {
        orcamento: number
        orcamentoAprovado: number
        orcamentoRecusado: number
        pendente: number
        emAndamento: number
        concluido: number
        cancelado: number
    }
}

export function StatusChart({ data }: StatusChartProps) {
    const chartData = {
        labels: [
            'Orçamento',
            'Aprovado',
            'Recusado',
            'Pendente',
            'Em Andamento',
            'Concluído',
            'Cancelado',
        ],
        datasets: [
            {
                data: [
                    data.orcamento,
                    data.orcamentoAprovado,
                    data.orcamentoRecusado,
                    data.pendente,
                    data.emAndamento,
                    data.concluido,
                    data.cancelado,
                ],
                backgroundColor: [
                    '#a855f7', // Purple
                    '#10b981', // Green
                    '#ef4444', // Red
                    '#f59e0b', // Amber
                    '#3b82f6', // Blue
                    '#06b6d4', // Cyan
                    '#6b7280', // Gray
                ],
                borderColor: '#1f2937',
                borderWidth: 2,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#9ca3af',
                    font: { size: 11 },
                    padding: 16,
                },
            },
            title: {
                display: true,
                text: 'Distribuição de Status',
                color: '#f3f4f6',
                font: { size: 14, weight: 600 as any },
            },
        },
    }

    return <Doughnut data={chartData} options={options} />
}
