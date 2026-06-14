# 💼 BudgetWise

A personal finance management web app with user authentication, transaction tracking, and savings projects.

## 🌐 Live Demo

👉 **[https://wartwix.github.io/budgetwise/](https://wartwix.github.io/budgetwise/)**

No download required — open the link and use it directly in your browser.

> **Test account:** `matteo@test.com` / `test1234`

## 📋 Description

Users can:

- Create an account and log in securely (JWT authentication)
- Add income and expense transactions
- View their balance, total income, and total expenses in real time
- Data is stored in a real database — persists across devices and sessions

## 🛠️ Tech Stack

**Frontend**
- [React](https://react.dev/) — components, context, state
- CSS-in-JS — dark "private banking" theme with sidebar layout

**Backend**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) — REST API
- [PostgreSQL](https://www.postgresql.org/) — database (hosted on [Neon](https://neon.tech))
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) — password hashing
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) — JWT authentication

**Hosting**
- Frontend → [GitHub Pages](https://pages.github.com/)
- Backend → [Render](https://render.com/)
- Database → [Neon](https://neon.tech/)

## 🚀 Run Locally

```bash
git clone https://github.com/wartwix/budgetwise.git
cd budgetwise

# Backend
cd server
cp .env.example .env   # fill in your DATABASE_URL and JWT_SECRET
npm install
npm start

# Frontend (new terminal)
cd ../client
npm install
npm start
```

## 📁 Project Structure

```
budgetwise/
├── server/
│   ├── index.js        # Express API (auth, transactions, projects)
│   ├── .env.example
│   └── package.json
└── client/
    ├── src/
    │   └── App.jsx     # React app (login, dashboard, transactions)
    └── package.json
```

---

# 💼 BudgetWise (Français)

Application de gestion de finances personnelles avec authentification, suivi des transactions et projets d'épargne.

## 🌐 Démo en ligne

👉 **[https://wartwix.github.io/budgetwise/](https://wartwix.github.io/budgetwise/)**

Aucun téléchargement nécessaire — ouvrez le lien et utilisez l'application directement dans votre navigateur.

> **Compte de test :** `matteo@test.com` / `test1234`

## 📋 Description

Les utilisateurs peuvent :

- Créer un compte et se connecter de façon sécurisée (authentification JWT)
- Ajouter des transactions de revenus et de dépenses
- Visualiser leur solde, total revenus et total dépenses en temps réel
- Les données sont stockées en base de données réelle — persistantes entre appareils et sessions

## 🛠️ Technologies

**Frontend**
- [React](https://react.dev/) — composants, context, state
- CSS-in-JS — thème sombre "banque privée" avec sidebar fixe

**Backend**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) — API REST
- [PostgreSQL](https://www.postgresql.org/) — base de données (hébergée sur [Neon](https://neon.tech))
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) — hachage des mots de passe
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) — authentification JWT

**Hébergement**
- Frontend → [GitHub Pages](https://pages.github.com/)
- Backend → [Render](https://render.com/)
- Base de données → [Neon](https://neon.tech/)

## 🚀 Lancer en local

```bash
git clone https://github.com/wartwix/budgetwise.git
cd budgetwise

# Backend
cd server
cp .env.example .env   # remplir DATABASE_URL et JWT_SECRET
npm install
npm start

# Frontend (nouveau terminal)
cd ../client
npm install
npm start
```

## 📁 Structure du projet

```
budgetwise/
├── server/
│   ├── index.js        # API Express (auth, transactions, projets)
│   ├── .env.example
│   └── package.json
└── client/
    ├── src/
    │   └── App.jsx     # App React (login, dashboard, transactions)
    └── package.json
```
