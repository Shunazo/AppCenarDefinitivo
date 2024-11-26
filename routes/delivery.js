/*const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");
const authMiddleware = require("../middleware/is-auth");

router.get("/", authMiddleware, deliveryController.home);

router.get("/perfil", authMiddleware, deliveryController.perfil);
router.get("/perfil/edit", authMiddleware, deliveryController.editperfilForm); 
router.post("/perfil/edit", authMiddleware, deliveryController.editperfil);

router.get("/ordenes", authMiddleware, deliveryController.ordenes); 
router.get("/ordenes/:id([0-9]+)", authMiddleware, deliveryController.ordenDetalle); 
router.post("/ordenes/complete/:id([0-9]+)", authMiddleware, deliveryController.completarOrden); 

module.exports = router;
*/