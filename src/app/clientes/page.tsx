'use client'

import { useState } from 'react'
import { useClientes, useCreateCliente, useUpdateCliente, useDeleteCliente } from '@/lib/hooks'
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
  ConfirmDialog,
  Badge,
  useToast,
} from '@/components/ui'
import { CPFCNPJInput, PhoneInput } from '@/components/ui/masked-input'
import { usePermission } from '@/providers/auth-provider'
import { validateClienteForm } from '@/lib/validations'
import { PlusIcon, PencilIcon, TrashIcon, UsersIcon } from '@/components/icons'
import { formatDate, formatDocument, formatPhone } from '@/lib/utils'
import type { Cliente, ClienteRequest } from '@/types'

export default function ClientesPage() {
  const { data: clientes, isLoading } = useClientes()
  const createCliente = useCreateCliente()
  const updateCliente = useUpdateCliente()
  const deleteCliente = useDeleteCliente()
  const { canCreateCliente, canEditCliente, canDeleteCliente } = usePermission()
  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<ClienteRequest>({
    nomeCompleto: '',
    documento: '',
    telefone: '',
  })

  const filteredClientes = clientes?.filter(
    (cliente) =>
      cliente.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.documento.includes(searchTerm) ||
      cliente.telefone.includes(searchTerm)
  )

  const handleOpenModal = (cliente?: Cliente) => {
    setErrors({})
    if (cliente) {
      setSelectedCliente(cliente)
      setFormData({
        nomeCompleto: cliente.nomeCompleto,
        documento: cliente.documento,
        telefone: cliente.telefone,
      })
    } else {
      setSelectedCliente(null)
      setFormData({ nomeCompleto: '', documento: '', telefone: '' })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCliente(null)
    setErrors({})
    setFormData({ nomeCompleto: '', documento: '', telefone: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar formulário
    const validationErrors = validateClienteForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      if (selectedCliente) {
        await updateCliente.mutateAsync({ id: selectedCliente.id, ...formData })
        addToast('success', 'Cliente atualizado com sucesso!')
      } else {
        await createCliente.mutateAsync(formData)
        addToast('success', 'Cliente cadastrado com sucesso!')
      }
      handleCloseModal()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      const message = error instanceof Error ? error.message : 'Erro ao salvar cliente'
      addToast('error', message)
    }
  }

  const handleDelete = async () => {
    if (selectedCliente) {
      try {
        await deleteCliente.mutateAsync(selectedCliente.id)
        addToast('success', 'Cliente excluído com sucesso!')
        setIsDeleteDialogOpen(false)
        setSelectedCliente(null)
      } catch (error) {
        console.error('Erro ao deletar cliente:', error)
        const message = error instanceof Error ? error.message : 'Erro ao excluir cliente'
        addToast('error', message)
      }
    }
  }

  const openDeleteDialog = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsDeleteDialogOpen(true)
  }

  if (isLoading) {
    return <LoadingPage text="Carregando clientes..." />
  }

  return (
    <DashboardLayout
      title="Clientes"
      subtitle={`${clientes?.length || 0} clientes cadastrados`}
      actions={
        canCreateCliente && (
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon size={16} /> Novo Cliente
          </Button>
        )
      }
    >
      {/* Search */}
      <div className="mb-6 max-w-md">
        <SearchInput
          placeholder="Buscar por nome, documento ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
        />
      </div>

      {/* Table */}
      {filteredClientes && filteredClientes.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cadastrado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                      {cliente.nomeCompleto.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{cliente.nomeCompleto}</p>
                      <p className="text-xs text-muted-foreground">ID: {cliente.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="default">{formatDocument(cliente.documento)}</Badge>
                </TableCell>
                <TableCell>{formatPhone(cliente.telefone)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(cliente.criadoEm)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {canEditCliente && (
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(cliente)}>
                        <PencilIcon size={16} />
                      </Button>
                    )}
                    {canDeleteCliente && (
                      <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(cliente)}>
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
          icon={<UsersIcon size={48} className="text-muted-foreground" />}
          title="Nenhum cliente encontrado"
          description={
            searchTerm
              ? 'Tente buscar com outros termos'
              : 'Comece cadastrando seu primeiro cliente'
          }
          action={
            !searchTerm && canCreateCliente
              ? { label: 'Novo Cliente', onClick: () => handleOpenModal() }
              : undefined
          }
        />
      )}

      {/* Modal de criação/edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCliente ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
            placeholder="Digite o nome completo"
            value={formData.nomeCompleto}
            onChange={(e) => {
              setFormData({ ...formData, nomeCompleto: e.target.value })
              if (errors.nomeCompleto) setErrors({ ...errors, nomeCompleto: '' })
            }}
            error={errors.nomeCompleto}
            required
          />
          <CPFCNPJInput
            label="Documento (CPF/CNPJ)"
            value={formData.documento}
            onValueChange={(value) => {
              setFormData({ ...formData, documento: value })
              if (errors.documento) setErrors({ ...errors, documento: '' })
            }}
            error={errors.documento}
            required
          />
          <PhoneInput
            label="Telefone"
            value={formData.telefone}
            onValueChange={(value) => {
              setFormData({ ...formData, telefone: value })
              if (errors.telefone) setErrors({ ...errors, telefone: '' })
            }}
            error={errors.telefone}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createCliente.isPending || updateCliente.isPending}>
              {selectedCliente ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${selectedCliente?.nomeCompleto}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={deleteCliente.isPending}
      />
    </DashboardLayout>
  )
}
