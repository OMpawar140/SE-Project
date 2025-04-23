const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const protectedRoutes = require('./routes/protectedRoutes');
const sessionTimeoutMiddleware = require('./middleware/sessionMiddleware');
const sessionLinkRoutes = require('./routes/sessionLinkRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();

app.use(cors({ origin: 'http://localhost:5174', credentials: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: true,
}));

app.use(sessionTimeoutMiddleware);

app.use('/api/protected', protectedRoutes);
app.use('/api/sessionlink', sessionLinkRoutes);
app.use('/api/student', studentAuthRoutes);
app.use('/api/session', sessionRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));