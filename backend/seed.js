const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./app.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const initializeTables = async () => {
  try {
    db.run('PRAGMA foreign_keys = ON');

    // Create tables if they don't exist
    await runAsync(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await runAsync(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER NOT NULL,
      is_private BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await runAsync(`CREATE TABLE IF NOT EXISTS project_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(project_id, user_id)
    )`);

    await runAsync(`CREATE TABLE IF NOT EXISTS board_columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    await runAsync(`CREATE TABLE IF NOT EXISTS tasks (
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

    await runAsync(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    console.log('✓ Database tables created');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    // Initialize tables first
    await initializeTables();

    // Create demo user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const userId = await runAsync(
      'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
      ['demo@example.com', 'Demo User', hashedPassword]
    );
    console.log('✓ Created demo user');

    // Create demo project
    const projectId = await runAsync(
      'INSERT INTO projects (title, description, owner_id) VALUES (?, ?, ?)',
      ['My First Project', 'A sample project to get started', userId]
    );
    console.log('✓ Created demo project');

    // Add user as project member
    await runAsync(
      'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
      [projectId, userId, 'admin']
    );
    console.log('✓ Added user as project member');

    // Create columns
    const columns = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'In Review', position: 2 },
      { title: 'Done', position: 3 }
    ];

    for (const col of columns) {
      const columnId = await runAsync(
        'INSERT INTO board_columns (project_id, title, position) VALUES (?, ?, ?)',
        [projectId, col.title, col.position]
      );
      console.log(`✓ Created column "${col.title}"`);

      if (col.title === 'To Do') {
        const tasks = [
          { title: 'Design homepage mockups', priority: 'high' },
          { title: 'Set up project repository', priority: 'medium' },
          { title: 'Create API documentation', priority: 'medium' },
        ];

        for (let i = 0; i < tasks.length; i++) {
          const taskId = await runAsync(
            'INSERT INTO tasks (column_id, project_id, title, priority, position) VALUES (?, ?, ?, ?, ?)',
            [columnId, projectId, tasks[i].title, tasks[i].priority, i]
          );

          // Add sample comment
          await runAsync(
            'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
            [taskId, userId, 'Great start! Let\'s review this tomorrow.']
          );
        }
        console.log(`✓ Created ${tasks.length} sample tasks with comments`);
      } else if (col.title === 'In Progress') {
        const taskId = await runAsync(
          'INSERT INTO tasks (column_id, project_id, title, priority, assigned_to, position) VALUES (?, ?, ?, ?, ?, ?)',
          [columnId, projectId, 'Implement authentication', 'urgent', userId, 0]
        );
        console.log('✓ Created task "Implement authentication"');
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nYou can now login with:');
    console.log('  Email: demo@example.com');
    console.log('  Password: password123\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
};

seedDatabase();
