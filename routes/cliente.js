const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const authMiddleware = require("../middleware/is-auth");

//no voy a comentar to eto me da pereza
router.get("/home", authMiddleware, clienteController.home); 
/*router.get("/perfil", authMiddleware, clienteController.perfil);

router.get("/perfil/edit", authMiddleware, clienteController.editperfilForm); 
router.post("/perfil/edit", authMiddleware, clienteController.editperfil); 

router.get("/tipo-comercio", authMiddleware, clienteController.tipoComercio);

router.get("/pedidos", authMiddleware, clienteController.pedidos); 
router.get("/pedidos/:id([0-9]+)", authMiddleware, clienteController.pedidoDetalle); 


router.get("/direcciones", authMiddleware, clienteController.direcciones);
router.get("/direcciones/create", authMiddleware, clienteController.createdireccionForm); 
router.post("/direcciones/create", authMiddleware, clienteController.createdireccion); 
router.get("/direcciones/edit/:id([0-9]+)", authMiddleware, clienteController.editdireccionForm); 
router.post("/direcciones/edit/:id([0-9]+)", authMiddleware, clienteController.editdireccion); 
router.post("/direcciones/delete/:id([0-9]+)", authMiddleware, clienteController.deletedireccion); 


router.get("/favoritos", authMiddleware, clienteController.favoritos); 
router.post("/favoritos/toggle/:id([0-9]+)", authMiddleware, clienteController.toggleFavorito); 

*/
module.exports = router;
