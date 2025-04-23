const express = require('express');
const db = require('../config');
const authMiddleware = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

//create session
// This route creates a new session for the teacher
router.post('/create', authMiddleware, (req, res) => {
  const { topic, topic_details, date_time } = req.body;
  const teacher_id = req.session.user.id;
  const joining_key = Math.random().toString(36).slice(2, 8);
  const session_link = uuidv4();

  if (!topic || !date_time || !teacher_id) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  // Step 1: Insert the session
  const insertQuery = `
    INSERT INTO sessions_table (
      topic, topic_details, teacher_id,
      session_link, joining_key, date_time
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [
    topic,
    topic_details,
    teacher_id,
    session_link,
    joining_key,
    date_time
  ], (err) => {
    if (err) {
      console.error('Error creating session:', err);
      return res.status(500).json({ error: 'Server error while inserting session' });
    }

    // Step 2: Retrieve session_id using session_link
    const getSessionIdQuery = `SELECT session_id FROM sessions_table WHERE session_link = ?`;

    db.query(getSessionIdQuery, [session_link], (selectErr, selectResults) => {
      if (selectErr || selectResults.length === 0) {
        console.error('Error fetching session_id:', selectErr);
        return res.status(500).json({ error: 'Could not fetch session_id' });
      }

      const session_id = selectResults[0].session_id;

      const registerQuery = `
        INSERT INTO session_registration (user_id, session_id)
        VALUES (?, ?)
      `;

      db.query(registerQuery, [teacher_id, session_id], (regErr) => {
        if (regErr) {
          console.error('Error registering teacher to session:', regErr);
          return res.status(500).json({ error: 'Session created, but registration failed' });
        }

        res.status(201).json({
          message: 'Session created and teacher registered',
          session_link,
          joining_key
        });
      });
    });
  });
});



//get all sessions of a teacher
// This route fetches all sessions created by the teacher
router.get('/mysessions', authMiddleware , (req, res) => {
  // if (!req.session || !req.session.user) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  
  const teacherId = req.session.user.id;

  const query = `
    SELECT s.session_id, s.topic, s.date_time, s.session_link, s.status, s.joining_key ,u.email AS teacher_email
    FROM sessions_table s
    JOIN users u ON s.teacher_id = u.id
    WHERE s.teacher_id = ?
    ORDER BY s.date_time DESC
  `;

  db.query(query, [teacherId], (err, rows) => {
    if (err) {
      console.error('Error fetching sessions:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(rows);
  });
});

module.exports = router;