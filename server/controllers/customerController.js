const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');

class CustomerController {
  static async getAllCustomers(req, res) {
    try {
      const db = require('../utils/db');
      const sql = 'SELECT CustomerID AS id, Name AS name, Email AS email, PhoneNumber AS phoneNumber FROM Customer';
      const [rows] = await db.execute(sql);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async registerCustomer(req, res) {
    try {
      const { name, password, email, phoneNumber } = req.body;
      if (!name || !password || !email) {
        return res.status(400).json({ error: 'Name, password, and email are required' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await UserModel.createCustomer({ name, password: hashedPassword, email, phoneNumber });
      res.status(201).json({ message: 'Customer registered successfully', userId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phoneNumber } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      const db = require('../utils/db');
      const sql = 'UPDATE Customer SET Name = ?, Email = ?, PhoneNumber = ? WHERE CustomerID = ?';
      const [result] = await db.execute(sql, [name, email, phoneNumber, id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json({ message: 'Customer updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const db = require('../utils/db');
      const sql = 'DELETE FROM Customer WHERE CustomerID = ?';
      const [result] = await db.execute(sql, [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CustomerController;
