import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Star, Users, Volume2, BarChart3, Award } from 'lucide-react';
import { Logo } from '../components/Shared.jsx';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const FEATURES = [
  { icon: MapPin, title: 'Eventos perto de você', desc: 'Descubra atividades culturais na sua região, de grandes centros ao interior.', cor: 'var(--c-purple)' },
  { icon: Star, title: 'Favoritos inteligentes', desc: 'Marque eventos e receba alertas quando estiverem chegando.', cor: 'var(--c-yellow)' },
  { icon: Users, title: 'Avalie e compartilhe', desc: 'Diga o que achou dos eventos que participou e ajude outros a decidir.', cor: 'var(--c-pink)' },
  { icon: Volume2, title: 'Acessibilidade total', desc: 'Leitura por voz, VLibras, suporte a dislexia e TEA, fontes ajustáveis.', cor: 'var(--c-green)' },
  { icon: BarChart3, title: 'Dados transparentes', desc: 'Saiba de onde vêm as informações com nosso painel de fontes abertas.', cor: 'var(--c-purple-dark)' },
  { icon: Award, title: 'Bolsas e editais', desc: 'Acesse Bolsa Atleta, Lei Aldir Blanc e ProAC em um só lugar.', cor: 'var(--c-purple)' },
];

export function LandingPage({ onEnter }) {
  return (
    <div className="min-h-screen bg-[var(--c-paper)] overflow-x-hidden">
      <header className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[var(--c-purple)]">
          <Logo className="w-10 h-10" />
          <span className="font-display text-2xl">Circula</span>
        </div>
        <button onClick={onEnter} className="btn-secondary text-sm focus-ring flex items-center gap-1">
          Entrar <ArrowRight size={16} />
        </button>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-12 pb-20 text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.5 }} className="mb-6">
          <img src="/logo-circula.webp" alt="Circula" className="w-40 h-40 mx-auto object-contain drop-shadow-lg" />
        </motion.div>
        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.6 }}
          className="font-display text-5xl sm:text-7xl text-[var(--c-purple)] leading-none mb-6">
          A cultura do Brasil inteiro, circulando até você
        </motion.h1>
        <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg sm:text-xl text-[var(--c-ink)]/70 max-w-2xl mx-auto mb-10">
          Uma plataforma sociocultural que conecta pessoas a eventos, editais e oportunidades — do interior aos grandes centros.
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onEnter} className="btn-primary text-lg px-10 py-4 focus-ring font-display">
            Começar agora
          </button>
        </motion.div>
      </section>

      <section className="py-20" style={{ background: 'var(--c-purple)', borderTop: '3px solid var(--c-ink)', borderBottom: '3px solid var(--c-ink)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl text-center text-white mb-12">
            O que o Circula oferece
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-5 flex flex-col gap-2" style={{ background: 'var(--c-paper)', border: '3px solid var(--c-ink)' }}>
                <f.icon size={32} style={{ color: f.cor }} />
                <h3 className="font-bold text-lg">{f.title}</h3>
                <p className="text-sm text-[var(--c-ink)]/70">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="text-sm text-[var(--c-ink)]/50">Projeto desenvolvido para o Desafio de Dados da Vivo — 2026</p>
        <p className="text-xs text-[var(--c-ink)]/40 mt-1">Circulação cultural além dos grandes centros</p>
      </section>
    </div>
  );
}
