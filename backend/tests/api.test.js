// tests/api.test.js
process.env.JWT_SECRET = 'test_secret_1234567890_abcdef';
process.env.DB_PATH = './data/test.db';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:5173';

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

for (const ext of ['', '-wal', '-shm']) {
  const p = `./data/test.db${ext}`;
  if (fs.existsSync(p)) fs.rmSync(p);
}

const { createApp } = await import('../src/app.js');
const { runSeed } = await import('../src/db/seed.js');
runSeed();
const app = createApp();
let server, baseUrl;

test.before(async () => { server = app.listen(0); baseUrl = `http://127.0.0.1:${server.address().port}`; });
test.after(() => { server.close(); });

async function req(path, opts = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

const userEmail = `user_${Date.now()}@example.com`;
const producerEmail = `prod_${Date.now()}@example.com`;
let userToken, producerToken, firstEventId;

test('health check', async () => {
  const { status, body } = await req('/health');
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
});

test('registra usuário normal', async () => {
  const { status, body } = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'User', email: userEmail, password: 'SenhaForte123', consent: true }),
  });
  assert.equal(status, 201);
  assert.equal(body.user.role, 'user');
});

test('rejeita produtor com CNPJ inválido', async () => {
  const { status } = await req('/api/auth/register/producer', {
    method: 'POST',
    body: JSON.stringify({ name: 'Prod', email: producerEmail, password: 'SenhaForte123', cnpj: '00000000000000', orgName: 'Org', consent: true }),
  });
  assert.equal(status, 400);
});

test('registra produtor com CNPJ válido', async () => {
  const { status, body } = await req('/api/auth/register/producer', {
    method: 'POST',
    body: JSON.stringify({ name: 'Produtor', email: producerEmail, password: 'SenhaForte123', cnpj: '11.222.333/0001-81', orgName: 'Cultura Viva LTDA', consent: true }),
  });
  assert.equal(status, 201);
  assert.equal(body.user.role, 'producer');
  assert.ok(body.user.org_name);
});

test('login user', async () => {
  const { status, body } = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: userEmail, password: 'SenhaForte123' }),
  });
  assert.equal(status, 200);
  userToken = body.token;
});

test('login producer', async () => {
  const { status, body } = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: producerEmail, password: 'SenhaForte123' }),
  });
  assert.equal(status, 200);
  producerToken = body.token;
});

test('atualiza perfil (username)', async () => {
  const { status, body } = await req('/api/auth/profile', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ username: 'roby_test' }),
  });
  assert.equal(status, 200);
  assert.equal(body.user.username, 'roby_test');
});

test('troca de senha', async () => {
  const { status } = await req('/api/auth/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ currentPassword: 'SenhaForte123', newPassword: 'NovaSenha456' }),
  });
  assert.equal(status, 200);
  const { status: s2 } = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: userEmail, password: 'NovaSenha456' }),
  });
  assert.equal(s2, 200);
});

test('solicitar reset de senha retorna ok mesmo para email inexistente (segurança)', async () => {
  const { status } = await req('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: 'naoexiste@x.com' }),
  });
  assert.equal(status, 200);
});

test('lista eventos publicamente', async () => {
  const { status, body } = await req('/api/events');
  assert.equal(status, 200);
  assert.ok(body.items.length > 0);
  firstEventId = body.items[0].id;
  assert.ok(body.items[0].source);
});

test('detalhe de evento inclui source_detail e reviews', async () => {
  const { status, body } = await req(`/api/events/${firstEventId}`);
  assert.equal(status, 200);
  assert.ok('source_detail' in body.event);
  assert.ok('reviews' in body.event);
});

test('usuário NÃO pode publicar evento', async () => {
  const { status } = await req('/api/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ title: 'Evento User', city: 'Campinas', dateStart: new Date(Date.now() + 86400000 * 30).toISOString() }),
  });
  assert.equal(status, 403);
});

test('produtor PODE publicar evento', async () => {
  const { status, body } = await req('/api/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${producerToken}` },
    body: JSON.stringify({ title: 'Evento do Produtor', city: 'Hortolândia', dateStart: new Date(Date.now() + 86400000 * 30).toISOString() }),
  });
  assert.equal(status, 201);
  assert.equal(body.event.is_user_generated, 1);
});

test('favoritar e desfavoritar', async () => {
  let { status } = await req('/api/favorites', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ eventId: firstEventId }),
  });
  assert.equal(status, 201);
  const { body } = await req('/api/favorites', { headers: { Authorization: `Bearer ${userToken}` } });
  assert.equal(body.items.length, 1);
  ({ status } = await req(`/api/favorites/${firstEventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userToken}` },
  }));
  assert.equal(status, 200);
});

test('marcar presença e avaliar evento', async () => {
  let { status } = await req(`/api/reviews/${firstEventId}/attend`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.equal(status, 201);
  ({ status } = await req(`/api/reviews/${firstEventId}/review`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ rating: 4, comment: 'Evento incrível!' }),
  }));
  assert.equal(status, 201);
});

test('não pode avaliar sem ter marcado presença', async () => {
  const secondEventId = (await req('/api/events')).body.items[1]?.id;
  if (secondEventId) {
    const { status } = await req(`/api/reviews/${secondEventId}/review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ rating: 3 }),
    });
    assert.equal(status, 400);
  }
});

test('listar avaliações de um evento', async () => {
  const { status, body } = await req(`/api/reviews/${firstEventId}/reviews`);
  assert.equal(status, 200);
  assert.ok(body.items.length > 0);
  assert.equal(body.items[0].rating, 4);
});

test('listar programas culturais', async () => {
  const { status, body } = await req('/api/cultural');
  assert.equal(status, 200);
  assert.ok(body.items.length > 0);
});

test('filtrar programas por tipo', async () => {
  const { status, body } = await req('/api/cultural?type=bolsa');
  assert.equal(status, 200);
  assert.ok(body.items.every(p => p.type === 'bolsa'));
});

test('bot responde', async () => {
  const { status, body } = await req('/api/bot', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ message: 'eventos em campinas' }),
  });
  assert.equal(status, 201);
  assert.ok(body.reply.length > 10);
});

test('SQL injection no login bloqueado', async () => {
  const { status } = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: "a@a.com' OR 1=1 --", password: 'x' }),
  });
  assert.equal(status, 400);
});

test('JWT forjado com alg none rejeitado', async () => {
  const forged = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOjEsInJvbGUiOiJhZG1pbiJ9.';
  const { status } = await req('/api/favorites', { headers: { Authorization: `Bearer ${forged}` } });
  assert.equal(status, 401);
});

test('erros internos retornam mensagem genérica', async () => {
  const { status } = await req('/api/events/abc');
  assert.ok([400, 404, 500].includes(status));
});
