const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your_secret_key'; // Use environment variable in production

class AuthController {
  static async registerCustomer(req, res) {
    try {
      const { name, password, email, phoneNumber } = req.body;
      console.log("Comparing password:", password, "with hash:", user.Password);
      const hashedPassword = await bcrypt.hash(password, 10);
      const UserModel = require('../models/userModel');
      const userId = await UserModel.createCustomer({ name, password: hashedPassword, email, phoneNumber });
      res.status(201).json({ message: 'Customer registered successfully', userId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
  
      const UserModel = require('../models/userModel');
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.Password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
      res.status(200).json({
        message: 'Login successful',
        token,
        role: user.role,
        username: user.username,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
  
}

module.exports = AuthController;
