'use client'

import { useState, useEffect } from 'react'
import { Modal, Button, Select, NotebookTextarea } from '@/components/ui'
import {
  useClientes,
  useVeiculosByCliente,
  useUsuarios,
  useDisponibilidadeMecanicos,
} from '@/lib/hooks'
import type { AgendamentoRequest } from '@/types'
import { format } from 'date-fns'
import { nowInSaoPaulo, toSaoPauloTime } from '@/lib/utils'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

interface AgendamentoFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AgendamentoRequest) => Promise<void>
  initialData?: Partial<AgendamentoRequest>
  initialDate?: { start: Date; end: Date }
  isReagendar?: boolean
}

const TIPO_SERVICO_OPTIONS = [
  { value: 'TROCA_OLEO', label: 'Troca de Óleo' },
  { value: 'TROCA_FILTRO_OLEO', label: 'Troca de Filtro de Óleo' },
  { value: 'TROCA_FILTRO_AR', label: 'Troca de Filtro de Ar' },
  { value: 'TROCA_FILTRO_COMBUSTIVEL', label: 'Troca de Filtro de Combustível' },
  { value: 'TROCA_PASTILHA_FREIO', label: 'Troca de Pastilha de Freio' },
  { value: 'TROCA_DISCO_FREIO', label: 'Troca de Disco de Freio' },
  { value: 'ALINHAMENTO', label: 'Alinhamento' },
  { value: 'BALANCEAMENTO', label: 'Balanceamento' },
  { value: 'REVISAO', label: 'Revisão' },
  { value: 'REVISAO_GERAL', label: 'Revisão Geral' },
  { value: 'TROCA_CORREIA_DENTADA', label: 'Troca de Correia Dentada' },
  { value: 'TROCA_BATERIA', label: 'Troca de Bateria' },
  { value: 'TROCA_PNEU', label: 'Troca de Pneu' },
  { value: 'SUSPENSAO', label: 'Suspensão' },
  { value: 'CAMBIO', label: 'Câmbio' },
  { value: 'EMBREAGEM', label: 'Embreagem' },
  { value: 'SISTEMA_ELETRICO', label: 'Sistema Elétrico' },
  { value: 'AR_CONDICIONADO', label: 'Ar Condicionado' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'OUTROS', label: 'Outros' },
]

export function AgendamentoForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialDate,
  isReagendar = false,
}: AgendamentoFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<number>(0)

  const { data: clientes = [] } = useClientes()
  const { data: veiculos = [] } = useVeiculosByCliente(selectedClienteId)
  const { data: usuarios = [] } = useUsuarios()

  const [formData, setFormData] = useState<AgendamentoRequest>({
    clienteId: 0,
    veiculoId: 0,
    mecanicoId: 0,
    dataHoraInicio: nowInSaoPaulo().toISOString(),
    dataHoraFim: nowInSaoPaulo().toISOString(),
    servicosSolicitados: [],
    observacoes: '',
  })

  const [selectedDate, setSelectedDate] = useState<Date>(nowInSaoPaulo())
  const { data: disponibilidade = [] } = useDisponibilidadeMecanicos(selectedDate)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Atualizar form data quando initialData ou initialDate mudar
  useEffect(() => {
    if (initialDate) {
      setFormData((prev) => ({
        ...prev,
        dataHoraInicio: initialDate.start.toISOString(),
        dataHoraFim: initialDate.end.toISOString(),
      }))
      setSelectedDate(initialDate.start)
    }
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }))
      // Sincronizar o cliente selecionado para carregar veículos
      if (initialData.clienteId) {
        setSelectedClienteId(initialData.clienteId)
      }
    }
  }, [initialData, initialDate])

  const clientesOptions = clientes.map((c) => ({
    value: c.id.toString(),
    label: c.nomeCompleto,
  }))

  const veiculosOptions = veiculos.map((v) => ({
    value: v.id.toString(),
    label: `${v.marca} ${v.modelo} - ${v.placa}`,
  }))

  const mecanicosOptions = usuarios
    .filter((u) => u.roles.includes('MECANICO'))
    .map((u) => ({
      value: u.id.toString(),
      label: u.nome,
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    const newErrors: Record<string, string> = {}
    if (formData.clienteId === 0 || !formData.clienteId)
      newErrors.clienteId = 'Selecione um cliente'
    if (formData.veiculoId === 0 || !formData.veiculoId)
      newErrors.veiculoId = 'Selecione um veículo'
    if (formData.mecanicoId === 0 || !formData.mecanicoId)
      newErrors.mecanicoId = 'Selecione um mecânico'
    if (formData.servicosSolicitados.length === 0)
      newErrors.servicosSolicitados = 'Selecione pelo menos um serviço'

    // Validar se a data está no passado (usando São Paulo)
    const now = nowInSaoPaulo()
    if (new Date(formData.dataHoraInicio) <= now) {
      newErrors.dataHoraInicio = 'A data e hora devem estar no futuro'
    }

    // Validar se a hora fim é posterior à hora início
    if (new Date(formData.dataHoraFim) <= new Date(formData.dataHoraInicio)) {
      newErrors.dataHoraFim = 'A hora fim deve ser posterior à hora início'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      // Converter as datas de UTC para São Paulo antes de enviar
      const zonedInicio = toZonedTime(new Date(formData.dataHoraInicio), 'America/Sao_Paulo')
      const zonedFim = toZonedTime(new Date(formData.dataHoraFim), 'America/Sao_Paulo')

      const submitData: AgendamentoRequest = {
        ...formData,
        dataHoraInicio: format(zonedInicio, "yyyy-MM-dd'T'HH:mm:ss"),
        dataHoraFim: format(zonedFim, "yyyy-MM-dd'T'HH:mm:ss"),
      }

      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleServiceToggle = (serviceValue: string) => {
    setFormData((prev) => {
      const servicosSolicitados = prev.servicosSolicitados.includes(serviceValue)
        ? prev.servicosSolicitados.filter((s) => s !== serviceValue)
        : [...prev.servicosSolicitados, serviceValue]
      return { ...prev, servicosSolicitados }
    })
    setErrors((prev) => ({ ...prev, servicosSolicitados: '' }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReagendar ? 'Reagendar Atendimento' : 'Novo Agendamento'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Cliente"
            placeholder="Selecione o cliente"
            value={formData.clienteId > 0 ? formData.clienteId.toString() : ''}
            onChange={(e) => {
              const clienteId = e.target.value ? parseInt(e.target.value) : 0
              setFormData({ ...formData, clienteId, veiculoId: 0 })
              setSelectedClienteId(clienteId)
              setErrors((prev) => ({ ...prev, clienteId: '', veiculoId: '' }))
            }}
            options={clientesOptions}
            error={errors.clienteId}
            required
          />

          <Select
            label="Veículo"
            placeholder="Selecione o veículo"
            value={formData.veiculoId > 0 ? formData.veiculoId.toString() : ''}
            onChange={(e) => {
              const veiculoId = e.target.value ? parseInt(e.target.value) : 0
              setFormData({ ...formData, veiculoId })
              setErrors((prev) => ({ ...prev, veiculoId: '' }))
            }}
            options={veiculosOptions}
            error={errors.veiculoId}
            required
            disabled={!formData.clienteId}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Data e Hora Início *
            </label>
            <input
              type="datetime-local"
              className="w-full h-11 px-4 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              min={format(toSaoPauloTime(nowInSaoPaulo()), "yyyy-MM-dd'T'HH:mm")}
              value={format(
                toSaoPauloTime(new Date(formData.dataHoraInicio)),
                "yyyy-MM-dd'T'HH:mm"
              )}
              onChange={(e) => {
                const newDate = fromZonedTime(new Date(e.target.value), 'America/Sao_Paulo')
                setFormData({ ...formData, dataHoraInicio: newDate.toISOString() })
                setSelectedDate(newDate)
                setErrors({ ...errors, dataHoraInicio: '' })
              }}
              required
            />
            {errors.dataHoraInicio && (
              <p className="text-xs text-danger mt-1">{errors.dataHoraInicio}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Data e Hora Fim *
            </label>
            <input
              type="datetime-local"
              className="w-full h-11 px-4 bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              min={format(toSaoPauloTime(new Date(formData.dataHoraInicio)), "yyyy-MM-dd'T'HH:mm")}
              value={format(new Date(formData.dataHoraFim), "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => {
                const newDate = fromZonedTime(new Date(e.target.value), 'America/Sao_Paulo')
                setFormData({ ...formData, dataHoraFim: newDate.toISOString() })
                setErrors({ ...errors, dataHoraFim: '' })
              }}
              required
            />
            {errors.dataHoraFim && <p className="text-xs text-danger mt-1">{errors.dataHoraFim}</p>}
          </div>
        </div>

        <Select
          label="Mecânico"
          placeholder="Selecione o mecânico"
          value={formData.mecanicoId > 0 ? formData.mecanicoId.toString() : ''}
          onChange={(e) => {
            const mecanicoId = e.target.value ? parseInt(e.target.value) : 0
            setFormData({ ...formData, mecanicoId })
            setErrors((prev) => ({ ...prev, mecanicoId: '' }))
          }}
          options={mecanicosOptions}
          error={errors.mecanicoId}
          required
        />

        {/* Disponibilidade do mecânico */}
        {formData.mecanicoId > 0 && disponibilidade.length > 0 && (
          <div className="bg-info/10 border border-info/20 rounded-lg p-3">
            <p className="text-sm font-medium text-foreground mb-2">Horários Disponíveis:</p>
            <div className="space-y-1">
              {disponibilidade
                .filter((d) => d.mecanicoId === formData.mecanicoId)
                .map((d) =>
                  d.horariosDisponiveis.map((h, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">
                      • {format(new Date(h.inicio), 'HH:mm')} - {format(new Date(h.fim), 'HH:mm')}
                    </p>
                  ))
                )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Serviços Solicitados *
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-border rounded-lg p-3 bg-secondary/30">
            {TIPO_SERVICO_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.servicosSolicitados.includes(option.value)}
                  onChange={() => handleServiceToggle(option.value)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-ring"
                />
                <span className="text-sm text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.servicosSolicitados && (
            <p className="text-xs text-danger mt-1">{errors.servicosSolicitados}</p>
          )}
        </div>

        <NotebookTextarea
          label="Observações"
          placeholder="Observações adicionais (opcional)"
          value={formData.observacoes || ''}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isReagendar ? 'Reagendar' : 'Agendar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
