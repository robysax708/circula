import { useEffect, useMemo, useState } from 'react';
import { Search, ArrowLeftRight, Plus } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { EventCard } from '../components/EventCard.jsx';
import { ProducerModal } from '../components/ProducerModal.jsx';
import { SkeletonCard } from '../components/Shared.jsx';

const CENTROS = ['campinas', 'são paulo', 'rio de janeiro', 'belo horizonte', 'curitiba', 'salvador'];

export function DiscoverPage({ onOpenEvent, initialCity = '' }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [filterCity, setFilterCity] = useState(initialCity);
  const [flow, setFlow] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);
  const [showProducer, setShowProducer] = useState(false);

  async function loadEvents() {
    setLoading(true);
    try {
      const params = {};
      if (query) params.q = query;
      if (categoryId) params.categoryId = categoryId;
      if (filterCity) params.city = filterCity;
      setEvents((await api.listEvents(params)).items);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { api.listCategories().then((r) => setCategories(r.items)).catch(() => {}); }, []);
  useEffect(() => { const t = setTimeout(loadEvents, 300); return () => clearTimeout(t); }, [query, categoryId, filterCity]);
  useEffect(() => { if (initialCity) setFilterCity(initialCity); }, [initialCity]);

  const allCities = useMemo(() => [...new Set(events.map((e) => e.city))].sort(), [events]);

  const filtered = useMemo(() => {
    if (flow === 'todos') return events;
    return events.filter((e) => {
      const isCentro = CENTROS.includes(e.city.toLowerCase());
      return flow === 'centros' ? isCentro : !isCentro;
    });
  }, [events, flow]);

  async function handleFav(event) {
    if (!user) { showToast('Entre na sua conta para favoritar', 'info'); return; }
    setPendingId(event.id);
    try {
      if (event.is_favorite) await api.removeFavorite(event.id);
      else await api.addFavorite(event.id);
      setEvents((p) => p.map((e) => (e.id === event.id ? { ...e, is_favorite: e.is_favorite ? 0 : 1 } : e)));
      showToast(event.is_favorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setPendingId(null); }
  }

  const isProducer = user?.role === 'producer' || user?.role === 'admin';

  return (
    <div className="content-wrapper px-4 pt-6 pb-28">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[var(--c-purple)]">Descobrir</h1>
          <p className="text-sm text-[var(--c-ink)]/60">Eventos culturais da sua região</p>
        </div>
        {isProducer && (
          <button type="button" onClick={() => setShowProducer(true)} className="btn-accent text-sm flex items-center gap-1 focus-ring">
            <Plus size={16} /> Publicar
          </button>
        )}
      </header>

      <div className="relative mb-3">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-ink)]/50" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar evento, cidade..." className="input-field pl-10 text-base" aria-label="Buscar" />
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="input-field text-sm py-2" style={{ width: 'auto', minWidth: '130px' }} aria-label="Filtrar por cidade">
          <option value="">Todas cidades</option>
          {allCities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-field text-sm py-2" style={{ width: 'auto', minWidth: '130px' }} aria-label="Filtrar por categoria">
          <option value="">Todas categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2 mb-5 rounded-2xl borda p-1.5 bg-[var(--c-paper-2)]" role="group" aria-label="Fluxo cultural">
        <ArrowLeftRight size={16} className="ml-2 text-[var(--c-purple)]" />
        <Seg active={flow === 'todos'} onClick={() => setFlow('todos')} label="Todos" />
        <Seg active={flow === 'interior'} onClick={() => setFlow('interior')} label="Interior" />
        <Seg active={flow === 'centros'} onClick={() => setFlow('centros')} label="Grandes centros" />
      </div>

      {loading ? (
        <div className="events-grid flex flex-col gap-4">{[1, 2, 3].map((n) => <SkeletonCard key={n} />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--c-ink)]/60 text-center py-8">Nenhum evento encontrado.{isProducer ? ' Que tal publicar um?' : ''}</p>
      ) : (
        <div className="events-grid flex flex-col gap-4">
          {filtered.map((e, i) => <EventCard key={e.id} event={e} index={i} pending={pendingId === e.id} onToggleFavorite={handleFav} onOpen={onOpenEvent} />)}
        </div>
      )}

      {showProducer && <ProducerModal categories={categories} onClose={() => setShowProducer(false)} onCreated={() => { setShowProducer(false); loadEvents(); }} />}
    </div>
  );
}

function Seg({ active, onClick, label }) {
  return <button type="button" onClick={onClick} className={`flex-1 rounded-xl py-2 text-sm font-bold focus-ring transition-colors ${active ? 'bg-[var(--c-purple)] text-white' : 'text-[var(--c-ink)]/60'}`}>{label}</button>;
}
