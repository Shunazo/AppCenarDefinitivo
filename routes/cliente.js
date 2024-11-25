const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");

//no voy a comentar to eto me da pereza
router.get("/", clienteController.home); 
router.get("/perfil", clienteController.perfil);

router.get("/perfil/edit", clienteController.editperfilForm); 
router.post("/perfil/edit", clienteController.editperfil); 


router.get("/ordenes", clienteController.ordenes); 
router.get("/ordenes/:id([0-9]+)", clienteController.ordenDetalle); 


router.get("/direcciones", clienteController.direcciones);
router.get("/direcciones/create", clienteController.createdireccionForm); 
router.post("/direcciones/create", clienteController.createdireccion); 
router.get("/direcciones/edit/:id([0-9]+)", clienteController.editdireccionForm); 
router.post("/direcciones/edit/:id([0-9]+)", clienteController.editdireccion); 
router.post("/direcciones/delete/:id([0-9]+)", clienteController.deletedireccion); 


router.get("/favoritos", clienteController.favoritos); 
router.post("/favoritos/toggle/:id([0-9]+)", clienteController.toggleFavorito); 


module.exports = router;
