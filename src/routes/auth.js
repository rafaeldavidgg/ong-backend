const express = require("express");
const { login, validateToken } = require("../controllers/auth.controller");
const { check } = require("express-validator");

const router = express.Router();

router.post(
  "/login",
  [
    check("email", "Ingrese un email válido").isEmail(),
    check("contraseña", "La contraseña es obligatoria").not().isEmpty(),
  ],
  login
);

router.get("/validate-token", validateToken);

module.exports = router;
