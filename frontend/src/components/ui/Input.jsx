export function Input({ as: Component = 'input', className = '', ...props }) {
  return (
    <Component
      className={`w-full p-3 border border-edge rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-accent bg-surface text-ink transition duration-150 ${className}`}
      {...props}
    />
  );
}
