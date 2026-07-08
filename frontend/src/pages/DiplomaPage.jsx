import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Printer, Loader2, Award, Calendar } from 'lucide-react';
import { profileService } from '../services/profile.service.js';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

export default function DiplomaPage() {
  const { profile } = useUserAuth();
  const { showNotification } = useNotification();
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiplomas() {
      try {
        const data = await profileService.getDiplomas();
        setDiplomas(data);
      } catch (err) {
        showNotification('Error al cargar tus diplomas: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadDiplomas();
  }, [showNotification]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (diplomas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center py-20 space-y-4"
      >
        <Award className="w-16 h-16 text-ink-muted mx-auto" />
        <h2 className="text-3xl font-serif font-semibold text-ink">Aún no tienes diplomas</h2>
        <p className="text-ink-muted">
          Completa un plan de lectura o un reto para ganar tu primer diploma.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif font-semibold text-ink">🏅 Mis Diplomas</h2>
          <p className="text-lg text-ink-muted">Reconocimientos por tus logros literarios.</p>
        </div>
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-accent text-accent-ink rounded-full font-semibold hover:bg-accent-hover transition flex items-center gap-2 shadow-sm"
        >
          <Printer className="w-5 h-5" />
          Imprimir
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {diplomas.map((diploma) => (
          <div
            key={diploma.id}
            className="bg-surface border-2 border-gold rounded-2xl p-8 shadow-lg print:shadow-none print:border-4 print:border-gold print:break-inside-avoid"
          >
            {/* Sello/medalla decorativa */}
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full border-4 border-gold flex items-center justify-center bg-gold-soft text-gold text-2xl font-serif font-bold shadow-lg print:border-4 print:border-gold">
              ✦
            </div>

            <div className="text-center space-y-4 relative">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-gold flex items-center justify-center bg-gold-soft text-gold text-3xl">
                🏅
              </div>

              <h3 className="text-3xl font-serif font-bold text-ink">
                {diploma.title}
              </h3>

              <div className="text-sm text-ink-muted space-y-1">
                <p className="flex items-center justify-center gap-2">
                  <Award className="w-4 h-4 text-gold" />
                  <span className="font-medium">
                    {diploma.type === 'PLAN' ? 'Plan de lectura' : 'Reto de lectura'}
                  </span>
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-ink-muted" />
                  <span>Otorgado el {new Date(diploma.issuedAt).toLocaleDateString('es-CO', { dateStyle: 'long' })}</span>
                </p>
              </div>

              <div className="pt-4 border-t border-edge">
                <p className="text-sm font-serif italic text-ink-muted">
                  Certificado a: <span className="font-bold text-ink">{profile?.name}</span>
                </p>
              </div>

              {/* Sello decorativo */}
              <div className="flex justify-center mt-4">
                <div className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center text-gold text-xs font-serif">
                  {diploma.type === 'PLAN' ? '📖' : '⭐'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estilos de impresión */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            .print\\:border-4 {
              border-width: 4px !important;
            }
            .print\\:break-inside-avoid {
              break-inside: avoid;
            }
            .print\\:border-gold {
              border-color: #a8791f !important;
            }
            .bg-surface {
              background: white !important;
            }
            .shadow-lg {
              box-shadow: none !important;
            }
            .text-ink {
              color: #2b2117 !important;
            }
            .border-edge {
              border-color: #e7dcc8 !important;
            }
            /* Mostrar solo el contenido del diploma al imprimir */
            .grid > div {
              visibility: visible !important;
              page-break-inside: avoid;
              margin-bottom: 1rem;
            }
            .grid > div * {
              visibility: visible !important;
            }
            button {
              display: none !important;
            }
            .space-y-8 > div:first-child {
              display: none !important;
            }
            /* Ajustar el título y botón de imprimir */
            .flex.items-center.justify-between {
              display: none !important;
            }
            h2.text-4xl {
              display: none !important;
            }
            p.text-lg {
              display: none !important;
            }
          }
        `}
      </style>
    </motion.div>
  );
}