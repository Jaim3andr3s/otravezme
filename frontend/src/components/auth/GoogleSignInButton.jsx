import { useEffect, useRef, useState } from 'react';

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function GoogleSignInButton({ onCredential }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState(CLIENT_ID ? 'loading' : 'unconfigured');

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => onCredential(response.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: 280,
          text: 'continue_with',
        });
        setStatus('ready');
      })
      .catch(() => setStatus('error'));

    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  if (status === 'unconfigured') {
    return (
      <p className="text-xs text-ink-muted text-center border border-edge rounded-full py-3 px-4">
        Inicio de sesión con Google no configurado todavía.
      </p>
    );
  }

  if (status === 'error') {
    return <p className="text-xs text-danger text-center">No se pudo cargar el botón de Google. Revisa tu conexión.</p>;
  }

  return <div ref={containerRef} className="flex justify-center" />;
}
