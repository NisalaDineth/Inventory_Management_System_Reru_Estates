const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite connection (persistent file)
const dbPath = './inventory.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  )`);

  // Insert initial data
  const insertUsers = db.prepare(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`);
  insertUsers.run('admin', 'admin123', 'owner');
  insertUsers.run('staff1', 'staff123', 'staff');
  insertUsers.run('customer1', 'customer123', 'customer');
  insertUsers.finalize();

  const insertInventory = db.prepare(`INSERT OR IGNORE INTO inventory (name, quantity, price) VALUES (?, ?, ?)`);
  insertInventory.run('Laptop', 15, 999.99);
  insertInventory.run('Mouse', 42, 19.99);
  insertInventory.run('Keyboard', 25, 49.99);
  insertInventory.finalize();
});

// User routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(
    'SELECT id, username, role FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      res.json({ 
        id: row.id,
        username: row.username,
        role: row.role,
        token: 'dummy-token'
      });
    }
  );
});

// Role-based middleware
function checkRole(role) {
  return (req, res, next) => {
    const userRole = req.headers['x-role'];
    if (userRole !== role) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

// Owner routes
app.get('/api/admin/inventory', checkRole('owner'), (req, res) => {
  db.all('SELECT * FROM inventory', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Staff routes
app.get('/api/staff/inventory', checkRole('staff'), (req, res) => {
  db.all('SELECT id, name, quantity FROM inventory', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Customer routes
app.get('/api/customer/inventory', checkRole('customer'), (req, res) => {
  db.all('SELECT id, name, price FROM inventory WHERE quantity > 0', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Inventory Management System API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
