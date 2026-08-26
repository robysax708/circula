import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { EventCard } from '../components/EventCard.jsx';
import { SkeletonCard } from '../components/Shared.jsx';

export function FavoritesPage({ onOpenEvent }) {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [fav, notif] = await Promise.all([api.listFavorites(), api.listNotifications()]);
      setFavorites(fav.items.map((e) => ({ ...e, is_favorite: 1 })));
      setNotifications(notif.items);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleRemove(event) {
    setPendingId(event.id);
    try { await api.removeFavorite(event.id); setFavorites((p) => p.filter((e) => e.id !== event.id)); showToast('Removido', 'success'); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setPendingId(null); }
  }

  async function dismiss(id) {
    try { await api.markNotificationRead(id); setNotifications((p) => p.filter((n) => n.id !== id)); } catch {}
  }

  return (
    <div className="content-wrapper px-4 pt-6 pb-28">
      <header className="mb-5">
        <h1 className="font-display text-3xl text-[var(--c-purple)]">Meus favoritos</h1>
        <p className="text-sm text-[var(--c-ink)]/60">Eventos que você quer não perder</p>
      </header>

      {notifications.length > 0 && (
        <div className="mb-5 flex flex-col gap-2" role="region" aria-label="Notificações">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-2 rounded-2xl borda p-3 text-sm" style={{ background: 'var(--c-yellow)', color: 'var(--c-ink)' }}>
              <BellRing size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 font-bold">{n.message}</p>
              <button type="button" onClick={() => dismiss(n.id)} className="text-xs font-bold underline focus-ring shrink-0">Ok</button>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="events-grid flex flex-col gap-4">{[1, 2].map((n) => <SkeletonCard key={n} />)}</div>
      ) : favorites.length === 0 ? (
        <p className="text-sm text-[var(--c-ink)]/60 text-center py-8">Você ainda não favoritou nenhum evento. Toque na ⭐ em um evento na aba Descobrir.</p>
      ) : (
        <div className="events-grid flex flex-col gap-4">{favorites.map((e, i) => <EventCard key={e.id} event={e} index={i} pending={pendingId === e.id} onToggleFavorite={handleRemove} onOpen={onOpenEvent} />)}</div>
      )}
    </div>
  );
}
