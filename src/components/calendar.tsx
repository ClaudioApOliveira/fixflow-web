'use client'

import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../app/agendamentos/calendar.css'
import type { Agendamento, StatusAgendamento } from '@/types'
import { useMemo } from 'react'
import { nowInSaoPaulo } from '@/lib/utils'

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(nowInSaoPaulo(), { locale: ptBR }),
  getDay,
  locales,
})

interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  resource: Agendamento
}

interface CalendarProps {
  agendamentos: Agendamento[]
  onSelectEvent: (agendamento: Agendamento) => void
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void
  view?: View
  onViewChange?: (view: View) => void
  date?: Date
  onNavigate?: (date: Date) => void
}

const STATUS_COLORS: Record<StatusAgendamento, string> = {
  AGENDADO: '#f59e0b',
  CONFIRMADO: '#3b82f6',
  EM_ATENDIMENTO: '#8b5cf6',
  CONCLUIDO: '#10b981',
  CANCELADO: '#6b7280',
  REAGENDADO: '#f97316',
}

export function Calendar({
  agendamentos,
  onSelectEvent,
  onSelectSlot,
  view = 'week',
  onViewChange,
  date,
  onNavigate,
}: CalendarProps) {
  const events: CalendarEvent[] = useMemo(
    () =>
      agendamentos.map((agendamento) => ({
        id: agendamento.id,
        title: `${agendamento.nomeCliente || `Cliente #${agendamento.clienteId}`} - ${agendamento.nomeMecanico || `Mecânico #${agendamento.mecanicoId}`}`,
        start: new Date(agendamento.dataHoraInicio),
        end: new Date(agendamento.dataHoraFim),
        resource: agendamento,
      })),
    [agendamentos]
  )

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = STATUS_COLORS[event.resource.status]
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
      },
    }
  }

  const handleSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    // Não permitir selecionar slots no passado (em São Paulo)
    const now = nowInSaoPaulo()
    if (slotInfo.start <= now) {
      return // Ignora seleção de slots no passado
    }
    onSelectSlot(slotInfo)
  }

  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Agendamento',
    noEventsInRange: 'Não há agendamentos neste período.',
    showMore: (total: number) => `+${total} mais`,
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4" style={{ height: '700px' }}>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={(event) => onSelectEvent(event.resource)}
        onSelectSlot={handleSlotSelect}
        selectable
        eventPropGetter={eventStyleGetter}
        messages={messages}
        culture="pt-BR"
        view={view}
        onView={onViewChange}
        date={date}
        onNavigate={onNavigate}
        step={30}
        timeslots={2}
        min={new Date(2024, 0, 1, 7, 0, 0)}
        max={new Date(2024, 0, 1, 19, 0, 0)}
      />
    </div>
  )
}
