const pool = require("../db");
const bcrypt = require("bcrypt");
const saltRounds = 10;

async function authenticateUser(username, password) {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE full_name = ?", [
      username,
    ]);
    if (rows.length > 0) {
      const user = { ...rows[0] };
      // Compare the hashed password with the password provided by the user
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        delete user.password; // Remove the password field from the user object
        return user; // User found and password matched
      } else {
        return null; // Password didn't match
      }
    }
  } catch (error) {
    console.error("Error in authenticate User:", error);
    throw error; // Propagate the error to the caller
  }
}

async function registerUser(full_name, poste, email, password) {
  try {
    //hashing the password
    hashedPass = await bcrypt.hash(password, saltRounds);

    const [rows] = await pool.query(
      "INSERT INTO users (full_name,poste,email,password) VALUES (?,?,?,?)",
      [full_name, poste, email, hashedPass]
    );

    const id = rows.insertId;
    return id;
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error; // Propagate the error to the caller
  }
}

module.exports = {
  authenticateUser,
  registerUser,
};
