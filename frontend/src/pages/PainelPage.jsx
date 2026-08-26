import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { SkeletonCard } from '../components/Shared.jsx';
import { Database, Globe, Users, BarChart3 } from 'lucide-react';

export function PainelPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.listEvents({ pageSize: 50 }).then((r) => {
      const byCity = {}, byCategory = {}, bySrc = {};
      for (const e of r.items) {
        byCity[e.city] = (byCity[e.city] || 0) + 1;
        const cat = e.category_name || 'Sem categoria';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
        const src = e.source || 'Desconhecida';
        bySrc[src] = (bySrc[src] || 0) + 1;
      }
      setStats({
        total: r.total,
        byCity: Object.entries(byCity).sort((a, b) => b[1] - a[1]),
        byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
        bySource: Object.entries(bySrc).sort((a, b) => b[1] - a[1]),
      });
    }).catch((err) => showToast(err.message, 'error')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="content-wrapper px-4 pt-6 pb-28"><SkeletonCard /></div>;

  return (
    <div className="content-wrapper px-4 pt-6 pb-28">
      <header className="mb-5">
        <h1 className="font-display text-3xl text-[var(--c-purple)]">Painel de dados</h1>
        <p className="text-sm text-[var(--c-ink)]/60">Como a circulação cultural está distribuída</p>
      </header>

      {stats && (
        <div className="flex flex-col gap-5">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl borda text-center py-6" style={{ background: 'var(--c-purple)', color: 'white' }}>
            <p className="font-display text-6xl">{stats.total}</p>
            <p className="text-sm opacity-80">eventos culturais ativos no Circula</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            <StatBlock title="Por cidade" entries={stats.byCity} icon={Globe} color="var(--c-green)" />
            <StatBlock title="Por categoria" entries={stats.byCategory} icon={BarChart3} color="var(--c-pink)" />
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Database size={20} className="text-[var(--c-purple)]" />
              <h2 className="font-display text-xl text-[var(--c-purple)]">De onde vêm os dados</h2>
            </div>
            <div className="flex flex-col gap-2">
              {stats.bySource.map(([src, count]) => (
                <div key={src} className="flex items-center justify-between text-sm py-2" style={{ borderBottom: '2px dashed rgba(34,24,51,0.1)' }}>
                  <span className="flex items-center gap-2"><Users size={14} className="text-[var(--c-ink)]/40" /> {src}</span>
                  <span className="font-bold text-[var(--c-purple)] rounded-full px-2 py-0.5 borda bg-[var(--c-purple-light)]">{count}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-[var(--c-ink)]/40">
              Fontes: secretarias municipais, Sympla, SESC, editais públicos (Lei Aldir Blanc, ProAC) e produtores credenciados com CNPJ.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBlock({ title, entries, icon: Icon, color }) {
  const max = entries.length ? entries[0][1] : 1;
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={20} style={{ color }} />
        <h2 className="font-display text-xl" style={{ color }}>{title}</h2>
      </div>
      <div className="flex flex-col gap-2">
        {entries.map(([label, count]) => (
          <div key={label} className="text-sm">
            <div className="flex justify-between mb-1"><span className="font-bold">{label}</span><span className="font-bold" style={{ color }}>{count}</span></div>
            <div className="h-3 rounded-full overflow-hidden borda">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ duration: 0.5 }} className="h-full rounded-full" style={{ background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
