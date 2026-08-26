import { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { SkeletonCard } from '../components/Shared.jsx';

const COLORS = ['#FDDCB5', '#F5B87A', '#E8944A', '#C96830', '#8B3A1F'];

const STATE_POSITIONS = {
  'AM': { x: 25, y: 18 }, 'PA': { x: 42, y: 20 }, 'MA': { x: 55, y: 20 },
  'CE': { x: 66, y: 23 }, 'PE': { x: 70, y: 30 }, 'BA': { x: 62, y: 38 },
  'MG': { x: 55, y: 52 }, 'RJ': { x: 62, y: 58 }, 'SP': { x: 50, y: 60 },
  'PR': { x: 45, y: 68 }, 'SC': { x: 47, y: 74 }, 'RS': { x: 44, y: 80 },
  'GO': { x: 46, y: 48 }, 'DF': { x: 50, y: 46 }, 'MT': { x: 34, y: 38 },
  'MS': { x: 38, y: 55 }, 'TO': { x: 48, y: 32 }, 'PI': { x: 58, y: 26 },
  'RN': { x: 72, y: 25 }, 'PB': { x: 72, y: 28 }, 'AL': { x: 72, y: 33 },
  'SE': { x: 68, y: 35 }, 'ES': { x: 62, y: 53 }, 'RO': { x: 28, y: 32 },
  'AC': { x: 18, y: 30 }, 'AP': { x: 45, y: 12 }, 'RR': { x: 28, y: 8 },
};

const CITY_TO_STATE = {
  'Hortolândia': 'SP', 'Sumaré': 'SP', 'Campinas': 'SP', 'Valinhos': 'SP',
  'Monte Mor': 'SP', 'São Paulo': 'SP', 'Curitiba': 'PR', 'Olinda': 'PE',
  'Gramado': 'RS', 'Paraty': 'RJ', 'Parintins': 'AM', 'Salvador': 'BA',
  'Belo Horizonte': 'MG',
};

const REGION_MAP = {
  'Norte': ['AM', 'PA', 'RO', 'AC', 'AP', 'RR', 'TO'],
  'Nordeste': ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'],
  'Centro-Oeste': ['MT', 'MS', 'GO', 'DF'],
  'Sudeste': ['SP', 'RJ', 'MG', 'ES'],
  'Sul': ['PR', 'SC', 'RS'],
};

function getColor(count, max) {
  if (count === 0) return '#E8E3DA';
  const ratio = max > 0 ? count / max : 0;
  return COLORS[Math.min(Math.floor(ratio * COLORS.length), COLORS.length - 1)];
}

function getSize(count, max) {
  if (count === 0) return 0;
  return 22 + (count / Math.max(max, 1)) * 42;
}

export function HeatmapPage({ onNavigateToCity }) {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [scale, setScale] = useState('estado');
  const [filterCat, setFilterCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    Promise.all([api.listEvents({ pageSize: 50 }), api.listCategories()])
      .then(([evRes, catRes]) => { setEvents(evRes.items); setCategories(catRes.items); })
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!filterCat) return events;
    return events.filter((e) => String(e.category_id) === filterCat);
  }, [events, filterCat]);

  const bubbles = useMemo(() => {
    if (scale === 'estado') {
      const byState = {};
      for (const e of filtered) {
        const st = CITY_TO_STATE[e.city] || 'SP';
        if (!byState[st]) byState[st] = { name: st, label: st, count: 0, cities: new Set() };
        byState[st].count++;
        byState[st].cities.add(e.city);
      }
      return Object.values(byState).map((s) => ({
        ...s, ...STATE_POSITIONS[s.name],
        cities: [...s.cities],
      }));
    }
    if (scale === 'regiao') {
      const byRegion = {};
      for (const e of filtered) {
        const st = CITY_TO_STATE[e.city] || 'SP';
        const reg = Object.entries(REGION_MAP).find(([, states]) => states.includes(st))?.[0] || 'Sudeste';
        if (!byRegion[reg]) byRegion[reg] = { name: reg, label: reg, count: 0, cities: new Set() };
        byRegion[reg].count++;
        byRegion[reg].cities.add(e.city);
      }
      const regionCenter = { 'Norte': { x: 35, y: 18 }, 'Nordeste': { x: 65, y: 28 }, 'Centro-Oeste': { x: 42, y: 46 }, 'Sudeste': { x: 55, y: 55 }, 'Sul': { x: 45, y: 74 } };
      return Object.values(byRegion).map((r) => ({
        ...r, ...regionCenter[r.name],
        cities: [...r.cities],
      }));
    }
    const byCity = {};
    for (const e of filtered) {
      if (!byCity[e.city]) {
        const st = CITY_TO_STATE[e.city] || 'SP';
        const pos = STATE_POSITIONS[st] || { x: 50, y: 50 };
        const offset = Object.keys(byCity).filter((c) => (CITY_TO_STATE[c] || 'SP') === st).length;
        byCity[e.city] = {
          name: e.city, label: e.city, count: 0,
          x: pos.x + (offset % 3 - 1) * 6,
          y: pos.y + (Math.floor(offset / 3) - 0.5) * 6,
          cities: [e.city],
        };
      }
      byCity[e.city].count++;
    }
    return Object.values(byCity);
  }, [filtered, scale]);

  const maxCount = useMemo(() => Math.max(...bubbles.map((b) => b.count), 1), [bubbles]);
  const totalEvents = filtered.length;

  function handleClick(bubble) {
    const city = bubble.cities?.[0] || bubble.label;
    onNavigateToCity?.(city);
  }

  if (loading) return <div className="content-wrapper px-4 pt-6 pb-28"><SkeletonCard /><div className="mt-4"><SkeletonCard /></div></div>;

  return (
    <div className="content-wrapper px-4 pt-6 pb-28">
      <header className="mb-6">
        <h1 className="font-display text-3xl text-[var(--c-purple)]">Mapa de calor cultural</h1>
        <p className="text-sm text-[var(--c-ink)]/60 mt-1">Densidade de eventos por região — clique para navegar</p>
      </header>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={scale} onChange={(e) => setScale(e.target.value)} className="input-field text-sm py-2.5" style={{ width: 'auto', minWidth: '140px' }} aria-label="Escala do mapa">
          <option value="estado">Por estado</option>
          <option value="regiao">Por região</option>
          <option value="cidade">Por cidade</option>
        </select>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input-field text-sm py-2.5" style={{ width: 'auto', minWidth: '150px' }} aria-label="Filtrar por categoria">
          <option value="">Todas categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <div className="flex items-center gap-2 ml-auto text-xs font-bold text-[var(--c-purple)] bg-[var(--c-purple-light)] px-3 py-2 rounded-xl borda">
          {totalEvents} eventos · {bubbles.length} {scale === 'estado' ? 'estados' : scale === 'regiao' ? 'regiões' : 'cidades'}
        </div>
      </div>

      <div className="rounded-2xl borda overflow-hidden mb-6" style={{ background: '#FAF7F2', position: 'relative' }}>
        <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }} aria-hidden="true">
          <path d="M120 55 Q145 35 185 40 Q225 30 265 45 Q305 50 325 78 Q345 100 355 145 Q365 185 342 225 Q355 265 342 305 Q332 338 312 358 Q292 378 262 388 Q242 408 222 428 Q202 448 182 458 Q162 448 142 428 Q122 408 102 388 Q82 358 72 328 Q62 288 72 248 Q67 208 82 168 Q92 128 102 98 Q112 75 120 55Z"
            fill="#E8E3DA" stroke="#D0CABE" strokeWidth="1.5" />
          <path d="M132 65 Q155 50 185 52 Q215 44 245 52 Q275 55 295 72 Q315 88 325 118 Q335 150 330 185 Q340 220 330 258 Q335 290 325 318 Q315 342 295 358 Q278 372 258 382 Q242 395 225 405 Q208 418 192 425 Q178 418 162 405 Q148 392 132 378 Q115 358 108 338 Q98 308 96 278 Q92 248 98 218 Q95 188 102 158 Q108 128 118 102 Q125 82 132 65Z"
            fill="#F0ECE4" stroke="#D5D0C8" strokeWidth="1" />
        </svg>

        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <AnimatePresence mode="wait">
            {bubbles.filter((b) => b.count > 0).map((b) => {
              const size = getSize(b.count, maxCount);
              const color = getColor(b.count, maxCount);
              const fontSize = size > 50 ? 18 : size > 35 ? 14 : 11;
              const labelSize = size > 38 ? 9 : 7;
              return (
                <motion.button
                  key={b.name}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={() => handleClick(b)}
                  onMouseEnter={() => setTooltip(b)}
                  onMouseLeave={() => setTooltip(null)}
                  aria-label={`${b.label}: ${b.count} eventos. Clique para ver.`}
                  className="focus-ring"
                  style={{
                    position: 'absolute',
                    left: `${b.x}%`, top: `${b.y}%`,
                    width: size, height: size,
                    marginLeft: -size / 2, marginTop: -size / 2,
                    borderRadius: '50%',
                    background: color,
                    border: '2.5px solid #221833',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
                    zIndex: Math.round((b.count / maxCount) * 10),
                  }}
                >
                  <span style={{ fontFamily: "'Anton','Arial Black',sans-serif", fontSize, color: '#221833', lineHeight: 1 }}>{b.count}</span>
                  <span style={{ fontSize: labelSize, fontWeight: 700, color: '#221833', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1, marginTop: 1 }}>{b.name.length > 6 ? b.name.slice(0, 5) + '…' : b.name}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {tooltip && (
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            background: '#221833', color: 'white', padding: '8px 16px',
            borderRadius: 12, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
            zIndex: 50, pointerEvents: 'none',
          }}>
            {tooltip.label}: {tooltip.count} evento(s) cultural(is)
            {tooltip.cities && tooltip.cities.length > 1 && (
              <span style={{ fontWeight: 400, opacity: 0.7 }}> · {tooltip.cities.slice(0, 3).join(', ')}{tooltip.cities.length > 3 ? '…' : ''}</span>
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <p className="text-xs font-bold text-[var(--c-ink)]/70 mb-2">Legenda de intensidade</p>
        <div className="flex items-center gap-0 rounded-xl borda overflow-hidden">
          {COLORS.map((c, i) => <div key={i} className="flex-1 h-6" style={{ background: c }} />)}
        </div>
        <div className="flex justify-between text-[10px] text-[var(--c-ink)]/50 mt-1.5">
          <span>Menos eventos</span>
          <span>Mais eventos</span>
        </div>
      </div>

      <div className="card">
        <p className="text-xs text-[var(--c-ink)]/50 leading-relaxed">
          Círculos maiores e mais escuros indicam maior concentração de eventos culturais. Regiões sem círculos ou com círculos pequenos e claros são potenciais "desertos culturais" que precisam de mais atenção e investimento. Clique em qualquer círculo para ser redirecionado aos eventos daquela região.
        </p>
      </div>
    </div>
  );
}
