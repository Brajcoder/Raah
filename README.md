# Raah — Career Intelligence & Guided Discovery Platform 🚀

A comprehensive, production-ready career discovery and student guidance platform featuring **Holland RIASEC cognitive assessments**, **AI-driven pathway scoring**, and verified **Supabase PostgreSQL authentication**.

---

## 📁 Repository Architecture

```
├── frontend/                     # React 19 + Vite + Tailwind CSS client portal
│   ├── public/                   # Static assets & brand logo (logo.png)
│   ├── src/
│   │   ├── assets/               # Logos, SVG icons, illustrations
│   │   ├── components/           # UI elements (PortalLayout, Navbar, PasswordStrength, etc.)
│   │   ├── context/              # AuthContext & state management
│   │   ├── data/                 # RIASEC questions & career dataset
│   │   ├── lib/                  # Supabase client helper
│   │   ├── pages/                # Login, SignUp, Dashboard, Profile, Assessment, Results, Explore, Saved
│   │   ├── App.jsx               # Client routes & protected pathways
│   │   ├── index.css             # Design tokens & responsive styles
│   │   └── main.jsx              # React DOM initialization
│   ├── index.html                # App entry HTML & Google Fonts
│   ├── vite.config.js            # Vite bundler configuration
│   └── package.json              # Frontend scripts & dependencies
│
├── backend/                      # Node.js + Express REST API Server
│   ├── src/
│   │   ├── config/               # Supabase admin client configuration
│   │   ├── routes/               # Modular Express API routers
│   │   │   ├── auth.routes.js    # Token verification endpoints
│   │   │   ├── careers.routes.js # Career pathways & RIASEC filtering
│   │   │   ├── assessment.routes.js # Holland RIASEC scoring engine
│   │   │   └── profile.routes.js # Student academic profile sync
│   │   └── server.js             # Central Express server entry point
│   ├── .env.example              # Server environment template
│   └── package.json              # Backend scripts & dependencies
│
├── supabase/                     # Database migrations & schemas
│   └── schema.sql                # User profiles table, RLS policies & triggers
│
├── .gitignore                    # Monorepo git ignore rules
├── package.json                  # Root runner scripts (npm run dev, build, lint)
└── README.md                     # Architecture documentation
```

---

## 🛠️ Quick Start

### 1. Run Frontend (Client Portal)
From the root directory:
```bash
npm run dev
# Or explicitly:
npm run dev:frontend
```
Client portal starts at **`http://localhost:5173`**.

### 2. Run Backend (API Server)
```bash
cd backend
npm install
npm run dev
```
API server starts at **`http://localhost:5000`**.

### 3. Build for Production
```bash
npm run build
```
Generates production bundle in `frontend/dist/`.
# Raah
