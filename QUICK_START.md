# Quick Start Guide

## 🚀 Run Everything in 2 Minutes

### Step 1: Start the Backend
```bash
cd backend
npm install  # Only needed first time
npm run seed # Initialize database with demo data
npm start    # Server starts on http://localhost:3001
```

### Step 2: Start the Frontend  
```bash
cd frontend
npm install  # Only needed first time
npm run dev  # Dev server starts on http://localhost:5173
```

### Step 3: Open in Browser
- **URL**: http://localhost:5173
- **Email**: demo@example.com
- **Password**: password123

## ✅ What You'll See

### Login Page
- Beautiful vintage paper-styled login form
- Secure JWT-based authentication
- Option to register new accounts

### Projects Dashboard
- List of your projects
- "New Project" button to create projects
- Project cards with member counts

### Kanban Board
- Four columns: To Do, In Progress, In Review, Done
- Drag-and-drop task management
- Task cards with priority colors
- Click any task to view details and comments

### Task Details Modal
- View full task information
- Update priority and due dates
- Add and view comments
- Assign tasks to team members

## 🔄 Workflow

1. **Create a Project** → Click "New Project" on dashboard
2. **Add Tasks** → Click "Add Task" in any column
3. **Manage Tasks** → Drag between columns, click to edit
4. **Discuss** → Add comments on task details modal
5. **Track Progress** → Watch tasks flow from To Do → Done

## 📊 What's Wired & Working

✅ **Complete Authentication System**
- Register, Login, Logout
- JWT tokens with secure storage
- User session persistence

✅ **Full Project Management**
- Create unlimited projects
- Organize with descriptions
- Multi-user access control

✅ **Kanban Board**
- Drag-and-drop between columns
- Real-time visual updates
- Priority color coding

✅ **Task Management**
- Create with priority levels
- Set due dates
- Assign to team members
- Add descriptions

✅ **Discussion Threads**
- Comment on any task
- User info and timestamps
- Real-time comment display

✅ **REST API**
- All endpoints fully functional
- JWT authentication on all routes
- CORS enabled
- Error handling

## 🗄️ Database

Data is stored in **SQLite** at `backend/app.db`

Pre-loaded demo data:
- 1 user (demo@example.com)
- 1 project with 4 columns
- 5 sample tasks
- 1 sample comment

## 🛠️ Stop Servers

To stop both servers:
```bash
# Frontend: Press Ctrl+C in the terminal
# Backend: Press Ctrl+C in the terminal
```

## ❓ Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173  
lsof -ti:5173 | xargs kill -9
```

**Database issues?**
```bash
cd backend
rm app.db          # Delete old database
npm run seed       # Recreate with fresh data
npm start
```

**Frontend not connecting?**
- Check backend is running on port 3001
- Check browser console for errors
- Verify CORS is working (should see no CORS errors)

---

**Status**: ✅ **All Systems Operational**

Backend: http://localhost:3001
Frontend: http://localhost:5173
