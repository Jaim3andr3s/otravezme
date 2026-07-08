export function Input({ as: Component = 'input', className = '', ...props }) {
  return (
    <Component
      className={`w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white transition duration-150 ${className}`}
      {...props}
    />
  );
}
