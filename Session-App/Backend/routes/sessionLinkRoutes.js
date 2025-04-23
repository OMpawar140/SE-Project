const express = require('express');
const db = require('../config');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

//this route will check the link of the session and return the session details if it is authorized
// This route checks if the session link is valid and authorized
router.get('/public/:session_link' ,async (req, res) => {
    const sessionLink = req.params.session_link;
  
    try {
      const [rows] = await db.promise().query(`
        SELECT session_id, topic, topic_details, date_time, status, authorized
        FROM sessions_table
        WHERE session_link = ?
      `, [sessionLink]);
  
      if (rows.length === 0 || !rows[0].authorized) {
        return res.status(404).json({ error: 'Session not found or unauthorized' });
      }
  
      res.json(rows[0]);
    } catch (err) {
      console.error('Error checking session link:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  module.exports = router;
  