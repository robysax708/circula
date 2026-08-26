// src/components/ProducerModal.jsx
import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export function ProducerModal({ categories, onClose, onCreated }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', city: '', categoryId: '', dateStart: '', price: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  function u(f, v) { setForm((p) => ({ ...p, [f]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.createEvent({
        title: form.title, description: form.description || undefined,
        city: form.city, categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        dateStart: new Date(form.dateStart).toISOString(),
        price: form.price || undefined, address: form.address || undefined,
      });
      showToast('Evento publicado com sucesso', 'success');
      onCreated();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl border-2 border-[var(--c-ink)] bg-[var(--c-paper)] p-5 max-h-[85vh] overflow-y-auto" role="dialog" aria-label="Publicar evento">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-semibold text-[var(--c-purple)]">Publicar evento</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="focus-ring rounded-full p-1"><X size={20} /></button>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-[var(--c-yellow)]/20 border border-[var(--c-yellow)] p-2 mb-4 text-xs text-[var(--c-ink)]/80">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-[var(--c-pink)]" />
          <p>Após a publicação, alterações no evento só podem ser feitas até 5 dias antes da data do evento.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required placeholder="Título do evento" value={form.title} onChange={(e) => u('title', e.target.value)} className="input-field" />
          <textarea placeholder="Descrição (recomendado)" value={form.description} onChange={(e) => u('description', e.target.value)} className="input-field min-h-20" />
          <input required placeholder="Cidade" value={form.city} onChange={(e) => u('city', e.target.value)} className="input-field" />
          <input placeholder="Endereço completo (opcional)" value={form.address} onChange={(e) => u('address', e.target.value)} className="input-field" />
          <select value={form.categoryId} onChange={(e) => u('categoryId', e.target.value)} className="input-field">
            <option value="">Categoria (opcional)</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="text-xs font-medium flex flex-col gap-1">
            Data e horário
            <input required type="datetime-local" value={form.dateStart} onChange={(e) => u('dateStart', e.target.value)} className="input-field" />
          </label>
          <input placeholder="Preço (ex: Gratuito, R$20)" value={form.price} onChange={(e) => u('price', e.target.value)} className="input-field" />
          {error && <p className="text-xs text-[var(--c-pink)]" role="alert">{error}</p>}
          <button type="submit" disabled={submitting} className="mt-1 btn-primary w-full focus-ring">{submitting ? 'Publicando...' : 'Publicar'}</button>
        </form>
      </div>
    </div>
  );
}
