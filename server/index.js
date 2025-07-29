const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./downtime.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    team_name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Channels table
  db.run(`CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
  )`);

  // Downtime records table
  db.run(`CREATE TABLE IF NOT EXISTS downtime_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    downtime_type TEXT NOT NULL CHECK(downtime_type IN ('scheduled', 'unscheduled')),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES channels (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Insert default channels
  const defaultChannels = [
    'ATM Switch', 'Credit Card Switch', 'UPI Switch', 'IMPS', 
    'Mobile Banking', 'Internet Banking', 'BBPS', 'IOB-Pay', 
    'AePS', 'Fastag', 'RTGS/NEFT'
  ];

  defaultChannels.forEach(channel => {
    db.run('INSERT OR IGNORE INTO channels (name) VALUES (?)', [channel]);
  });

  // Insert default admin user
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run('INSERT OR IGNORE INTO users (username, password, team_name, role) VALUES (?, ?, ?, ?)', 
    ['admin', adminPassword, 'System Admin', 'admin']);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, team_name: user.team_name, role: user.role } });
  });
});

// Get channels
app.get('/api/channels', authenticateToken, (req, res) => {
  db.all('SELECT * FROM channels ORDER BY name', (err, channels) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(channels);
  });
});

// Add downtime record
app.post('/api/downtime', authenticateToken, (req, res) => {
  const { channel_id, downtime_type, start_time, end_time, duration_minutes, reason } = req.body;
  const user_id = req.user.id;

  db.run(
    'INSERT INTO downtime_records (channel_id, user_id, downtime_type, start_time, end_time, duration_minutes, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [channel_id, user_id, downtime_type, start_time, end_time, duration_minutes, reason],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Downtime record added successfully' });
    }
  );
});

// Get downtime records for reporting
app.get('/api/downtime/report', authenticateToken, (req, res) => {
  const { start_date, end_date } = req.query;
  
  const query = `
    SELECT 
      c.name as channel_name,
      c.id as channel_id,
      SUM(CASE WHEN dr.downtime_type = 'scheduled' THEN dr.duration_minutes ELSE 0 END) as scheduled_downtime,
      SUM(CASE WHEN dr.downtime_type = 'unscheduled' THEN dr.duration_minutes ELSE 0 END) as unscheduled_downtime,
      COUNT(CASE WHEN dr.downtime_type = 'scheduled' THEN 1 END) as scheduled_count,
      COUNT(CASE WHEN dr.downtime_type = 'unscheduled' THEN 1 END) as unscheduled_count
    FROM channels c
    LEFT JOIN downtime_records dr ON c.id = dr.channel_id
    WHERE (dr.start_time IS NULL OR (dr.start_time >= ? AND dr.start_time <= ?))
    GROUP BY c.id, c.name
    ORDER BY c.name
  `;

  db.all(query, [start_date, end_date], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get detailed downtime records
app.get('/api/downtime', authenticateToken, (req, res) => {
  const { start_date, end_date, channel_id } = req.query;
  
  let query = `
    SELECT 
      dr.*,
      c.name as channel_name,
      u.username as recorded_by
    FROM downtime_records dr
    JOIN channels c ON dr.channel_id = c.id
    JOIN users u ON dr.user_id = u.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (start_date && end_date) {
    query += ' AND dr.start_time >= ? AND dr.start_time <= ?';
    params.push(start_date, end_date);
  }
  
  if (channel_id) {
    query += ' AND dr.channel_id = ?';
    params.push(channel_id);
  }
  
  query += ' ORDER BY dr.start_time DESC';

  db.all(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Get users (admin only)
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.all('SELECT id, username, team_name, role, created_at FROM users ORDER BY created_at', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

// Add user (admin only)
app.post('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { username, password, team_name, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    'INSERT INTO users (username, password, team_name, role) VALUES (?, ?, ?, ?)',
    [username, hashedPassword, team_name, role || 'user'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'User created successfully' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});