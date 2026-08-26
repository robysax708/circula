# Circula v2

Plataforma sociocultural — Desafio de Dados da Vivo 2026.

## Requisitos

- **Node.js 22.5 ou superior** (o banco usa `node:sqlite`, nativo do Node — sem compilador necessário)

## Como rodar

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

A API sobe em `http://localhost:3001`. O banco é criado e populado automaticamente.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O app abre em `http://localhost:5173`.

### Testes

```bash
cd backend
npm test
```
