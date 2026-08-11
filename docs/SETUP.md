# TheNahj — Local setup

## Fastest way (Windows)

1. Install **Node.js LTS** from https://nodejs.org/ if you have not already.
2. Double-click **`start-dev.bat`** in this folder.
3. Open **http://localhost:3000** in your browser.

## Manual commands

```powershell
cd C:\Users\Asus\.cursor\projects\empty-window
npm install
npm run dev
```

## Admin CMS

- URL: http://localhost:3000/admin/login
- Password: value of `ADMIN_PASSWORD` in `.env.local` (default dev: `thenahj-dev`)

## If localhost refuses connection

1. Dev terminal must stay open and show `Ready`.
2. Run `npm install` if `node_modules` folder is missing.
3. Check port: `netstat -ano | findstr ":3000"`

## Production build test

```powershell
npm run build
npm start
```
