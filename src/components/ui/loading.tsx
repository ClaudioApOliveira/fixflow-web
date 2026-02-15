interface LoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
}

export function Loading({ text = 'Carregando...', size = 'md' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        <div className={`${sizeStyles[size]} border-4 border-primary/20 rounded-full`} />
        <div
          className={`absolute top-0 left-0 ${sizeStyles[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`}
        />
      </div>
      {text && <p className="text-muted-foreground font-medium">{text}</p>}
    </div>
  )
}

export function LoadingPage({ text }: LoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loading text={text} size="lg" />
    </div>
  )
}
