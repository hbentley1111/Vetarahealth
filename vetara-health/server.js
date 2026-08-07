const path = require('path');
const express = require('express');
const session = require('express-session');

const { initDb } = require('./src/db');
initDb();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'vetara-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

// API routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/pets', require('./src/routes/pets'));
app.use('/api/records', require('./src/routes/records'));
app.use('/api/providers', require('./src/routes/providers'));
app.use('/api/appointments', require('./src/routes/appointments'));
app.use('/api/reminders', require('./src/routes/reminders'));
app.use('/api/insurance', require('./src/routes/insurance'));
app.use('/api/posts', require('./src/routes/posts'));
app.use('/api/slots', require('./src/routes/slots'));
app.use('/api/assistant', require('./src/routes/assistant'));

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => console.log(`Vetara Health running → http://localhost:${PORT}`));
