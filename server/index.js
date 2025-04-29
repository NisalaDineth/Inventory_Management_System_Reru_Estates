
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const authRoutes = require('./routes/authRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Update with your MySQL username
  password: '', // Update with your MySQL password
  database: 'inventory_db' // Create this database in MySQL
});

// Test database connection and initialize
db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');

  // Initialize database if needed
  const initQueries = [
    `CREATE DATABASE IF NOT EXISTS inventory_db`,
    `USE inventory_db`,
    `CREATE TABLE IF NOT EXISTS Customer (
      CustomerID INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(100) NOT NULL,
      Password VARCHAR(255) NOT NULL,
      Email VARCHAR(100) NOT NULL UNIQUE,
      PhoneNumber VARCHAR(20)
    )`,
    `CREATE TABLE IF NOT EXISTS Owner (
      OwnerID INT AUTO_INCREMENT PRIMARY KEY,
      Username VARCHAR(50) NOT NULL UNIQUE,
      Password VARCHAR(255) NOT NULL,
      Email VARCHAR(100) NOT NULL UNIQUE,
      PhoneNumber VARCHAR(20)
    )`,
    `CREATE TABLE IF NOT EXISTS Staff (
      StaffID INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(100) NOT NULL,
      Password VARCHAR(255) NOT NULL,
      Email VARCHAR(100) NOT NULL UNIQUE,
      PhoneNumber VARCHAR(20),
      OwnerID INT,
      FOREIGN KEY (OwnerID) REFERENCES Owner(OwnerID) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS Supplier (
      SupplierID INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(100) NOT NULL,
      Address VARCHAR(255),
      TelephoneNumber VARCHAR(20),
      Email VARCHAR(100)
    )`,
    `CREATE TABLE IF NOT EXISTS HarvestInventory (
      HarvestID INT AUTO_INCREMENT PRIMARY KEY,
      CropName VARCHAR(100) NOT NULL,
      Category VARCHAR(100),
      QuantityAvailable INT NOT NULL,
      HarvestingDate DATE,
      UnitPrice DECIMAL(10,2)
    )`,
    `CREATE TABLE IF NOT EXISTS Inventory (
      InventoryID INT AUTO_INCREMENT PRIMARY KEY,
      HarvestID INT,
      Quantity INT NOT NULL,
      FOREIGN KEY (HarvestID) REFERENCES HarvestInventory(HarvestID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS \`Order\` (
      OrderID INT AUTO_INCREMENT PRIMARY KEY,
      OrderDate DATE NOT NULL,
      DeliveryDate DATE,
      OrderStatus VARCHAR(50),
      TotalAmount DECIMAL(10,2),
      AdvancePayment DECIMAL(10,2),
      CustomerID INT,
      FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS OrderDetails (
      OrderDetailsID INT AUTO_INCREMENT PRIMARY KEY,
      OrderID INT,
      HarvestID INT,
      Quantity INT NOT NULL,
      UnitPrice DECIMAL(10,2),
      Total DECIMAL(10,2),
      FOREIGN KEY (OrderID) REFERENCES \`Order\`(OrderID) ON DELETE CASCADE,
      FOREIGN KEY (HarvestID) REFERENCES HarvestInventory(HarvestID) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS Transaction (
      TransactionID INT AUTO_INCREMENT PRIMARY KEY,
      Date DATE NOT NULL,
      Amount DECIMAL(10,2) NOT NULL,
      Type ENUM('income', 'expense') NOT NULL,
      Description VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS FinancialReport (
      ReportID INT AUTO_INCREMENT PRIMARY KEY,
      GeneratedDate DATE NOT NULL,
      TotalRevenue DECIMAL(10,2),
      TotalExpenses DECIMAL(10,2),
      NetProfit DECIMAL(10,2)
    )`
  ];

  // Execute initialization queries sequentially
  initQueries.reduce((promise, query) => {
    return promise.then(() => new Promise((resolve, reject) => {
      db.query(query, (err) => {
        if (err) {
          console.error(`Error executing query: ${query}`, err);
          return reject(err);
        }
        resolve();
      });
    }));
  }, Promise.resolve())
  .then(() => console.log('Database initialized successfully'))
  .catch(err => console.error('Database initialization failed:', err));
});

// Use auth routes
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);

// Role-based middleware
function checkRole(role) {
  return (req, res, next) => {
    // In production, verify JWT token
    const userRole = req.headers['x-role'];
    if (userRole !== role) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

// Owner routes
app.get('/api/admin/inventory', checkRole('owner'), (req, res) => {
  db.query('SELECT * FROM Inventory', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Staff routes
app.get('/api/staff/inventory', checkRole('staff'), (req, res) => {
  db.query('SELECT InventoryID, Quantity FROM Inventory', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Customer routes
app.get('/api/customer/inventory', checkRole('customer'), (req, res) => {
  db.query('SELECT InventoryID, Quantity FROM Inventory WHERE Quantity > 0', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Staff routes for inventory management
app.post('/api/staff/inventory', checkRole('staff'), (req, res) => {
  const { HarvestID, Quantity } = req.body;
  if (!HarvestID || Quantity == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const query = 'INSERT INTO Inventory (HarvestID, Quantity) VALUES (?, ?)';
  db.query(query, [HarvestID, Quantity], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Inventory item added', itemId: result.insertId });
  });
});

app.put('/api/staff/inventory/:id', checkRole('staff'), (req, res) => {
  const { id } = req.params;
  const { HarvestID, Quantity } = req.body;
  if (!HarvestID || Quantity == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const query = 'UPDATE Inventory SET HarvestID = ?, Quantity = ? WHERE InventoryID = ?';
  db.query(query, [HarvestID, Quantity, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Inventory item not found' });
    res.json({ message: 'Inventory item updated' });
  });
});

app.delete('/api/staff/inventory/:id', checkRole('staff'), (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Inventory WHERE InventoryID = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Inventory item not found' });
    res.json({ message: 'Inventory item deleted' });
  });
});

// Purchase route to reduce inventory quantity
app.post('/api/purchase', (req, res) => {
  const { inventoryId, quantity } = req.body;
  if (!inventoryId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid inventoryId or quantity' });
  }

  // Check current quantity
  db.query('SELECT Quantity FROM Inventory WHERE InventoryID = ?', [inventoryId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Inventory item not found' });

    const currentQuantity = results[0].Quantity;
    if (currentQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity in inventory' });
    }

    // Update quantity
    const newQuantity = currentQuantity - quantity;
    db.query('UPDATE Inventory SET Quantity = ? WHERE InventoryID = ?', [newQuantity, inventoryId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Purchase successful', inventoryId, quantityPurchased: quantity, remainingQuantity: newQuantity });
    });
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Inventory Management System API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
