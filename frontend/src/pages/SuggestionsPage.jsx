// src/pages/SuggestionsPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Lightbulb } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { SkeletonCard } from '../components/Shared.jsx';

export function SuggestionsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ targetType: 'secretaria', targetRegion: '', category: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/suggestions`);
      const data = await res.json();
      setSuggestions(data.items || []);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.message.trim().length < 10) { showToast('A sugestão precisa ter ao menos 10 caracteres', 'error'); return; }
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('circula_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showToast('Sugestão enviada com sucesso!', 'success');
      setForm({ ...form, message: '', category: '' });
      load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSubmitting(false); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto px-4 pt-6 pb-28">
      <header className="mb-5">
        <h1 className="font-display text-2xl font-semibold text-[var(--c-purple)]">Sugestões culturais</h1>
        <p className="text-xs text-[var(--c-ink)]/60">Ajude a trazer mais cultura para sua região</p>
      </header>

      <div className="card mb-5 bg-[var(--c-purple-light)] border-[var(--c-purple)]/30">
        <div className="flex items-start gap-2">
          <Lightbulb size={20} className="text-[var(--c-purple)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--c-ink)]/80">
            Envie sugestões de eventos, atividades ou melhorias para a secretaria de cultura da sua região ou diretamente para produtores de eventos. Suas ideias ajudam a diversificar a oferta cultural!
          </p>
        </div>
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="card mb-5 flex flex-col gap-3">
          <h2 className="font-semibold text-sm text-[var(--c-purple)] flex items-center gap-2"><Send size={16} /> Nova sugestão</h2>
          <select value={form.targetType} onChange={(e) => setForm((p) => ({ ...p, targetType: e.target.value }))} className="input-field">
            <option value="secretaria">Para a secretaria de cultura</option>
            <option value="produtor">Para produtores de eventos</option>
          </select>
          <input placeholder="Região (ex: Campinas e Região)" value={form.targetRegion} onChange={(e) => setForm((p) => ({ ...p, targetRegion: e.target.value }))} className="input-field" />
          <input placeholder="Categoria (ex: Música, Teatro)" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="input-field" />
          <textarea placeholder="Escreva sua sugestão (mín. 10 caracteres)" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="input-field min-h-20" maxLength={1000} />
          <button type="submit" disabled={submitting} className="btn-primary flex items-center justify-center gap-2 focus-ring">
            <Send size={16} /> {submitting ? 'Enviando...' : 'Enviar sugestão'}
          </button>
        </form>
      )}

      <h2 className="font-display font-semibold text-[var(--c-purple)] mb-3 flex items-center gap-2">
        <MessageSquare size={18} /> Sugestões da comunidade
      </h2>

      {loading ? (
        <div className="flex flex-col gap-3">{[1, 2].map((n) => <SkeletonCard key={n} />)}</div>
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-[var(--c-ink)]/60">Nenhuma sugestão ainda. Seja o primeiro a contribuir!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {suggestions.map((s) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[var(--c-purple)]">{s.target_type === 'secretaria' ? '🏛️ Secretaria' : '🎪 Produtores'}</span>
                {s.target_region && <span className="text-[10px] text-[var(--c-ink)]/50">{s.target_region}</span>}
              </div>
              {s.category && <span className="text-[10px] rounded-full bg-[var(--c-purple-light)] px-2 py-0.5 text-[var(--c-purple)]">{s.category}</span>}
              <p className="text-sm text-[var(--c-ink)]/80 mt-1">{s.message}</p>
              <p className="text-[10px] text-[var(--c-ink)]/40 mt-1">por {s.user_name} · {new Date(s.created_at).toLocaleDateString('pt-BR')}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
