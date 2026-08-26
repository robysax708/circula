// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
let authToken = null;

export function setAuthToken(token) { authToken = token; }

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const error = new Error(body?.error || 'Erro ao comunicar com o servidor');
    error.status = res.status;
    error.details = body?.details;
    throw error;
  }
  return body;
}

export const api = {
  register: (d) => request('/auth/register', { method: 'POST', body: JSON.stringify(d) }),
  registerProducer: (d) => request('/auth/register/producer', { method: 'POST', body: JSON.stringify(d) }),
  login: (d) => request('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
  me: () => request('/auth/me'),
  updateProfile: (d) => request('/auth/profile', { method: 'PATCH', body: JSON.stringify(d) }),
  changePassword: (d) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(d) }),
  forgotPassword: (d) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(d) }),
  resetPassword: (d) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(d) }),

  listEvents: (p = {}) => {
    const qs = new URLSearchParams(Object.entries(p).filter(([, v]) => v !== undefined && v !== '')).toString();
    return request(`/events${qs ? `?${qs}` : ''}`);
  },
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (d) => request('/events', { method: 'POST', body: JSON.stringify(d) }),
  updateEvent: (id, d) => request(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  listCategories: () => request('/events/categories'),

  listFavorites: () => request('/favorites'),
  addFavorite: (eventId) => request('/favorites', { method: 'POST', body: JSON.stringify({ eventId }) }),
  removeFavorite: (eventId) => request(`/favorites/${eventId}`, { method: 'DELETE' }),

  listNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),

  markAttended: (eventId) => request(`/reviews/${eventId}/attend`, { method: 'POST' }),
  submitReview: (eventId, data, photos = []) => {
    if (photos.length > 0) {
      const fd = new FormData();
      fd.append('rating', String(data.rating));
      if (data.comment) fd.append('comment', data.comment);
      for (const p of photos) fd.append('photos', p);
      return request(`/reviews/${eventId}/review`, { method: 'POST', body: fd });
    }
    return request(`/reviews/${eventId}/review`, { method: 'POST', body: JSON.stringify(data) });
  },
  getReviews: (eventId) => request(`/reviews/${eventId}/reviews`),

  listCulturalPrograms: (type) => request(`/cultural${type ? `?type=${type}` : ''}`),

  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return request('/avatar', { method: 'POST', body: fd });
  },

  getProducerEvents: (producerId) => request(`/events/by-producer/${producerId}`),

  sendBotMessage: (message) => request('/bot', { method: 'POST', body: JSON.stringify({ message }) }),
  getBotConversation: () => request('/bot'),
};
