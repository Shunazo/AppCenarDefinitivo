const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");
const authMiddleware = require("../middleware/is-auth");

router.get("/home", authMiddleware, deliveryController.home);

router.get("/perfil/edit", authMiddleware, deliveryController.editperfilForm); 
router.post("/perfil/edit", authMiddleware, deliveryController.editPerfil);

router.get("/pedidos/:id([0-9]+)", authMiddleware, deliveryController.pedidoDetalle); 
router.post("/pedidos/complete/:id([0-9]+)", authMiddleware, deliveryController.completarPedido); 

module.exports = router;
