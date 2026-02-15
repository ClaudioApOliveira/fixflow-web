import { TextareaHTMLAttributes, forwardRef } from 'react'

interface NotebookTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const NotebookTextarea = forwardRef<HTMLTextAreaElement, NotebookTextareaProps>(
  ({ className = '', label, error, hint, id, style, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-')
    const lineHeight = 28

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div
          className="relative bg-secondary/50 rounded-xl border border-border overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all duration-200"
          style={
            error
              ? {
                  borderColor: 'var(--color-danger)',
                  borderWidth: '1px',
                  boxShadow: '0 0 0 2px var(--color-danger-opacity)',
                }
              : {}
          }
        >
          {/* Linhas do caderno */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: 0.1 }}
          >
            <defs>
              <pattern
                id="lines"
                x="0"
                y="0"
                width="100%"
                height={lineHeight}
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1={lineHeight - 1}
                  x2="100%"
                  y2={lineHeight - 1}
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lines)" />
          </svg>

          <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/30 to-accent/10" />

          <textarea
            ref={ref}
            id={textareaId}
            className={`
                            w-full bg-transparent border-0
                            text-foreground placeholder:text-muted-foreground
                            focus:outline-none resize-vertical
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200
                            relative z-10
                            ${className}
                        `}
            style={{
              lineHeight: `${lineHeight}px`,
              minHeight: `${lineHeight * 6}px`,
              paddingTop: '0px',
              paddingBottom: '12px',
              paddingLeft: '64px',
              paddingRight: '24px',
              ...style,
            }}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
        {error && (
          <p className="text-xs text-danger flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)

NotebookTextarea.displayName = 'NotebookTextarea'
