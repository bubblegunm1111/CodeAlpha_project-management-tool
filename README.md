# Foldable — Tactile Project & Dossier Management

A full-stack, tactile project management web application crafted with a warm archival manila folder design. Features interactive Kanban boards, sprint timeline calendars, notes, client accounts, product roadmaps, and Google Authentication.

---

## Features

- **Manila Dossier Workspaces:** Organize tasks, deliverables, and team files inside custom folders.
- **Kanban Task Boards:** Multi-column workflow (`To Do`, `In Progress`, `In Review`, `Done`) with priority badges, subtask checklists, and time tracking.
- **Schedule & Dynamic Timeline:** Interactive Gantt phases and full-month calendar views for deadlines and milestones.
- **Client Dossier & CRM:** Manage client contracts, account tiers, and project deliverables.
- **Product Deliverables Hub:** Multi-product tracking, feature lists, and health metrics.
- **Authentication:** Google OAuth via Firebase Authentication and secure email/password sign-in.
- **Workspace Customization:** Live profile avatar upload (drag-and-drop), theme settings, and organization renaming synced across all views.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Firebase Auth
- **Backend:** Node.js, Express, SQLite3, JSON Web Tokens (JWT), bcrypt
- **Deployment:** Vercel / Firebase Hosting

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/bubblegunm1111/CodeAlpha_project-management-tool.git
cd CodeAlpha_project-management-tool
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup
```bash
cd backend
npm install
node server.js
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
