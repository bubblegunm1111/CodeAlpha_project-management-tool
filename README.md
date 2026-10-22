# 🚀 Collaborative Project Management Platform (Trello / Asana Alternative)

A modern, full-stack collaborative project management application featuring real-time interactive Kanban boards, role-based project workspaces, card assignments, rich comment threads, and live WebSocket updates.

![Project Preview](https://via.placeholder.com/1200x630.png?text=Kanban+Board+%26+Project+Management+Platform)

---

## ✨ Features

- **🔐 Robust Authentication & Workspaces:** Multi-tenant project workspace access with Laravel Sanctum token-based authentication.
- **📋 Interactive Kanban Boards:** Smooth drag-and-drop board cards and columns (Backlog, To Do, In Progress, In Review, Done).
- **👥 Group Projects & Member Management:** Add and manage project collaborators with role-based permissions (`admin`, `member`, `viewer`).
- **🎯 Task Cards & Assignment:** Detailed card modals, due dates, priority tags (Urgent, High, Medium, Low), task descriptions, and assigned team members.
- **💬 Real-Time Task Comments:** Communication feeds directly inside each task card for seamless team discussions.
- **⚡ WebSockets & Live Sync (Bonus):** Instant multi-user board state synchronizations and real-time activity notifications powered by Laravel Reverb / WebSockets.

---

## 🛠️ Tech Stack

### Backend
* **Language & Framework:** PHP 8.2+ / Laravel 11
* **Authentication:** Laravel Sanctum
* **Real-time Server:** Laravel Reverb / Pusher WebSockets
* **Database & ORM:** PostgreSQL / MySQL / SQLite with Eloquent ORM
* **Architecture:** RESTful API with Form Requests, Resource Collections, and Event Broadcasting

### Frontend
* **Core:** React 18+ / 19 with TypeScript & Vite
* **Styling & UI:** Tailwind CSS + Lucide Icons + Headless UI primitives
* **Kanban Drag & Drop:** `@hello-pangea/dnd`
* **State & Data Fetching:** TanStack Query (React Query v5) & Zustand
* **Real-time Client:** `laravel-echo` + `pusher-js`

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18+ or v20+) & **npm**
* **PHP** (8.2+) & **Composer**

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/project-management-tool.git
cd project-management-tool
```

### 2. Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan reverb:start   # Start WebSocket server
php artisan serve          # Starts API on http://127.0.0.1:8000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev                # Starts UI on http://localhost:5173
```

---

## 📁 Repository Structure

```
project-management-tool/
├── backend/            # Laravel 11 REST API & WebSocket server
│   ├── app/            # Controllers, Models, Events, Policies
│   ├── database/       # Migrations, seeders, factories
│   └── routes/         # API routes definition
├── frontend/           # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/ # Kanban boards, task cards, modals, navigation
│   │   ├── hooks/      # Real-time WebSocket & API query hooks
│   │   ├── store/      # State management stores
│   │   └── types/      # TypeScript schemas & contracts
└── README.md
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
