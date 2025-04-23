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

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    db.query('INSERT INTO users (name, email, password, otp) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, otp], (err, result) => {
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
