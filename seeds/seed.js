const bcrypt = require("bcrypt");
const pool = require("../db");

const saltRounds = 10;
const users = [
  {
    full_name: "Administrateur",
    email: "admin@gmail.com",
    password: "00000",
    role: "admin",
  },
];

async function seedDatabase() {
  try {
    await pool.query("CREATE DATABASE IF NOT EXISTS users_app");
    await pool.query("USE users_app");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(255) NOT NULL,
        description VARCHAR(255)   
      )
    `);

    await pool.query(`
      INSERT INTO roles (role_name) VALUES ('admin');
      INSERT INTO roles (role_name) VALUES ('user');
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        poste VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL references users(id),
        role_id INT NOT NULL references role
      )
    `);

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);

      const [result] = await pool.query(
        "INSERT INTO users (full_name,email,password) VALUES (?,?,?)",
        [user.full_name, user.email, hashedPassword]
      );
      const user_id = result.insertId;

      await pool.query("INSERT INTO users_roles (user_id,role_id) VALUES (?,?)", [user_id, 1]);
    }
  } catch (error) {
    console.error("Error Seeding DataBase", error);
  }
}

seedDatabase();
