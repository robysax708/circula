import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import { LogOut, Save, Lock, Shield, Heart, Edit3, Camera, Calendar, Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const A11Y_OPTIONS = [
  { value: '', label: 'Nenhuma necessidade especial' },
  { value: 'visual', label: 'Deficiência visual' },
  { value: 'auditiva', label: 'Deficiência auditiva' },
  { value: 'motora', label: 'Deficiência motora' },
  { value: 'autismo', label: 'Transtorno do Espectro Autista (TEA)' },
  { value: 'dislexia', label: 'Dislexia' },
];

export function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState(user?.username || '');
  const [city, setCity] = useState(user?.city || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(user?.accessibility_needs || '');
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [changingPw, setChangingPw] = useState(false);
  const [producerEvents, setProducerEvents] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef(null);
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

  useEffect(() => {
    if (user?.role === 'producer') {
      api.getProducerEvents(user.id).then((r) => setProducerEvents(r.items)).catch(() => {});
    }
  }, [user]);

  async function handleAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      await api.uploadAvatar(file);
      await refreshUser();
      showToast('Foto atualizada!', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setUploadingAvatar(false); }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {};
      if (username !== (user?.username || '')) data.username = username;
      if (city !== (user?.city || '')) data.city = city;
      if (bio !== (user?.bio || '')) data.bio = bio;
      if (accessibilityNeeds !== (user?.accessibility_needs || '')) data.accessibilityNeeds = accessibilityNeeds;
      if (Object.keys(data).length === 0) { showToast('Nenhuma alteração', 'info'); setSaving(false); return; }
      await api.updateProfile(data);
      await refreshUser();
      showToast('Perfil atualizado', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleChangePw(e) {
    e.preventDefault();
    setChangingPw(true);
    try {
      await api.changePassword(pwForm);
      showToast('Senha alterada', 'success');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) { showToast(err.message, 'error'); }
    finally { setChangingPw(false); }
  }

  const avatarSrc = user?.avatar_url ? `${apiBase}/uploads/${user.avatar_url}` : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto px-4 pt-6 pb-28">
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-14 h-14 rounded-full border-2 border-[var(--c-purple)] object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full border-2 border-[var(--c-purple)] bg-[var(--c-purple-light)] flex items-center justify-center text-[var(--c-purple)] font-bold text-xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--c-purple)] text-white flex items-center justify-center focus-ring" aria-label="Trocar foto">
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-[var(--c-purple)]">{user?.name}</h1>
            {user?.username && <p className="text-xs text-[var(--c-ink)]/50">@{user.username}</p>}
            <p className="text-[10px] text-[var(--c-ink)]/40">{user?.email}</p>
          </div>
        </div>
        <button type="button" onClick={logout} className="text-xs font-semibold text-[var(--c-pink)] flex items-center gap-1 focus-ring">
          <LogOut size={14} /> Sair
        </button>
      </header>

      {user?.bio && (
        <p className="text-sm text-[var(--c-ink)]/70 mb-4 italic">"{user.bio}"</p>
      )}

      <div className="card mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-[var(--c-purple)]" />
          <p className="text-xs text-[var(--c-ink)]/60">Dados do cadastro (não editáveis)</p>
        </div>
        <div className="text-sm flex flex-col gap-1">
          <p><span className="font-semibold">Tipo:</span> {user?.role === 'producer' ? '🎪 Produtor de eventos' : '👤 Participante'}</p>
          {user?.role === 'producer' && (
            <>
              {user.cnpj && <p><span className="font-semibold">CNPJ:</span> {user.cnpj}</p>}
              {user.org_name && <p><span className="font-semibold">Organização:</span> {user.org_name}</p>}
              {user.org_description && <p className="text-xs text-[var(--c-ink)]/60 mt-1">{user.org_description}</p>}
            </>
          )}
        </div>
      </div>

      {user?.role === 'producer' && (
        <div className="card mb-5">
          <h2 className="font-semibold text-sm text-[var(--c-purple)] mb-3 flex items-center gap-2">
            <Calendar size={16} /> Histórico de eventos publicados ({producerEvents.length})
          </h2>
          {producerEvents.length === 0 ? (
            <p className="text-xs text-[var(--c-ink)]/50">Nenhum evento publicado ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {producerEvents.map((e) => {
                const d = new Date(e.date_start);
                const isPast = d < new Date();
                return (
                  <div key={e.id} className={`flex items-center justify-between text-sm rounded-lg border px-3 py-2 ${isPast ? 'bg-[var(--c-paper-2)] border-[var(--c-ink)]/10' : 'border-[var(--c-purple)]/30'}`}>
                    <div className="flex-1">
                      <p className="font-medium text-xs">{e.title}</p>
                      <p className="text-[10px] text-[var(--c-ink)]/50 flex items-center gap-1">
                        <MapPin size={10} /> {e.city} · {d.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      {e.avg_rating > 0 && <span className="flex items-center gap-0.5 text-[var(--c-yellow)]"><Star size={10} fill="currentColor" /> {e.avg_rating}</span>}
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${isPast ? 'bg-[var(--c-ink)]/10 text-[var(--c-ink)]/50' : 'bg-[var(--c-green)] text-white'}`}>
                        {isPast ? 'Realizado' : 'Próximo'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="card mb-5 flex flex-col gap-3">
        <h2 className="font-semibold text-sm flex items-center gap-2"><Edit3 size={16} className="text-[var(--c-purple)]" /> Editar perfil</h2>
        <label className="flex flex-col gap-1 text-sm">
          Nome de usuário
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" placeholder="seu_username" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Cidade
          <input value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Biografia
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-field min-h-16" placeholder="Conte sobre você, seus interesses culturais..." maxLength={500} />
          <span className="text-[10px] text-[var(--c-ink)]/50">{bio.length}/500</span>
        </label>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium"><Heart size={16} className="text-[var(--c-pink)]" /> Acessibilidade</div>
          <select value={accessibilityNeeds} onChange={(e) => setAccessibilityNeeds(e.target.value)} className="input-field">
            {A11Y_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="text-[10px] text-[var(--c-ink)]/50">A interface se adapta automaticamente à sua necessidade.</span>
        </div>
        <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-2 focus-ring">
          <Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      <form onSubmit={handleChangePw} className="card flex flex-col gap-3">
        <h2 className="font-semibold text-sm flex items-center gap-2"><Lock size={16} className="text-[var(--c-purple)]" /> Alterar senha</h2>
        <input type="password" required placeholder="Senha atual" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} className="input-field" autoComplete="current-password" />
        <input type="password" required placeholder="Nova senha" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} className="input-field" autoComplete="new-password" />
        <span className="text-[10px] text-[var(--c-ink)]/50">Mínimo 8 caracteres, com maiúscula, minúscula e número</span>
        <button type="submit" disabled={changingPw} className="btn-secondary flex items-center justify-center gap-2 focus-ring">
          <Lock size={14} /> {changingPw ? 'Alterando...' : 'Alterar senha'}
        </button>
      </form>
    </motion.div>
  );
}
