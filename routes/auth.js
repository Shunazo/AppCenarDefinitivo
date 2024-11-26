const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login", authController.loginForm); // form de login
router.post("/login", authController.login); // procesar 

router.post("/cerrar-sesion", authController.logout);  // cerrar sesion

router.get("/registro/usuario", authController.registerForm); // form de registro
router.post("/registro/usuario", authController.register);  // procesar 

router.get("/registro/comercio", authController.registerComercioForm); // form de registro
router.post("/registro/comercio", authController.registerComercio);  // procesar

router.get("/reset-password", authController.resetForm); //form de reestablecer contraseña
router.post("/reset-password", authController.resetToken);  // procesar

router.get("/reset-password/:token", authController.passwordForm); // form de nueva contraseña
router.post("/reset-password/:token", authController.password); // procesar

router.post("/activate/:token", authController.activateAccount);

module.exports = router;
