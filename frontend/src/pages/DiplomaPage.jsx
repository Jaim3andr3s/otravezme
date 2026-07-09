import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, Loader2, Award, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { profileService } from '../services/profile.service.js';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { useMascot } from '../context/MascotContext.jsx';

const STORAGE_KEY = 'sofi_last_diploma_seen';

export default function DiplomaPage() {
  const { profile } = useUserAuth();
  const { showNotification } = useNotification();
  const { react } = useMascot();
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);
  const notifiedRef = useRef(false);

  useEffect(() => {
    async function loadDiplomas() {
      try {
        const data = await profileService.getDiplomas();
        setDiplomas(data);

        // Verificar si hay un diploma nuevo
        if (data.length > 0 && !notifiedRef.current) {
          const lastSeen = localStorage.getItem(STORAGE_KEY);
          const latest = data.reduce((a, b) => new Date(a.issuedAt) > new Date(b.issuedAt) ? a : b);
          if (!lastSeen || new Date(latest.issuedAt) > new Date(lastSeen)) {
            react('diploma');
            localStorage.setItem(STORAGE_KEY, latest.issuedAt);
          }
          notifiedRef.current = true;
        }
      } catch (err) {
        showNotification('Error al cargar tus diplomas: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadDiplomas();
  }, [showNotification, react]);

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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <Link to="/perfil" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-accent mb-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al perfil
          </Link>
          <h2 className="text-4xl font-serif font-semibold text-ink">🏅 Mis Diplomas</h2>
          <p className="text-lg text-ink-muted">Reconocimientos por tus logros literarios.</p>
        </div>
        {diplomas.length > 0 && (
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-accent text-accent-ink rounded-full font-semibold hover:bg-accent-hover transition flex items-center gap-2 shadow-sm print:hidden"
          >
            <Printer className="w-5 h-5" />
            Imprimir diplomas
          </button>
        )}
      </div>

      {diplomas.length === 0 ? (
        <div className="text-center py-20 space-y-4 bg-surface rounded-xl border border-edge">
          <Award className="w-16 h-16 text-ink-muted mx-auto" />
          <h3 className="text-2xl font-serif font-semibold text-ink">Aún no tienes diplomas</h3>
          <p className="text-ink-muted max-w-md mx-auto">
            Completa un plan de lectura o un reto para ganar tu primer diploma.
          </p>
          <Link
            to="/planes-lectores"
            className="inline-block px-6 py-3 bg-accent text-accent-ink rounded-full font-semibold hover:bg-accent-hover transition"
          >
            Ver planes de lectura
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diplomas.map((diploma) => (
            <div
              key={diploma.id}
              className="relative bg-surface border-2 border-gold rounded-2xl p-8 shadow-lg print:shadow-none print:border-4 print:border-gold print:break-inside-avoid print:page-break-inside-avoid"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full border-4 border-gold flex items-center justify-center bg-gold-soft text-gold text-2xl font-serif font-bold shadow-lg print:border-4 print:border-gold">
                ✦
              </div>

              <div className="text-center space-y-4 relative">
                <div className="w-20 h-20 mx-auto rounded-full border-4 border-gold flex items-center justify-center bg-gold-soft text-gold text-3xl">
                  🏅
                </div>

                <h3 className="text-2xl font-serif font-bold text-ink">
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

                <div className="flex justify-center mt-4">
                  <div className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center text-gold text-xl font-serif">
                    {diploma.type === 'PLAN' ? '📖' : '⭐'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .grid > div {
            visibility: visible !important;
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 1rem;
          }
          .grid > div * {
            visibility: visible !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-4 {
            border-width: 4px !important;
          }
          .print\\:border-gold {
            border-color: #f5a623 !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:page-break-inside-avoid {
            page-break-inside: avoid;
          }
          .bg-surface {
            background: white !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
          .text-ink {
            color: #1f2937 !important;
          }
          .border-edge {
            border-color: #dcebfb !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          header, nav, .print\\:hidden {
            display: none !important;
          }
          .space-y-8 > div:first-child {
            display: none !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .grid {
            display: block !important;
          }
          .grid > div {
            max-width: 800px !important;
            margin: 0 auto 2rem auto !important;
          }
        }
      `}</style>
    </motion.div>
  );
}