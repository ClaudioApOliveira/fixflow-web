'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { OrcamentoApproval } from '@/components/orcamento-approval'
import {
    Button,
    Card,
    LoadingPage,
    Modal,
    Input,
    NotebookTextarea,
    Select,
    ConfirmDialog,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    EmptyState,
    useToast,
} from '@/components/ui'
import { CurrencyInput } from '@/components/ui/masked-input'
import {
    useOrdem,
    useCliente,
    useVeiculo,
    useUsuario,
    useServicosOS,
    useCreateServicoOS,
    useUpdateServicoOS,
    useDeleteServicoOS,
    useApproveOrcamento,
    useRejectOrcamento,
} from '@/lib/hooks'
import { usePermission } from '@/providers/auth-provider'
import { validateServicoOSForm } from '@/lib/validations'
import { STATUS_CONFIG } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
    ArrowLeftIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    WrenchIcon,
} from '@/components/icons'
import type { ServicoOS, ServicoOSRequest, StatusOrdem } from '@/types'

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

export default function OrdemDetalhePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const ordemId = parseInt(id)
    const router = useRouter()
    const { addToast } = useToast()
    const { canEditOrdem } = usePermission()

    const { data: ordem, isLoading: isLoadingOrdem } = useOrdem(ordemId)
    const { data: cliente } = useCliente(ordem?.clienteId || 0)
    const { data: veiculo } = useVeiculo(ordem?.veiculoId || 0)
    const { data: responsavel } = useUsuario(ordem?.responsavelId || 0)
    const { data: servicos, isLoading: isLoadingServicos } = useServicosOS(ordemId)

    const createServico = useCreateServicoOS()
    const updateServico = useUpdateServicoOS()
    const deleteServico = useDeleteServicoOS()
    const approveOrcamento = useApproveOrcamento()
    const rejectOrcamento = useRejectOrcamento()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedServico, setSelectedServico] = useState<ServicoOS | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState<ServicoOSRequest>({
        tipoServico: '',
        descricao: '',
        valor: 0,
        kmVeiculo: undefined,
        observacoes: '',
    })

    const handleOpenModal = (servico?: ServicoOS) => {
        setErrors({})
        if (servico) {
            setSelectedServico(servico)
            setFormData({
                tipoServico: servico.tipoServico,
                descricao: servico.descricao,
                valor: servico.valor,
                kmVeiculo: servico.kmVeiculo,
                observacoes: servico.observacoes || '',
            })
        } else {
            setSelectedServico(null)
            setFormData({
                tipoServico: '',
                descricao: '',
                valor: 0,
                kmVeiculo: undefined,
                observacoes: '',
            })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedServico(null)
        setErrors({})
        setFormData({
            tipoServico: '',
            descricao: '',
            valor: 0,
            kmVeiculo: undefined,
            observacoes: '',
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const validationErrors = validateServicoOSForm(formData)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        try {
            if (selectedServico) {
                await updateServico.mutateAsync({
                    id: selectedServico.id,
                    ordemServicoId: ordemId,
                    ...formData,
                })
                addToast('success', 'Serviço atualizado com sucesso!')
            } else {
                await createServico.mutateAsync({
                    ordemServicoId: ordemId,
                    ...formData,
                })
                addToast('success', 'Serviço adicionado com sucesso!')
            }
            handleCloseModal()
        } catch (error) {
            console.error('Erro ao salvar serviço:', error)
            const message = error instanceof Error ? error.message : 'Erro ao salvar serviço'
            addToast('error', message)
        }
    }

    const handleDelete = async () => {
        if (selectedServico) {
            try {
                await deleteServico.mutateAsync({
                    id: selectedServico.id,
                    ordemServicoId: ordemId,
                })
                addToast('success', 'Serviço excluído com sucesso!')
                setIsDeleteDialogOpen(false)
                setSelectedServico(null)
            } catch (error) {
                console.error('Erro ao deletar serviço:', error)
                const message = error instanceof Error ? error.message : 'Erro ao excluir serviço'
                addToast('error', message)
            }
        }
    }

    const openDeleteDialog = (servico: ServicoOS) => {
        setSelectedServico(servico)
        setIsDeleteDialogOpen(true)
    }

    const handleApproveOrcamento = async () => {
        try {
            await approveOrcamento.mutateAsync(ordemId)
            addToast('success', 'Orçamento aprovado com sucesso!')
        } catch (error) {
            console.error('Erro ao aprovar orçamento:', error)
            const message = error instanceof Error ? error.message : 'Erro ao aprovar orçamento'
            addToast('error', message)
        }
    }

    const handleRejectOrcamento = async () => {
        try {
            await rejectOrcamento.mutateAsync(ordemId)
            addToast('success', 'Orçamento recusado!')
        } catch (error) {
            console.error('Erro ao recusar orçamento:', error)
            const message = error instanceof Error ? error.message : 'Erro ao recusar orçamento'
            addToast('error', message)
        }
    }

    const getTipoServicoLabel = (tipo: string) => {
        return TIPO_SERVICO_OPTIONS.find(opt => opt.value === tipo)?.label || tipo
    }

    const totalServicos = servicos?.reduce((acc, s) => acc + s.valor, 0) || 0

    if (isLoadingOrdem) {
        return <LoadingPage text="Carregando ordem..." />
    }

    if (!ordem) {
        return (
            <DashboardLayout title="Ordem não encontrada">
                <EmptyState
                    icon={<WrenchIcon size={48} className="text-muted-foreground" />}
                    title="Ordem não encontrada"
                    description="A ordem de serviço solicitada não existe ou foi removida."
                    action={{
                        label: 'Voltar para ordens',
                        onClick: () => router.push('/ordens'),
                    }}
                />
            </DashboardLayout>
        )
    }

    const statusConfig = STATUS_CONFIG[ordem.status as StatusOrdem]

    return (
        <DashboardLayout
            title={`Ordem #${ordem.codigoRastreio}`}
            subtitle={`Detalhes da ordem de serviço`}
            actions={
                <Button variant="outline" onClick={() => router.push('/ordens')}>
                    <ArrowLeftIcon size={16} /> Voltar
                </Button>
            }
        >
            {/* Aviso de Orçamento */}
            {ordem.status === 'ORCAMENTO' && (
                <div className="mb-6">
                    <OrcamentoApproval
                        onApprove={handleApproveOrcamento}
                        onReject={handleRejectOrcamento}
                        isLoading={approveOrcamento.isPending || rejectOrcamento.isPending}
                    />
                </div>
            )}

            {/* Informações da Ordem */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Card Principal */}
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Informações da Ordem</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Código de Rastreio</p>
                            <p className="font-medium">{ordem.codigoRastreio}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge className={`${statusConfig.bg} ${statusConfig.text}`}>
                                {statusConfig.label}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Cliente</p>
                            <p className="font-medium">{cliente?.nomeCompleto || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Veículo</p>
                            <p className="font-medium">
                                {veiculo ? `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}` : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Responsável</p>
                            <p className="font-medium">{responsavel?.nome || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Data de Criação</p>
                            <p className="font-medium">{formatDate(ordem.criadoEm)}</p>
                        </div>
                    </div>
                </Card>

                {/* Card de Valores */}
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Resumo Financeiro</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Total em Serviços</p>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(totalServicos)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Valor Total da OS</p>
                            <p className="text-2xl font-bold">{formatCurrency(ordem.valorTotal)}</p>
                        </div>
                        <div className="pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">Quantidade de Serviços</p>
                            <p className="text-lg font-semibold">{servicos?.length || 0}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Lista de Serviços */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Serviços</h3>
                    {canEditOrdem && (
                        <Button size="sm" onClick={() => handleOpenModal()}>
                            <PlusIcon size={16} /> Adicionar Serviço
                        </Button>
                    )}
                </div>

                {isLoadingServicos ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Carregando serviços...
                    </div>
                ) : servicos && servicos.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Km Veículo</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                {canEditOrdem && <TableHead className="text-right">Ações</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {servicos.map((servico) => (
                                <TableRow key={servico.id}>
                                    <TableCell>
                                        <Badge>
                                            {getTipoServicoLabel(servico.tipoServico)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{servico.descricao}</p>
                                            {servico.observacoes && (
                                                <p className="text-sm text-muted-foreground">{servico.observacoes}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {servico.kmVeiculo ? `${servico.kmVeiculo.toLocaleString()} km` : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(servico.valor)}
                                    </TableCell>
                                    {canEditOrdem && (
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => handleOpenModal(servico)}
                                                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <PencilIcon size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(servico)}
                                                    className="p-2 hover:bg-danger/10 rounded-lg transition-colors text-danger"
                                                    title="Excluir"
                                                >
                                                    <TrashIcon size={16} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <EmptyState
                        icon={<WrenchIcon size={40} className="text-muted-foreground" />}
                        title="Nenhum serviço cadastrado"
                        description="Adicione serviços a esta ordem de serviço"
                        action={
                            canEditOrdem
                                ? { label: 'Adicionar Serviço', onClick: () => handleOpenModal() }
                                : undefined
                        }
                    />
                )}
            </Card>

            {/* Modal de criação/edição de serviço */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedServico ? 'Editar Serviço' : 'Novo Serviço'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label="Tipo de Serviço"
                        placeholder="Selecione o tipo"
                        value={formData.tipoServico}
                        onChange={(e) => {
                            setFormData({ ...formData, tipoServico: e.target.value })
                            if (errors.tipoServico) setErrors({ ...errors, tipoServico: '' })
                        }}
                        options={TIPO_SERVICO_OPTIONS}
                        error={errors.tipoServico}
                        required
                    />

                    <NotebookTextarea
                        label="Descrição"
                        placeholder="Descreva o serviço realizado"
                        value={formData.descricao}
                        onChange={(e) => {
                            setFormData({ ...formData, descricao: e.target.value })
                            if (errors.descricao) setErrors({ ...errors, descricao: '' })
                        }}
                        error={errors.descricao}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <CurrencyInput
                            label="Valor (R$)"
                            value={formData.valor ? Math.round(formData.valor * 100).toString() : '0'}
                            onValueChange={(value) => {
                                const numValue = parseInt(value || '0', 10) / 100
                                setFormData({ ...formData, valor: numValue })
                                if (errors.valor) setErrors({ ...errors, valor: '' })
                            }}
                            error={errors.valor}
                            required
                        />

                        <Input
                            type="number"
                            label="Km do Veículo"
                            placeholder="Ex: 50000"
                            value={formData.kmVeiculo || ''}
                            onChange={(e) => {
                                setFormData({ ...formData, kmVeiculo: e.target.value ? parseInt(e.target.value) : undefined })
                                if (errors.kmVeiculo) setErrors({ ...errors, kmVeiculo: '' })
                            }}
                            error={errors.kmVeiculo}
                        />
                    </div>

                    <NotebookTextarea
                        label="Observações"
                        placeholder="Observações adicionais (opcional)"
                        value={formData.observacoes || ''}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={createServico.isPending || updateServico.isPending}>
                            {selectedServico ? 'Salvar' : 'Adicionar'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Dialog de confirmação de exclusão */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Serviço"
                message={`Tem certeza que deseja excluir o serviço "${selectedServico?.descricao}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                isLoading={deleteServico.isPending}
            />
        </DashboardLayout>
    )
}
