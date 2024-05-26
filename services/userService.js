const pool = require("../db");
const bcrypt = require("bcrypt");
const saltRounds = 10;

async function authenticateUser(username, password) {
  try {
    const [rows] = await pool.query(
      "SELECT u.id, u.full_name, u.poste, u.email, u.password, DATE_FORMAT(u.created_at, '%d-%m-%Y %H:%i:%s') AS formatted_created_at, r.role_name AS role FROM users u LEFT JOIN users_roles ur ON u.id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.role_id WHERE full_name = ?",
      [username]
    );
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

async function registerUser(full_name, poste, email, password, role) {
  try {
    //hashing the password
    hashedPass = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      "INSERT INTO users (full_name,poste,email,password) VALUES (?,?,?,?)",
      [full_name, poste, email, hashedPass]
    );
    const user_id = result.insertId;

    const [roles] = await pool.query(
      "SELECT role_id FROM roles WHERE role_name = ?",
      [role]
    );
    const role_id = roles[0].role_id;

    await pool.query(
      "INSERT INTO users_roles (user_id, role_id) VALUES (?,?)",
      [user_id, role_id]
    );

    return user_id;
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error; // Propagate the error to the caller
  }
}

async function getUsers(searchName = null) {
  try {
    let query = `
      SELECT u.id, u.full_name, u.poste, u.email, u.password,
      DATE_FORMAT(u.created_at, '%d-%m-%Y %H:%i:%s') AS formatted_created_at,
      r.role_name AS role FROM users u LEFT JOIN users_roles ur
      ON u.id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.role_id`;
      
    if (searchName) {
      query += ` WHERE u.full_name LIKE '%${searchName}%'`;
    }
    query += ` ORDER BY u.id`;

    const [rows] = await pool.query(query);

    if (rows.length > 0) {
      return rows;
    }
  } catch (error) {
    console.error("Error getting all the users", error);
    throw error;
  }
}

async function getUser(id) {
  try {
    const [user] = await pool.query(
      "SELECT full_name, poste, email FROM users WHERE id = ?",
      [id]
    );
    return user[0];
  } catch (error) {
    console.error("Error getting the user", error);
    throw error;
  }
}

async function updateUser(body, userId) {
  try {
    const { full_name, poste, email, password, password_confirmed } = body;
    if (!password && !password_confirmed) {
      const [user] = await pool.query(
        "UPDATE users SET full_name = ?, poste = ?, email = ? WHERE id = ?",
        [full_name, poste, email, userId]
      );
      return user;
    } else if (password == password_confirmed) {
      hashedPass = await bcrypt.hash(password, saltRounds);

      const [user] = await pool.query(
        "UPDATE users SET full_name = ?, poste = ?, email = ?, password = ? WHERE id = ?",
        [full_name, poste, email, hashedPass, userId]
      );
      return user;
    } else {
      throw new Error("Passwords do not match");
    }
  } catch (error) {
    console.error("Error updating the users", error);
    throw error;
  }
}

async function deleteUser(id) {
  try {
    const connection = await pool.getConnection(); //Get a connection from the pool

    try {
      await connection.beginTransaction();

      await connection.query("DELETE FROM users WHERE id = ?", [id]);
      await connection.query("DELETE FROM users_roles WHERE user_id = ?", [id]);

      await connection.commit(); //Commit the transaction if all queries succeed
    } catch (error) {
      await connection.rollback(); //Rollback the transaction if any query fails
      throw error; // Re-throw the error to the caller
    } finally {
      connection.release(); // Release the connection back to the pool
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

async function getRoles(){
  try {
    const [result] = await pool.query(
      "SELECT role_name FROM roles"
    )
    return result;
  } catch (error) {
    console.error("Error getting the roles", error);
    throw error;
  }
}


module.exports = {
  authenticateUser,
  registerUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getRoles
};
