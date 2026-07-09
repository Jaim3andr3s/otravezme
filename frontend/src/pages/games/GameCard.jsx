import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { IconTile } from '../../components/ui/IconTile.jsx';

export function GameCard({ to, icon: Icon, title, description, accentClass = 'bg-accent-soft text-accent' }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link
        to={to}
        className="group flex flex-col h-full bg-surface border border-edge rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow min-h-[200px]"
      >
        <IconTile icon={Icon} className={`mb-4 ${accentClass}`} />
        <h3 className="text-xl font-serif font-semibold text-ink mb-1">{title}</h3>
        <p className="text-sm text-ink-muted flex-grow">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all min-h-[44px]">
          Jugar <ArrowRight className="w-4 h-4" />
        </span>
      </Link>
    </motion.div>
  );
}