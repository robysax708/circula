// src/pages/AuthScreen.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Logo } from '../components/Shared.jsx';
import { api } from '../services/api.js';
import { ArrowLeft } from 'lucide-react';

export function AuthScreen() {
  const [view, setView] = useState('login');
  const [registerType, setRegisterType] = useState('user');
  const { login, register, registerProducer } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', consent: false, cnpj: '', orgName: '', orgPhone: '', orgDescription: '', resetToken: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function u(field, value) { setForm((p) => ({ ...p, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      if (view === 'login') {
        await login(form.email, form.password);
        showToast('Bem-vindo de volta!', 'success');
      } else if (view === 'register') {
        if (registerType === 'producer') {
          await registerProducer(form);
        } else {
          await register(form);
        }
        showToast('Conta criada! Agora faça login.', 'success');
        setView('login');
      } else if (view === 'forgot') {
        await api.forgotPassword({ email: form.email });
        showToast('Se o e-mail existir, as instruções serão enviadas.', 'info');
        setView('login');
      } else if (view === 'reset') {
        await api.resetPassword({ token: form.resetToken, newPassword: form.newPassword });
        showToast('Senha redefinida!', 'success');
        setView('login');
      }
    } catch (err) {
      if (err.details?.fieldErrors) setErrors(err.details.fieldErrors);
      else showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-[var(--c-paper)]">
      <div className="w-full max-w-sm">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 mb-8 text-[var(--c-purple)]">
          <img src="/logo-circula.webp" alt="Circula" className="w-28 h-28 object-contain" />
          <h1 className="font-display text-4xl font-semibold tracking-tight">Circula</h1>
          <p className="text-sm text-[var(--c-ink)]/70 text-center">Cultura em circulação</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {(view === 'login' || view === 'register') && (
              <div className="flex rounded-lg overflow-hidden border-2 border-[var(--c-ink)] mb-6">
                <button type="button" onClick={() => setView('login')} className={`flex-1 py-2 text-sm font-semibold focus-ring ${view === 'login' ? 'bg-[var(--c-purple)] text-[var(--c-paper)]' : ''}`}>Entrar</button>
                <button type="button" onClick={() => setView('register')} className={`flex-1 py-2 text-sm font-semibold focus-ring ${view === 'register' ? 'bg-[var(--c-purple)] text-[var(--c-paper)]' : ''}`}>Criar conta</button>
              </div>
            )}

            {view === 'register' && (
              <div className="flex rounded-lg overflow-hidden border-2 border-[var(--c-ink)] mb-4">
                <button type="button" onClick={() => setRegisterType('user')} className={`flex-1 py-2 text-xs font-semibold focus-ring ${registerType === 'user' ? 'bg-[var(--c-pink)] text-[var(--c-paper)]' : ''}`}>Participante</button>
                <button type="button" onClick={() => setRegisterType('producer')} className={`flex-1 py-2 text-xs font-semibold focus-ring ${registerType === 'producer' ? 'bg-[var(--c-pink)] text-[var(--c-paper)]' : ''}`}>Produtor de eventos</button>
              </div>
            )}

            {(view === 'forgot' || view === 'reset') && (
              <button type="button" onClick={() => setView('login')} className="flex items-center gap-1 text-sm mb-4 text-[var(--c-purple)] font-semibold focus-ring">
                <ArrowLeft size={16} /> Voltar ao login
              </button>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
              {view === 'register' && (
                <Field label="Nome completo" error={errors.name?.[0]}>
                  <input required value={form.name} onChange={(e) => u('name', e.target.value)} className="input-field" autoComplete="name" />
                </Field>
              )}

              {(view === 'login' || view === 'register' || view === 'forgot') && (
                <Field label="E-mail" error={errors.email?.[0]}>
                  <input type="email" required value={form.email} onChange={(e) => u('email', e.target.value)} className="input-field" autoComplete="email" />
                </Field>
              )}

              {view === 'register' && (
                <Field label="Cidade">
                  <input value={form.city} onChange={(e) => u('city', e.target.value)} className="input-field" autoComplete="address-level2" />
                </Field>
              )}

              {view === 'register' && registerType === 'producer' && (
                <>
                  <Field label="CNPJ" error={errors.cnpj?.[0]}>
                    <input required value={form.cnpj} onChange={(e) => u('cnpj', e.target.value)} className="input-field" placeholder="00.000.000/0000-00" />
                  </Field>
                  <Field label="Nome da organização" error={errors.orgName?.[0]}>
                    <input required value={form.orgName} onChange={(e) => u('orgName', e.target.value)} className="input-field" />
                  </Field>
                  <Field label="Telefone da organização">
                    <input value={form.orgPhone} onChange={(e) => u('orgPhone', e.target.value)} className="input-field" type="tel" />
                  </Field>
                  <Field label="Descrição (opcional)">
                    <textarea value={form.orgDescription} onChange={(e) => u('orgDescription', e.target.value)} className="input-field min-h-16" maxLength={500} />
                  </Field>
                </>
              )}

              {(view === 'login' || view === 'register') && (
                <Field label="Senha" error={errors.password?.[0]} hint={view === 'register' ? 'Mínimo 8 caracteres, com maiúscula, minúscula e número' : undefined}>
                  <input type="password" required value={form.password} onChange={(e) => u('password', e.target.value)} className="input-field" autoComplete={view === 'login' ? 'current-password' : 'new-password'} />
                </Field>
              )}

              {view === 'register' && (
                <label className="flex items-start gap-2 text-xs text-[var(--c-ink)]/80">
                  <input type="checkbox" checked={form.consent} onChange={(e) => u('consent', e.target.checked)} className="mt-0.5" />
                  Aceito que meus dados sejam usados conforme a política de privacidade para recomendar eventos culturais.
                </label>
              )}

              {view === 'register' && (
                <Field label="Necessidade de acessibilidade (opcional)">
                  <select value={form.accessibilityNeeds || ''} onChange={(e) => u('accessibilityNeeds', e.target.value)} className="input-field">
                    <option value="">Nenhuma</option>
                    <option value="visual">Deficiência visual</option>
                    <option value="auditiva">Deficiência auditiva</option>
                    <option value="motora">Deficiência motora</option>
                    <option value="autismo">Transtorno do Espectro Autista (TEA)</option>
                    <option value="dislexia">Dislexia</option>
                  </select>
                </Field>
              )}

              {view === 'reset' && (
                <>
                  <Field label="Token de recuperação">
                    <input required value={form.resetToken} onChange={(e) => u('resetToken', e.target.value)} className="input-field" />
                  </Field>
                  <Field label="Nova senha" error={errors.newPassword?.[0]}>
                    <input type="password" required value={form.newPassword} onChange={(e) => u('newPassword', e.target.value)} className="input-field" autoComplete="new-password" />
                  </Field>
                </>
              )}

              <button type="submit" disabled={submitting} className="mt-2 btn-primary w-full focus-ring">
                {submitting ? 'Enviando...' : view === 'login' ? 'Entrar' : view === 'register' ? 'Criar conta' : view === 'forgot' ? 'Enviar instruções' : 'Redefinir senha'}
              </button>

              {view === 'login' && (
                <div className="flex justify-between text-xs mt-1">
                  <button type="button" onClick={() => setView('forgot')} className="text-[var(--c-purple)] underline focus-ring">Esqueci a senha</button>
                  <button type="button" onClick={() => setView('reset')} className="text-[var(--c-ink)]/50 underline focus-ring">Tenho um token</button>
                </div>
              )}
            </form>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      {children}
      {hint && !error && <span className="text-xs text-[var(--c-ink)]/60">{hint}</span>}
      {error && <span className="text-xs text-[var(--c-pink)]" role="alert">{error}</span>}
    </label>
  );
}
