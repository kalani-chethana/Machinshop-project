const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",              
  password: "12345678", 
  database: "loadcell_db",   
  waitForConnections: true,
  connectionLimit: 10,       
  queueLimit: 0
});

const db = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Database connection failed:", err.message);
  } else {
    console.log("✅ MySQL Database connected securely via thread ID: " + connection.threadId);
    connection.release(); 
  }
});

module.exports = db;