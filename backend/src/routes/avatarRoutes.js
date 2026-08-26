// src/routes/avatarRoutes.js
import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { uploadLimiter } from '../middlewares/rateLimiters.js';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import db from '../db/index.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Formato não suportado'));
  },
}).single('avatar');

const router = Router();

router.post('/', requireAuth, uploadLimiter, (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    try {
      const filename = `avatar-${req.user.id}-${crypto.randomBytes(4).toString('hex')}.webp`;
      await sharp(req.file.buffer).resize(200, 200, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(UPLOAD_DIR, filename));
      db.prepare('UPDATE users SET avatar_url = ?, updated_at = ? WHERE id = ?').run(filename, new Date().toISOString(), req.user.id);
      res.json({ avatarUrl: filename });
    } catch (e) { next(e); }
  });
});

export default router;
