import { Button } from '@/components/ui'
import { CheckCircleIcon, XCircleIcon } from '@/components/icons'

interface OrcamentoApprovalProps {
    onApprove: () => Promise<void>
    onReject: () => Promise<void>
    isLoading: boolean
}

export function OrcamentoApproval({ onApprove, onReject, isLoading }: OrcamentoApprovalProps) {
    return (
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Orçamento Pendente de Aprovação</h4>
                    <p className="text-sm text-muted-foreground">
                        Aprove ou recuse este orçamento para continuar
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onReject}
                        isLoading={isLoading}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <XCircleIcon size={16} /> Recusar
                    </Button>
                    <Button
                        onClick={onApprove}
                        isLoading={isLoading}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <CheckCircleIcon size={16} /> Aprovar
                    </Button>
                </div>
            </div>
        </div>
    )
}
