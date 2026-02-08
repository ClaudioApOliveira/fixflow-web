'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui'
import type { DisponibilidadeMecanico } from '@/types'

interface AvailableSlotsProps {
    date: Date
    disponibilidade: DisponibilidadeMecanico[]
    onSelectSlot: (slot: { start: Date; end: Date }) => void
}

export function AvailableSlots({ date, disponibilidade, onSelectSlot }: AvailableSlotsProps) {
    if (disponibilidade.length === 0) {
        return (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <p className="text-sm text-warning font-medium">⚠️ Nenhum horário disponível</p>
                <p className="text-xs text-muted-foreground mt-1">Tente selecionar outro dia ou mecânico</p>
            </div>
        )
    }

    const dayFormatted = format(date, 'EEEE, d', { locale: ptBR })

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground capitalize">Horários disponíveis</p>
                <Badge variant="default" className="text-xs">{dayFormatted}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {disponibilidade.map((disp, dispIdx) =>
                    disp.horariosDisponiveis.map((slot, slotIdx) => {
                        const slotStart = new Date(slot.inicio)
                        const slotEnd = new Date(slot.fim)
                        const slotKey = `${dispIdx}-${slotIdx}`

                        return (
                            <button
                                key={slotKey}
                                onClick={() => onSelectSlot({ start: slotStart, end: slotEnd })}
                                className="relative group px-3 py-2 text-sm font-medium rounded-lg border border-success/30 bg-success/5 text-success hover:bg-success hover:text-success-foreground hover:border-success transition-all duration-200 flex items-center justify-center gap-1"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {format(slotStart, 'HH:mm')} - {format(slotEnd, 'HH:mm')}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-foreground text-background text-xs rounded px-2 py-1 pointer-events-none">
                                    Clique para agendar
                                </div>
                            </button>
                        )
                    })
                )}
            </div>

            <p className="text-xs text-muted-foreground italic">💡 Clique em um horário para agendar</p>
        </div>
    )
}
