const SIZES = {
  sm: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
  md: { box: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7' },
  lg: { box: 'w-16 h-16 rounded-2xl', icon: 'w-8 h-8' },
};

export function IconTile({ icon: Icon, size = 'md', className = '' }) {
  const { box, icon: iconClass } = SIZES[size];
  return (
    <div
      className={`${box} flex items-center justify-center shadow-sm ring-1 ring-black/5 dark:ring-white/10 flex-shrink-0 ${className}`}
    >
      <Icon className={iconClass} />
    </div>
  );
}
