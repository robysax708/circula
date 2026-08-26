// src/db/seed.js
import db, { withTransaction } from './index.js';

const categories = [
  { name: 'Música', icon: '🎵' },
  { name: 'Teatro', icon: '🎭' },
  { name: 'Artes visuais', icon: '🎨' },
  { name: 'Literatura', icon: '📚' },
  { name: 'Cinema', icon: '🎬' },
  { name: 'Feiras e artesanato', icon: '🧺' },
  { name: 'Dança', icon: '💃' },
  { name: 'Gastronomia', icon: '🍽️' },
];

const culturalPrograms = [
  { title: 'Bolsa Atleta', type: 'bolsa', description: 'Programa federal de apoio financeiro a atletas de alto rendimento.', url: 'https://www.gov.br/esporte/pt-br/acoes-e-programas/bolsa-atleta', source: 'Ministério do Esporte', deadline: null },
  { title: 'Lei Paulo Gustavo', type: 'edital', description: 'Recursos emergenciais para o setor cultural, distribuídos por estados e municípios.', url: 'https://www.gov.br/cultura/pt-br/assuntos/lei-paulo-gustavo', source: 'Ministério da Cultura', deadline: null },
  { title: 'Lei Aldir Blanc', type: 'edital', description: 'Política nacional de fomento à cultura com repasses a estados, municípios e DF.', url: 'https://www.gov.br/cultura/pt-br/assuntos/lei-aldir-blanc', source: 'Ministério da Cultura', deadline: null },
  { title: 'Programa Cultura Viva', type: 'programa', description: 'Reconhecimento e apoio a Pontos de Cultura em todo o Brasil.', url: 'https://www.gov.br/cultura/pt-br/acesso-a-informacao/acoes-e-programas/cultura-viva', source: 'Ministério da Cultura', deadline: null },
  { title: 'ProAC (SP)', type: 'edital', description: 'Programa de ação cultural do estado de São Paulo para projetos artísticos.', url: 'https://proac.sp.gov.br', source: 'Governo de São Paulo', deadline: null },
  { title: 'Bolsa Funarte de Criação Artística', type: 'bolsa', description: 'Bolsas individuais para artistas brasileiros em diversas linguagens.', url: 'https://www.gov.br/funarte', source: 'Funarte', deadline: null },
  { title: 'Edital SESC de Artes', type: 'edital', description: 'Seleção de projetos artísticos para circulação nas unidades do SESC.', url: 'https://www.sesc.com.br', source: 'SESC', deadline: null },
];

function daysFromNow(days, hour = 19) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function seedCategories() {
  const insert = db.prepare('INSERT OR IGNORE INTO categories (name, icon) VALUES (?, ?)');
  withTransaction(() => { for (const c of categories) insert.run(c.name, c.icon); });
}

function categoryId(name) {
  return db.prepare('SELECT id FROM categories WHERE name = ?').get(name)?.id || null;
}

function seedPrograms() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM cultural_programs').get().c;
  if (count > 0) return;
  const insert = db.prepare(
    `INSERT INTO cultural_programs (title, type, description, url, source, deadline, created_at)
     VALUES (@title, @type, @description, @url, @source, @deadline, @now)`
  );
  withTransaction(() => {
    for (const p of culturalPrograms) insert.run({ ...p, now: new Date().toISOString() });
  });
}

function seedEvents() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM events').get().c;
  if (count > 0) return;
  const events = [
    { title: 'Sarau de Poesia na Praça', description: 'Encontro aberto de poesia falada com artistas locais.', category_id: categoryId('Literatura'), city: 'Hortolândia', region: 'Campinas e Região', address: 'Praça Central, Hortolândia - SP', lat: -22.8584, lng: -47.2200, date_start: daysFromNow(1, 19), source: 'Prefeitura de Hortolândia', source_detail: 'Agenda Cultural Municipal' },
    { title: 'Feira de Artesanato do Interior', description: 'Exposição e venda de artesanato de produtores regionais.', category_id: categoryId('Feiras e artesanato'), city: 'Sumaré', region: 'Campinas e Região', address: 'Parque Municipal, Sumaré - SP', lat: -22.8208, lng: -47.2669, date_start: daysFromNow(2, 10), source: 'Sec. Cultura de Sumaré', source_detail: 'Edital n° 12/2026' },
    { title: 'Show de MPB Instrumental', description: 'Trio instrumental de MPB no Teatro Municipal.', category_id: categoryId('Música'), city: 'Campinas', region: 'Campinas e Região', address: 'Teatro Carlos Gomes, Campinas - SP', lat: -22.9035, lng: -47.0565, date_start: daysFromNow(3, 20), source: 'Sympla', source_detail: 'sympla.com.br' },
    { title: 'O Interior Também Tem Palco', description: 'Teatro independente sobre identidade regional.', category_id: categoryId('Teatro'), city: 'Hortolândia', region: 'Campinas e Região', address: 'Centro Cultural, Hortolândia - SP', lat: -22.8620, lng: -47.2148, date_start: daysFromNow(5, 20), source: 'Prefeitura de Hortolândia', source_detail: 'Lei Aldir Blanc' },
    { title: 'Cidades Invisíveis: Fotografia', description: 'Mostra sobre cidades pequenas do interior.', category_id: categoryId('Artes visuais'), city: 'Monte Mor', region: 'Campinas e Região', address: 'Biblioteca Municipal, Monte Mor - SP', lat: -22.9467, lng: -47.3147, date_start: daysFromNow(7, 14), source: 'Biblioteca de Monte Mor', source_detail: 'Acervo colaborativo' },
    { title: 'Cinema ao Ar Livre', description: 'Filme nacional com debate. Classificação livre.', category_id: categoryId('Cinema'), city: 'Sumaré', region: 'Campinas e Região', address: 'Praça do Bosque, Sumaré - SP', lat: -22.8215, lng: -47.2585, date_start: daysFromNow(4, 19), source: 'SESC Campinas', source_detail: 'Circuito SESC de Cinema' },
    { title: 'Festival de Dança Urbana', description: 'Competição de dança urbana com grupos da RMC.', category_id: categoryId('Dança'), city: 'Campinas', region: 'Campinas e Região', address: 'Largo do Rosário, Campinas - SP', lat: -22.9064, lng: -47.0616, date_start: daysFromNow(8, 15), source: 'Sec. Cultura de Campinas', source_detail: 'Cultura na Praça' },
    { title: 'Mostra Gastronômica Regional', description: 'Pratos típicos do interior paulista.', category_id: categoryId('Gastronomia'), city: 'Valinhos', region: 'Campinas e Região', address: 'Parque Avelino Viaro, Valinhos - SP', lat: -22.9706, lng: -46.9955, date_start: daysFromNow(10, 11), source: 'Prefeitura de Valinhos', source_detail: 'Festa do Figo 2026' },
    { title: 'Virada Cultural SP', description: 'Festival de 24h com shows, teatro e arte.', category_id: categoryId('Música'), city: 'São Paulo', region: 'Grande São Paulo', address: 'Vale do Anhangabaú, SP', lat: -23.5475, lng: -46.6361, date_start: daysFromNow(12, 18), source: 'Prefeitura de São Paulo', source_detail: 'Virada Cultural 2026' },
    { title: 'Bienal de Arte de São Paulo', description: 'Exposição internacional de arte contemporânea.', category_id: categoryId('Artes visuais'), city: 'São Paulo', region: 'Grande São Paulo', address: 'Ibirapuera, São Paulo - SP', lat: -23.5874, lng: -46.6576, date_start: daysFromNow(20, 10), source: 'Fundação Bienal', source_detail: 'bienal.org.br' },
    { title: 'Festival de Teatro de Curitiba', description: 'Maior festival de teatro do país.', category_id: categoryId('Teatro'), city: 'Curitiba', region: 'Paraná', address: 'Teatro Guaíra, Curitiba - PR', lat: -25.4284, lng: -49.2733, date_start: daysFromNow(14, 20), source: 'Festival de Curitiba', source_detail: 'festivaldecuritiba.com.br' },
    { title: 'Carnaval de Olinda', description: 'Frevo e maracatu pelas ladeiras históricas.', category_id: categoryId('Música'), city: 'Olinda', region: 'Pernambuco', address: 'Alto da Sé, Olinda - PE', lat: -8.0089, lng: -34.8553, date_start: daysFromNow(15, 10), source: 'Prefeitura de Olinda', source_detail: 'Agenda Cultural PE' },
    { title: 'Festival de Cinema de Gramado', description: 'Filmes brasileiros e latino-americanos.', category_id: categoryId('Cinema'), city: 'Gramado', region: 'Rio Grande do Sul', address: 'Palácio dos Festivais, Gramado - RS', lat: -29.3773, lng: -50.8764, date_start: daysFromNow(18, 19), source: 'Festival de Gramado', source_detail: 'festivaldegramado.net' },
    { title: 'FLIP - Feira Literária de Paraty', description: 'Maior festa literária do Brasil.', category_id: categoryId('Literatura'), city: 'Paraty', region: 'Rio de Janeiro', address: 'Centro Histórico, Paraty - RJ', lat: -23.2178, lng: -44.7131, date_start: daysFromNow(22, 14), source: 'FLIP', source_detail: 'flip.org.br' },
    { title: 'Festival de Parintins', description: 'Disputa dos bois Garantido e Caprichoso.', category_id: categoryId('Dança'), city: 'Parintins', region: 'Amazonas', address: 'Bumbódromo, Parintins - AM', lat: -2.6284, lng: -56.7353, date_start: daysFromNow(25, 20), source: 'Prefeitura de Parintins', source_detail: 'Festival de Parintins' },
    { title: 'Pelourinho ao Vivo', description: 'Música e cultura afro-brasileira no centro histórico.', category_id: categoryId('Música'), city: 'Salvador', region: 'Bahia', address: 'Pelourinho, Salvador - BA', lat: -12.9737, lng: -38.5103, date_start: daysFromNow(6, 20), source: 'Prefeitura de Salvador', source_detail: 'Agenda Salvador' },
    { title: 'Feira de Artesanato de BH', description: 'Artesanato mineiro na Praça da Liberdade.', category_id: categoryId('Feiras e artesanato'), city: 'Belo Horizonte', region: 'Minas Gerais', address: 'Praça da Liberdade, BH - MG', lat: -19.9319, lng: -43.9386, date_start: daysFromNow(9, 9), source: 'Prefeitura de BH', source_detail: 'Feira de Artesanato' },
  ];
  const insert = db.prepare(
    `INSERT INTO events (title, description, category_id, city, region, address, lat, lng, date_start, source, source_detail, is_user_generated, created_at, updated_at)
     VALUES (@title, @description, @category_id, @city, @region, @address, @lat, @lng, @date_start, @source, @source_detail, 0, @now, @now)`
  );
  withTransaction(() => {
    for (const e of events) insert.run({ ...e, now: new Date().toISOString() });
  });
}

export function runSeed() {
  seedCategories();
  seedEvents();
  seedPrograms();
}
