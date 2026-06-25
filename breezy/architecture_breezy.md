# 🏗️ Architecture du projet Breezy

## Vue d'ensemble

```mermaid
graph TB
    subgraph CLIENT["🖥️ Client (Navigateur)"]
        BROWSER["Navigateur Web"]
    end

    subgraph DOCKER_FRONT["🐳 Docker Compose (Frontend)"]
        NEXT["Frontend Next.js<br/>Container: frontend<br/>Port 3000:3000"]
    end

    subgraph DOCKER_BACK["🐳 Docker Compose (Backend) — app-network"]
        subgraph GW["🚪 API Gateway"]
            NGINX["Nginx<br/>Port 8080:80"]
        end

        subgraph AUTH_DOMAIN["🔑 Domaine Authentification"]
            AUTH["auth-service<br/>Node.js / Express<br/>Port interne 3000"]
            POSTGRES[("PostgreSQL 17<br/>auth-postgres<br/>Port 5432<br/>DB: authdb")]
        end

        subgraph POST_DOMAIN["📝 Domaine Posts"]
            POST["post-service<br/>Node.js / Express<br/>Port interne 3333"]
            MONGO[("MongoDB 6<br/>post-mongodb<br/>Port 27018:27017<br/>DB: breezy-api")]
        end
    end

    BROWSER -- "Visite l'UI (:3000)" --> NEXT
    BROWSER -- "Appels API (CORS) (:8080)" --> NGINX
    NEXT -- "Appels SSR (:8080)" --> NGINX
    NGINX -- "/api/auth/*<br/>/api/users/*<br/>/login /register<br/>/api/docs/*" --> AUTH
    NGINX -- "/api/tweet/*<br/>/api/tweet/uploads/*" --> POST
    AUTH -- "SQL (Sequelize)" --> POSTGRES
    POST -- "Mongoose ODM" --> MONGO
    POST -- "GET /api/users/:id/following<br/>(Header: Authorization)" --> AUTH
```

---

## 🔀 Routage Nginx (Gateway)

| Route entrante | Service cible | Description |
|---|---|---|
| `/api/auth/*` | `auth-service:3000` | Connexion, inscription, validation JWT |
| `/api/users/*` | `auth-service:3000` | Profils, abonnements, modération |
| `/api/docs/*` | `auth-service:3000` | Documentation API (Swagger) |
| `/login` | `auth-service:3000` | Raccourci login |
| `/register` | `auth-service:3000` | Raccourci inscription |
| `/api/tweet/*` | `post-service:3333` | CRUD tweets, likes, réponses |
| `/api/tweet/uploads/*` | `post-service:3333` | Fichiers médias (images/vidéos) |

---

## 📦 Services Backend

### 🔑 auth-service (Node.js + Express + PostgreSQL)

```mermaid
graph LR
    subgraph AUTH_SERVICE["auth-service"]
        A1["POST /api/auth/register"]
        A2["POST /api/auth/login"]
        A3["GET /api/auth/validate"]
        A4["GET /api/users/:id"]
        A5["GET /api/users/me"]
        A6["GET /api/users/action/search"]
        A7["POST /api/users/:id/follow"]
        A8["DELETE /api/users/:id/follow"]
        A9["GET /api/users/:id/following"]
        A10["POST /api/users/:id/suspend"]
        A11["POST /api/users/:id/unsuspend"]
        A12["GET /api/users"]
    end
```

| Responsabilité | Détails |
|---|---|
| Inscription / Connexion | Hachage mot de passe, génération JWT |
| Gestion utilisateurs | Profils, rôles (user, moderator, admin) |
| Recherche | Recherche d'utilisateurs par nom ou pseudo |
| Abonnements | Follow / Unfollow / Liste following |
| Modération | Suspension / Réactivation de comptes |

---

### 📝 post-service (Node.js + Express + MongoDB)

```mermaid
graph LR
    subgraph POST_SERVICE["post-service"]
        T1["GET /api/tweet<br/>?page=1&limit=15"]
        T2["GET /api/tweet/followed<br/>?page=1&limit=15"]
        T3["POST /api/tweet"]
        T4["GET /api/tweet/:id"]
        T5["PUT /api/tweet/:id"]
        T6["POST /api/tweet/:id/like"]
        T7["DELETE /api/tweet/:id/like"]
        T8["GET /api/tweet/:id/response"]
        T9["GET /api/tweet/action/search"]
        T10["GET /api/tweet/user/:userId"]
        T11["GET /api/tweet/uploads/:file"]
    end
```

| Responsabilité | Détails |
|---|---|
| Tweets (CRUD) | Création avec texte + média (image/vidéo), lecture, modification |
| Fil "À la une" | Tri par poids dynamique (likes − âge en jours), pagination 15/page |
| Fil "Abonnements" | Tri chronologique décroissant, pagination 15/page |
| Recherche | Recherche de tweets par contenu (insensible à la casse) |
| Likes | Like / Unlike par utilisateur |
| Réponses | Fils de discussion imbriqués via `belongTo` |
| Médias | Upload base64 → fichier disque, service statique via Express |

#### Schéma du document Tweet (MongoDB)

```json
{
  "_id": "ObjectId",
  "idUser": "string (userId de auth-service)",
  "content": "string (max 280 caractères)",
  "belongTo": "string | null (ID du tweet parent si réponse)",
  "likes": ["userId1", "userId2"],
  "mediaUrl": "/api/tweet/uploads/filename | null",
  "mediaType": "image | video | null",
  "createdAt": "Date"
}
```

---

## 🎨 Frontend (Next.js 16 + React 19 + Tailwind CSS 4)

```mermaid
graph TD
    subgraph LAYOUT["Layout global"]
        SIDEBAR["Sidebar.js<br/>Menu desktop (hidden md:flex)"]
        MOBILENAV["MobileNav.js<br/>Barre du bas mobile (md:hidden)"]
        MOBILEHEADER["MobileHeader.js<br/>En-tête mobile"]
        THEMEPROVIDER["ThemeProvider.js<br/>Gestion des thèmes CSS"]
    end

    subgraph PAGES["Pages (App Router)"]
        HOME["/ — Accueil<br/>Fil d'actualité<br/>(À la une / Abonnements)"]
        LOGIN["/login — Connexion"]
        REGISTER["/register — Inscription"]
        SEARCH["/search — Recherche"]
        CREATE["/tweet/create — Poster<br/>(texte + image/vidéo)"]
        DETAIL["/tweet/[id] — Détail tweet<br/>+ réponses"]
        PROFILE["/user/[handle] — Profil<br/>+ posts de l'utilisateur"]
        MODERATION["/moderation — Modération<br/>(admin/moderator)"]
    end

    subgraph COMPONENTS["Composants réutilisables"]
        LISTTWEET["ListTweet.js<br/>Infinite scroll + pagination"]
        ONETWEET["OneTweet.js<br/>Affichage tweet unitaire<br/>(texte, média, like, edit)"]
        THEMESELECTOR["ThemeSelector.js<br/>Sélecteur de thème"]
        AUTHGUARD["AuthGuard.js<br/>Protection de routes"]
    end

    HOME --> LISTTWEET
    LISTTWEET --> ONETWEET
    DETAIL --> ONETWEET
    PROFILE --> ONETWEET
```

---

## 🔄 Flux de données principaux

### 1. Publication d'un tweet avec média

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant G as Gateway (Nginx)
    participant P as post-service
    participant M as MongoDB

    U->>F: Rédige texte + glisse image
    F->>F: FileReader → base64
    F->>G: POST /api/tweet<br/>{content, mediaData, mediaName}
    G->>P: Proxy vers post-service:3333
    P->>P: Décode base64 → buffer<br/>Écrit fichier dans /uploads
    P->>M: Save Tweet {content, mediaUrl, mediaType}
    M-->>P: OK
    P-->>G: 201 Created
    G-->>F: 201 Created
    F->>F: Rafraîchit le fil
```

### 2. Chargement du fil paginé (Infinite Scroll)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend (ListTweet)
    participant G as Gateway
    participant P as post-service
    participant M as MongoDB

    U->>F: Ouvre la page d'accueil
    F->>G: GET /api/tweet?page=1&limit=15
    G->>P: Proxy
    P->>M: Tweet.find() + calcul poids
    P->>P: Tri décroissant + slice(0, 15)
    P-->>F: [15 tweets]
    F->>F: Affiche les tweets

    U->>F: Scroll vers le bas
    F->>G: GET /api/tweet?page=2&limit=15
    G->>P: Proxy
    P-->>F: [15 tweets suivants]
    F->>F: Append aux tweets existants
```

---

## 🐳 Conteneurs Docker (état actuel)

| Conteneur | Image | Port exposé | Rôle | Orchestrateur |
|---|---|---|---|---|
| `frontend` | Build local (Node 20) | **3000** | Interface utilisateur (Next.js) | `frontend-api-breezy` |
| `gateway` | nginx:1.29.1-alpine | **8080** → 80 | Reverse proxy / API Gateway | `backend-user-breezy` |
| `auth-service` | Build local (Node 24) | interne 3000 | API Authentification & Utilisateurs | `backend-user-breezy` |
| `auth-postgres` | postgres:17-alpine | 5432 | Base de données relationnelle | `backend-user-breezy` |
| `post-service` | Build local (Node 20) | interne 3333 | API Posts / Tweets | `backend-user-breezy` |
| `post-mongodb` | mongo:6-jammy | 27018 → 27017 | Base de données documents | `backend-user-breezy` |

---

## 🗂️ Arborescence des dépôts Git

```
Breezy/
├── backend-user-breezy/          ← Dépôt Git #1
│   ├── compose.yml               ← Orchestration Docker
│   ├── gateway/
│   │   └── nginx.conf            ← Configuration du reverse proxy
│   └── auth-service/
│       └── src/                  ← Code de l'API auth (Express + Sequelize)
│
├── backend-post-breezy/          ← Dépôt Git #2
│   └── src/
│       ├── controllers/
│       │   └── tweets.controller.js
│       ├── models/
│       │   └── tweet.model.js
│       ├── routes/
│       │   └── tweets.routes.js
│       ├── middlewares/
│       ├── uploads/              ← Fichiers médias (images/vidéos)
│       └── index.js
│
└── frontend-api-breezy/          ← Dépôt Git #3
    └── breezy/
        └── src/
            ├── app/
            │   ├── page.js           ← Accueil (fil d'actualité)
            │   ├── layout.js         ← Layout global
            │   ├── login/            ← Page de connexion
            │   ├── register/         ← Page d'inscription
            │   ├── search/           ← Page de recherche
            │   ├── moderation/       ← Page de modération
            │   ├── tweet/
            │   │   ├── create/       ← Page de création (avec média)
            │   │   └── [id]/         ← Détail d'un tweet
            │   └── user/
            │       └── [handle]/     ← Page profil utilisateur
            ├── components/
            │   ├── ListTweet.js      ← Liste paginée (infinite scroll)
            │   ├── OneTweet.js       ← Affichage d'un tweet
            │   ├── Sidebar.js        ← Menu latéral desktop
            │   ├── MobileNav.js      ← Navigation mobile
            │   ├── ThemeProvider.js   ← Gestion des thèmes
            │   └── ThemeSelector.js   ← Sélecteur de thème
            └── utils/
                ├── api.js            ← Appels API (axios)
                └── formatDate.js     ← Formatage des dates
```
