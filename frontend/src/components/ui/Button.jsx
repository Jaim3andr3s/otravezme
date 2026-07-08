const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  success: 'bg-green-600 text-white hover:bg-green-700',
  purple: 'bg-purple-600 text-white hover:bg-purple-700',
  pink: 'bg-pink-600 text-white hover:bg-pink-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600',
  ghost: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600',
};

export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
