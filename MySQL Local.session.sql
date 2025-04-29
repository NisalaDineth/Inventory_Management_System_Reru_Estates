-- Create database
CREATE DATABASE IF NOT EXISTS reru_estates_system;
USE reru_estates_system;

-- Customer table
CREATE TABLE IF NOT EXISTS Customer (
  CustomerID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  PhoneNumber VARCHAR(20),
  FirstName VARCHAR(100),
  LastName VARCHAR(100)
);

-- Owner table
CREATE TABLE IF NOT EXISTS Owner (
  OwnerID INT AUTO_INCREMENT PRIMARY KEY,
  Username VARCHAR(50) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  PhoneNumber VARCHAR(20)
);

-- Staff table
CREATE TABLE IF NOT EXISTS Staff (
  StaffID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  PhoneNumber VARCHAR(20),
  OwnerID INT,
  FOREIGN KEY (OwnerID) REFERENCES Owner(OwnerID) ON DELETE SET NULL
);

-- Supplier table
CREATE TABLE IF NOT EXISTS Supplier (
  SupplierID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Address VARCHAR(255),
  TelephoneNumber VARCHAR(20),
  Email VARCHAR(100)
);

-- HarvestInventory table
CREATE TABLE IF NOT EXISTS HarvestInventory (
  HarvestID INT AUTO_INCREMENT PRIMARY KEY,
  CropName VARCHAR(100) NOT NULL,
  Category VARCHAR(100),
  QuantityAvailable INT NOT NULL,
  HarvestingDate DATE,
  UnitPrice DECIMAL(10,2)
);

-- Inventory table (linked to HarvestInventory)
CREATE TABLE IF NOT EXISTS Inventory (
  InventoryID INT AUTO_INCREMENT PRIMARY KEY,
  HarvestID INT,
  Quantity INT NOT NULL,
  FOREIGN KEY (HarvestID) REFERENCES HarvestInventory(HarvestID) ON DELETE CASCADE
);

-- Order table
CREATE TABLE IF NOT EXISTS `Order` (
  OrderID INT AUTO_INCREMENT PRIMARY KEY,
  OrderDate DATE NOT NULL,
  DeliveryDate DATE,
  OrderStatus VARCHAR(50),
  TotalAmount DECIMAL(10,2),
  AdvancePayment DECIMAL(10,2),
  CustomerID INT,
  FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE
);

-- OrderDetails table (includes crops in orders)
CREATE TABLE IF NOT EXISTS OrderDetails (
  OrderDetailsID INT AUTO_INCREMENT PRIMARY KEY,
  OrderID INT,
  HarvestID INT,
  Quantity INT NOT NULL,
  UnitPrice DECIMAL(10,2),
  Total DECIMAL(10,2),
  FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID) ON DELETE CASCADE,
  FOREIGN KEY (HarvestID) REFERENCES HarvestInventory(HarvestID) ON DELETE CASCADE
);

-- Transaction table (for income and expenses)
CREATE TABLE IF NOT EXISTS Transaction (
  TransactionID INT AUTO_INCREMENT PRIMARY KEY,
  Date DATE NOT NULL,
  Amount DECIMAL(10,2) NOT NULL,
  Type ENUM('income', 'expense') NOT NULL,
  Description VARCHAR(255)
);

-- FinancialReport table
CREATE TABLE IF NOT EXISTS FinancialReport (
  ReportID INT AUTO_INCREMENT PRIMARY KEY,
  GeneratedDate DATE NOT NULL,
  TotalRevenue DECIMAL(10,2),
  TotalExpenses DECIMAL(10,2),
  NetProfit DECIMAL(10,2)
);

-- Relationships from ER diagram:
-- Owner manages Staff and HarvestInventory
-- Staff manages Inventory and Orders (to be handled in app logic)
-- Orders placed by Customers
-- Suppliers provide items (not explicitly in ER diagram but included as per previous schema)

-- Additional attributes from ER diagram added where applicable (e.g., FirstName, LastName in Customer)
