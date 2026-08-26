// src/middlewares/upload.js
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { badRequest } from '../utils/apiError.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(badRequest('Formato de imagem não suportado. Use JPG, PNG ou WebP.'));
};

export const uploadPhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
}).array('photos', 3);

export async function processPhotos(req, res, next) {
  if (!req.files || req.files.length === 0) return next();
  try {
    const filenames = [];
    for (const file of req.files) {
      const name = `${crypto.randomUUID()}.webp`;
      const outPath = path.join(UPLOAD_DIR, name);
      await sharp(file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outPath);
      filenames.push(name);
    }
    req.processedPhotos = filenames;
    next();
  } catch (err) {
    next(err);
  }
}

export { UPLOAD_DIR };
