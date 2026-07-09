export function IconButton({ icon: Icon, onClick, className = '', title = '', disabled = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-11 h-11 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200 ease-out hover:scale-105 active:scale-95 ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}