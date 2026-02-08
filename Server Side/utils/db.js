import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

// Use connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "", //your password here
    database: process.env.DB_NAME || "employeems",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

// Get a promise-based connection
const getConnection = () => {
    return pool.promise()
}

// Test connection
pool.getConnection((err, connection) => {
    if(err) {
        console.error("Database connection error:", err.message)
    } else {
        console.log("Database connected successfully")
        connection.release()
    }
})

export default pool
export { getConnection }

