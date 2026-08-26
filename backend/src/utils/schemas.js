// src/utils/schemas.js
import { z } from 'zod';

const passwordRule = z
  .string()
  .min(8)
  .max(128)
  .regex(/[a-z]/, 'A senha precisa de ao menos uma letra minúscula')
  .regex(/[A-Z]/, 'A senha precisa de ao menos uma letra maiúscula')
  .regex(/[0-9]/, 'A senha precisa de ao menos um número');

export const registerUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(180),
  password: passwordRule,
  city: z.string().trim().min(2).max(120).optional(),
  stateCode: z.string().trim().max(2).optional(),
  accessibilityNeeds: z.string().trim().max(200).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'É necessário aceitar os termos' }),
  }),
});

export const registerProducerSchema = registerUserSchema.extend({
  cnpj: z.string().trim().min(14).max(18),
  orgName: z.string().trim().min(2).max(200),
  orgPhone: z.string().trim().min(10).max(20).optional(),
  orgDescription: z.string().trim().max(500).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

export const updateProfileSchema = z.object({
  username: z.string().trim().min(3).max(60).regex(/^[a-zA-Z0-9_.-]+$/, 'Use apenas letras, números, pontos, hifens e underlines').optional(),
  city: z.string().trim().min(2).max(120).optional(),
  stateCode: z.string().trim().max(2).optional(),
  bio: z.string().trim().max(500).optional(),
  accessibilityNeeds: z.string().trim().max(200).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordRule,
});

export const requestResetSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(10),
  newPassword: passwordRule,
});

export const eventCreateSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional(),
  categoryId: z.number().int().positive().optional(),
  city: z.string().trim().min(2).max(120),
  region: z.string().trim().max(120).optional(),
  address: z.string().trim().max(240).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  dateStart: z.string().datetime(),
  dateEnd: z.string().datetime().optional(),
  price: z.string().trim().max(60).optional(),
  imageUrl: z.string().url().optional(),
  sourceUrl: z.string().url().optional(),
});

export const eventUpdateSchema = eventCreateSchema.partial();

export const eventQuerySchema = z.object({
  city: z.string().trim().max(120).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  from: z.string().datetime().optional(),
  onlyFavorites: z.coerce.boolean().optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export const favoriteToggleSchema = z.object({
  eventId: z.number().int().positive(),
  notify: z.boolean().optional().default(true),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const botMessageSchema = z.object({
  message: z.string().trim().min(1).max(500),
});
