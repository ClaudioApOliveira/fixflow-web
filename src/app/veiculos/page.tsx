'use client'

import { useState } from 'react'
import { useVeiculos, useClientes, useCreateVeiculo, useUpdateVeiculo, useDeleteVeiculo } from '@/lib/hooks'
import { DashboardLayout } from '@/components/layout'
import {
    Button,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    LoadingPage,
    EmptyState,
    SearchInput,
    Modal,
    Input,
    Select,
    ConfirmDialog,
    Badge,
    useToast,
} from '@/components/ui'
import { PlacaInput } from '@/components/ui/masked-input'
import { usePermission } from '@/providers/auth-provider'
import { validateVeiculoForm } from '@/lib/validations'
import { PlusIcon, PencilIcon, TrashIcon, CarIcon } from '@/components/icons'
import { formatDate, formatPlaca } from '@/lib/utils'
import type { Veiculo, VeiculoRequest } from '@/types'

export default function VeiculosPage() {
    const { data: veiculos, isLoading } = useVeiculos()
    const { data: clientes } = useClientes()
    const createVeiculo = useCreateVeiculo()
    const updateVeiculo = useUpdateVeiculo()
    const deleteVeiculo = useDeleteVeiculo()
    const { canCreateVeiculo, canEditVeiculo, canDeleteVeiculo } = usePermission()
    const { addToast } = useToast()

    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState<VeiculoRequest>({
        placa: '',
        modelo: '',
        marca: '',
        clienteId: 0,
    })

    const filteredVeiculos = veiculos?.filter(
        (veiculo) =>
            veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
            veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getClienteNome = (clienteId: number) => {
        const cliente = clientes?.find((c) => c.id === clienteId)
        return cliente?.nomeCompleto || `Cliente #${clienteId}`
    }

    const handleOpenModal = (veiculo?: Veiculo) => {
        setErrors({})
        if (veiculo) {
            setSelectedVeiculo(veiculo)
            setFormData({
                placa: veiculo.placa,
                modelo: veiculo.modelo,
                marca: veiculo.marca,
                clienteId: veiculo.clienteId,
            })
        } else {
            setSelectedVeiculo(null)
            setFormData({ placa: '', modelo: '', marca: '', clienteId: 0 })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedVeiculo(null)
        setErrors({})
        setFormData({ placa: '', modelo: '', marca: '', clienteId: 0 })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const validationErrors = validateVeiculoForm(formData)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        try {
            if (selectedVeiculo) {
                await updateVeiculo.mutateAsync({ id: selectedVeiculo.id, ...formData })
                addToast('success', 'Veículo atualizado com sucesso!')
            } else {
                await createVeiculo.mutateAsync(formData)
                addToast('success', 'Veículo cadastrado com sucesso!')
            }
            handleCloseModal()
        } catch (error) {
            console.error('Erro ao salvar veículo:', error)
            const message = error instanceof Error ? error.message : 'Erro ao salvar veículo'
            addToast('error', message)
        }
    }

    const handleDelete = async () => {
        if (selectedVeiculo) {
            try {
                await deleteVeiculo.mutateAsync(selectedVeiculo.id)
                addToast('success', 'Veículo excluído com sucesso!')
                setIsDeleteDialogOpen(false)
                setSelectedVeiculo(null)
            } catch (error) {
                console.error('Erro ao deletar veículo:', error)
                const message = error instanceof Error ? error.message : 'Erro ao excluir veículo'
                addToast('error', message)
            }
        }
    }

    const openDeleteDialog = (veiculo: Veiculo) => {
        setSelectedVeiculo(veiculo)
        setIsDeleteDialogOpen(true)
    }

    if (isLoading) {
        return <LoadingPage text="Carregando veículos..." />
    }

    return (
        <DashboardLayout
            title="Veículos"
            subtitle={`${veiculos?.length || 0} veículos cadastrados`}
            actions={
                canCreateVeiculo && (
                    <Button onClick={() => handleOpenModal()}>
                        <PlusIcon size={16} /> Novo Veículo
                    </Button>
                )
            }
        >
            {/* Search */}
            <div className="mb-6 max-w-md">
                <SearchInput
                    placeholder="Buscar por placa, modelo ou marca..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm('')}
                />
            </div>

            {/* Table */}
            {filteredVeiculos && filteredVeiculos.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Veículo</TableHead>
                            <TableHead>Placa</TableHead>
                            <TableHead>Proprietário</TableHead>
                            <TableHead>Cadastrado em</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVeiculos.map((veiculo) => (
                            <TableRow key={veiculo.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                                            <CarIcon size={20} className="text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{veiculo.modelo}</p>
                                            <p className="text-xs text-muted-foreground">{veiculo.marca}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="info">{formatPlaca(veiculo.placa)}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                                            {getClienteNome(veiculo.clienteId).charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm">{getClienteNome(veiculo.clienteId)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(veiculo.criadoEm)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-2">
                                        {canEditVeiculo && (
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(veiculo)}>
                                                <PencilIcon size={16} />
                                            </Button>
                                        )}
                                        {canDeleteVeiculo && (
                                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(veiculo)}>
                                                <TrashIcon size={16} />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <EmptyState
                    icon={<CarIcon size={48} className="text-muted-foreground" />}
                    title="Nenhum veículo encontrado"
                    description={
                        searchTerm
                            ? 'Tente buscar com outros termos'
                            : 'Comece cadastrando seu primeiro veículo'
                    }
                    action={
                        !searchTerm && canCreateVeiculo
                            ? { label: 'Novo Veículo', onClick: () => handleOpenModal() }
                            : undefined
                    }
                />
            )}

            {/* Modal de criação/edição */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedVeiculo ? 'Editar Veículo' : 'Novo Veículo'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <PlacaInput
                        label="Placa"
                        value={formData.placa}
                        onValueChange={(value) => {
                            setFormData({ ...formData, placa: value })
                            if (errors.placa) setErrors({ ...errors, placa: '' })
                        }}
                        error={errors.placa}
                        required
                    />
                    <Input
                        label="Marca"
                        placeholder="Ex: Toyota, Honda, Fiat..."
                        value={formData.marca}
                        onChange={(e) => {
                            setFormData({ ...formData, marca: e.target.value })
                            if (errors.marca) setErrors({ ...errors, marca: '' })
                        }}
                        error={errors.marca}
                        required
                    />
                    <Input
                        label="Modelo"
                        placeholder="Ex: Corolla, Civic, Uno..."
                        value={formData.modelo}
                        onChange={(e) => {
                            setFormData({ ...formData, modelo: e.target.value })
                            if (errors.modelo) setErrors({ ...errors, modelo: '' })
                        }}
                        error={errors.modelo}
                        required
                    />
                    <Select
                        label="Proprietário"
                        placeholder="Selecione o cliente"
                        value={formData.clienteId || ''}
                        onChange={(e) => {
                            setFormData({ ...formData, clienteId: Number(e.target.value) })
                            if (errors.clienteId) setErrors({ ...errors, clienteId: '' })
                        }}
                        options={
                            clientes?.map((cliente) => ({
                                value: cliente.id,
                                label: cliente.nomeCompleto,
                            })) || []
                        }
                        error={errors.clienteId}
                        required
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createVeiculo.isPending || updateVeiculo.isPending}
                        >
                            {selectedVeiculo ? 'Salvar' : 'Criar'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Dialog de confirmação de exclusão */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Veículo"
                message={`Tem certeza que deseja excluir o veículo "${selectedVeiculo?.modelo}" (${selectedVeiculo?.placa})? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                isLoading={deleteVeiculo.isPending}
            />
        </DashboardLayout>
    )
}
