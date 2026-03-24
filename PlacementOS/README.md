# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

---

## Full-stack API (Express + MongoDB)

The backend lives in `server/`. Run **two terminals** from this folder (`AI-Resume-Checker-main/AI-Resume-Checker-main`).

### 1. Install

```bash
npm install
npm install --prefix server
```

### 2. Environment

Copy the example env and edit if needed:

```bash
copy server\.env.example server\.env
```

- **MongoDB** must be reachable at `MONGO_URI` (default: `mongodb://127.0.0.1:27017/resume-analyzer`).
- **CORS**: `CLIENT_ORIGIN` should match the frontend (default: `http://localhost:5173`).

### 3. Run

**One terminal (API + frontend together):**

```bash
npm run dev:all
```

**Or two terminals — Terminal A — API**

```bash
npm run api:dev
```

**Terminal B — Frontend**

```bash
npm run dev
```

- App: `http://localhost:5173`
- API health: `http://localhost:5000/health`

### If something failed (common errors)

| What you see | What to do |
|--------------|------------|
| `ECONNREFUSED` / Mongo connection error | Start **MongoDB** locally, or set `MONGO_URI` in `server/.env` to **Atlas**. |
| `'react-router' is not recognized` | Run `npm install` in the **inner** project folder (where `package.json` is). |
| `Cannot find module '@rollup/rollup-win32-x64-msvc'` | Delete `node_modules` and `package-lock.json`, then `npm install` again. |
| `No route matches URL "/upload"` | Pull latest; `/upload` is registered in `app/routes.ts`. |
| Port **5000** in use | Set `PORT=5001` in `server/.env` and use that port for API calls. |

If it still fails, copy the **full red error text** from the terminal and share it.

