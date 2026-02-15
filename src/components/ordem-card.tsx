import type { OrdemServico, StatusOrdem } from '@/types'
import { STATUS_CONFIG } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'

export function OrdemCard({ ordem }: { ordem: OrdemServico }) {
  const status = STATUS_CONFIG[ordem.status as StatusOrdem] || {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
    dot: 'bg-muted-foreground',
    label: ordem.status,
  }

  const formattedDate = formatDate(ordem.criadoEm)

  return (
    <div className="group relative bg-card rounded-2xl border border-border p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">OS</span>
            <h3 className="font-bold text-xl">#{ordem.id}</h3>
          </div>
          <p className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded-md inline-block">
            {ordem.codigoRastreio}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text} ${status.border} border`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Info grid */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-sm">Cliente</span>
          </div>
          <span className="font-semibold text-sm">
            {ordem.nomeCliente || `#${ordem.clienteId}`}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 9l-7 7-7-7"
              />
              <circle cx="12" cy="5" r="2" strokeWidth={1.5} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19h14" />
            </svg>
            <span className="text-sm">Veículo</span>
          </div>
          <span className="font-semibold text-sm">
            {ordem.modeloVeiculo || `#${ordem.veiculoId}`}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">Criado em</span>
          </div>
          <span className="font-medium text-sm text-muted-foreground">{formattedDate}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Valor total</p>
          <p className="text-2xl font-bold gradient-text">{formatCurrency(ordem.valorTotal)}</p>
        </div>
        <button className="p-3 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-all group-hover:scale-105">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
