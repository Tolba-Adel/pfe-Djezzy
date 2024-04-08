var express = require("express");
var router = express.Router();
const userService = require("../services/userService");

router.get("/", async (req, res) => {
  if (req.session.loggedin) {
    try {
      const users = await userService.getUsers();
      res.render("users", { session: req.session, users });
    } catch (error) {
      console.error("Error getting users", error);
      res.status(500).render("500");
    }
  } else {
    res.render("login", { message: "", username: "", password: "" });
  }
});

router.delete("/:id", async (req, res) => {
  if (req.session.loggedin) {
    try {
      const result = await userService.deleteUser(req.params.id);
      res.redirect("/users")
    } catch (error) {
      console.error("Error deleting user", error);
      res.status(500).render("500");
    }
  } else {
    res.render("login", { message: "", username: "", password: "" });
  }
});

module.exports = router;
