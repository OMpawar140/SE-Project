// routes/session.js
const express = require('express');
const router = express.Router();
const db = require('../config'); 
const authMiddleware = require('../middleware/authMiddleware');
// Get session details by ID


router.get('/id/:session_id',async (req, res) => {
  const { session_id } = req.params;

  try {
    const [rows] = await db.promise().execute('SELECT * FROM sessions_table WHERE session_id = ?', [session_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching session by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:session_id/registered-users' ,async (req, res) => {
    const { session_id } = req.params;
  
    try {
      const [rows] = await db.promise().execute(`
        SELECT u.email
        FROM session_registration sr
        JOIN users u ON sr.user_id = u.id
        WHERE sr.session_id = ?
      `, [session_id]);
  
      res.json(rows);
    } catch (err) {
      console.error('Error fetching registered users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;