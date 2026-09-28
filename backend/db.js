// db.js
// Ye file MySQL database se connect karti hai.
// Tables already phpMyAdmin se ban chuki hain, isliye yahan sirf connection hai.

const mysql = require("mysql2/promise");

// -------------------- Connection settings --------------------
// XAMPP mein default: user "root", password khali ""
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",          // agar aapne XAMPP mein password set kiya hai to yahan likhein
  database: "vibely",
  waitForConnections: true,
  connectionLimit: 10,
});

// -------------------- Connection test karna --------------------
async function testConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("Database se connection ho gaya!");
  } catch (error) {
    console.log("Database se connection NAHI hua. Error:", error.message);
  }
}

testConnection();

// Is file ko baaki files mein use karne ke liye export kar rahe hain
module.exports = pool;