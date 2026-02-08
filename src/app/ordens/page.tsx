'use client'

import { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  useOrdens,
  useClientes,
  useVeiculos,
  useUsuarios,
  useCreateOrdem,
  useUpdateOrdem,
  useDeleteOrdem,
} from '@/lib/hooks'
import { DashboardLayout } from '@/components/layout'
import { OrdemCard } from '@/components/ordem-card'
import {
  Button,
  LoadingPage,
  EmptyState,
  SearchInput,
  Modal,
  Select,
  ConfirmDialog,
  StatCard,
  useToast,
} from '@/components/ui'
import { CurrencyInput } from '@/components/ui/masked-input'
import { usePermission } from '@/providers/auth-provider'
import { validateOrdemForm } from '@/lib/validations'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClipboardListIcon,
  ClockIcon,
  LoaderIcon,
  CircleCheckIcon,
  EyeIcon,
} from '@/components/icons'
import type { OrdemServico, OrdemServicoRequest, StatusOrdem } from '@/types'

const STATUS_OPTIONS = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

const STATUS_FILTERS = ['TODOS', 'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']

export default function OrdensPage() {
  const router = useRouter()
  const { data: ordens, isLoading } = useOrdens()
  const { data: clientes } = useClientes()
  const { data: veiculos } = useVeiculos()
  const { data: usuarios } = useUsuarios()
  const createOrdem = useCreateOrdem()
  const updateOrdem = useUpdateOrdem()
  const deleteOrdem = useDeleteOrdem()
  const { canCreateOrdem, canEditOrdem, canDeleteOrdem, canChangeOrdemStatus } = usePermission()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemServico | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<OrdemServicoRequest>({
    status: 'PENDENTE',
    valorTotal: 0,
    veiculoId: 0,
    clienteId: 0,
    responsavelId: 0,
  })

  const filteredOrdens = ordens?.filter((ordem) => {
    const matchesSearch =
      ordem.codigoRastreio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.id.toString().includes(searchTerm)
    const matchesStatus = statusFilter === 'TODOS' || ordem.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getVeiculosByCliente = (clienteId: number) => {
    return veiculos?.filter((v) => v.clienteId === clienteId) || []
  }

  const handleOpenModal = (ordem?: OrdemServico) => {
    setErrors({})
    if (ordem) {
      setSelectedOrdem(ordem)
      setFormData({
        status: ordem.status,
        valorTotal: ordem.valorTotal,
        veiculoId: ordem.veiculoId,
        clienteId: ordem.clienteId,
        responsavelId: ordem.responsavelId,
      })
    } else {
      setSelectedOrdem(null)
      setFormData({
        status: 'PENDENTE',
        valorTotal: 0,
        veiculoId: 0,
        clienteId: 0,
        responsavelId: 0,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrdem(null)
    setErrors({})
    setFormData({
      status: 'PENDENTE',
      valorTotal: 0,
      veiculoId: 0,
      clienteId: 0,
      responsavelId: 0,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateOrdemForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      if (selectedOrdem) {
        await updateOrdem.mutateAsync({ id: selectedOrdem.id, ...formData })
        addToast('success', 'Ordem atualizada com sucesso!')
      } else {
        await createOrdem.mutateAsync(formData)
        addToast('success', 'Ordem criada com sucesso!')
      }
      handleCloseModal()
    } catch (error) {
      console.error('Erro ao salvar ordem:', error)
      const message = error instanceof Error ? error.message : 'Erro ao salvar ordem'
      addToast('error', message)
    }
  }

  const handleDelete = async () => {
    if (selectedOrdem) {
      try {
        await deleteOrdem.mutateAsync(selectedOrdem.id)
        addToast('success', 'Ordem excluída com sucesso!')
        setIsDeleteDialogOpen(false)
        setSelectedOrdem(null)
      } catch (error) {
        console.error('Erro ao deletar ordem:', error)
        const message = error instanceof Error ? error.message : 'Erro ao excluir ordem'
        addToast('error', message)
      }
    }
  }

  const openDeleteDialog = (ordem: OrdemServico) => {
    setSelectedOrdem(ordem)
    setIsDeleteDialogOpen(true)
  }

  const handleClienteChange = (clienteId: number) => {
    if (errors.clienteId) setErrors({ ...errors, clienteId: '' })
    setFormData((prev) => ({
      ...prev,
      clienteId,
      veiculoId: 0,
    }))
  }

  const stats = {
    total: ordens?.length || 0,
    pendentes: ordens?.filter((o) => o.status === 'PENDENTE').length || 0,
    emAndamento: ordens?.filter((o) => o.status === 'EM_ANDAMENTO').length || 0,
    concluidas: ordens?.filter((o) => o.status === 'CONCLUIDO').length || 0,
  }

  if (isLoading) {
    return <LoadingPage text="Carregando ordens..." />
  }

  return (
    <DashboardLayout
      title="Ordens de Serviço"
      subtitle={`${filteredOrdens?.length || 0} ordens encontradas`}
      actions={
        canCreateOrdem && (
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon size={16} /> Nova Ordem
          </Button>
        )
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} icon={<ClipboardListIcon size={24} />} color="primary" />
        <StatCard label="Pendentes" value={stats.pendentes} icon={<ClockIcon size={24} />} color="warning" />
        <StatCard label="Em andamento" value={stats.emAndamento} icon={<LoaderIcon size={24} />} color="info" />
        <StatCard label="Concluídas" value={stats.concluidas} icon={<CircleCheckIcon size={24} />} color="success" />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar por código ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === status
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
            >
              {status === 'TODOS' ? 'Todos' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrdens && filteredOrdens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrdens.map((ordem) => (
            <div key={ordem.id} className="group relative cursor-pointer" onClick={() => router.push(`/ordens/${ordem.id}`)}>
              <OrdemCard ordem={ordem} />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/ordens/${ordem.id}`) }}
                  className="p-2 bg-card rounded-lg shadow-lg hover:bg-primary/10 transition-colors"
                  title="Ver detalhes"
                >
                  <EyeIcon size={16} />
                </button>
                {canEditOrdem && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenModal(ordem) }}
                    className="p-2 bg-card rounded-lg shadow-lg hover:bg-secondary transition-colors"
                    title="Editar"
                  >
                    <PencilIcon size={16} />
                  </button>
                )}
                {canDeleteOrdem && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openDeleteDialog(ordem) }}
                    className="p-2 bg-card rounded-lg shadow-lg hover:bg-danger/10 transition-colors"
                    title="Excluir"
                  >
                    <TrashIcon size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ClipboardListIcon size={48} className="text-muted-foreground" />}
          title="Nenhuma ordem encontrada"
          description={
            searchTerm || statusFilter !== 'TODOS'
              ? 'Tente ajustar os filtros ou termo de busca'
              : 'Comece criando uma nova ordem de serviço'
          }
          action={
            !searchTerm && statusFilter === 'TODOS' && canCreateOrdem
              ? { label: 'Nova Ordem', onClick: () => handleOpenModal() }
              : undefined
          }
        />
      )}

      {/* Modal de criação/edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedOrdem ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Cliente"
              placeholder="Selecione o cliente"
              value={formData.clienteId || ''}
              onChange={(e) => handleClienteChange(Number(e.target.value))}
              options={
                clientes?.map((cliente) => ({
                  value: cliente.id,
                  label: cliente.nomeCompleto,
                })) || []
              }
              error={errors.clienteId}
              required
            />
            <Select
              label="Veículo"
              placeholder="Selecione o veículo"
              value={formData.veiculoId || ''}
              onChange={(e) => {
                setFormData({ ...formData, veiculoId: Number(e.target.value) })
                if (errors.veiculoId) setErrors({ ...errors, veiculoId: '' })
              }}
              options={getVeiculosByCliente(formData.clienteId).map((veiculo) => ({
                value: veiculo.id,
                label: `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`,
              }))}
              disabled={!formData.clienteId}
              error={errors.veiculoId}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Responsável"
              placeholder="Selecione o responsável"
              value={formData.responsavelId || ''}
              onChange={(e) => {
                setFormData({ ...formData, responsavelId: Number(e.target.value) })
                if (errors.responsavelId) setErrors({ ...errors, responsavelId: '' })
              }}
              options={
                usuarios?.map((usuario) => ({
                  value: usuario.id,
                  label: usuario.nome,
                })) || []
              }
              error={errors.responsavelId}
              required
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusOrdem })}
              options={STATUS_OPTIONS}
              disabled={!!(selectedOrdem && !canChangeOrdemStatus)}
              required
            />
          </div>

          <CurrencyInput
            label="Valor Total (R$)"
            value={formData.valorTotal ? Math.round(formData.valorTotal * 100).toString() : '0'}
            onValueChange={(value) => {
              const numValue = parseInt(value || '0', 10) / 100
              setFormData({ ...formData, valorTotal: numValue })
              if (errors.valorTotal) setErrors({ ...errors, valorTotal: '' })
            }}
            error={errors.valorTotal}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createOrdem.isPending || updateOrdem.isPending}>
              {selectedOrdem ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Ordem de Serviço"
        message={`Tem certeza que deseja excluir a ordem #${selectedOrdem?.id}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={deleteOrdem.isPending}
      />
    </DashboardLayout>
  )
}
