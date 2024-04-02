const userService = require("../services/userService");

async function renderLogin(req, res, next) {
  try {
    // if already logged in send user to the home page
    if (req.session.loggedin) {
      res.redirect("/");
    } else {
      res.render("login", { message: "", username: "", password: "" });
    }
  } catch (error) {
    next(error);
  }
}

async function renderRegister(req, res, next) {
  try {
    // if alredy logged in send user to the home page
    if (req.session.loggedin) {
      res.redirect("/");
    } else {
      res.render("register", {
        message: "",
        full_name: "",
        poste: "",
        email: "",
        password: "",
        password_confirmed: "",
      });
    }
  } catch (error) {
    next(error);
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (username && password) {
      const user = await userService.authenticateUser(username, password);
      if (user) {
        // Authentication successful, set session and redirect
        req.session.loggedin = true;
        req.session.user = user;
        res.redirect("/");
      } else {
        res.render("login", {
          message: "Nom ou mot de passe incorrect!",
          username: username || "",
          password: password || "",
        });
      }
    } else {
      return res.render("login", {
        message: "Veuillez remplir tous les champs!",
        username: username || "",
        password: password || "",
      });
    }
  } catch (e) {
    console.error("Error during login:", e);
    res.status(500).render("500");
  }
}

async function register(req, res) {
  try {
    const { full_name, poste, email, password, password_confirmed } = req.body;
    if (full_name && poste && email && password && password_confirmed) {
      if (password !== password_confirmed) {
        return res.render("register", {
          message: "Les mots de passe ne correspondent pas",
          full_name: full_name || "",
          poste: poste || "",
          email: email || "",
          password: password || "",
          password_confirmed: password_confirmed || "",
        });
      }
      const user = await userService.registerUser(
        full_name,
        poste,
        email,
        password
      );
      res.render("login", { message: "", username: "", password: "" });
    } else {
      return res.render("register", {
        message: "Veuillez remplir tous les champs!",
        full_name: full_name || "",
        poste: poste || "",
        email: email || "",
        password: password || "",
        password_confirmed: password_confirmed || "",
      });
    }
  } catch (e) {
    console.error("Error during registration:", e);
    res.status(500).render("500");
  }
}

async function logout(req, res) {
  try {
    // Destroy the user's session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        res.status(500).render("500");
      } else {
        res.redirect("/login");
      }
    });
  } catch (e) {
    console.error("Error during logout:", e);
    res.status(500).render("500");
  }
}

module.exports = {
  login,
  register,
  renderLogin,
  renderRegister,
  logout,
};
