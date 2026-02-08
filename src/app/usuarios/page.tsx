'use client'

import { useState } from 'react'
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from '@/lib/hooks'
import { DashboardLayout } from '@/components/layout'
import { RoleProtected } from '@/components/role-protected'
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
import { usePermission, useAuth } from '@/providers/auth-provider'
import { validateUsuarioForm } from '@/lib/validations'
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, ShieldIcon } from '@/components/icons'
import { formatDate } from '@/lib/utils'
import type { Usuario, UsuarioRequest } from '@/types'

const ROLES_OPTIONS = [
    { value: 'ADMIN', label: 'Administrador', adminOnly: true },
    { value: 'GERENTE', label: 'Gerente', adminOnly: true },
    { value: 'FINANCEIRO', label: 'Financeiro', adminOnly: false },
    { value: 'FUNCIONARIO', label: 'Funcionário', adminOnly: false },
    { value: 'MECANICO', label: 'Mecânico', adminOnly: false },
    { value: 'ATENDENTE', label: 'Atendente', adminOnly: false },
]

export default function UsuariosPage() {
    const { data: usuarios, isLoading } = useUsuarios()
    const createUsuario = useCreateUsuario()
    const updateUsuario = useUpdateUsuario()
    const deleteUsuario = useDeleteUsuario()
    const { canCreateUsuario, canEditUsuario, canDeleteUsuario } = usePermission()
    const { user } = useAuth()
    const isAdmin = user?.roles.includes('ADMIN')
    const { addToast } = useToast()

    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState<UsuarioRequest>({
        nome: '',
        email: '',
        senha: '',
        ativo: true,
        roles: [],
    })

    const filteredUsuarios = usuarios?.filter(
        (usuario) =>
            usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleOpenModal = (usuario?: Usuario) => {
        setErrors({})
        if (usuario) {
            setSelectedUsuario(usuario)
            setFormData({
                nome: usuario.nome,
                email: usuario.email,
                senha: '',
                ativo: usuario.ativo,
                roles: usuario.roles,
            })
        } else {
            setSelectedUsuario(null)
            setFormData({ nome: '', email: '', senha: '', ativo: true, roles: [] })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedUsuario(null)
        setErrors({})
        setFormData({ nome: '', email: '', senha: '', ativo: true, roles: [] })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const validationErrors = validateUsuarioForm(formData, !!selectedUsuario)
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        try {
            if (selectedUsuario) {
                const updateData = { id: selectedUsuario.id, ...formData }
                if (!formData.senha) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { senha: _, ...dataWithoutPassword } = updateData
                    await updateUsuario.mutateAsync(dataWithoutPassword as Parameters<typeof updateUsuario.mutateAsync>[0])
                } else {
                    await updateUsuario.mutateAsync(updateData)
                }
                addToast('success', 'Usuário atualizado com sucesso!')
            } else {
                await createUsuario.mutateAsync(formData)
                addToast('success', 'Usuário cadastrado com sucesso!')
            }
            handleCloseModal()
        } catch (error) {
            console.error('Erro ao salvar usuário:', error)
            const message = error instanceof Error ? error.message : 'Erro ao salvar usuário'
            addToast('error', message)
        }
    }

    const handleDelete = async () => {
        if (selectedUsuario) {
            try {
                await deleteUsuario.mutateAsync(selectedUsuario.id)
                addToast('success', 'Usuário excluído com sucesso!')
                setIsDeleteDialogOpen(false)
                setSelectedUsuario(null)
            } catch (error) {
                console.error('Erro ao deletar usuário:', error)
                const message = error instanceof Error ? error.message : 'Erro ao excluir usuário'
                addToast('error', message)
            }
        }
    }

    const openDeleteDialog = (usuario: Usuario) => {
        setSelectedUsuario(usuario)
        setIsDeleteDialogOpen(true)
    }

    const toggleRole = (role: string) => {
        if (errors.roles) setErrors({ ...errors, roles: '' })
        setFormData((prev) => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter((r) => r !== role)
                : [...prev.roles, role],
        }))
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Badge variant="danger">{role}</Badge>
            case 'MECANICO':
                return <Badge variant="info">{role}</Badge>
            case 'ATENDENTE':
                return <Badge variant="warning">{role}</Badge>
            default:
                return <Badge>{role}</Badge>
        }
    }

    if (isLoading) {
        return <LoadingPage text="Carregando usuários..." />
    }

    return (
        <RoleProtected allowedRoles={['ADMIN', 'GERENTE']}>
            <DashboardLayout
                title="Usuários"
                subtitle={`${usuarios?.length || 0} usuários cadastrados`}
                actions={
                    canCreateUsuario && (
                        <Button onClick={() => handleOpenModal()}>
                            <PlusIcon size={16} /> Novo Usuário
                        </Button>
                    )
                }
            >
            {/* Search */}
            <div className="mb-6 max-w-md">
                <SearchInput
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm('')}
                />
            </div>

            {/* Table */}
            {filteredUsuarios && filteredUsuarios.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Cadastrado em</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsuarios.map((usuario) => (
                            <TableRow key={usuario.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                                            {usuario.nome.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">{usuario.nome}</p>
                                            <p className="text-xs text-muted-foreground">ID: {usuario.id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{usuario.email}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {usuario.roles.map((role) => (
                                            <span key={role}>{getRoleBadge(role)}</span>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={usuario.ativo ? 'success' : 'danger'}>
                                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {formatDate(usuario.criadoEm)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-2">
                                        {canEditUsuario && (
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(usuario)}>
                                                <PencilIcon size={16} />
                                            </Button>
                                        )}
                                        {canDeleteUsuario && (
                                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(usuario)}>
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
                    icon={<UserIcon size={48} className="text-muted-foreground" />}
                    title="Nenhum usuário encontrado"
                    description={
                        searchTerm
                            ? 'Tente buscar com outros termos'
                            : 'Comece cadastrando seu primeiro usuário'
                    }
                    action={
                        !searchTerm && canCreateUsuario
                            ? { label: 'Novo Usuário', onClick: () => handleOpenModal() }
                            : undefined
                    }
                />
            )}

            {/* Modal de criação/edição */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedUsuario ? 'Editar Usuário' : 'Novo Usuário'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome"
                            placeholder="Digite o nome completo"
                            value={formData.nome}
                            onChange={(e) => {
                                setFormData({ ...formData, nome: e.target.value })
                                if (errors.nome) setErrors({ ...errors, nome: '' })
                            }}
                            error={errors.nome}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="email@exemplo.com"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value })
                                if (errors.email) setErrors({ ...errors, email: '' })
                            }}
                            error={errors.email}
                            required
                        />
                    </div>

                    <Input
                        label={selectedUsuario ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
                        type="password"
                        placeholder="••••••••"
                        value={formData.senha}
                        onChange={(e) => {
                            setFormData({ ...formData, senha: e.target.value })
                            if (errors.senha) setErrors({ ...errors, senha: '' })
                        }}
                        error={errors.senha}
                        required={!selectedUsuario}
                        hint={selectedUsuario ? 'Deixe em branco para manter a senha atual' : 'Mínimo de 6 caracteres'}
                    />

                    {/* Roles */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                            <span className="flex items-center gap-2">
                                <ShieldIcon size={16} />
                                Permissões
                            </span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ROLES_OPTIONS
                                .filter(role => isAdmin || !role.adminOnly)
                                .map((role) => (
                                <button
                                    key={role.value}
                                    type="button"
                                    onClick={() => toggleRole(role.value)}
                                    className={`
                    px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200
                    ${formData.roles.includes(role.value)
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-secondary border-border hover:border-primary/50'
                                        }
                  `}
                                >
                                    {role.label}
                                </button>
                            ))}
                        </div>
                        {errors.roles && (
                            <p className="text-xs text-danger">{errors.roles}</p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Status</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={formData.ativo}
                                    onChange={() => setFormData({ ...formData, ativo: true })}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm">Ativo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={!formData.ativo}
                                    onChange={() => setFormData({ ...formData, ativo: false })}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="text-sm">Inativo</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createUsuario.isPending || updateUsuario.isPending}
                        >
                            {selectedUsuario ? 'Salvar' : 'Criar'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Dialog de confirmação de exclusão */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Usuário"
                message={`Tem certeza que deseja excluir o usuário "${selectedUsuario?.nome}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                isLoading={deleteUsuario.isPending}
            />
        </DashboardLayout>
        </RoleProtected>
    )
}
