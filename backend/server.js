const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./app.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database');
});

db.run('PRAGMA foreign_keys = ON');

// Initialize database
const initializeDB = () => {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Projects table
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER NOT NULL,
      is_private BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Project members table
    db.run(`CREATE TABLE IF NOT EXISTS project_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(project_id, user_id)
    )`);

    // Board columns table
    db.run(`CREATE TABLE IF NOT EXISTS board_columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    // Tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      column_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to INTEGER,
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (column_id) REFERENCES board_columns(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    )`);

    // Comments table
    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
  });
};

initializeDB();

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper functions
const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// ============ AUTHENTICATION ENDPOINTS ============

// Register
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await getAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await runAsync(
      'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
      [email, name, hashedPassword]
    );

    const user = await getAsync('SELECT id, email, name FROM users WHERE email = ?', [email]);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/v1/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await getAsync('SELECT id, email, name, avatar_url FROM users WHERE id = ?', [req.userId]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PROJECTS ENDPOINTS ============

// List user's projects
app.get('/api/v1/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await allAsync(`
      SELECT DISTINCT p.* FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = ? OR pm.user_id = ?
      ORDER BY p.created_at DESC
    `, [req.userId, req.userId]);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create project
app.post('/api/v1/projects', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO projects (title, description, owner_id) VALUES (?, ?, ?)',
        [title, description || null, req.userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Add owner as member
    await runAsync(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [result, req.userId, 'admin']
    );

    // Create default columns
    const columnTitles = ['To Do', 'In Progress', 'In Review', 'Done'];
    for (let i = 0; i < columnTitles.length; i++) {
      await runAsync(
        'INSERT INTO board_columns (project_id, title, position) VALUES (?, ?, ?)',
        [result, columnTitles[i], i]
      );
    }

    const project = await getAsync('SELECT * FROM projects WHERE id = ?', [result]);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project with details
app.get('/api/v1/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await getAsync('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const columns = await allAsync(
      'SELECT * FROM board_columns WHERE project_id = ? ORDER BY position ASC',
      [req.params.id]
    );

    for (let col of columns) {
      const tasks = await allAsync(
        'SELECT * FROM tasks WHERE column_id = ? ORDER BY position ASC',
        [col.id]
      );

      for (let task of tasks) {
        const assignee = task.assigned_to ?
          await getAsync('SELECT id, name, avatar_url FROM users WHERE id = ?', [task.assigned_to]) : null;

        const comments = await allAsync(
          'SELECT c.*, u.name, u.avatar_url FROM comments c JOIN users u ON c.user_id = u.id WHERE c.task_id = ? ORDER BY c.created_at DESC',
          [task.id]
        );

        task.assignee = assignee;
        task.comments = comments;
      }

      col.tasks = tasks;
    }

    const members = await allAsync(`
      SELECT u.id, u.name, u.email, u.avatar_url, pm.role
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
    `, [req.params.id]);

    project.columns = columns;
    project.members = members;
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TASKS ENDPOINTS ============

// Create task
app.post('/api/v1/projects/:projectId/tasks', authMiddleware, async (req, res) => {
  try {
    const { column_id, title, description, priority, due_date } = req.body;

    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO tasks (column_id, project_id, title, description, priority, due_date, position)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [column_id, req.params.projectId, title, description || null, priority || 'medium', due_date || null, 0],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [result]);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
app.put('/api/v1/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, assigned_to, priority, due_date, column_id, position } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assigned_to);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (due_date !== undefined) {
      updates.push('due_date = ?');
      params.push(due_date);
    }
    if (column_id !== undefined) {
      updates.push('column_id = ?');
      params.push(column_id);
    }
    if (position !== undefined) {
      updates.push('position = ?');
      params.push(position);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length === 1) {
      return res.json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    await runAsync(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move task
app.post('/api/v1/tasks/:id/move', authMiddleware, async (req, res) => {
  try {
    const { column_id, position } = req.body;

    await runAsync(
      'UPDATE tasks SET column_id = ?, position = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [column_id, position, req.params.id]
    );

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
app.delete('/api/v1/tasks/:id', authMiddleware, async (req, res) => {
  try {
    await runAsync('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ COMMENTS ENDPOINTS ============

// Get task comments
app.get('/api/v1/tasks/:taskId/comments', authMiddleware, async (req, res) => {
  try {
    const comments = await allAsync(`
      SELECT c.*, u.name, u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.taskId]);

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment
app.post('/api/v1/tasks/:taskId/comments', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
        [req.params.taskId, req.userId, content],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    const comment = await getAsync(`
      SELECT c.*, u.name, u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result]);

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
