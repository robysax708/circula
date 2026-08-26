import { Star, MapPin, Calendar } from 'lucide-react';
import { StarRating } from './Shared.jsx';

const EVENT_COLORS = ['#660099', '#FFC63F', '#1E9E6A', '#E84D8A', '#3D1156'];

export function EventCard({ event, onToggleFavorite, onOpen, pending, index = 0 }) {
  const date = new Date(event.date_start);
  const dateLabel = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  const timeLabel = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const bgColor = EVENT_COLORS[index % EVENT_COLORS.length];
  const isLight = bgColor === '#FFC63F';
  const textColor = isLight ? '#221833' : '#FFFFFF';
  const rotate = index % 2 === 0 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]';
  const mapQuery = encodeURIComponent(`${event.address || ''} ${event.city}`);

  return (
    <div className={`poster ${rotate}`} style={{ background: bgColor, color: textColor }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.25)' }}>
            {event.category_icon || ''} {event.category_name || 'Evento'}
          </span>
          <button type="button" onClick={(e) => { e.stopPropagation(); onToggleFavorite(event); }} disabled={pending}
            aria-pressed={!!event.is_favorite} aria-label={event.is_favorite ? 'Remover dos favoritos' : 'Favoritar'}
            className="focus-ring rounded-full p-1 disabled:opacity-50">
            <Star size={20} fill={event.is_favorite ? '#FFC63F' : 'none'} stroke={event.is_favorite ? '#FFC63F' : 'currentColor'} />
          </button>
        </div>

        <button type="button" onClick={() => onOpen?.(event)} className="text-left w-full focus-ring" aria-label={`Ver: ${event.title}`}>
          <div className="font-display text-2xl md:text-3xl leading-none mb-2">{event.title}</div>
        </button>

        {event.description && <p className="text-sm opacity-90 line-clamp-2 mb-2">{event.description}</p>}

        <div className="text-sm font-bold flex items-center gap-1"><Calendar size={14} /> {dateLabel} · {timeLabel}</div>
        <div className="text-sm opacity-90 flex items-center gap-1"><MapPin size={14} /> {event.address || event.city}</div>

        {event.lat && event.lng && (
          <iframe
            title={`Mapa: ${event.title}`}
            className="w-full h-28 rounded-lg borda mt-2"
            src={`https://www.google.com/maps?q=${event.lat},${event.lng}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {event.avg_rating > 0 && (
              <div className="flex items-center gap-1">
                <StarRating value={Math.round(event.avg_rating)} readonly size={12} />
                <span className="text-[10px] font-bold">({event.review_count})</span>
              </div>
            )}
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: 'var(--c-ink)', color: '#FFF' }}>
            {event.source_detail || event.source}
          </span>
        </div>
      </div>
    </div>
  );
}
