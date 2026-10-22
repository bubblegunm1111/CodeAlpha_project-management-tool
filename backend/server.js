const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'archival-secret-key-change-in-prod';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5173';

// Setup email transporter (Supports real Gmail/SMTP or Ethereal test inbox)
let mailTransporter = null;
const initMailer = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const liveTransport = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    try {
      await liveTransport.verify();
      mailTransporter = liveTransport;
      console.log(`[Email Service] Live SMTP verified and active for ${process.env.SMTP_USER}`);
      return;
    } catch (authErr) {
      console.warn(`[Email Service Warning] Gmail credentials rejected (${authErr.message}). Switching to Ethereal web mailer so invitation links remain accessible.`);
    }
  }

  // Generate test account so emails can always be inspected live
  try {
    const testAccount = await nodemailer.createTestAccount();
    mailTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`[Email Service] Ethereal test mailer ready. User: ${testAccount.user}`);
  } catch (e) {
    console.log('[Email Service] Offline mail fallback enabled');
  }
};
initMailer();

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
      phase TEXT DEFAULT 'Discovery & Research',
      start_date TEXT,
      end_date TEXT,
      description TEXT,
      assignee_avatar TEXT,
      assignee_role TEXT,
      subtasks TEXT DEFAULT '[]',
      comments TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    // Team Members table
    db.run(`CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT DEFAULT 'Developer',
      avatar TEXT,
      projects TEXT DEFAULT '[]',
      workload INTEGER DEFAULT 50,
      last_active TEXT DEFAULT 'Just now',
      organization_id INTEGER,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Organization Members table (links registered users to organizations they belong to)
    db.run(`CREATE TABLE IF NOT EXISTS organization_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(organization_id, user_id)
    )`);

    // Organization Invitations table (ClickUp style email invites with unique token)
    db.run(`CREATE TABLE IF NOT EXISTS organization_invitations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'Developer',
      projects TEXT DEFAULT '[]',
      token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
      invited_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      accepted_at DATETIME,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    )`);

    // Alter table migrations in case columns were missing in existing DB
    db.run("ALTER TABLE tasks ADD COLUMN color TEXT DEFAULT 'blue'", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN tags TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN progress INTEGER DEFAULT 0", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN subtasks TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN assignees TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN note TEXT", () => {});
    db.run("ALTER TABLE projects ADD COLUMN organization_id INTEGER", () => {});
    db.run("ALTER TABLE projects ADD COLUMN folder_id INTEGER", () => {});
    db.run("ALTER TABLE schedules ADD COLUMN phase TEXT DEFAULT 'Discovery & Research'", () => {});
    db.run("ALTER TABLE schedules ADD COLUMN start_date TEXT", () => {});
    db.run("ALTER TABLE schedules ADD COLUMN end_date TEXT", () => {});
    db.run("ALTER TABLE schedules ADD COLUMN description TEXT", () => {});
    db.run("ALTER TABLE schedules ADD COLUMN assignee_avatar TEXT", () => {});
    db.run("ALTER TABLE schedules ADD COLUMN assignee_role TEXT", () => {});
    db.run("ALTER TABLE schedules ADD COLUMN subtasks TEXT DEFAULT '[]'", () => {});
    db.run("ALTER TABLE team_members ADD COLUMN organization_id INTEGER", () => {});
    db.run("ALTER TABLE team_members ADD COLUMN status TEXT DEFAULT 'active'", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN time_spent INTEGER DEFAULT 0", () => {}); // in seconds
    db.run("ALTER TABLE tasks ADD COLUMN estimated_hours REAL DEFAULT 4.0", () => {}); // realistic target hours
    db.run("ALTER TABLE tasks ADD COLUMN ai_risk_score TEXT DEFAULT 'Low'", () => {}); // 'Low' | 'Medium' | 'High' | 'Overdue'
    db.run("ALTER TABLE tasks ADD COLUMN ai_risk_reason TEXT", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN is_timer_running BOOLEAN DEFAULT 0", () => {});
    db.run("ALTER TABLE tasks ADD COLUMN timer_started_at DATETIME", () => {});
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
        t.assignees = typeof t.assignees === 'string' ? JSON.parse(t.assignees || '[]') : t.assignees;
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

// Create task with custom color, tags, checklist, assignees
app.post('/api/v1/projects/:projectId/tasks', authMiddleware, async (req, res) => {
  try {
    const { column_id, title, description, priority, due_date, color, tags, progress, subtasks, note, assignees } = req.body;

    const result = await runAsync(
      `INSERT INTO tasks (column_id, project_id, title, description, priority, due_date, color, tags, progress, subtasks, note, position, assignees)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        0,
        JSON.stringify(assignees || [])
      ]
    );

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    task.tags = JSON.parse(task.tags || '[]');
    task.subtasks = JSON.parse(task.subtasks || '[]');
    task.assignees = JSON.parse(task.assignees || '[]');
    task.comments = [];
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task (Change card color, title, priority, checklist, assignees, etc.)
app.put('/api/v1/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, due_date, column_id, position, color, tags, progress, subtasks, note, assignees } = req.body;

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
    if (assignees !== undefined) { updates.push('assignees = ?'); params.push(JSON.stringify(assignees)); }
    if (req.body.time_spent !== undefined) { updates.push('time_spent = ?'); params.push(req.body.time_spent); }
    if (req.body.estimated_hours !== undefined) { updates.push('estimated_hours = ?'); params.push(req.body.estimated_hours); }
    if (req.body.ai_risk_score !== undefined) { updates.push('ai_risk_score = ?'); params.push(req.body.ai_risk_score); }
    if (req.body.ai_risk_reason !== undefined) { updates.push('ai_risk_reason = ?'); params.push(req.body.ai_risk_reason); }
    if (req.body.is_timer_running !== undefined) { updates.push('is_timer_running = ?'); params.push(req.body.is_timer_running ? 1 : 0); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    await runAsync(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);

    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    task.tags = JSON.parse(task.tags || '[]');
    task.subtasks = JSON.parse(task.subtasks || '[]');
    task.assignees = JSON.parse(task.assignees || '[]');
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle or sync Task Stopwatch Time Tracker
app.post('/api/v1/tasks/:id/timer', authMiddleware, async (req, res) => {
  try {
    const { action, time_spent } = req.body; // action: 'start' | 'stop' | 'sync' | 'reset'
    const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    let newTimeSpent = time_spent !== undefined ? time_spent : (task.time_spent || 0);
    let isRunning = task.is_timer_running ? 1 : 0;
    let timerStartedAt = task.timer_started_at;

    if (action === 'start') {
      isRunning = 1;
      timerStartedAt = new Date().toISOString();
    } else if (action === 'stop') {
      if (isRunning && timerStartedAt) {
        const elapsedSec = Math.max(0, Math.round((Date.now() - new Date(timerStartedAt).getTime()) / 1000));
        newTimeSpent += elapsedSec;
      }
      isRunning = 0;
      timerStartedAt = null;
    } else if (action === 'reset') {
      newTimeSpent = 0;
      isRunning = 0;
      timerStartedAt = null;
    }

    // Dynamic AI Realistic Deadline & Pacing Risk Calculation
    const estHours = task.estimated_hours || 4.0;
    const spentHours = newTimeSpent / 3600;
    let riskScore = 'Low';
    let riskReason = 'On track based on sprint velocity';

    if (spentHours > estHours) {
      riskScore = 'High';
      riskReason = `Exceeded target estimate by ${(spentHours - estHours).toFixed(1)}h. Pacing indicates scope creep or blockers.`;
    } else if (spentHours > estHours * 0.75 && (task.progress || 0) < 50) {
      riskScore = 'Medium';
      riskReason = `Spent 75% of realistic budget with only ${task.progress}% completion. Risk of deadline slip.`;
    }

    await runAsync(
      `UPDATE tasks SET time_spent = ?, is_timer_running = ?, timer_started_at = ?, ai_risk_score = ?, ai_risk_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newTimeSpent, isRunning, timerStartedAt, riskScore, riskReason, req.params.id]
    );

    const updatedTask = await getAsync('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    updatedTask.tags = JSON.parse(updatedTask.tags || '[]');
    updatedTask.subtasks = JSON.parse(updatedTask.subtasks || '[]');
    updatedTask.assignees = JSON.parse(updatedTask.assignees || '[]');
    res.json(updatedTask);
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
    let schedules = await allAsync('SELECT * FROM schedules ORDER BY date ASC, time ASC');
    
    // Seed default realistic interactive timeline tasks matching reference if empty or missing phases
    if (schedules.length === 0 || !schedules.some(s => s.phase)) {
      const initialSchedule = [
        // Discovery & Research
        {
          project_id: 1,
          title: 'Market research',
          phase: 'Discovery & Research',
          date: '2026-05-05',
          start_date: '2026-05-05',
          end_date: '2026-05-07',
          time: '10:00 AM',
          category: 'Research',
          color: 'purple',
          priority: 'High',
          status: 'In Progress',
          assignee: 'Alex Carter',
          assignee_role: 'Product Manager',
          assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
          description: 'Analyze market trends, competitors, and user needs to inform the product strategy.',
          subtasks: JSON.stringify([
            { id: 'sub-1', text: 'Review industry reports', completed: true },
            { id: 'sub-2', text: 'Analyze competitors', completed: true },
            { id: 'sub-3', text: 'Summarize findings', completed: false }
          ]),
          comments: JSON.stringify([
            { id: 'c-1', author: 'Alex Carter', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', time: 'May 6, 2026, 10:24 AM', content: 'Initial research shows strong demand in the SMB segment. I\'ll share the full report in the dossier.' },
            { id: 'c-2', author: 'Taylor Kim', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop', time: 'May 6, 2026, 2:17 PM', content: 'Great! Let\'s focus on the top 3 competitors for the next step.' },
            { id: 'c-3', author: 'Jordan Lee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', time: 'May 6, 2026, 4:03 PM', content: 'Sounds good. I\'ve added the links to the research folder.' }
          ])
        },
        {
          project_id: 1,
          title: 'User interviews',
          phase: 'Discovery & Research',
          date: '2026-05-05',
          start_date: '2026-05-05',
          end_date: '2026-05-06',
          time: '02:00 PM',
          category: 'Research',
          color: 'purple',
          priority: 'Medium',
          status: 'Scheduled',
          assignee: 'Alex Carter',
          assignee_role: 'Product Manager',
          assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
          description: 'Conduct 5 remote user interviews focusing on workspace archival needs.',
          subtasks: JSON.stringify([]),
          comments: JSON.stringify([])
        },
        {
          project_id: 1,
          title: 'Competitive analysis',
          phase: 'Discovery & Research',
          date: '2026-05-06',
          start_date: '2026-05-06',
          end_date: '2026-05-07',
          time: '04:00 PM',
          category: 'Research',
          color: 'purple',
          priority: 'Medium',
          status: 'Scheduled',
          assignee: 'Taylor Kim',
          assignee_role: 'UX Researcher',
          assignee_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
          description: 'Matrix comparison of competitive filing and calendar timeline interfaces.',
          subtasks: JSON.stringify([]),
          comments: JSON.stringify([])
        },

        // Design & Planning
        {
          project_id: 1,
          title: 'Create wireframes',
          phase: 'Design & Planning',
          date: '2026-05-07',
          start_date: '2026-05-07',
          end_date: '2026-05-09',
          time: '11:00 AM',
          category: 'Wireframes',
          color: 'peach',
          priority: 'High',
          status: 'In Progress',
          assignee: 'Taylor Kim',
          assignee_role: 'Lead Product Designer',
          assignee_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
          description: 'Wireframe user flows, timeline navigation grids, and task detail inspect drawers.',
          subtasks: JSON.stringify([
            { id: 'sub-w1', text: 'Low-fi layout sketches', completed: true },
            { id: 'sub-w2', text: 'High-fi desktop & drawer screens', completed: true }
          ]),
          comments: JSON.stringify([])
        },
        {
          project_id: 1,
          title: 'Design system',
          phase: 'Design & Planning',
          date: '2026-05-08',
          start_date: '2026-05-08',
          end_date: '2026-05-10',
          time: '01:30 PM',
          category: 'Sprint',
          color: 'peach',
          priority: 'Medium',
          status: 'Scheduled',
          assignee: 'Taylor Kim',
          assignee_role: 'Lead Product Designer',
          assignee_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
          description: 'Parchment and charcoal color swatches, button states, and badge styling.',
          subtasks: JSON.stringify([]),
          comments: JSON.stringify([])
        },
        {
          project_id: 1,
          title: 'Prototype',
          phase: 'Design & Planning',
          date: '2026-05-09',
          start_date: '2026-05-09',
          end_date: '2026-05-10',
          time: '03:00 PM',
          category: 'Sprint',
          color: 'peach',
          priority: 'Medium',
          status: 'Scheduled',
          assignee: 'Alex Carter',
          assignee_role: 'Product Manager',
          assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
          description: 'Clickable interactive walkthrough prototype for client signoff.',
          subtasks: JSON.stringify([]),
          comments: JSON.stringify([])
        },

        // Development
        {
          project_id: 1,
          title: 'Frontend development',
          phase: 'Development',
          date: '2026-05-09',
          start_date: '2026-05-09',
          end_date: '2026-05-12',
          time: '09:00 AM',
          category: 'Development',
          color: 'mint',
          priority: 'Urgent',
          status: 'In Progress',
          assignee: 'Jordan Lee',
          assignee_role: 'Frontend Engineer',
          assignee_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
          description: 'Construct the Gantt timeline layout, connected connector lines, and inspect drawer state.',
          subtasks: JSON.stringify([
            { id: 'sub-f1', text: '7-day date grid', completed: true },
            { id: 'sub-f2', text: 'Horizontal timeline bar offsets', completed: true }
          ]),
          comments: JSON.stringify([])
        },
        {
          project_id: 1,
          title: 'Backend development',
          phase: 'Development',
          date: '2026-05-09',
          start_date: '2026-05-09',
          end_date: '2026-05-11',
          time: '11:00 AM',
          category: 'Sprint',
          color: 'mint',
          priority: 'High',
          status: 'In Progress',
          assignee: 'Jordan Lee',
          assignee_role: 'Fullstack Engineer',
          assignee_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
          description: 'REST API endpoints for tasks, subtasks toggle, comments stream, and sqlite persistence.',
          subtasks: JSON.stringify([]),
          comments: JSON.stringify([])
        },
        {
          project_id: 1,
          title: 'API integration',
          phase: 'Development',
          date: '2026-05-10',
          start_date: '2026-05-10',
          end_date: '2026-05-11',
          time: '02:00 PM',
          category: 'Sprint',
          color: 'mint',
          priority: 'Medium',
          status: 'Scheduled',
          assignee: 'Jordan Lee',
          assignee_role: 'Frontend Engineer',
          assignee_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
          description: 'Hook frontend Schedule tab directly with live Express endpoints.',
          subtasks: JSON.stringify([]),
          comments: JSON.stringify([])
        },

        // Review & QA
        {
          project_id: 1,
          title: 'Testing',
          phase: 'Review & QA',
          date: '2026-05-11',
          start_date: '2026-05-11',
          end_date: '2026-05-12',
          time: '10:00 AM',
          category: 'Review',
          color: 'blue',
          priority: 'High',
          status: 'Scheduled',
          assignee: 'Taylor Kim',
          assignee_role: 'QA Engineer',
          assignee_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
          description: 'End-to-end user testing across date spans, checklists, and responsiveness.',
          subtasks: JSON.stringify([]),
          comments: JSON.stringify([])
        },
        {
          project_id: 1,
          title: 'Client review',
          phase: 'Review & QA',
          date: '2026-05-11',
          start_date: '2026-05-11',
          end_date: '2026-05-12',
          time: '01:00 PM',
          category: 'Review',
          color: 'blue',
          priority: 'High',
          status: 'Scheduled',
          assignee: 'Alex Carter',
          assignee_role: 'Product Manager',
          assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
          description: 'Walkthrough demonstration with stakeholder steering committee.',
          subtasks: JSON.stringify([]),
          comments: JSON.stringify([])
        },
        {
          project_id: 1,
          title: 'Fixes',
          phase: 'Review & QA',
          date: '2026-05-11',
          start_date: '2026-05-11',
          end_date: '2026-05-12',
          time: '04:00 PM',
          category: 'Review',
          color: 'blue',
          priority: 'Medium',
          status: 'Scheduled',
          assignee: 'Jordan Lee',
          assignee_role: 'Frontend Engineer',
          assignee_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
          description: 'Address any styling refinements or bug fixes identified during testing.',
          subtasks: JSON.stringify([]),
          comments: JSON.stringify([])
        },

        // Launch
        {
          project_id: 1,
          title: 'Deploy to production',
          phase: 'Launch',
          date: '2026-05-11',
          start_date: '2026-05-11',
          end_date: '2026-05-12',
          time: '09:00 AM',
          category: 'Launch',
          color: 'purple',
          priority: 'Urgent',
          status: 'Scheduled',
          assignee: 'Alex Carter',
          assignee_role: 'Product Manager',
          assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
          description: 'Execute deployment pipeline and archive release documentation.',
          subtasks: JSON.stringify([]),
          comments: JSON.stringify([])
        },
        {
          project_id: 1,
          title: 'Monitor & support',
          phase: 'Launch',
          date: '2026-05-11',
          start_date: '2026-05-11',
          end_date: '2026-05-12',
          time: '02:00 PM',
          category: 'Launch',
          color: 'purple',
          priority: 'Medium',
          status: 'Scheduled',
          assignee: 'Jordan Lee',
          assignee_role: 'Lead Engineer',
          assignee_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
          description: 'Live telemetry and telemetry monitor post-launch.',
          subtasks: JSON.stringify([]),
          comments: JSON.stringify([])
        }
      ];

      for (let s of initialSchedule) {
        await runAsync(
          `INSERT INTO schedules 
          (project_id, title, phase, date, start_date, end_date, time, category, color, priority, status, assignee, assignee_role, assignee_avatar, description, subtasks, comments)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.project_id, s.title, s.phase, s.date, s.start_date, s.end_date, s.time,
            s.category, s.color, s.priority, s.status, s.assignee, s.assignee_role,
            s.assignee_avatar, s.description, s.subtasks, s.comments
          ]
        );
      }

      schedules = await allAsync('SELECT * FROM schedules ORDER BY date ASC, time ASC');
    }

    const formatted = schedules.map(s => ({
      ...s,
      subtasks: JSON.parse(s.subtasks || '[]'),
      comments: JSON.parse(s.comments || '[]')
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/schedules', authMiddleware, async (req, res) => {
  try {
    const {
      title, date, time, category, color, priority, assignee, status, project_id,
      phase, start_date, end_date, description, assignee_avatar, assignee_role,
      subtasks, comments
    } = req.body;

    const result = await runAsync(
      `INSERT INTO schedules 
      (project_id, title, date, time, category, color, priority, assignee, status, phase, start_date, end_date, description, assignee_avatar, assignee_role, subtasks, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id || 1,
        title,
        date || start_date || '2026-05-08',
        time || '10:00 AM',
        category || 'Sprint',
        color || 'blue',
        priority || 'Medium',
        assignee || 'Team',
        status || 'Scheduled',
        phase || 'Design & Planning',
        start_date || date || '2026-05-08',
        end_date || date || '2026-05-10',
        description || '',
        assignee_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
        assignee_role || 'Contributor',
        JSON.stringify(subtasks || []),
        JSON.stringify(comments || [])
      ]
    );

    const event = await getAsync('SELECT * FROM schedules WHERE id = ?', [result.lastID]);
    event.subtasks = JSON.parse(event.subtasks || '[]');
    event.comments = JSON.parse(event.comments || '[]');
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/v1/schedules/:id', authMiddleware, async (req, res) => {
  try {
    const {
      title, date, time, category, color, priority, assignee, status,
      phase, start_date, end_date, description, assignee_avatar, assignee_role,
      subtasks, comments
    } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (date !== undefined) { updates.push('date = ?'); params.push(date); }
    if (time !== undefined) { updates.push('time = ?'); params.push(time); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }
    if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
    if (assignee !== undefined) { updates.push('assignee = ?'); params.push(assignee); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (phase !== undefined) { updates.push('phase = ?'); params.push(phase); }
    if (start_date !== undefined) { updates.push('start_date = ?'); params.push(start_date); }
    if (end_date !== undefined) { updates.push('end_date = ?'); params.push(end_date); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (assignee_avatar !== undefined) { updates.push('assignee_avatar = ?'); params.push(assignee_avatar); }
    if (assignee_role !== undefined) { updates.push('assignee_role = ?'); params.push(assignee_role); }
    if (subtasks !== undefined) { updates.push('subtasks = ?'); params.push(JSON.stringify(subtasks)); }
    if (comments !== undefined) { updates.push('comments = ?'); params.push(JSON.stringify(comments)); }

    if (updates.length > 0) {
      params.push(req.params.id);
      await runAsync(`UPDATE schedules SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const event = await getAsync('SELECT * FROM schedules WHERE id = ?', [req.params.id]);
    if (!event) return res.status(404).json({ error: 'Schedule item not found' });
    event.subtasks = JSON.parse(event.subtasks || '[]');
    event.comments = JSON.parse(event.comments || '[]');
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/schedules/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content, author, avatar } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment content is required' });

    const event = await getAsync('SELECT * FROM schedules WHERE id = ?', [req.params.id]);
    if (!event) return res.status(404).json({ error: 'Schedule item not found' });

    const comments = JSON.parse(event.comments || '[]');
    const newComment = {
      id: 'c-' + Date.now(),
      author: author || 'Current User',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
      time: 'Just now',
      content
    };
    comments.push(newComment);

    await runAsync('UPDATE schedules SET comments = ? WHERE id = ?', [JSON.stringify(comments), req.params.id]);
    res.json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TEAM MEMBERS ENDPOINTS ============

app.get('/api/v1/team-members', authMiddleware, async (req, res) => {
  try {
    let members = await allAsync('SELECT * FROM team_members ORDER BY id ASC');

    if (members.length === 0) {
      const initialTeam = [
        {
          name: 'Emma Carter',
          email: 'emma@archivalpm.com',
          role: 'Product Owner',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
          projects: JSON.stringify(['Acme Digital Revamp', 'CRM Platform']),
          workload: 80,
          last_active: '2h ago'
        },
        {
          name: 'Liam Johnson',
          email: 'liam@archivalpm.com',
          role: 'Developer',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
          projects: JSON.stringify(['Web Platform', 'Mobile App']),
          workload: 60,
          last_active: '4h ago'
        },
        {
          name: 'Olivia Martinez',
          email: 'olivia@archivalpm.com',
          role: 'Designer',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
          projects: JSON.stringify(['Acme Digital Revamp', 'Brand Refresh']),
          workload: 45,
          last_active: '1h ago'
        },
        {
          name: 'Noah Wilson',
          email: 'noah@archivalpm.com',
          role: 'Developer',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
          projects: JSON.stringify(['Web Platform', 'API Integration']),
          workload: 70,
          last_active: '3h ago'
        },
        {
          name: 'Sophia Lee',
          email: 'sophia@archivalpm.com',
          role: 'QA Engineer',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
          projects: JSON.stringify(['CRM Platform', 'Mobile App']),
          workload: 50,
          last_active: '5h ago'
        },
        {
          name: 'Daniel Kim',
          email: 'daniel@archivalpm.com',
          role: 'Backend Engineer',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop',
          projects: JSON.stringify(['API Integration', 'Web Platform']),
          workload: 75,
          last_active: '2h ago'
        },
        {
          name: 'Ava Thompson',
          email: 'ava@archivalpm.com',
          role: 'Project Manager',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop',
          projects: JSON.stringify(['Acme Digital Revamp', 'Brand Refresh']),
          workload: 55,
          last_active: '6h ago'
        },
        {
          name: 'Ethan Davis',
          email: 'ethan@archivalpm.com',
          role: 'Frontend Engineer',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop',
          projects: JSON.stringify(['Mobile App', 'CRM Platform']),
          workload: 65,
          last_active: '1h ago'
        }
      ];

      for (let m of initialTeam) {
        await runAsync(
          'INSERT INTO team_members (name, email, role, avatar, projects, workload, last_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [m.name, m.email, m.role, m.avatar, m.projects, m.workload, m.last_active]
        );
      }

      members = await allAsync('SELECT * FROM team_members ORDER BY id ASC');
    }

    const formatted = members.map(m => ({
      ...m,
      projects: JSON.parse(m.projects || '[]')
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/team-members', authMiddleware, async (req, res) => {
  try {
    const { name, email, role, avatar, projects, workload, last_active } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const result = await runAsync(
      'INSERT INTO team_members (name, email, role, avatar, projects, workload, last_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        email,
        role || 'Developer',
        avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
        JSON.stringify(projects || ['Acme Digital Revamp']),
        workload !== undefined ? workload : 50,
        last_active || 'Just now'
      ]
    );

    const member = await getAsync('SELECT * FROM team_members WHERE id = ?', [result.lastID]);
    member.projects = JSON.parse(member.projects || '[]');
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/v1/team-members/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, role, avatar, projects, workload, last_active } = req.body;
    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email); }
    if (role !== undefined) { updates.push('role = ?'); params.push(role); }
    if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
    if (projects !== undefined) { updates.push('projects = ?'); params.push(JSON.stringify(projects)); }
    if (workload !== undefined) { updates.push('workload = ?'); params.push(workload); }
    if (last_active !== undefined) { updates.push('last_active = ?'); params.push(last_active); }

    if (updates.length > 0) {
      params.push(req.params.id);
      await runAsync(`UPDATE team_members SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const member = await getAsync('SELECT * FROM team_members WHERE id = ?', [req.params.id]);
    if (!member) return res.status(404).json({ error: 'Team member not found' });
    member.projects = JSON.parse(member.projects || '[]');
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/v1/team-members/:id', authMiddleware, async (req, res) => {
  try {
    await runAsync('DELETE FROM team_members WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ INVITATION & EMAIL ONBOARDING ENDPOINTS (ClickUp Style) ============

// 1. Send invite to a team member by work email
app.post('/api/v1/organizations/:orgId/invites', authMiddleware, async (req, res) => {
  try {
    const { email, name, role, projects } = req.body;
    const orgId = req.params.orgId;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const org = await getAsync('SELECT * FROM organizations WHERE id = ?', [orgId]);
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Generate unique ClickUp-style secure token
    const token = 'inv_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

    // Save invitation record
    const result = await runAsync(
      `INSERT INTO organization_invitations (organization_id, email, name, role, projects, token, status, invited_by)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        orgId,
        email.trim().toLowerCase(),
        name || email.split('@')[0],
        role || 'Developer',
        JSON.stringify(projects || ['Acme Digital Revamp']),
        token,
        req.userId
      ]
    );

    // Also register or update in team_members as "Pending Invite"
    const existingMember = await getAsync('SELECT id FROM team_members WHERE email = ?', [email.trim().toLowerCase()]);
    if (!existingMember) {
      await runAsync(
        `INSERT INTO team_members (name, email, role, avatar, projects, workload, last_active, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name || email.split('@')[0],
          email.trim().toLowerCase(),
          role || 'Developer',
          `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=80&h=80&fit=crop`,
          JSON.stringify(projects || ['Acme Digital Revamp']),
          40,
          'Invite pending',
          'pending'
        ]
      );
    }

    const invitation = await getAsync('SELECT * FROM organization_invitations WHERE id = ?', [result.lastID]);
    invitation.projects = JSON.parse(invitation.projects || '[]');
    invitation.organization_name = org.name;
    
    // Dynamic link (supports local or Vercel production deployment)
    const clientBaseUrl = req.headers.origin || APP_BASE_URL || 'http://localhost:5173';
    const inviteUrl = `${clientBaseUrl}/?invite=${token}`;
    invitation.invite_url = inviteUrl;

    // Send Real Email via nodemailer
    let emailSent = false;
    let emailPreviewUrl = null;
    let emailError = null;

    if (mailTransporter) {
      try {
        const fromAddress = process.env.SMTP_USER || 'shahdhosni144@gmail.com';
        const mailOptions = {
          from: `"Archival PM" <${fromAddress}>`,
          to: email.trim().toLowerCase(),
          replyTo: fromAddress,
          subject: `Invitation to collaborate on ${org.name}`,
          text: `Hi ${name || 'there'},\n\nYou have been invited to collaborate with ${org.name} on Archival PM.\n\nTo accept this invitation and access your projects, please visit:\n${inviteUrl}\n\nThank you,\n${org.name} Team`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Workspace Invitation</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d241e;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 40px 15px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2dacd; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background-color: #f2ede4; padding: 18px 28px; border-bottom: 1px solid #e2dacd;">
                          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="font-size: 13px; font-weight: 700; color: #6b5c4d; letter-spacing: 0.5px;">
                                ARCHIVAL PM WORKSPACE
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 36px 32px;">
                          <h1 style="font-size: 22px; line-height: 1.3; font-weight: 800; color: #221a14; margin: 0 0 16px 0;">
                            Join ${org.name}
                          </h1>
                          <p style="font-size: 15px; line-height: 1.6; color: #4a3e35; margin: 0 0 20px 0;">
                            Hello ${name || ''},<br/><br/>
                            You've been invited as <strong>${role || 'Team Member'}</strong> to collaborate on schedules, task boards, and project dossiers in the <strong>${org.name}</strong> workspace.
                          </p>
                          <div style="margin: 28px 0; text-align: left;">
                            <a href="${inviteUrl}" target="_blank" style="display: inline-block; background-color: #2b231d; color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.2px;">
                              Accept Invitation &rarr;
                            </a>
                          </div>
                          <p style="font-size: 13px; line-height: 1.5; color: #706356; margin: 24px 0 0 0; padding-top: 20px; border-top: 1px solid #f0e9df;">
                            If you're having trouble clicking the button, copy and paste this link into your web browser:<br/>
                            <a href="${inviteUrl}" style="color: #6366f1; word-break: break-all; font-size: 12px;">${inviteUrl}</a>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #faf8f5; padding: 16px 32px; border-top: 1px solid #f0e9df; font-size: 12px; color: #8e8072; text-align: center;">
                          Sent via Archival PM Workspace for ${org.name}.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        };

        const info = await mailTransporter.sendMail(mailOptions);
        emailSent = true;
        emailPreviewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[Email Sent] Message ID: ${info.messageId} to ${email}`);
        if (emailPreviewUrl) {
          console.log(`[Email Preview URL]: ${emailPreviewUrl}`);
        }
      } catch (err) {
        console.error('[Email Dispatch Error]', err);
        emailError = err.message;
      }
    }

    invitation.email_sent = emailSent;
    invitation.email_preview_url = emailPreviewUrl;
    invitation.email_error = emailError;

    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get pending invites for an organization
app.get('/api/v1/organizations/:orgId/invites', authMiddleware, async (req, res) => {
  try {
    const invites = await allAsync(
      'SELECT * FROM organization_invitations WHERE organization_id = ? ORDER BY created_at DESC',
      [req.params.orgId]
    );
    const formatted = invites.map(i => ({
      ...i,
      projects: JSON.parse(i.projects || '[]')
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Inspect invitation details by token (public endpoint for invited user opening email link)
app.get('/api/v1/invites/:token', async (req, res) => {
  try {
    const invite = await getAsync(`
      SELECT i.*, o.name as organization_name, o.description as organization_description
      FROM organization_invitations i
      JOIN organizations o ON i.organization_id = o.id
      WHERE i.token = ?
    `, [req.params.token]);

    if (!invite) {
      return res.status(404).json({ error: 'Invitation link is invalid or expired' });
    }

    invite.projects = JSON.parse(invite.projects || '[]');
    res.json(invite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Accept invitation (creates or attaches user account and joins them to the organization workspace)
app.post('/api/v1/invites/:token/accept', async (req, res) => {
  try {
    const { name, password } = req.body;
    const invite = await getAsync('SELECT * FROM organization_invitations WHERE token = ?', [req.params.token]);

    if (!invite) {
      return res.status(404).json({ error: 'Invitation not found or expired' });
    }

    if (invite.status === 'accepted') {
      return res.status(400).json({ error: 'This invitation has already been accepted' });
    }

    // Find or create user with the invited email
    let user = await getAsync('SELECT * FROM users WHERE email = ?', [invite.email.toLowerCase()]);
    if (!user) {
      const hashedPassword = await bcrypt.hash(password || 'password123', 10);
      const userRes = await runAsync(
        'INSERT INTO users (email, name, password, avatar_url) VALUES (?, ?, ?, ?)',
        [
          invite.email.toLowerCase(),
          name || invite.name || invite.email.split('@')[0],
          hashedPassword,
          `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=80&h=80&fit=crop`
        ]
      );
      user = await getAsync('SELECT id, email, name, avatar_url FROM users WHERE id = ?', [userRes.lastID]);
    }

    // Add user to organization_members
    await runAsync(
      'INSERT OR IGNORE INTO organization_members (organization_id, user_id, role) VALUES (?, ?, ?)',
      [invite.organization_id, user.id, invite.role || 'member']
    );

    // Update invitation status
    await runAsync(
      `UPDATE organization_invitations 
       SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [invite.id]
    );

    // Update team_members directory status to active
    await runAsync(
      `UPDATE team_members 
       SET status = 'active', last_active = 'Just now', name = ?
       WHERE email = ?`,
      [user.name, user.email]
    );

    // Fetch the organization details so the user enters straight into it
    const org = await getAsync('SELECT * FROM organizations WHERE id = ?', [invite.organization_id]);
    org.folders = await allAsync('SELECT * FROM folders WHERE organization_id = ? ORDER BY id ASC', [org.id]);

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      message: `Welcome to ${org.name}!`,
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
      token,
      organization: org
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Archival Backend API listening on http://localhost:${PORT}`);
});

module.exports = app;
