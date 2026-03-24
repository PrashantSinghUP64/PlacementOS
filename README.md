# AI Resume Checker — start here

You probably opened this **outer** folder. The React app and `server/` API live **one level deeper**:

```
AI-Resume-Checker-main/          ← you are here (this README)
  AI-Resume-Checker-main/        ← run commands HERE (has package.json + server/)
```

## Option A — stay in this folder (recommended if your terminal opens here)

```powershell
npm run install:all
npm run dev:all
```

This starts **API + frontend** together (backend `http://localhost:5000`, app `http://localhost:5173`).

**Or** use two terminals:

```powershell
npm run api:dev
```

```powershell
npm run dev
```

## Option B — go into the real project folder

```powershell
cd AI-Resume-Checker-main
npm install
npm install --prefix server
npm run api:dev
```

Second terminal:

```powershell
cd AI-Resume-Checker-main
npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:5000/health  

Do **not** run `npm install --prefix server` from this outer folder — there is no `server` here; it is inside `AI-Resume-Checker-main`.
