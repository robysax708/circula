// src/components/BotWidget.jsx
import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export function BotWidget() {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      api.getBotConversation().then((r) => {
        setMessages(r.items.length > 0 ? r.items : [{ role: 'bot', content: 'Oi! Sou o assistente do Circula. Pergunte sobre uma cidade ou diga "meus favoritos".' }]);
      }).catch(() => {});
    }
  }, [open, messages.length]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((p) => [...p, { role: 'user', content: text }]);
    setSending(true);
    try { const { reply } = await api.sendBotMessage(text); setMessages((p) => [...p, { role: 'bot', content: reply }]); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setSending(false); }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Abrir assistente do Circula"
        className={`fixed bottom-20 right-4 z-40 rounded-full bg-[var(--c-purple)] text-[var(--c-paper)] p-3.5 shadow-[3px_3px_0_0_var(--c-ink)] focus-ring ${open ? 'hidden' : ''}`}>
        <MessageCircle size={22} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm h-[70vh] sm:h-[32rem] rounded-t-2xl sm:rounded-2xl border-2 border-[var(--c-ink)] bg-[var(--c-paper)] flex flex-col overflow-hidden" role="dialog" aria-label="Chat do assistente Circula">
            <div className="flex items-center justify-between border-b-2 border-[var(--c-ink)] px-4 py-3 bg-[var(--c-purple)] text-[var(--c-paper)]">
              <h2 className="font-display font-semibold">Assistente Circula</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="focus-ring"><X size={20} /></button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[85%] whitespace-pre-line rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'self-end bg-[var(--c-yellow)] text-[var(--c-ink)]' : 'self-start bg-white border-2 border-[var(--c-ink)]'}`}>{m.content}</div>
              ))}
              {sending && <p className="text-xs text-[var(--c-ink)]/50 self-start">digitando...</p>}
            </div>
            <form onSubmit={handleSend} className="flex items-center gap-2 border-t-2 border-[var(--c-ink)] p-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pergunte sobre eventos..." maxLength={500} className="flex-1 input-field" aria-label="Mensagem para o assistente" />
              <button type="submit" disabled={sending} aria-label="Enviar" className="btn-primary p-2.5 focus-ring"><Send size={18} /></button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
