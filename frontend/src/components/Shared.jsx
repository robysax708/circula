// src/components/Shared.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Star, Landmark, BarChart3, User, Loader2 } from 'lucide-react';

export function Logo({ className = 'w-8 h-8', variant = 'icon' }) {
  if (variant === 'full') {
    return <img src="/logo-circula.webp" alt="Circula" className={`${className} object-contain`} />;
  }
  return <img src="/logo-circula.svg" alt="Circula" className={`${className} object-contain`} />;
}

export function LoadingScreen({ message = 'Carregando...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--c-paper)]" role="status" aria-label={message}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
        <Loader2 size={36} className="text-[var(--c-purple)]" />
      </motion.div>
      <p className="text-sm text-[var(--c-ink)]/60">{message}</p>
    </div>
  );
}

export function PageTransition({ children, id }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const TABS = [
  { id: 'descobrir', label: 'Descobrir', icon: Compass },
  { id: 'favoritos', label: 'Favoritos', icon: Star },
  { id: 'fomento', label: 'Fomento', icon: Landmark },
  { id: 'painel', label: 'Painel', icon: BarChart3 },
  { id: 'perfil', label: 'Perfil', icon: User },
];

export function BottomNav({ active, onChange, unreadCount = 0 }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white z-40" style={{ borderTop: '3px solid var(--c-ink)' }} aria-label="Navegação principal" role="tablist">
      <ul className="max-w-4xl mx-auto flex">
        {TABS.map(({ id, label, icon: Icon }) => (
          <li key={id} className="flex-1">
            <button type="button" onClick={() => onChange(id)} role="tab" aria-selected={active === id}
              className="w-full flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold focus-ring transition-colors relative"
              style={{
                background: active === id ? 'var(--c-yellow)' : 'transparent',
                borderTop: active === id ? '3px solid var(--c-ink)' : '3px solid transparent',
                marginTop: '-3px',
                color: active === id ? 'var(--c-ink)' : 'rgba(34,24,51,0.5)',
              }}>
              <Icon size={22} strokeWidth={active === id ? 2.5 : 1.8} />
              {label}
              {id === 'favoritos' && unreadCount > 0 && (
                <span className="absolute top-1 right-[calc(50%-14px)] w-2.5 h-2.5 rounded-full bg-[var(--c-pink)] borda" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function StarRating({ value = 0, onChange, size = 20, readonly = false }) {
  return (
    <div className="flex gap-0.5" role={readonly ? 'img' : 'radiogroup'} aria-label={`Avaliação: ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={readonly}
          onClick={() => onChange?.(n)}
          aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
          className={`focus-ring ${readonly ? 'cursor-default' : 'cursor-pointer'}`}>
          <Star size={size} fill={n <= value ? 'var(--c-yellow)' : 'none'} stroke={n <= value ? 'var(--c-yellow)' : 'currentColor'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      <div className="h-5 bg-[var(--c-paper-2)] rounded w-3/4 mb-3" />
      <div className="h-3 bg-[var(--c-paper-2)] rounded w-full mb-2" />
      <div className="h-3 bg-[var(--c-paper-2)] rounded w-2/3" />
    </div>
  );
}
