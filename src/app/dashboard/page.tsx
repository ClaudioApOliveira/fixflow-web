'use client'

import { useMemo } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card } from '@/components/ui'
import { RoleProtected } from '@/components/role-protected'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { StatusChart } from '@/components/charts/status-chart'
import { ServicesChart } from '@/components/charts/services-chart'
import { useOrdens, useServicosOS } from '@/lib/hooks'
import { formatCurrency, parseDate } from '@/lib/utils'

interface KPI {
    label: string
    value: string | number
    description: string
    icon: string
    color: string
}

export default function DashboardPage() {
    const { data: ordens = [] } = useOrdens()

    // Calcular KPIs
    const kpis = useMemo(() => {
        const hoje = new Date()
        const diaAtual = hoje.getDate()
        const mesAtual = hoje.getMonth()
        const anoAtual = hoje.getFullYear()

        const ordensHoje = ordens.filter(o => {
            const criadoEm = parseDate(o.criadoEm)
            return criadoEm.getDate() === diaAtual &&
                criadoEm.getMonth() === mesAtual &&
                criadoEm.getFullYear() === anoAtual &&
                o.status === 'CONCLUIDO'
        })

        const totalHoje = ordensHoje.reduce((acc, o) => acc + o.valorTotal, 0)

        const emAndamento = ordens.filter(o => o.status === 'EM_ANDAMENTO').length
        const concluidas = ordens.filter(o => o.status === 'CONCLUIDO').length
        const totalReceita = ordens.filter(o => o.status === 'CONCLUIDO').reduce((acc, o) => acc + o.valorTotal, 0)

        return [
            {
                label: 'Ordens Hoje',
                value: ordensHoje.length,
                description: `de ${ordens.length} total`,
                icon: '📋',
                color: 'from-blue-500 to-blue-600',
            },
            {
                label: 'Receita Hoje',
                value: formatCurrency(totalHoje),
                description: `de R$ ${formatCurrency(totalReceita)}`,
                icon: '💰',
                color: 'from-green-500 to-green-600',
            },
            {
                label: 'Em Andamento',
                value: emAndamento,
                description: `${concluidas} concluídas hoje`,
                icon: '⚙️',
                color: 'from-orange-500 to-orange-600',
            },
            {
                label: 'Taxa Conclusão',
                value: `${ordens.length > 0 ? Math.round((concluidas / ordens.length) * 100) : 0}%`,
                description: `${concluidas} de ${ordens.length}`,
                icon: '✅',
                color: 'from-purple-500 to-purple-600',
            },
        ] as KPI[]
    }, [ordens])

    // Dados para gráficos
    const statusData = useMemo(() => {
        return {
            orcamento: ordens.filter(o => o.status === 'ORCAMENTO').length,
            orcamentoAprovado: ordens.filter(o => o.status === 'ORCAMENTO_APROVADO').length,
            orcamentoRecusado: ordens.filter(o => o.status === 'ORCAMENTO_RECUSADO').length,
            pendente: ordens.filter(o => o.status === 'PENDENTE').length,
            emAndamento: ordens.filter(o => o.status === 'EM_ANDAMENTO').length,
            concluido: ordens.filter(o => o.status === 'CONCLUIDO').length,
            cancelado: ordens.filter(o => o.status === 'CANCELADO').length,
        }
    }, [ordens])

    // Receita por dia (últimos 7 dias)
    const revenueData = useMemo(() => {
        const dias = []
        const hoje = new Date()

        for (let i = 6; i >= 0; i--) {
            const data = new Date(hoje)
            data.setDate(data.getDate() - i)

            const dia = String(data.getDate()).padStart(2, '0')
            const mes = String(data.getMonth() + 1).padStart(2, '0')

            const ordensDodia = ordens.filter(o => {
                const criadoEm = parseDate(o.criadoEm)
                return criadoEm.getDate() === data.getDate() &&
                    criadoEm.getMonth() === data.getMonth() &&
                    criadoEm.getFullYear() === data.getFullYear() &&
                    o.status === 'CONCLUIDO'
            })

            const valor = ordensDodia.reduce((acc, o) => acc + o.valorTotal, 0)

            dias.push({
                date: `${dia}/${mes}`,
                valor,
            })
        }

        return dias
    }, [ordens])

    // Serviços mais solicitados
    const servicesData = useMemo(() => {
        const servicosMap = new Map<string, number>()

        // Este dado vendria do backend idealmente
        ordens.forEach(ordem => {
            const tipo = ordem.status
            servicosMap.set(tipo, (servicosMap.get(tipo) || 0) + 1)
        })

        return Array.from(servicosMap.entries())
            .map(([tipo, quantidade]) => ({
                tipo,
                quantidade,
            }))
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 5)
    }, [ordens])

    return (
        <DashboardLayout title="Dashboard">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {kpis.map((kpi, index) => {
                    // Proteger KPIs de receita e faturamento
                    if (kpi.label === 'Receita Hoje' || kpi.label === 'Taxa Conclusão') {
                        return (
                            <RoleProtected
                                key={index}
                                allowedRoles={['ADMIN', 'GERENTE', 'FINANCEIRO']}
                                fallback={<Card className="p-6 bg-muted/30" />}
                            >
                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-medium text-muted-foreground">{kpi.label}</h3>
                                            <span className="text-3xl">{kpi.icon}</span>
                                        </div>
                                        <div className="mb-2">
                                            <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{kpi.description}</p>
                                    </div>
                                </Card>
                            </RoleProtected>
                        )
                    }

                    // KPIs públicos
                    return (
                        <Card key={index}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-muted-foreground">{kpi.label}</h3>
                                    <span className="text-3xl">{kpi.icon}</span>
                                </div>
                                <div className="mb-2">
                                    <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">{kpi.description}</p>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Gráfico de Receita - Protegido */}
                <RoleProtected
                    allowedRoles={['ADMIN', 'GERENTE', 'FINANCEIRO']}
                    fallback={<Card className="lg:col-span-2 p-6 bg-muted/30" />}
                >
                    <Card className="lg:col-span-2">
                        <div className="p-6">
                            <div style={{ height: '300px' }}>
                                <RevenueChart data={revenueData} />
                            </div>
                        </div>
                    </Card>
                </RoleProtected>

                {/* Gráfico de Status - Público */}
                <Card>
                    <div className="p-6">
                        <div style={{ height: '300px' }}>
                            <StatusChart data={statusData} />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <div className="p-6">
                        <div style={{ height: '300px' }}>
                            <ServicesChart data={servicesData} />
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    )
}
