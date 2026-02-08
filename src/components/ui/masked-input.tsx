import { InputHTMLAttributes, forwardRef, ChangeEvent } from 'react'

type MaskType = 'cpf' | 'cnpj' | 'cpfCnpj' | 'phone' | 'cep' | 'placa' | 'currency' | 'none'

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string
    error?: string
    hint?: string
    mask?: MaskType
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void
    onValueChange?: (value: string, maskedValue: string) => void
}

// Funções de máscara
function maskCPF(value: string): string {
    return value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function maskCNPJ(value: string): string {
    return value
        .replace(/\D/g, '')
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

function maskCPFCNPJ(value: string): string {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 11) {
        return maskCPF(value)
    }
    return maskCNPJ(value)
}

function maskPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 10) {
        return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
}

function maskCEP(value: string): string {
    return value
        .replace(/\D/g, '')
        .slice(0, 8)
        .replace(/(\d{5})(\d)/, '$1-$2')
}

function maskPlaca(value: string): string {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)

    // Placa Mercosul: ABC1D23
    if (cleaned.length >= 4 && /^[A-Z]{3}[0-9][A-Z0-9]/.test(cleaned)) {
        return cleaned
    }

    // Placa antiga: ABC-1234
    if (cleaned.length > 3) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    }

    return cleaned
}

function maskCurrency(value: string): string {
    const digits = value.replace(/\D/g, '')
    const number = parseInt(digits || '0', 10) / 100
    return number.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

function unmask(value: string): string {
    return value.replace(/\D/g, '')
}

function applyMask(value: string, mask: MaskType): string {
    switch (mask) {
        case 'cpf':
            return maskCPF(value)
        case 'cnpj':
            return maskCNPJ(value)
        case 'cpfCnpj':
            return maskCPFCNPJ(value)
        case 'phone':
            return maskPhone(value)
        case 'cep':
            return maskCEP(value)
        case 'placa':
            return maskPlaca(value)
        case 'currency':
            return maskCurrency(value)
        default:
            return value
    }
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
    ({ className = '', label, error, hint, id, mask = 'none', onChange, onValueChange, value, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value

            if (mask === 'none') {
                onChange?.(e)
                onValueChange?.(rawValue, rawValue)
                return
            }

            const maskedValue = applyMask(rawValue, mask)
            const unmaskedValue = mask === 'placa' ? rawValue.toUpperCase().replace(/[^A-Z0-9]/g, '') : unmask(rawValue)

            // Criar um novo evento com o valor mascarado
            const newEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: maskedValue,
                },
            } as ChangeEvent<HTMLInputElement>

            onChange?.(newEvent)
            onValueChange?.(unmaskedValue, maskedValue)
        }

        // Aplicar máscara ao valor inicial se necessário
        const displayValue = mask !== 'none' && typeof value === 'string'
            ? applyMask(value, mask)
            : value

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    value={displayValue}
                    onChange={handleChange}
                    className={`
            w-full h-11 px-4 bg-secondary/50 border border-border rounded-xl
            text-foreground placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? 'border-danger focus:ring-danger' : ''}
            ${className}
          `}
                    {...props}
                />
                {hint && !error && (
                    <p className="text-xs text-muted-foreground">{hint}</p>
                )}
                {error && (
                    <p className="text-xs text-danger flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

MaskedInput.displayName = 'MaskedInput'

// Componentes específicos para facilitar o uso
export const CPFInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>((props, ref) => (
    <MaskedInput ref={ref} mask="cpf" placeholder="000.000.000-00" {...props} />
))
CPFInput.displayName = 'CPFInput'

export const CNPJInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>((props, ref) => (
    <MaskedInput ref={ref} mask="cnpj" placeholder="00.000.000/0000-00" {...props} />
))
CNPJInput.displayName = 'CNPJInput'

export const CPFCNPJInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>((props, ref) => (
    <MaskedInput ref={ref} mask="cpfCnpj" placeholder="CPF ou CNPJ" {...props} />
))
CPFCNPJInput.displayName = 'CPFCNPJInput'

export const PhoneInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>((props, ref) => (
    <MaskedInput ref={ref} mask="phone" placeholder="(00) 00000-0000" {...props} />
))
PhoneInput.displayName = 'PhoneInput'

export const CEPInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>((props, ref) => (
    <MaskedInput ref={ref} mask="cep" placeholder="00000-000" {...props} />
))
CEPInput.displayName = 'CEPInput'

export const PlacaInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>((props, ref) => (
    <MaskedInput ref={ref} mask="placa" placeholder="ABC-1234" {...props} />
))
PlacaInput.displayName = 'PlacaInput'

export const CurrencyInput = forwardRef<HTMLInputElement, Omit<MaskedInputProps, 'mask'>>((props, ref) => (
    <MaskedInput ref={ref} mask="currency" placeholder="0,00" {...props} />
))
CurrencyInput.displayName = 'CurrencyInput'
