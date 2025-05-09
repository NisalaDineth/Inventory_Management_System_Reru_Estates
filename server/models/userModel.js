const db = require('../utils/db'); // Assuming a db utility for database connection

class UserModel {
  static async findByEmail(email) {
    // Query Customer table
    let sql = 'SELECT CustomerID AS id, Name AS username, Password, Email, PhoneNumber, \'customer\' AS role FROM customer WHERE Email = ? LIMIT 1';
    let [rows] = await db.execute(sql, [email]);
    if (rows.length > 0) {
      return rows[0];
    }

    // Query Staff table
    sql = 'SELECT StaffID AS id, Name AS username, Password, Email, PhoneNumber, \'staff\' AS role FROM Staff WHERE Email = ? LIMIT 1';
    [rows] = await db.execute(sql, [email]);
    if (rows.length > 0) {
      return rows[0];
    }

    // Query Owner table
    sql = 'SELECT OwnerID AS id, Username AS username, Password, Email, PhoneNumber, \'owner\' AS role FROM Owner WHERE Email = ? LIMIT 1';
    [rows] = await db.execute(sql, [email]);
    if (rows.length > 0) {
      return rows[0];
    }

    return null;
  }

  static async createCustomer({ name, password, email, phoneNumber }) {
    const sql = 'INSERT INTO Customer (Name, Password, Email, PhoneNumber) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(sql, [name, password, email, phoneNumber]);
    return result.insertId;
  }

  static async createStaff({ name, password, email, phoneNumber, ownerId }) {
    const sql = 'INSERT INTO Staff (Name, Password, Email, PhoneNumber, OwnerID) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.execute(sql, [name, password, email, phoneNumber, ownerId]);
    return result.insertId;
  }

  static async createOwner({ username, password, email, phoneNumber }) {
    const sql = 'INSERT INTO Owner (Username, Password, Email, PhoneNumber) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(sql, [username, password, email, phoneNumber]);
    return result.insertId;
  }
}

module.exports = UserModel;
