const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const SECRET_KEY = 'your_secret_key'; // Use environment variable in production

class AuthController {
  static async registerCustomer(req, res) {
    try {
      const { name, password, email, phoneNumber } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await UserModel.createCustomer({ name, password: hashedPassword, email, phoneNumber });
      res.status(201).json({ message: 'Customer registered successfully', userId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      const validPassword = await bcrypt.compare(password, user.Password || user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      const role = user.role || user.Role || 'customer';
      const token = jwt.sign({ id: user.CustomerID || user.StaffID || user.OwnerID, role }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token, role });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
