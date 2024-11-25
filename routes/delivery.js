const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");

router.get("/", deliveryController.home);

router.get("/perfil", deliveryController.perfil);
router.get("/perfil/edit", deliveryController.editperfilForm); 
router.post("/perfil/edit", deliveryController.editperfil);

router.get("/ordenes", deliveryController.ordenes); 
router.get("/ordenes/:id([0-9]+)", deliveryController.ordenDetalle); 
router.post("/ordenes/complete/:id([0-9]+)", deliveryController.completarOrden); 

module.exports = router;
