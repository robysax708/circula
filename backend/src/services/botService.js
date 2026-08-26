// src/services/botService.js
import db from '../db/index.js';
import { listFavorites } from './favoriteService.js';

function saveMessage(userId, role, content) {
  db.prepare(
    `INSERT INTO bot_messages (user_id, role, content, created_at) VALUES (?, ?, ?, ?)`
  ).run(userId, role, content, new Date().toISOString());
}

function extractCityFromMessage(message, knownCities) {
  const lower = message.toLowerCase();
  return knownCities.find((city) => lower.includes(city.toLowerCase())) || null;
}

function formatEventLine(event) {
  const date = new Date(event.date_start).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
  return `- ${event.title} (${event.city}, ${date})`;
}

export function generateBotReply(user, message) {
  saveMessage(user.id, 'user', message);

  const favorites = listFavorites(user.id);
  const cities = db
    .prepare('SELECT DISTINCT city FROM events WHERE is_active = 1')
    .all()
    .map((r) => r.city);

  const mentionedCity = extractCityFromMessage(message, cities);
  const wantsFavorites = /favorit/i.test(message);

  let reply;

  if (wantsFavorites) {
    if (favorites.length === 0) {
      reply =
        'Você ainda não favoritou nenhum evento. Toque na estrela de um evento em "Descobrir" para acompanhar aqui.';
    } else {
      const upcoming = favorites.slice(0, 5).map(formatEventLine).join('\n');
      reply = `Estes são seus próximos eventos favoritos:\n${upcoming}`;
    }
  } else if (mentionedCity) {
    const events = db
      .prepare(
        `SELECT * FROM events WHERE is_active = 1 AND LOWER(city) = LOWER(?) ORDER BY date_start ASC LIMIT 5`
      )
      .all(mentionedCity);

    reply =
      events.length > 0
        ? `Encontrei estes eventos em ${mentionedCity}:\n${events.map(formatEventLine).join('\n')}`
        : `Ainda não tenho eventos cadastrados em ${mentionedCity}. Você pode publicar um no modo produtor.`;
  } else {
    const soon = db
      .prepare(
        `SELECT * FROM events WHERE is_active = 1 ORDER BY date_start ASC LIMIT 3`
      )
      .all();

    reply =
      soon.length > 0
        ? `Posso te ajudar a encontrar eventos culturais! Aqui vão alguns em destaque:\n${soon
            .map(formatEventLine)
            .join(
              '\n'
            )}\n\nVocê também pode me perguntar sobre uma cidade específica ou pedir "meus favoritos".`
        : 'Ainda não há eventos cadastrados. Volte em breve!';
  }

  saveMessage(user.id, 'bot', reply);
  return reply;
}

export function getConversation(userId) {
  return db
    .prepare(
      `SELECT role, content, created_at FROM bot_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 100`
    )
    .all(userId);
}
