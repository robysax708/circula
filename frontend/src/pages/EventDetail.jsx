import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Clock, Send, Check, ExternalLink, Volume2, ImagePlus, Share2, Navigation, Users, Tag } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { StarRating, LoadingScreen } from '../components/Shared.jsx';

export function EventDetail({ eventId, onBack }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try { const { event } = await api.getEvent(eventId); setEvent(event); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [eventId]);

  async function handleAttend() {
    try { await api.markAttended(eventId); showToast('Presença marcada!', 'success'); load(); }
    catch (err) { showToast(err.message, 'error'); }
  }

  async function handleReview(e) {
    e.preventDefault();
    if (reviewForm.rating === 0) { showToast('Selecione uma nota', 'error'); return; }
    setSubmitting(true);
    try {
      await api.submitReview(eventId, reviewForm, photos);
      showToast('Avaliação enviada!', 'success');
      setReviewForm({ rating: 0, comment: '' });
      setPhotos([]);
      load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSubmitting(false); }
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR'; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  function shareEvent() {
    const text = `${event.title} — ${new Date(event.date_start).toLocaleDateString('pt-BR')} em ${event.city}`;
    if (navigator.share) navigator.share({ title: event.title, text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  function openMaps() {
    const query = encodeURIComponent(`${event.address || ''} ${event.city}`);
    const url = event.lat && event.lng
      ? `https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  }

  if (loading) return <LoadingScreen message="Carregando evento..." />;
  if (!event) return <p className="p-4 text-sm">Evento não encontrado.</p>;

  const d = new Date(event.date_start);
  const isPast = d < new Date();
  const alreadyReviewed = event.reviews?.some((r) => r.user_id === user?.id);
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
  const mapQuery = encodeURIComponent(`${event.address || ''} ${event.city}`);
  const mapSrc = event.lat && event.lng
    ? `https://www.google.com/maps?q=${event.lat},${event.lng}&output=embed`
    : `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-wrapper px-4 pt-4 pb-28">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm font-bold text-[var(--c-purple)] focus-ring">
          <ArrowLeft size={18} /> Voltar
        </button>
        <button type="button" onClick={shareEvent} className="btn-secondary text-xs flex items-center gap-1 focus-ring py-2 px-3">
          <Share2 size={14} /> Compartilhar
        </button>
      </div>

      <div className="rounded-2xl borda overflow-hidden mb-4" style={{ background: 'var(--c-purple)', color: 'white' }}>
        <div className="p-5">
          {event.category_name && (
            <div className="flex items-center gap-1 mb-2">
              <Tag size={14} />
              <span className="text-xs font-bold tracking-widest uppercase">{event.category_icon} {event.category_name}</span>
            </div>
          )}
          <h1 className="font-display text-3xl md:text-4xl leading-none mb-3">{event.title}</h1>
          <div className="flex gap-2">
            <button type="button" onClick={() => speak(`${event.title}. ${event.description || ''}`)} className="text-xs flex items-center gap-1 opacity-80 rounded-full px-2 py-1 focus-ring" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Volume2 size={14} /> Ouvir
            </button>
          </div>
        </div>
      </div>

      {event.description && (
        <div className="card mb-4">
          <h2 className="font-bold text-sm text-[var(--c-purple)] mb-1">Sobre o evento</h2>
          <p className="text-sm text-[var(--c-ink)]/80 leading-relaxed">{event.description}</p>
        </div>
      )}

      <div className="card mb-4 flex flex-col gap-3 text-sm">
        <h2 className="font-bold text-[var(--c-purple)]">Quando e onde</h2>
        <div className="flex items-start gap-3">
          <Calendar size={20} className="text-[var(--c-pink)] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <p className="text-xs text-[var(--c-ink)]/60 flex items-center gap-1"><Clock size={12} /> {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin size={20} className="text-[var(--c-pink)] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{event.address || event.city}</p>
            {event.address && event.city && <p className="text-xs text-[var(--c-ink)]/60">{event.city}{event.region ? ` — ${event.region}` : ''}</p>}
          </div>
        </div>
        {event.price && <p className="text-xs font-bold rounded-full bg-[var(--c-yellow)] text-[var(--c-ink)] px-3 py-1 self-start borda">{event.price}</p>}
        {event.creator_org && (
          <div className="flex items-center gap-2 text-xs text-[var(--c-ink)]/60">
            <Users size={14} /> Organização: <span className="font-bold">{event.creator_org}</span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h2 className="font-bold text-sm text-[var(--c-purple)] mb-2">Localização</h2>
        <iframe
          title={`Localização: ${event.title}`}
          className="w-full h-56 rounded-2xl borda"
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <button type="button" onClick={openMaps} className="btn-primary w-full mt-2 flex items-center justify-center gap-2 focus-ring">
          <Navigation size={18} /> Abrir no Google Maps
        </button>
      </div>

      <div className="card mb-4 text-xs flex flex-col gap-1">
        <h2 className="font-bold text-sm text-[var(--c-purple)]">Fonte dos dados</h2>
        <p>Fonte: <span className="font-bold">{event.source}</span></p>
        {event.source_detail && <p>Detalhe: {event.source_detail}</p>}
        {event.source_url && <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-[var(--c-purple)] underline flex items-center gap-1 font-bold">Ver fonte original <ExternalLink size={12} /></a>}
      </div>

      {event.avg_rating > 0 && (
        <div className="card mb-4 flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="font-display text-3xl text-[var(--c-yellow)]">{event.avg_rating}</span>
            <StarRating value={Math.round(event.avg_rating)} readonly size={16} />
          </div>
          <div className="text-sm">
            <p className="font-bold">{event.review_count} avaliação(ões)</p>
            <p className="text-xs text-[var(--c-ink)]/60">{event.attendance_count} pessoa(s) participaram</p>
          </div>
        </div>
      )}

      {user && !event.has_attended && (
        <button type="button" onClick={handleAttend} className="btn-accent w-full mb-4 flex items-center justify-center gap-2 focus-ring">
          <Check size={18} /> {isPast ? 'Marcar que participei' : 'Confirmar presença'}
        </button>
      )}

      {user && event.has_attended && !alreadyReviewed && (
        <form onSubmit={handleReview} className="card mb-4 flex flex-col gap-3">
          <h2 className="font-bold text-sm text-[var(--c-purple)]">Como foi sua experiência?</h2>
          <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm((p) => ({ ...p, rating: v }))} size={32} />
          <textarea value={reviewForm.comment} onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))} placeholder="Conte como foi (opcional)" className="input-field min-h-16" maxLength={1000} />
          <label className="flex items-center gap-2 text-xs cursor-pointer text-[var(--c-purple)] rounded-2xl borda border-dashed p-3 justify-center font-bold">
            <ImagePlus size={18} /> Adicionar fotos (até 3)
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setPhotos(Array.from(e.target.files).slice(0, 3))} />
          </label>
          {photos.length > 0 && <p className="text-xs text-[var(--c-ink)]/50">{photos.length} foto(s)</p>}
          <button type="submit" disabled={submitting} className="btn-primary flex items-center justify-center gap-2 focus-ring">
            <Send size={16} /> {submitting ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </form>
      )}

      {user && event.has_attended && alreadyReviewed && (
        <div className="rounded-2xl borda p-4 mb-4" style={{ background: 'var(--c-green)', color: 'white' }}>
          <p className="font-bold flex items-center gap-2"><Check size={18} /> Você já avaliou este evento</p>
        </div>
      )}

      {event.reviews?.length > 0 && (
        <div className="flex flex-col gap-3 mt-2">
          <h2 className="font-display text-2xl text-[var(--c-purple)]">Avaliações ({event.reviews.length})</h2>
          {event.reviews.map((r) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm">{r.user_name}</span>
                  {r.username && <span className="text-xs text-[var(--c-ink)]/50 ml-1">@{r.username}</span>}
                </div>
                <StarRating value={r.rating} readonly size={14} />
              </div>
              {r.comment && <p className="text-sm text-[var(--c-ink)]/80">{r.comment}</p>}
              {r.photos?.length > 0 && (
                <div className="flex gap-2 mt-1">
                  {r.photos.map((p, i) => <img key={i} src={`${apiBase}/uploads/${p}`} alt="Foto da avaliação" className="w-20 h-20 object-cover rounded-xl borda" loading="lazy" />)}
                </div>
              )}
              <p className="text-[10px] text-[var(--c-ink)]/40">{new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
            </motion.div>
          ))}
        </div>
      )}

      {(!event.reviews || event.reviews.length === 0) && (
        <p className="text-sm text-[var(--c-ink)]/50 text-center mt-6">Nenhuma avaliação ainda. Participe e seja o primeiro!</p>
      )}
    </motion.div>
  );
}
