import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AccessibilityProvider } from './components/AccessibilityProvider.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { AuthScreen } from './pages/AuthScreen.jsx';
import { DiscoverPage } from './pages/DiscoverPage.jsx';
import { FavoritesPage } from './pages/FavoritesPage.jsx';
import { FomentoPage } from './pages/FomentoPage.jsx';
import { PainelPage } from './pages/PainelPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { EventDetail } from './pages/EventDetail.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { SuggestionsPage } from './pages/SuggestionsPage.jsx';
import { HeatmapPage } from './pages/HeatmapPage.jsx';
import { BottomNav, LoadingScreen, Logo, PageTransition } from './components/Shared.jsx';
import { BotWidget } from './components/BotWidget.jsx';
import { VoiceReader } from './components/VoiceReader.jsx';
import { MessageSquare, Info, Map } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle.jsx';

function Shell() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('landing');
  const [tab, setTab] = useState('descobrir');
  const [detailId, setDetailId] = useState(null);
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    if (!document.getElementById('vlibras-script')) {
      const s = document.createElement('script');
      s.id = 'vlibras-script';
      s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      s.onload = () => { try { if (window.VLibras) new window.VLibras.Widget('https://vlibras.gov.br/app'); } catch {} };
      document.head.appendChild(s);
      const div = document.createElement('div');
      div.setAttribute('vw', '');
      div.className = 'enabled';
      div.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
      document.body.appendChild(div);
    }
  }, []);

  useEffect(() => {
    if (user && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {}, { enableHighAccuracy: false, timeout: 5000 });
    }
  }, [user]);

  if (loading) return <LoadingScreen />;
  if (!user && screen === 'landing') return <LandingPage onEnter={() => setScreen('auth')} />;
  if (!user) return <AuthScreen />;
  if (detailId) return <EventDetail eventId={detailId} onBack={() => setDetailId(null)} />;

  function openEvent(e) { setDetailId(e.id); }
  function navigateToCity(city) { setCityFilter(city); setTab('descobrir'); }

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-[var(--c-paper)]">
        <header className="flex items-center justify-between content-wrapper px-4 pt-3">
          <div className="flex items-center gap-2 text-[var(--c-purple)]">
            <Logo className="w-7 h-7" />
            <span className="font-display text-xl">Circula</span>
          </div>
          <div className="flex items-center gap-1">
            <HeaderBtn icon={Map} active={tab === 'mapa'} onClick={() => setTab('mapa')} label="Mapa" />
            <HeaderBtn icon={MessageSquare} active={tab === 'sugestoes'} onClick={() => setTab('sugestoes')} label="Sugestões" />
            <HeaderBtn icon={Info} active={tab === 'sobre'} onClick={() => setTab('sobre')} label="Sobre" />
            <ThemeToggle />
            <span className="ml-1 text-xs font-bold px-2 py-1 rounded-full borda bg-[var(--c-yellow)]">
              {user.role === 'producer' ? '🎪 Produtor' : '👤'}
            </span>
          </div>
        </header>

        <main>
          <PageTransition id={tab + cityFilter}>
            {tab === 'descobrir' && <DiscoverPage onOpenEvent={openEvent} initialCity={cityFilter} />}
            {tab === 'favoritos' && <FavoritesPage onOpenEvent={openEvent} />}
            {tab === 'fomento' && <FomentoPage />}
            {tab === 'painel' && <PainelPage />}
            {tab === 'perfil' && <ProfilePage />}
            {tab === 'sobre' && <AboutPage />}
            {tab === 'sugestoes' && <SuggestionsPage />}
            {tab === 'mapa' && <HeatmapPage onOpenEvent={openEvent} onNavigateToCity={navigateToCity} />}
          </PageTransition>
        </main>

        <VoiceReader />
        <BotWidget />
        <BottomNav active={tab} onChange={(t) => { setTab(t); if (t === 'descobrir') setCityFilter(''); }} />
      </div>
    </AccessibilityProvider>
  );
}

function HeaderBtn({ icon: Icon, active, onClick, label }) {
  return (
    <button type="button" onClick={onClick} aria-label={label}
      className={`p-2 rounded-full focus-ring transition-colors ${active ? 'bg-[var(--c-purple-light)]' : ''}`}>
      <Icon size={18} className="text-[var(--c-purple)]" />
    </button>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ToastProvider>
  );
}
