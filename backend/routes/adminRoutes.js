const express = require('express');
const router = express.Router();
const db = require('../database/sqlite');
const { requireAdminAuth } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');
const { createSignedToken, hashPassword, verifyPassword } = require('../utils/security');

const authRateLimit = createRateLimit({
  windowMs: 1000 * 60 * 15,
  maxRequests: 25,
});

router.post('/login', authRateLimit, (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    db.get(
      'SELECT * FROM admin_users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) LIMIT 1',
      [username.trim(), username.trim()],
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
            message: 'Invalid username or password',
          });
        }

        if (row.status !== 'active') {
          return res.status(403).json({
            success: false,
            message: 'Your admin account is not active',
          });
        }

        const token = createSignedToken({
          type: 'admin',
          adminId: row.id,
          username: row.username,
          role: row.role,
        });

        return res.status(200).json({
          success: true,
          message: 'Login successful',
          token,
          admin: {
            id: row.id,
            username: row.username,
            email: row.email,
            fullName: row.full_name,
            role: row.role,
          },
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

router.use(requireAdminAuth);

// Get dashboard statistics
router.get('/stats', (req, res) => {
  try {
    db.get('SELECT COUNT(*) as count FROM conductors', [], (err, conductorsCount) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to get conductor count' });
      }

      db.get('SELECT COUNT(*) as count FROM tickets', [], (ticketsErr, ticketsCount) => {
        if (ticketsErr) {
          return res.status(500).json({ error: 'Failed to get tickets count' });
        }

        db.get('SELECT COALESCE(SUM(fare), 0) as total FROM tickets', [], (revenueErr, revenue) => {
          if (revenueErr) {
            return res.status(500).json({ error: 'Failed to get revenue' });
          }

          db.get(
            'SELECT COUNT(*) as count FROM conductors WHERE status = ?',
            ['active'],
            (activeErr, activeConductorsCount) => {
              if (activeErr) {
                return res.status(500).json({ error: 'Failed to get active conductors count' });
              }

              res.status(200).json({
                totalConductors: conductorsCount?.count || 0,
                activeTickets: ticketsCount?.count || 0,
                revenue: revenue?.total || 0,
                completedRoutes: activeConductorsCount?.count || 0,
              });
            }
          );
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Get all conductors
router.get('/conductors', (req, res) => {
  try {
    db.all('SELECT * FROM conductors ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: 'Failed to fetch conductors',
          message: err.message,
        });
      }

      const conductors = rows.map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        location: row.location,
        status: row.status,
        createdAt: row.created_at,
      }));

      res.status(200).json(conductors);
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Update conductor details
router.put('/conductors/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, location, status } = req.body;

    db.run(
      `
        UPDATE conductors
        SET first_name = ?, last_name = ?, phone = ?, location = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [firstName, lastName, phone, location, status, id],
      function onUpdate(err) {
        if (err) {
          return res.status(500).json({
            error: 'Failed to update conductor',
            message: err.message,
          });
        }

        res.status(200).json({
          success: true,
          message: 'Conductor updated successfully',
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Delete conductor
router.delete('/conductors/:id', (req, res) => {
  try {
    const { id } = req.params;

    db.run('DELETE FROM conductors WHERE id = ?', [id], function onDelete(err) {
      if (err) {
        return res.status(500).json({
          error: 'Failed to delete conductor',
          message: err.message,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Conductor deleted successfully',
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

router.get('/conductors/:id', (req, res) => {
  try {
    const { id } = req.params;

    db.get('SELECT * FROM conductors WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({
          error: 'Failed to fetch conductor',
          message: err.message,
        });
      }

      if (!row) {
        return res.status(404).json({
          error: 'Conductor not found',
        });
      }

      res.status(200).json({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        location: row.location,
        status: row.status,
        createdAt: row.created_at,
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Get all tickets
router.get('/tickets', (req, res) => {
  try {
    db.all(
      `
        SELECT
          t.*,
          c.first_name AS conductor_first_name,
          c.last_name AS conductor_last_name
        FROM tickets t
        LEFT JOIN conductors c ON c.id = t.conductor_id
        ORDER BY t.created_at DESC
      `,
      [],
      (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: 'Failed to fetch tickets',
          message: err.message,
        });
      }

      const formatRouteName = (row) => {
        if (row.origin && row.destination) {
          return `${row.origin} -> ${row.destination}`;
        }

        if (row.route_name) {
          return row.route_name.replace(/\s+to\s+/i, ' -> ');
        }

        return '-';
      };

      const tickets = rows.map((row) => ({
        id: row.id,
        ticketId: row.ticket_id,
        passengerName: row.passenger_name || '',
        paymentStatus: row.payment_status || 'unpaid',
        isArchived: Boolean(row.is_archived),
        archivedAt: row.archived_at || null,
        distance: row.distance,
        passengerType: row.passenger_type,
        fare: row.fare,
        conductorId: row.conductor_id,
        conductorName:
          row.conductor_name ||
          [row.conductor_first_name, row.conductor_last_name].filter(Boolean).join(' ').trim() ||
          'Unknown',
        origin: row.origin || '',
        destination: row.destination || '',
        routeName: formatRouteName(row),
        createdAt: row.created_at,
      }));

      res.status(200).json(tickets);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Get ticket reports/statistics
router.get('/reports', (req, res) => {
  try {
    db.get('SELECT COALESCE(SUM(fare), 0) as totalRevenue FROM tickets', [], (err, revenue) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to get revenue' });
      }

      db.all(
        'SELECT passenger_type, COUNT(*) as count, SUM(fare) as total FROM tickets GROUP BY passenger_type',
        [],
        (passengerErr, passengerData) => {
          if (passengerErr) {
            return res.status(500).json({ error: 'Failed to get passenger data' });
          }

          db.get('SELECT AVG(fare) as avgFare FROM tickets', [], (avgErr, avgData) => {
            if (avgErr) {
              return res.status(500).json({ error: 'Failed to get average fare' });
            }

            db.get('SELECT COUNT(*) as count FROM tickets', [], (countErr, ticketCount) => {
              if (countErr) {
                return res.status(500).json({ error: 'Failed to get ticket count' });
              }

              res.status(200).json({
                totalRevenue: revenue?.totalRevenue || 0,
                totalTickets: ticketCount?.count || 0,
                averageFare: avgData?.avgFare || 0,
                passengerTypeData: passengerData || [],
              });
            });
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

router.post('/conductors/:id/reset-password', (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    db.run(
      'UPDATE conductors SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashPassword(newPassword), id],
      function onReset(err) {
        if (err) {
          return res.status(500).json({
            error: 'Failed to reset password',
            message: err.message,
          });
        }

        res.status(200).json({
          success: true,
          message: 'Password reset successfully. Share the new password with the conductor securely.',
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

const handleAdminPasswordChange = (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const adminId = req.auth.adminId;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    db.get('SELECT password FROM admin_users WHERE id = ?', [adminId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', message: err.message });
      }

      if (!row) {
        return res.status(404).json({ success: false, message: 'Admin user not found' });
      }

      if (!verifyPassword(currentPassword, row.password)) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      db.run(
        'UPDATE admin_users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashPassword(newPassword), adminId],
        function onPasswordChange(updateErr) {
          if (updateErr) {
            return res.status(500).json({
              error: 'Failed to change password',
              message: updateErr.message,
            });
          }

          res.status(200).json({
            success: true,
            message: 'Password changed successfully',
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

router.post('/admin/change-password', handleAdminPasswordChange);
router.post('/change-password', handleAdminPasswordChange);

router.get('/admin-users', (req, res) => {
  try {
    db.all(
      'SELECT id, username, email, full_name, role, status, created_at, updated_at FROM admin_users ORDER BY created_at DESC',
      [],
      (err, rows) => {
        if (err) {
          return res.status(500).json({
            error: 'Failed to fetch admin users',
            message: err.message,
          });
        }

        const adminUsers = rows.map((row) => ({
          id: row.id,
          username: row.username,
          email: row.email,
          fullName: row.full_name,
          role: row.role,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        res.status(200).json(adminUsers);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

router.post('/admin-users', (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    db.run(
      `INSERT INTO admin_users (username, email, password, full_name, role, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [username, email, hashPassword(password), fullName || '', role || 'admin'],
      function onCreate(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({
              success: false,
              message: 'Username or email already exists',
            });
          }
          return res.status(500).json({
            error: 'Failed to create admin user',
            message: err.message,
          });
        }

        res.status(201).json({
          success: true,
          message: 'Admin user created successfully',
          userId: this.lastID,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

router.delete('/admin-users/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (id === '1') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete the default admin user',
      });
    }

    db.run('DELETE FROM admin_users WHERE id = ?', [id], function onDelete(err) {
      if (err) {
        return res.status(500).json({
          error: 'Failed to delete admin user',
          message: err.message,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Admin user deleted successfully',
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;
