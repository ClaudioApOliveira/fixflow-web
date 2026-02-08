import { ReactNode } from 'react'
import { Card } from './card'

interface StatCardProps {
  label: string
  value: number | string
  icon: ReactNode
  color?: 'primary' | 'warning' | 'info' | 'success' | 'danger'
}

export function StatCard({ label, value, icon, color = 'primary' }: StatCardProps) {
  const colorClasses = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    warning: 'from-warning/20 to-warning/5 text-warning',
    info: 'from-info/20 to-info/5 text-info',
    success: 'from-success/20 to-success/5 text-success',
    danger: 'from-danger/20 to-danger/5 text-danger',
  }

  return (
    <Card className={`bg-linear-to-br ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">{icon}</div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </Card>
  )
}
