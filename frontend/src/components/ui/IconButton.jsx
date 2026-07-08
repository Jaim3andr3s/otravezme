export function IconButton({ icon: Icon, onClick, className = '', title = '', disabled = false }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-full transition duration-200 ease-in-out shadow-lg transform hover:scale-105 ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}
