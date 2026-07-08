export function Badge({
  icon: Icon,
  text,
  color = 'bg-surface-alt',
  textColor = 'text-ink-muted',
}) {
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${color} ${textColor}`}>
      {Icon && <Icon className="w-4 h-4 mr-1" />}
      {text}
    </span>
  );
}
