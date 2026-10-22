# Project Management Tool - Full Stack Implementation ✅

A complete collaborative project management application built with **Node.js/Express backend** and **React/TypeScript frontend**.

## 🚀 Features Implemented

### ✅ Authentication System
- User registration with email validation
- Secure login with JWT tokens
- Password hashing with bcrypt
- Session persistence with localStorage

### ✅ Project Management
- Create and manage projects
- Project descriptions and metadata
- Multi-user project membership
- Project listing and filtering

### ✅ Kanban Board
- Drag-and-drop task management
- Four default columns: To Do, In Progress, In Review, Done
- Real-time task updates
- Task cards with metadata

### ✅ Task Management
- Create tasks with priority levels (Low, Medium, High, Urgent)
- Assign tasks to team members
- Set due dates
- Task descriptions and details
- Task deletion

### ✅ Discussion & Comments
- Comment threads on tasks
- User avatars and names
- Timestamp tracking
- Real-time comment display

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt for password hashing
- **API**: RESTful API with CORS support

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Build Tool**: Vite

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run seed          # Initialize database with demo data
npm start            # Start server on http://localhost:3001
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev          # Start dev server on http://localhost:5173
```

## 🔐 Demo Credentials

```
Email: demo@example.com
Password: password123
```

## 📖 How to Use

### 1. **Login/Register**
   - Navigate to `http://localhost:5173`
   - Login with demo credentials or create a new account
   - You'll be redirected to the Projects dashboard

### 2. **Create a Project**
   - Click "New Project" button
   - Enter project name and optional description
   - Four default columns are automatically created

### 3. **Manage Tasks**
   - Click on any project to view its Kanban board
   - Click "Add Task" in any column to create a new task
   - Set task priority and title
   - **Drag and drop** tasks between columns to move them

### 4. **View Task Details**
   - Click on any task card to open the task detail modal
   - Update task priority and due date
   - View task description
   - **Add comments** to task

### 5. **Add Comments**
   - Open a task detail modal
   - Scroll to the Comments section
   - Type your comment and press Enter or click Send
   - Comments appear instantly with user info and timestamp

### 6. **Assign Tasks**
   - Tasks can be assigned to team members (owner automatically assigned)
   - Assignee info displays on task cards

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/auth/register    # Register new user
POST   /api/v1/auth/login       # Login user
GET    /api/v1/auth/me          # Get current user
```

### Projects
```
GET    /api/v1/projects         # List user's projects
POST   /api/v1/projects         # Create new project
GET    /api/v1/projects/:id     # Get project details
PUT    /api/v1/projects/:id     # Update project
DELETE /api/v1/projects/:id     # Delete project
```

### Tasks
```
POST   /api/v1/projects/:id/tasks        # Create task
PUT    /api/v1/tasks/:id                 # Update task
POST   /api/v1/tasks/:id/move            # Move task to column
DELETE /api/v1/tasks/:id                 # Delete task
```

### Comments
```
GET    /api/v1/tasks/:id/comments        # List comments
POST   /api/v1/tasks/:id/comments        # Add comment
```

## 📁 Project Structure

```
project-management-tool/
├── backend/
│   ├── server.js          # Main Express server
│   ├── seed.js            # Database seeding script
│   ├── .env               # Environment variables
│   ├── app.db             # SQLite database (auto-created)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.ts           # Axios client & API calls
    │   ├── store/
    │   │   ├── authStore.ts        # Auth state management
    │   │   └── projectStore.ts     # Projects & tasks state
    │   ├── pages/
    │   │   ├── Login.tsx           # Login page
    │   │   ├── Register.tsx        # Register page
    │   │   ├── Projects.tsx        # Projects dashboard
    │   │   └── Board.tsx           # Kanban board
    │   ├── App.tsx                 # Main app with routing
    │   └── main.tsx                # React entry point
    ├── tailwind.config.js
    ├── tsconfig.json
    └── package.json
```

## 🎨 Design Features

- **Vintage Paper Style**: Warm amber and orange gradient background
- **Folder-inspired UI**: Card-based layout with paper texture
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Drag-and-drop with visual feedback
- **Color-coded Priorities**: Visual priority indicators on tasks
- **Real-time Updates**: Instant UI updates without page reload

## 🔄 Working Features

- ✅ User Authentication (Register/Login/Logout)
- ✅ Project CRUD operations
- ✅ Project membership
- ✅ Kanban board with 4 columns
- ✅ Task creation and management
- ✅ Task prioritization
- ✅ Due date assignment
- ✅ Drag-and-drop task movement
- ✅ Task assignment to users
- ✅ Comments/discussion threads
- ✅ Real-time comment updates
- ✅ Task deletion
- ✅ Responsive UI
- ✅ Error handling

## 🚦 Testing Workflow

1. **Start both servers** (as shown above)
2. **Open** `http://localhost:5173` in browser
3. **Login** with: `demo@example.com` / `password123`
4. **View** the "My First Project" with pre-populated tasks
5. **Interact** with the Kanban board:
   - Drag tasks between columns
   - Click tasks to view/edit details
   - Add comments to tasks
   - Create new tasks
   - Update priorities and due dates

## 📊 Database Schema

The SQLite database includes the following tables:
- **users**: User accounts and authentication
- **projects**: Project metadata
- **project_members**: Project membership and roles
- **board_columns**: Kanban board columns
- **tasks**: Task cards and details
- **comments**: Task discussions and comments

## 🔒 Security Features

- JWT token-based authentication
- Bcrypt password hashing
- CORS configuration
- Foreign key constraints
- SQL injection prevention via parameterized queries

## 🎯 Next Steps & Enhancements

Optional features that can be added:
- WebSocket real-time updates (Laravel Echo)
- Task attachments
- Notifications system
- User profiles and avatars
- Project settings and permissions
- Activity logs
- Search and filtering
- Task labels/tags
- Sprint planning
- Mobile app

## 📞 Support

For issues or questions, check:
1. Console logs (frontend and backend)
2. Database state via SQLite browser
3. Network requests in browser DevTools
4. Backend logs in terminal

---

**Status**: ✅ Fully Functional - All core features working end-to-end
