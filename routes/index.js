var express = require("express");
var router = express.Router();
var database = require("../db");
const authController = require("../controllers/AuthController");

router.get("/prediction", (req, res) => {
  if (req.session.loggedin) {
    res.render("prediction", { session: req.session });
  } else {
    res.render("login", { message: "", username: "", password: "" });
  }
});

router.get("/profile", (req, res) => {
  if (req.session.loggedin) {
    res.render("profile", { session: req.session });
  } else {
    res.render("login", { message: "", username: "", password: "" });
  }
});

router.get("/", (req, res, next) => {
  if (req.session.loggedin) {
    res.render("index", { session: req.session });
  } else {
    res.render("login", { message: "", username: "", password: "" });
  }
});

router.get("/login", authController.renderLogin);
router.get("/register", authController.renderRegister);

router.post("/login", authController.login);

router.post("/register", authController.register);

router.get("/logout", authController.logout);

module.exports = router;
