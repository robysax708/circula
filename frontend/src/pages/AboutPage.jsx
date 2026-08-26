// src/pages/AboutPage.jsx
import { motion } from 'framer-motion';
import { Shield, Database, Code, Globe, Lock, Eye, Server, ExternalLink } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export function AboutPage() {
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto px-4 pt-6 pb-28">
      <h1 className="font-display text-2xl font-bold text-[var(--c-purple)] mb-1">Sobre o Circula</h1>
      <p className="text-xs text-[var(--c-ink)]/60 mb-6">Transparência, dados abertos e tecnologia a serviço da cultura</p>

      <Section icon={Eye} title="O que é o Circula" delay={0}>
        <p>O Circula é uma plataforma sociocultural que conecta pessoas a eventos, editais, bolsas e oportunidades culturais de todo o Brasil. Nosso objetivo é fortalecer a circulação cultural entre grandes centros e o interior, usando dados e tecnologia para que ninguém fique de fora.</p>
      </Section>

      <Section icon={Shield} title="Tratamento de dados e LGPD" delay={0.1}>
        <p>Coletamos apenas os dados necessários para o funcionamento da plataforma: nome, e-mail, cidade e preferências de acessibilidade. Todos os dados são armazenados com criptografia (senhas com bcrypt, 12 rounds) e nunca são compartilhados com terceiros sem consentimento.</p>
        <p className="mt-2">O cadastro exige aceite explícito dos termos, em conformidade com a Lei Geral de Proteção de Dados (LGPD). Você pode solicitar a exclusão dos seus dados a qualquer momento.</p>
      </Section>

      <Section icon={Database} title="De onde vêm os dados" delay={0.2}>
        <p>Os eventos e informações culturais do Circula vêm de múltiplas fontes verificadas:</p>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          <li>• Secretarias municipais de cultura (agendas oficiais)</li>
          <li>• Plataformas de eventos (Sympla, Eventbrite)</li>
          <li>• Editais públicos (Lei Aldir Blanc, Lei Paulo Gustavo, ProAC)</li>
          <li>• SESC e instituições culturais</li>
          <li>• Produtores credenciados (com CNPJ verificado)</li>
          <li>• Dados abertos do IBGE (informações demográficas)</li>
        </ul>
        <p className="mt-2">Cada evento exibe sua fonte de dados para total transparência.</p>
      </Section>

      <Section icon={Globe} title="API pública do Circula" delay={0.3}>
        <p>Disponibilizamos uma API pública para que desenvolvedores, pesquisadores e órgãos culturais acessem os dados do Circula de forma programática:</p>
        <div className="mt-2 bg-[var(--c-purple-light)] rounded-lg p-3 text-sm font-mono flex flex-col gap-1">
          <p><span className="font-bold text-[var(--c-purple)]">GET</span> /api/public/events — Listar eventos com filtros</p>
          <p><span className="font-bold text-[var(--c-purple)]">GET</span> /api/public/categories — Categorias culturais</p>
          <p><span className="font-bold text-[var(--c-purple)]">GET</span> /api/public/stats — Estatísticas agregadas</p>
          <p><span className="font-bold text-[var(--c-purple)]">GET</span> /api/public/suggestions — Sugestões da comunidade</p>
          <p><span className="font-bold text-[var(--c-purple)]">GET</span> /api/public/docs — Documentação completa</p>
        </div>
        <a href={`${apiBase}/api/public/docs`} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm text-[var(--c-purple)] underline flex items-center gap-1">
          Acessar documentação da API <ExternalLink size={12} />
        </a>
      </Section>

      <Section icon={Code} title="Tecnologias utilizadas" delay={0.4}>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Tech name="React" desc="Interface de usuário" />
          <Tech name="Tailwind CSS" desc="Estilização" />
          <Tech name="Framer Motion" desc="Animações" />
          <Tech name="Node.js + Express" desc="API backend" />
          <Tech name="SQLite (nativo)" desc="Banco de dados" />
          <Tech name="Zod" desc="Validação de dados" />
          <Tech name="bcrypt" desc="Criptografia de senhas" />
          <Tech name="JWT" desc="Autenticação" />
          <Tech name="Sharp" desc="Processamento de imagens" />
          <Tech name="VLibras" desc="Acessibilidade em Libras" />
          <Tech name="Web Speech API" desc="Leitura por voz" />
          <Tech name="Google Maps" desc="Localização de eventos" />
        </div>
      </Section>

      <Section icon={Lock} title="Segurança" delay={0.5}>
        <ul className="flex flex-col gap-1 text-sm">
          <li>• Senhas com hash bcrypt (12 rounds)</li>
          <li>• Autenticação JWT com expiração</li>
          <li>• Validação e sanitização de 100% das entradas</li>
          <li>• Rate limiting contra ataques de força bruta</li>
          <li>• Proteção contra SQL injection e XSS</li>
          <li>• CNPJ de produtores validado com dígitos verificadores</li>
          <li>• Consentimento LGPD obrigatório no cadastro</li>
        </ul>
      </Section>

      <Section icon={Server} title="Arquitetura" delay={0.6}>
        <p>O Circula usa uma arquitetura de monólito modular, projetada para ser simples de manter e evoluir. O banco SQLite é nativo do Node.js (sem dependências de compilação), e a API é preparada para múltiplas fontes de dados com adaptadores unificados.</p>
        <p className="mt-2">A plataforma é multi-região: eventos, sugestões e dados são organizados por estado, cidade e região, permitindo que cada localidade tenha sua experiência personalizada.</p>
      </Section>

      <div className="mt-8 text-center text-xs text-[var(--c-ink)]/40">
        <p>Circula — Circulação cultural além dos grandes centros</p>
        <p>Desafio de Dados da Vivo — 2026</p>
      </div>
    </motion.div>
  );
}

function Section({ icon: Icon, title, delay, children }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay }} className="card mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={20} className="text-[var(--c-purple)] shrink-0" />
        <h2 className="font-display font-semibold text-[var(--c-purple)]">{title}</h2>
      </div>
      <div className="text-sm text-[var(--c-ink)]/80 leading-relaxed">{children}</div>
    </motion.div>
  );
}

function Tech({ name, desc }) {
  return (
    <div className="rounded-lg bg-[var(--c-purple-light)] px-2 py-1.5">
      <p className="font-semibold text-xs text-[var(--c-purple)]">{name}</p>
      <p className="text-[10px] text-[var(--c-ink)]/60">{desc}</p>
    </div>
  );
}
