const express = require('express');
const router = express.Router();
const db = require('../database/sqlite');
const { createRateLimit } = require('../middleware/rateLimit');
const { createSignedToken, hashPassword, verifyPassword } = require('../utils/security');

const authRateLimit = createRateLimit({
  windowMs: 1000 * 60 * 15,
  maxRequests: 20,
});

const buildConductorResponse = (row) => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: row.phone,
  location: row.location,
  status: row.status,
});

// Login a conductor with email and password authentication
router.post('/login', authRateLimit, (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    db.get(
      'SELECT * FROM conductors WHERE LOWER(email) = LOWER(?) LIMIT 1',
      [email.trim()],
      (err, row) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Unable to process login right now',
          });
        }

        if (!row || !verifyPassword(password, row.password)) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
          });
        }

        if (row.status === 'inactive') {
          return res.status(403).json({
            success: false,
            message: 'Your account has been deactivated. Contact support.',
          });
        }

        const conductor = buildConductorResponse(row);
        const token = createSignedToken({
          type: 'conductor',
          conductorId: row.id,
          email: row.email,
          name: `${row.first_name} ${row.last_name}`.trim(),
        });

        res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          conductor,
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Signup a new conductor
router.post('/signup', authRateLimit, (req, res) => {
  try {
    const { firstName, lastName, email, phone, location, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !location || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    db.get('SELECT * FROM conductors WHERE LOWER(email) = LOWER(?)', [email], (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Unable to create account right now',
        });
      }

      if (row) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
      }

      const insertQuery = `
        INSERT INTO conductors (first_name, last_name, email, phone, location, password, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();
      db.run(
        insertQuery,
        [
          firstName.trim(),
          lastName.trim(),
          email.toLowerCase().trim(),
          phone.trim(),
          location.trim(),
          hashPassword(password),
          'active',
          now,
          now,
        ],
        function onInsert(insertErr) {
          if (insertErr) {
            return res.status(500).json({
              success: false,
              message: 'Failed to create conductor account',
            });
          }

          res.status(201).json({
            success: true,
            message: 'Conductor account created successfully',
            conductorId: this.lastID,
            conductor: {
              id: this.lastID,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.toLowerCase().trim(),
              phone: phone.trim(),
              location: location.trim(),
              status: 'active',
            },
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Get conductor by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    db.get('SELECT * FROM conductors WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Conductor not found',
        });
      }

      res.status(200).json({
        success: true,
        conductor: buildConductorResponse(row),
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;
