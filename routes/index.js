var express = require("express");
var router = express.Router();
var database = require("../db");
const userService = require("../services/userService");
const authController = require("../controllers/AuthController");
const { ROLES, authRole } = require("../permissions/auth");
const { PythonShell } = require("python-shell");
const { exec } = require("child_process");
const path = require("path");
const tf = require("@tensorflow/tfjs");
const fs = require("fs");
const nodePickle = require("node-pickle");
const axios = require("axios");

router.get("/prediction", authRole(ROLES.ADMIN), (req, res) => {
  if (req.session.loggedin) {
    res.render("prediction", { session: req.session, predicted_offer: "" });
  } else {
    res.render("login", { message: "", username: "", password: "" });
  }
});

//handle prediction
router.post("/prediction", authRole(ROLES.ADMIN), async (req, res) => {
  if (req.session.loggedin) {
    const phoneNumber = req.body.phoneNumber;

    try {
      const features = await userService.getFeatures(phoneNumber);

      const response = await axios.post('http://0.0.0.0:5000/predict', features);

      const predicted_offer = response.data.predicted_offer;

      res.render("prediction", { session: req.session, predicted_offer });
    } catch (error) {
      console.error("Error during prediction process", error);
      res.render("prediction", {
        session: req.session,
        predicted_offer: "Error during prediction",
      });
    }
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
router.get("/register", authRole(ROLES.ADMIN), authController.renderRegister);

router.post("/login", authController.login);

router.post("/register", authRole(ROLES.ADMIN), authController.register);

router.get("/logout", authController.logout);

// const pklFilePath = path.join(__dirname, '../ML_Model/FinalPfeModel.pkl');
// const jsonFilePath = path.join(__dirname, '../ML_Model/FinalPfeModel.json');

// fs.readFile(pklFilePath, (err, pickledData) => {
//   if (err) {
//     console.error('Error reading pickled model file:', err);
//     return;
//   }

//   nodePickle.load(pickledData)
//     .then(data => {
//       const jsonModel = JSON.stringify(data);
//       fs.writeFileSync(jsonFilePath, jsonModel);
//       console.log('JSON model saved to:', jsonFilePath);
//     })
//     .catch(error => {
//       console.error('Error converting pickled model to JSON:', error);
//     });
// });

// async function loadModel() {
//   const model = await tf.loadLayersModel('../ML_Model/FinalPfeModel.json');
//   return model;
// }

// async function predictOffer(features, model) {
//   const tensorFeatures = tf.tensor2d([features]);
//   const predictions = model.predict(tensorFeatures);
//   return predictions;
// }

// function predictOffer(features) {
//   return new Promise((resolve, reject) => {
//     const formattedFeatures = JSON.stringify([features]);
//     console.log("Features being sent to Python script:", formattedFeatures);
//     const options = {
//       mode: "text",
//       pythonOptions: ["-u"],
//       scriptPath: "../pfe-Djezzy/ML Model",
//       args: formattedFeatures,
//     };

//     PythonShell.run("predict.py", options, (err, result) => {
//       if (err) {
//         console.error("Error calling Python script:", err);
//         reject(err);
//       } else {
//         const predicted_offer = JSON.parse(result[0]);
//         resolve(predicted_offer);
//       }
//     });
//   });
// }

module.exports = router;
