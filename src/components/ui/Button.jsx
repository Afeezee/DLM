import { forwardRef } from 'react'

const variants = {
  primary: 'bg-brand-dark text-brand-light hover:bg-brand-primary',
  light: 'bg-brand-light text-brand-dark hover:bg-brand-secondary',
  secondary:
    'border border-brand-dark/15 bg-white/70 text-brand-dark hover:border-brand-primary hover:text-brand-primary',
  ghost: 'bg-transparent text-brand-dark hover:bg-brand-dark/5',
}

const sizes = {
  md: 'h-12 px-5 text-sm',
  lg: 'h-14 px-6 text-base',
}

function ButtonBase(
  { as: Component = 'button', className = '', size = 'md', variant = 'primary', ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    />
  )
}

const Button = forwardRef(ButtonBase)

export default Button