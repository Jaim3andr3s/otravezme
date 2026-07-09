const VARIANTS = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
  success: 'bg-success text-white hover:opacity-90',
  purple: 'bg-accent text-accent-ink hover:bg-accent-hover',
  pink: 'bg-accent text-accent-ink hover:bg-accent-hover',
  danger: 'bg-danger text-white hover:opacity-90',
  secondary: 'bg-surface-alt text-ink hover:opacity-80 border border-edge',
  ghost: 'bg-surface-alt text-ink hover:opacity-80',
};

export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl font-semibold shadow-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}