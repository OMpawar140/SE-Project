const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const sessionTimeoutMiddleware = require('./middleware/sessionMiddleware');
const sessionRoutes = require('./routes/sessionRoutes');
const sessionLinkRoutes = require('./routes/sessionLinkRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: true,
}));

app.use(sessionTimeoutMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/sessionlink', sessionLinkRoutes);
app.use('/api/student', studentAuthRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));