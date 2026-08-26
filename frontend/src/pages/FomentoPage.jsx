// src/pages/FomentoPage.jsx
import { useEffect, useState } from 'react';
import { ExternalLink, Volume2, Award, BookOpen, FileText } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { SkeletonCard } from '../components/Shared.jsx';
import { motion } from 'framer-motion';

const TYPE_INFO = {
  bolsa: { label: 'Bolsas', icon: Award, color: 'var(--c-green)' },
  edital: { label: 'Editais', icon: FileText, color: 'var(--c-pink)' },
  programa: { label: 'Programas', icon: BookOpen, color: 'var(--c-purple)' },
};

export function FomentoPage() {
  const { showToast } = useToast();
  const [programs, setPrograms] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listCulturalPrograms(filter || undefined)
      .then((r) => setPrograms(r.items))
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [filter]);

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    window.speechSynthesis.speak(u);
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28">
      <header className="mb-2">
        <h1 className="font-display text-2xl font-semibold text-[var(--c-purple)]">Fomento cultural</h1>
        <p className="text-xs text-[var(--c-ink)]/60">Bolsas, editais e programas para artistas e produtores</p>
      </header>

      <div className="card mb-5 bg-[var(--c-green-light)] border-[var(--c-green)]">
        <p className="text-sm text-[var(--c-ink)]/80">
          Esta seção reúne oportunidades de fomento cultural de fontes oficiais. Futuramente, o Circula também vai facilitar processos governamentais (inscrição em editais, acompanhamento de status) diretamente por aqui.
        </p>
      </div>

      <div className="flex gap-2 mb-4" role="group" aria-label="Filtrar por tipo">
        <FilterBtn active={!filter} onClick={() => setFilter('')} label="Todos" />
        {Object.entries(TYPE_INFO).map(([key, { label }]) => (
          <FilterBtn key={key} active={filter === key} onClick={() => setFilter(key)} label={label} />
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">{[1, 2, 3].map((n) => <SkeletonCard key={n} />)}</div>
      ) : programs.length === 0 ? (
        <p className="text-sm text-[var(--c-ink)]/60">Nenhum programa encontrado.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {programs.map((p) => {
            const info = TYPE_INFO[p.type] || TYPE_INFO.programa;
            const Icon = info.icon;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <Icon size={20} className="shrink-0 mt-0.5" style={{ color: info.color }} aria-hidden="true" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border" style={{ borderColor: info.color, color: info.color }}>{info.label}</span>
                  </div>
                  <button type="button" onClick={() => speak(`${p.title}. ${p.description || ''}`)} className="focus-ring text-[var(--c-purple)]/60" aria-label="Ouvir">
                    <Volume2 size={16} />
                  </button>
                </div>
                {p.description && <p className="text-sm text-[var(--c-ink)]/80">{p.description}</p>}
                <div className="flex items-center justify-between text-xs text-[var(--c-ink)]/50">
                  {p.source && <span>Fonte: {p.source}</span>}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[var(--c-purple)] underline flex items-center gap-1 focus-ring">
                      Acessar <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, label }) {
  return <button type="button" onClick={onClick} className={`rounded-full border-2 border-[var(--c-ink)] px-3 py-1 text-xs font-medium focus-ring ${active ? 'bg-[var(--c-pink)] text-[var(--c-paper)]' : 'bg-white'}`}>{label}</button>;
}
