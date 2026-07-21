import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Error capturado por ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-danger" />
          <h2 className="text-2xl font-serif font-semibold text-ink">Algo salió mal</h2>
          <p className="text-ink-muted max-w-md">
            Ocurrió un error inesperado. Por favor, intenta recargar la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl font-semibold bg-accent text-accent-ink hover:opacity-90 transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Recargar página
          </button>
          {import.meta.env.DEV && (
            <pre className="text-xs text-left text-danger-soft bg-surface-alt p-4 rounded-xl max-w-full overflow-auto mt-4">
              {this.state.error?.stack || this.state.error?.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
