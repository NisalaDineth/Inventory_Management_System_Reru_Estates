const db = require('../utils/db'); // Assuming a db utility for database connection

class UserModel {
  static async findByUsername(username) {
    const sql = `
      SELECT *, 'customer' AS role FROM Customer WHERE Name = ?
      UNION
      SELECT *, 'staff' AS role FROM Staff WHERE Name = ?
      UNION
      SELECT *, 'owner' AS role FROM Owner WHERE Username = ?
    `;
    const [rows] = await db.execute(sql, [username, username, username]);
    return rows[0];
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
