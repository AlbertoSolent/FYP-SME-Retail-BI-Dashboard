# SME Retail BI Dashboard

A web-based Business Intelligence dashboard for SME retailers. Built with React, Node.js, and MySQL.

**Live:** https://fyp-sme-retail-bi-dashboard.vercel.app

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) installed and running — you'll need your MySQL root username and password for setup

## Setup

### 1. Clone and install

```bash
git clone https://github.com/AlbertoSolent/FYP-SME-Retail-BI-Dashboard.git
cd FYP-SME-Retail-BI-Dashboard
```

Install dependencies for both backend and frontend:

```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Set up the database

Make sure your MySQL server is running, then open a terminal. The database name is `retail_bi_db` — it's created automatically by the first script.

Run these scripts in order (you'll be prompted for your MySQL password each time):

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
mysql -u root -p retail_bi_db < database/users.sql
mysql -u root -p retail_bi_db < database/suggestions.sql
```

This creates the database, 6 tables, and 6 months of sample retail data.

Seed the admin account (requires dependencies):

```bash
cd database
npm install bcryptjs mysql2 dotenv
node seed-superuser.js
cd ..
```

This creates the default admin login: `admin@retailbi.com` / `admin123`

### 3. Configure the backend

Create a `.env` file inside `/backend`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=retail_bi_db
PORT=5000
```

### 4. Start the app

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:3000 and login with `admin@retailbi.com` / `admin123`.

## Project Structure

```
backend/
  server.js          — Express app entry point
  config/db.js       — MySQL connection pool
  middleware/auth.js  — JWT authentication
  routes/
    auth.js          — Login endpoints
    kpis.js          — Dashboard KPI endpoints
    data.js          — CRUD for all tables
    users.js         — User management
    suggestions.js   — Suggestions system

frontend/
  src/
    pages/           — Dashboard, DataExplorer, Login, Users, Suggestions
    components/      — KPICard, RevenueChart, Tables, Header, Modals
    context/         — AuthContext (JWT state management)
    api.js           — Axios instance with base URL config

database/
  schema.sql         — Core 4 tables (Categories, Products, Inventory, Sales)
  seed.sql           — 6 months of synthetic retail data
  users.sql          — Users table
  suggestions.sql    — Suggestions table
  seed-superuser.js  — Creates the protected admin account
```

## User Roles

| Role | Dashboard | Data Explorer | Users | Suggestions |
|------|-----------|--------------|-------|-------------|
| Admin | View | Full CRUD | Manage all | View all + delete |
| Viewer | View | Read only | View list | Submit + view own |

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, Recharts, React Router |
| Backend | Node.js, Express, JWT, bcrypt |
| Database | MySQL |
| Hosting | Vercel (frontend), Render (backend), Aiven (database) |
