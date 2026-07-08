export function Badge({
  icon: Icon,
  text,
  color = 'bg-gray-100 dark:bg-gray-700',
  textColor = 'text-gray-600 dark:text-gray-200',
}) {
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${color} ${textColor}`}>
      {Icon && <Icon className="w-4 h-4 mr-1" />}
      {text}
    </span>
  );
}
