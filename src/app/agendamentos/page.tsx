'use client'

import { useState } from 'react'
import { View } from 'react-big-calendar'
import { DashboardLayout } from '@/components/layout'
import { Calendar } from '@/components/calendar'
import { AgendamentoForm } from '@/components/agendamento-form'
import { AvailableSlots } from '@/components/available-slots'
import { AvailabilityLegend } from '@/components/availability-legend'
import { Button, Card, Badge, Modal, ConfirmDialog, useToast } from '@/components/ui'
import {
  useAgendamentos,
  useCreateAgendamento,
  useCancelAgendamento,
  useConfirmarAgendamento,
  useUpdateAgendamento,
  useDisponibilidadeMecanicos,
} from '@/lib/hooks'
import type { Agendamento, AgendamentoRequest, StatusAgendamento } from '@/types'
import { format } from 'date-fns'
import { PlusIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@/components/icons'
import { nowInSaoPaulo } from '@/lib/utils'

const STATUS_CONFIG: Record<StatusAgendamento, { bg: string; text: string; label: string }> = {
  AGENDADO: { bg: 'bg-warning/10', text: 'text-warning', label: 'Agendado' },
  CONFIRMADO: { bg: 'bg-info/10', text: 'text-info', label: 'Confirmado' },
  EM_ATENDIMENTO: { bg: 'bg-purple/10', text: 'text-purple', label: 'Em Atendimento' },
  CONCLUIDO: { bg: 'bg-success/10', text: 'text-success', label: 'Concluído' },
  CANCELADO: { bg: 'bg-danger/10', text: 'text-danger', label: 'Cancelado' },
  REAGENDADO: { bg: 'bg-orange/10', text: 'text-orange', label: 'Reagendado' },
}

export default function AgendamentosPage() {
  const { addToast } = useToast()
  const [currentDate, setCurrentDate] = useState(nowInSaoPaulo())
  const [selectedDate, setSelectedDate] = useState(nowInSaoPaulo())
  const [currentView, setCurrentView] = useState<View>('week')
  const [statusFilter, setStatusFilter] = useState<StatusAgendamento | 'TODOS'>('TODOS')

  const { data: agendamentos = [], isLoading } = useAgendamentos()
  const { data: disponibilidade = [] } = useDisponibilidadeMecanicos(selectedDate)
  const createAgendamento = useCreateAgendamento()
  const cancelAgendamento = useCancelAgendamento()
  const confirmarAgendamento = useConfirmarAgendamento()
  const updateAgendamento = useUpdateAgendamento()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [isReagendar, setIsReagendar] = useState(false)

  const filteredAgendamentos =
    statusFilter === 'TODOS' ? agendamentos : agendamentos.filter((a) => a.status === statusFilter)

  const handleSelectEvent = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento)
    setIsDetailOpen(true)
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // Validar se a data está no passado (usando São Paulo)
    const now = nowInSaoPaulo()
    if (slotInfo.start <= now) {
      addToast('error', 'Não é possível agendar para datas no passado')
      return
    }

    setSelectedDate(slotInfo.start)
    setSelectedSlot(slotInfo)
    setIsReagendar(false)
    setIsFormOpen(true)
  }

  const handleCreateAgendamento = async (data: AgendamentoRequest) => {
    try {
      await createAgendamento.mutateAsync(data)
      addToast('success', 'Agendamento criado com sucesso!')
      setIsFormOpen(false)
      setSelectedSlot(null)
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      const message = error instanceof Error ? error.message : 'Erro ao criar agendamento'
      addToast('error', message)
    }
  }

  const handleReagendar = () => {
    if (selectedAgendamento) {
      setIsReagendar(true)
      setIsDetailOpen(false)
      setIsFormOpen(true)
    }
  }

  const handleUpdateAgendamento = async (data: AgendamentoRequest) => {
    if (selectedAgendamento) {
      try {
        await updateAgendamento.mutateAsync({ id: selectedAgendamento.id, ...data })
        addToast('success', 'Agendamento reagendado com sucesso!')
        setIsFormOpen(false)
        setSelectedAgendamento(null)
        setIsReagendar(false)
      } catch (error) {
        console.error('Erro ao reagendar:', error)
        const message = error instanceof Error ? error.message : 'Erro ao reagendar'
        addToast('error', message)
      }
    }
  }

  const handleConfirmar = async () => {
    if (selectedAgendamento) {
      try {
        await confirmarAgendamento.mutateAsync(selectedAgendamento.id)
        addToast('success', 'Agendamento confirmado com sucesso!')
        setIsDetailOpen(false)
      } catch (error) {
        console.error('Erro ao confirmar:', error)
        const message = error instanceof Error ? error.message : 'Erro ao confirmar agendamento'
        addToast('error', message)
      }
    }
  }

  const handleCancelar = async () => {
    if (selectedAgendamento) {
      try {
        await cancelAgendamento.mutateAsync(selectedAgendamento.id)
        addToast('success', 'Agendamento cancelado!')
        setIsCancelDialogOpen(false)
        setIsDetailOpen(false)
      } catch (error) {
        console.error('Erro ao cancelar:', error)
        const message = error instanceof Error ? error.message : 'Erro ao cancelar agendamento'
        addToast('error', message)
      }
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Agendamentos">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Agendamentos"
      subtitle="Gerencie os agendamentos da oficina"
      actions={
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusIcon size={16} /> Novo Agendamento
        </Button>
      }
    >
      {/* Filtro de Status */}
      <Card className="mb-6">
        <div className="p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Filtrar por Status</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setStatusFilter('TODOS')}>
              <Badge
                variant={statusFilter === 'TODOS' ? 'default' : 'secondary'}
                className="cursor-pointer"
              >
                Todos ({agendamentos.length})
              </Badge>
            </button>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <button key={status} onClick={() => setStatusFilter(status as StatusAgendamento)}>
                <Badge
                  variant={statusFilter === status ? 'default' : 'secondary'}
                  className={`cursor-pointer ${statusFilter === status ? '' : config.bg + ' ' + config.text}`}
                >
                  {config.label} ({agendamentos.filter((a) => a.status === status).length})
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Agendados Hoje</p>
            <p className="text-2xl font-bold">
              {
                agendamentos.filter(
                  (a) =>
                    new Date(a.dataHoraInicio).toDateString() === nowInSaoPaulo().toDateString() &&
                    a.status === 'AGENDADO'
                ).length
              }
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Confirmados</p>
            <p className="text-2xl font-bold">
              {agendamentos.filter((a) => a.status === 'CONFIRMADO').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Em Atendimento</p>
            <p className="text-2xl font-bold">
              {agendamentos.filter((a) => a.status === 'EM_ATENDIMENTO').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Concluídos</p>
            <p className="text-2xl font-bold">
              {agendamentos.filter((a) => a.status === 'CONCLUIDO').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Calendário + Painel de Disponibilidade */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendário (3 colunas) */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <div className="p-4">
              <Calendar
                agendamentos={filteredAgendamentos}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                view={currentView}
                onViewChange={setCurrentView}
                date={currentDate}
                onNavigate={setCurrentDate}
              />
            </div>
          </Card>
        </div>

        {/* Painel Lateral (1 coluna) */}
        <div className="space-y-6">
          {/* Horários Disponíveis */}
          <Card>
            <div className="p-4 space-y-4">
              {disponibilidade.length > 0 ? (
                <AvailableSlots
                  date={selectedDate}
                  disponibilidade={disponibilidade}
                  onSelectSlot={(slot) => {
                    setSelectedSlot(slot)
                    setIsFormOpen(true)
                  }}
                />
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">Selecione uma data no calendário</p>
                </div>
              )}
            </div>
          </Card>

          {/* Legenda de Cores */}
          <Card>
            <div className="p-4">
              <AvailabilityLegend />
            </div>
          </Card>

          {/* Resumo Rápido */}
          <Card>
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
                Resumo
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Agendamentos</span>
                <Badge variant="default">{agendamentos.length}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pendentes</span>
                <Badge variant="secondary">
                  {agendamentos.filter((a) => a.status === 'AGENDADO').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Confirmados</span>
                <Badge variant="default">
                  {agendamentos.filter((a) => a.status === 'CONFIRMADO').length}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de formulário */}
      {isFormOpen && (
        <AgendamentoForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedSlot(null)
            setSelectedAgendamento(null)
            setIsReagendar(false)
          }}
          onSubmit={isReagendar ? handleUpdateAgendamento : handleCreateAgendamento}
          initialDate={
            selectedSlot
              ? selectedSlot
              : selectedAgendamento
                ? {
                    start: new Date(selectedAgendamento.dataHoraInicio),
                    end: new Date(selectedAgendamento.dataHoraFim),
                  }
                : undefined
          }
          initialData={
            selectedAgendamento
              ? {
                  clienteId: selectedAgendamento.clienteId,
                  veiculoId: selectedAgendamento.veiculoId,
                  mecanicoId: selectedAgendamento.mecanicoId,
                  dataHoraInicio: new Date(selectedAgendamento.dataHoraInicio),
                  dataHoraFim: new Date(selectedAgendamento.dataHoraFim),
                  servicosSolicitados: selectedAgendamento.servicosSolicitados,
                  observacoes: selectedAgendamento.observacoes,
                }
              : undefined
          }
          isReagendar={isReagendar}
        />
      )}

      {/* Modal de detalhes */}
      {selectedAgendamento && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedAgendamento(null)
          }}
          title="Detalhes do Agendamento"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h4 className="font-semibold">Status</h4>
              <Badge
                className={`${STATUS_CONFIG[selectedAgendamento.status].bg} ${
                  STATUS_CONFIG[selectedAgendamento.status].text
                }`}
              >
                {STATUS_CONFIG[selectedAgendamento.status].label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">
                  {selectedAgendamento.nomeCliente || `#${selectedAgendamento.clienteId}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Veículo</p>
                <p className="font-medium">
                  {selectedAgendamento.modeloVeiculo || `#${selectedAgendamento.veiculoId}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mecânico</p>
                <p className="font-medium">
                  {selectedAgendamento.nomeMecanico || `#${selectedAgendamento.mecanicoId}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data/Hora</p>
                <p className="font-medium">
                  {format(new Date(selectedAgendamento.dataHoraInicio), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Serviços Solicitados</p>
              <div className="flex flex-wrap gap-2">
                {selectedAgendamento.servicosSolicitados.map((servico) => (
                  <Badge key={servico} className="bg-secondary text-foreground">
                    {servico.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            {selectedAgendamento.observacoes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Observações</p>
                <p className="text-sm bg-secondary/50 p-3 rounded-lg">
                  {selectedAgendamento.observacoes}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              {selectedAgendamento.status === 'AGENDADO' && (
                <>
                  <Button variant="outline" onClick={handleReagendar}>
                    <CalendarIcon size={16} /> Reagendar
                  </Button>
                  <Button variant="outline" onClick={() => setIsCancelDialogOpen(true)}>
                    <XCircleIcon size={16} /> Cancelar
                  </Button>
                  <Button onClick={handleConfirmar}>
                    <CheckCircleIcon size={16} /> Confirmar
                  </Button>
                </>
              )}
              {selectedAgendamento.status === 'CONFIRMADO' && (
                <>
                  <Button variant="outline" onClick={handleReagendar}>
                    <CalendarIcon size={16} /> Reagendar
                  </Button>
                  <Button variant="outline" onClick={() => setIsCancelDialogOpen(true)}>
                    <XCircleIcon size={16} /> Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Dialog de confirmação de cancelamento */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelar}
        title="Cancelar Agendamento"
        message="Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."
        confirmLabel="Sim, cancelar"
        cancelLabel="Não, manter"
      />
    </DashboardLayout>
  )
}
