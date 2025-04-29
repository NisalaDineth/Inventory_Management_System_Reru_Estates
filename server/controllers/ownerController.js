const bcrypt = require('bcrypt');
const db = require('../utils/db'); // Import the db connection

class OwnerController {
  static async getAllOwners(req, res) {
    try {
      const sql = 'SELECT OwnerID, Username, Email, PhoneNumber FROM Owner';
      const [owners] = await db.execute(sql);
      res.json(owners);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createOwner(req, res) {
    try {
      const { username, password, email, phoneNumber } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = 'INSERT INTO Owner (Username, Password, Email, PhoneNumber) VALUES (?, ?, ?, ?)';
      const [result] = await db.execute(sql, [username, hashedPassword, email, phoneNumber]);
      res.status(201).json({ message: 'Owner created successfully', ownerId: result.insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateOwner(req, res) {
    try {
      const { ownerId } = req.params;
      const { username, password, email, phoneNumber } = req.body;
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

      let sql = 'UPDATE Owner SET ';
      const params = [];
      if (username) {
        sql += 'Username = ?, ';
        params.push(username);
      }
      if (hashedPassword) {
        sql += 'Password = ?, ';
        params.push(hashedPassword);
      }
      if (email) {
        sql += 'Email = ?, ';
        params.push(email);
      }
      if (phoneNumber) {
        sql += 'PhoneNumber = ?, ';
        params.push(phoneNumber);
      }
      sql = sql.slice(0, -2); // Remove last comma and space
      sql += ' WHERE OwnerID = ?';
      params.push(ownerId);

      const [result] = await db.execute(sql, params);
      res.json({ message: 'Owner updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteOwner(req, res) {
    try {
      const { ownerId } = req.params;
      const sql = 'DELETE FROM Owner WHERE OwnerID = ?';
      const [result] = await db.execute(sql, [ownerId]);
      res.json({ message: 'Owner deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = OwnerController;
