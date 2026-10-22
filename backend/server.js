const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'archival-secret-key-change-in-prod';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./app.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database');
});

db.run('PRAGMA foreign_keys = ON');

// Initialize database schema
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

    // Organizations table
    db.run(`CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      owner_id INTEGER NOT NULL,
      icon TEXT DEFAULT 'Building2',
      color TEXT DEFAULT 'stone',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Task Folders (Dossiers) within Organizations
    db.run(`CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      color TEXT DEFAULT 'peach',
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    )`);

    // Projects table (linked optionally to folders & organizations)
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER NOT NULL,
      folder_id INTEGER,
      organization_id INTEGER,
      is_private BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
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

    // Tasks table (with color, progress, subtasks, tags, notes)
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      column_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to INTEGER,
      priority TEXT DEFAULT 'Medium',
      due_date TEXT,
      position INTEGER DEFAULT 0,
      color TEXT DEFAULT 'blue',
      tags TEXT DEFAULT '[]',
      progress INTEGER DEFAULT 0,
      subtasks TEXT DEFAULT '[]',
      note TEXT,
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

    // Notes table (Vintage Dossier Memos)
    db.run(`CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      color TEXT DEFAULT 'cream',
      is_pinned BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Schedule / Timeline Events table
    db.run(`CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      category TEXT DEFAULT 'Sprint',
      color TEXT DEFAULT 'blue',
      priority TEXT DEFAULT 'Medium',
      assignee TEXT,
      status TEXT DEFAULT 'Scheduled',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    // Alter table migrations in case columns were missing in existing DB
    db.run("ALTER TABLE tasks ADD COLUMN color TEXT DEFAULT 'blue'", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN tags TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN progress INTEGER DEFAULT 0", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN subtasks TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN note TEXT", () => {});
    db.run("ALTER TABLE projects ADD COLUMN organization_id INTEGER", () => {});
    db.run("ALTER TABLE projects ADD COLUMN folder_id INTEGER", () => {});
  });
};

initializeDB();

// Auth Middleware (Supports JWT or Demo/Guest header)
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token || token === 'guest-token' || token === 'demo-token') {
    // Default to user id 1 for instant evaluation / demo mode
    req.userId = 1;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    req.userId = 1; // Fallback to demo user
    next();
  }
};

// Async helpers
const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
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
    const result = await runAsync(
      'INSERT INTO users (email, name, password, avatar_url) VALUES (?, ?, ?, ?)',
      [email, name, hashedPassword, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop']
    );

    const user = await getAsync('SELECT id, email, name, avatar_url FROM users WHERE id = ?', [result.lastID]);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/auth/me', authMiddleware, async (req, res) => {
  try {
    let user = await getAsync('SELECT id, email, name, avatar_url FROM users WHERE id = ?', [req.userId]);
    if (!user) {
      user = { id: 1, email: 'mason.walker@example.com', name: 'Mason Walker', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop' };
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ORGANIZATIONS ENDPOINTS ============

app.get('/api/v1/organizations', authMiddleware, async (req, res) => {
  try {
    let orgs = await allAsync('SELECT * FROM organizations ORDER BY created_at ASC');
    if (orgs.length === 0) {
      // Seed default organization
      const result = await runAsync(
        'INSERT INTO organizations (name, slug, description, owner_id, icon, color) VALUES (?, ?, ?, ?, ?, ?)',
        ['Apex Studio Agency', 'apex-studio', 'Digital product design, brand identity & architecture studio', req.userId, 'Briefcase', 'stone']
      );
      const defaultOrgId = result.lastID;

      // Seed initial folders (Dossiers)
      const initialFolders = [
        { name: 'Client Deliverables', code: 'DOSSIER-01', description: 'Active client design systems & production builds', color: 'peach' },
        { name: 'Internal Research & Labs', code: 'DOSSIER-02', description: 'Product specs, AI models & wireframes', color: 'mint' },
        { name: 'Brand & Marketing Ops', code: 'DOSSIER-03', description: 'Press kits, typography guides & launch schedules', color: 'blue' }
      ];

      for (let f of initialFolders) {
        await runAsync(
          'INSERT INTO folders (organization_id, name, code, description, color, status) VALUES (?, ?, ?, ?, ?, ?)',
          [defaultOrgId, f.name, f.code, f.description, f.color, 'Active']
        );
      }

      orgs = await allAsync('SELECT * FROM organizations WHERE id = ?', [defaultOrgId]);
    }

    // Attach folders to each org
    for (let org of orgs) {
      const folders = await allAsync('SELECT * FROM folders WHERE organization_id = ? ORDER BY id ASC', [org.id]);
      org.folders = folders;
    }

    res.json(orgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/organizations', authMiddleware, async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Organization name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
    const result = await runAsync(
      'INSERT INTO organizations (name, slug, description, owner_id, icon, color) VALUES (?, ?, ?, ?, ?, ?)',
      [name, slug, description || '', req.userId, icon || 'Building2', color || 'stone']
    );

    const newOrgId = result.lastID;

    // Create a default initial folder for this organization
    await runAsync(
      'INSERT INTO folders (organization_id, name, code, description, color, status) VALUES (?, ?, ?, ?, ?, ?)',
      [newOrgId, 'General Dossier', 'DOSSIER-01', 'Primary task folder and boards', 'peach', 'Active']
    );

    const created = await getAsync('SELECT * FROM organizations WHERE id = ?', [newOrgId]);
    created.folders = await allAsync('SELECT * FROM folders WHERE organization_id = ?', [newOrgId]);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TASK FOLDERS ENDPOINTS ============

app.get('/api/v1/organizations/:orgId/folders', authMiddleware, async (req, res) => {
  try {
    const folders = await allAsync(
      'SELECT * FROM folders WHERE organization_id = ? ORDER BY created_at ASC',
      [req.params.orgId]
    );

    // Attach task count and projects count
    for (let f of folders) {
      const taskCount = await getAsync(
        `SELECT COUNT(*) as count FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.folder_id = ?`,
        [f.id]
      );
      f.taskCount = taskCount ? taskCount.count : 0;
    }

    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/organizations/:orgId/folders', authMiddleware, async (req, res) => {
  try {
    const { name, description, color, code } = req.body;
    if (!name) return res.status(400).json({ error: 'Folder name is required' });

    const generatedCode = code || `DOSSIER-${Math.floor(10 + Math.random() * 90)}`;
    const result = await runAsync(
      'INSERT INTO folders (organization_id, name, code, description, color, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.orgId, name, generatedCode, description || '', color || 'peach', 'Active']
    );

    const newFolder = await getAsync('SELECT * FROM folders WHERE id = ?', [result.lastID]);
    newFolder.taskCount = 0;
    res.status(201).json(newFolder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PROJECTS ENDPOINTS ============

app.get('/api/v1/projects', authMiddleware, async (req, res) => {
  try {
    let projects = await allAsync('SELECT * FROM projects ORDER BY created_at DESC');
    if (projects.length === 0) {
      // Seed initial default project
      const p = await runAsync(
        'INSERT INTO projects (title, description, owner_id) VALUES (?, ?, ?)',
        ['Acme Digital Revamp', 'Collaborative vintage dossier for sprint #3 deliverables', req.userId]
      );
      const cols = ['Todo list', 'In Progress', 'In Review'];
      for (let i = 0; i < cols.length; i++) {
        await runAsync('INSERT INTO board_columns (project_id, title, position) VALUES (?, ?, ?)', [p.lastID, cols[i], i]);
      }
      projects = await allAsync('SELECT * FROM projects WHERE id = ?', [p.lastID]);
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project with full board columns and tasks
app.get('/api/v1/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await getAsync('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const columns = await allAsync(
      'SELECT * FROM board_columns WHERE project_id = ? ORDER BY position ASC',
      [req.params.id]
    );

    for (let col of columns) {
      const tasks = await allAsync(
        'SELECT * FROM tasks WHERE column_id = ? ORDER BY position ASC',
        [col.id]
      );

      for (let t of tasks) {
        t.tags = typeof t.tags === 'string' ? JSON.parse(t.tags || '[]') : t.tags;
        t.subtasks = typeof t.subtasks === 'string' ? JSON.parse(t.subtasks || '[]') : t.subtasks;
        const comments = await allAsync(
          'SELECT c.*, u.name, u.avatar_url FROM comments c JOIN users u ON c.user_id = u.id WHERE c.task_id = ? ORDER BY c.created_at DESC',
          [t.id]
        );
        t.comments = comments;
      }
      col.tasks = tasks;
    }

    project.columns = columns;
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TASKS ENDPOINTS ============

// Create task with custom color, tags, checklist
app.post('/api/v1/projects/:projectId/tasks', authMiddleware, async (req, res) => {
  try {
    const { column_id, title, description, priority, due_date, color, tags, progress, subtasks, note } = req.body;

    const result = await runAsync(
      `INSERT INTO tasks (column_id, project_id, title, description, priority, due_date, color, tags, progress, subtasks, note, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        column_id,
        req.params.projectId,
        title,
        description || null,
        priority || 'Medium',
        due_date || null,
        color || 'blue',
        JSON.stringify(tags || ['#client']),
        progress || 0,
        JSON.stringify(subtasks || []),
        note || null,
        0
      ]
    );

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    task.tags = JSON.parse(task.tags || '[]');
    task.subtasks = JSON.parse(task.subtasks || '[]');
    task.comments = [];
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task (Change card color, title, priority, checklist, etc.)
app.put('/api/v1/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, due_date, column_id, position, color, tags, progress, subtasks, note } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
    if (due_date !== undefined) { updates.push('due_date = ?'); params.push(due_date); }
    if (column_id !== undefined) { updates.push('column_id = ?'); params.push(column_id); }
    if (position !== undefined) { updates.push('position = ?'); params.push(position); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }
    if (tags !== undefined) { updates.push('tags = ?'); params.push(JSON.stringify(tags)); }
    if (progress !== undefined) { updates.push('progress = ?'); params.push(progress); }
    if (subtasks !== undefined) { updates.push('subtasks = ?'); params.push(JSON.stringify(subtasks)); }
    if (note !== undefined) { updates.push('note = ?'); params.push(note); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    await runAsync(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    task.tags = JSON.parse(task.tags || '[]');
    task.subtasks = JSON.parse(task.subtasks || '[]');
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
      [column_id, position || 0, req.params.id]
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

app.post('/api/v1/tasks/:taskId/comments', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const result = await runAsync(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.taskId, req.userId, content]
    );

    const comment = await getAsync(`
      SELECT c.*, u.name, u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.lastID]);

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ NOTES ENDPOINTS (Dossier Memos) ============

app.get('/api/v1/notes', authMiddleware, async (req, res) => {
  try {
    const notes = await allAsync('SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC');
    const formatted = notes.map(n => ({
      ...n,
      tags: JSON.parse(n.tags || '[]')
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/notes', authMiddleware, async (req, res) => {
  try {
    const { title, content, tags, color, is_pinned, project_id } = req.body;
    const result = await runAsync(
      'INSERT INTO notes (project_id, user_id, title, content, tags, color, is_pinned) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [project_id || 1, req.userId, title, content, JSON.stringify(tags || []), color || 'cream', is_pinned ? 1 : 0]
    );

    const note = await getAsync('SELECT * FROM notes WHERE id = ?', [result.lastID]);
    note.tags = JSON.parse(note.tags || '[]');
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/v1/notes/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content, tags, color, is_pinned } = req.body;
    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (tags !== undefined) { updates.push('tags = ?'); params.push(JSON.stringify(tags)); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }
    if (is_pinned !== undefined) { updates.push('is_pinned = ?'); params.push(is_pinned ? 1 : 0); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    await runAsync(`UPDATE notes SET ${updates.join(', ')} WHERE id = ?`, params);
    const note = await getAsync('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    note.tags = JSON.parse(note.tags || '[]');
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/v1/notes/:id', authMiddleware, async (req, res) => {
  try {
    await runAsync('DELETE FROM notes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SCHEDULE & TIMELINE ENDPOINTS ============

app.get('/api/v1/schedules', authMiddleware, async (req, res) => {
  try {
    const schedules = await allAsync('SELECT * FROM schedules ORDER BY date ASC, time ASC');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/schedules', authMiddleware, async (req, res) => {
  try {
    const { title, date, time, category, color, priority, assignee, status, project_id } = req.body;
    const result = await runAsync(
      'INSERT INTO schedules (project_id, title, date, time, category, color, priority, assignee, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [project_id || 1, title, date, time || '10:00 AM', category || 'Sprint', color || 'blue', priority || 'Medium', assignee || 'Team', status || 'Scheduled']
    );

    const event = await getAsync('SELECT * FROM schedules WHERE id = ?', [result.lastID]);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/v1/schedules/:id', authMiddleware, async (req, res) => {
  try {
    await runAsync('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Archival Backend API listening on http://localhost:${PORT}`);
});

module.exports = app;
