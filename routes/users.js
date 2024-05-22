var express = require("express");
var router = express.Router();
const userService = require("../services/userService");
const { ROLES, authRole } = require("../permissions/auth");
const session = require("express-session");
const { pool } = require("../db");

router.get("/", authRole(ROLES.ADMIN), async (req, res) => {
  if (req.session.loggedin) {
    try {
      let users;
      if (req.query.search) {
        users = await userService.getUsers(req.query.search);
      } else {
        users = await userService.getUsers();
      }
      res.render("users", { session: req.session, users });
    } catch (error) {
      console.error("Error getting users", error);
      res.status(500).render("500");
    }
  } else {
    res.render("login", { message: "", username: "", password: "" });
  }
});

router.get("/edit/:id", authRole(ROLES.ADMIN), async (req, res) => {
  if (req.session.loggedin) {
    try {
      const userId = req.params.id;
      const user = await userService.getUser(userId);
      res.render("editUser", {
        message: "",
        session: req.session,
        user,
        userId,
      });
    } catch (error) {
      console.error("Error getting user", error);
      res.status(500).render("500");
    }
  } else {
    res.render("login", { message: "", username: "", password: "" });
  }
});

router.put("/:id", authRole(ROLES.ADMIN), async (req, res) => {
  if (req.session.loggedin) {
    try {
      const result = await userService.updateUser(req.body, req.params.id);
      res.redirect("/users");
    } catch (error) {
      console.error("Error updating user", error);
      if (error.message === "Passwords do not match") {
        const user = await userService.getUser(req.params.id);
        res.render("editUser", {
          message: "Les mots de passe ne correspondent pas",
          session: req.session,
          user,
          userId: req.params.id,
        });
      } else {
        res.status(500).render("500");
      }
    }
  } else {
    res.render("login", { message: "", username: "", password: "" });
  }
});

router.delete("/:id", authRole(ROLES.ADMIN), async (req, res) => {
  if (req.session.loggedin) {
    try {
      const result = await userService.deleteUser(req.params.id);
      res.redirect("/users");
    } catch (error) {
      console.error("Error deleting user", error);
      res.status(500).render("500");
    }
  } else {
    res.render("login", { message: "", username: "", password: "" });
  }
});

module.exports = router;
