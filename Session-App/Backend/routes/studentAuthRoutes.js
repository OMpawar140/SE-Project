const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config');
const nodemailer = require('nodemailer');

const router = express.Router();

// Setup NodeMailer
const transporter = nodemailer.createTransport({
  host: "students.coredecimal.com",
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// Check if user exists and session is authorized
// This route checks if the user exists and if the session is authorized for joining
router.post('/check-user', async (req, res) => {
    const { email, joiningKey, session_link } = req.body;
  
    if (!email || !joiningKey || !session_link) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      // Check if session exists and is authorized
      const [sessionRows] = await db.promise().query(
        `SELECT session_id, joining_key, authorized FROM sessions_table WHERE session_link = ?`,
        [session_link]
      );
  
      if (sessionRows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }
  
      const session = sessionRows[0];
  
      if (!session.authorized) {
        return res.status(403).json({ error: 'Session is not authorized for joining' });
      }
  
      if (session.joining_key !== joiningKey) {
        return res.status(401).json({ error: 'Invalid joining key' });
      }
  
      // Check if user exists
      const [userRows] = await db.promise().query(
        `SELECT id FROM users WHERE email = ?`,
        [email]
      );
  
      const userExists = userRows.length > 0 ? "user exists" : "user does not exist";
  
      res.json({ exists: userExists });
  
    } catch (err) {
      console.error('Error in /check-user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  const userRole = "Student";

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    db.query('INSERT INTO users (name, email, password, otp , userRole) VALUES (?, ?, ?, ? ,?)',
      [name, email, hashedPassword, otp ,userRole], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your OTP for Signup',
          text: `Your OTP is: ${otp}`
        });

        res.json({ message: 'Signup successful. OTP sent to email.' });
      });
  });
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid password' });

    const otp = generateOTP();
    db.query('UPDATE users SET otp = ? WHERE email = ?', [otp, email], (err) => {
      if (err) return res.status(500).json({ error: err });

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Login',
        text: `Your OTP is: ${otp}`
      });

      res.json({ message: 'OTP sent to email' });
    });
  });
});

// Check if user is already registered for the session
// This route checks if the user is already registered for the session , else register them
router.post('/register-to-session', async (req, res) => {
    const {email , joining_key, session_link } = req.body;
  
    if (!email || !joining_key || !session_link)
      return res.status(400).json({ message: 'Missing required fields' });
  
    try {
      // 1. Find user by email
      const [userRows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
      if (userRows.length === 0) return res.status(404).json({ message: 'User not found' });
      const user = userRows[0];
  
      // 2. Find session by session_link
      const [sessionRows] = await db.promise().query(
        'SELECT * FROM sessions_table WHERE session_link = ? AND authorized = TRUE',
        [session_link]
      );
      if (sessionRows.length === 0) return res.status(404).json({ message: 'Session not found or not authorized' });
  
      const session = sessionRows[0];
  
      // 3. Check joining key
      if (joining_key !== session.joining_key)
        return res.status(401).json({ message: 'Invalid joining key' });
  
      // 4. Check if already registered
      const [alreadyRegistered] = await db.promise().query(
        'SELECT * FROM session_registration WHERE user_id = ? AND session_id = ?',
        [user.id, session.session_id]
      );
      if (alreadyRegistered.length > 0) {
        return res.status(409).json({ message: 'Already registered for this session' ,
          session: {
            session_id: session.session_id,
            topic: session.topic,
            date_time: session.date_time
          }
        });
      }
  
      // 5. Register the user
      await db.promise().query(
        'INSERT INTO session_registration (id, user_id, session_id) VALUES (UUID(), ?, ?)',
        [user.id, session.session_id]
      );
  
      return res.status(200).json({
        message: 'Successfully registered for session',
        session: {
          session_id: session.session_id,
          topic: session.topic,
          date_time: session.date_time
        }
      });
  
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// Resend OTP Route
router.post('/resend-otp', (req, res) => {
  const { email } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    db.query('UPDATE users SET otp = ? WHERE email = ?', [otp, email], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err });
      }

      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your New OTP',
        text: `Your new OTP is: ${otp}`
      }, (mailErr) => {
        if (mailErr) {
          return res.status(500).json({ message: 'Error sending email', error: mailErr });
        }

        res.json({ message: 'New OTP sent to email' });
      });
    });
  });
});


// OTP Verification Route
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  db.query('SELECT * FROM users WHERE email = ? AND otp = ?', [email, otp], (err, results) => {
    if (results.length === 0) return res.status(400).json({ message: 'Invalid OTP' });

    req.session.user = results[0];
    res.json({ message: 'OTP verified. Logged in.', user: req.session.user });
  });
});

// Logout Route
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
