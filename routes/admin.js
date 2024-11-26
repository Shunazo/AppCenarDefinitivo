const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/is-auth");

router.get("/", authMiddleware, adminController.home); 

router.get("/clientes", authMiddleware, adminController.clientes); 
router.post("/clientes/activate/:id([0-9]+)", authMiddleware, adminController.activateCliente); 
router.post("/clientes/deactivate/:id([0-9]+)", authMiddleware, adminController.deactivateCliente); 

router.get("/deliveries", authMiddleware, adminController.deliveries); 
router.post("/deliveries/activate/:id([0-9]+)", authMiddleware, adminController.activateDelivery); 
router.post("/deliveries/deactivate/:id([0-9]+)", authMiddleware, adminController.deactivateDelivery); 

router.get("/comercios", authMiddleware, adminController.comercios); 
router.post("/comercios/activate/:id([0-9]+)", authMiddleware, adminController.activateComercio); 
router.post("/comercios/deactivate/:id([0-9]+)", authMiddleware, adminController.deactivateComercio);

router.get("/config", authMiddleware, adminController.config);
router.get("/config/edit", authMiddleware, adminController.editconfigForm);
router.post("/config/edit", authMiddleware, adminController.editconfig); 


router.get("/administradores", authMiddleware, adminController.administradores);
router.get("/administradores/create", authMiddleware, adminController.createAdminForm);
router.post("/administradores/create", authMiddleware, adminController.createAdmin);
router.get("/administradores/edit/:id", authMiddleware, adminController.editAdminForm);
router.post("/administradores/edit/:id", authMiddleware, adminController.editAdmin);
router.post("/administradores/activate/:id", authMiddleware, adminController.activateAdmin);
router.post("/administradores/deactivate/:id", authMiddleware, adminController.deactivateAdmin);


router.get("/tipo-comercio", authMiddleware, adminController.tipoComercio); 
router.get("/tipo-comercio/create", authMiddleware, adminController.createtipoComercioForm); 
router.post("/tipo-comercio/create", authMiddleware, adminController.createtipoComercio); 
router.get("/tipo-comercio/edit/:id([0-9]+)", authMiddleware, adminController.edittipoComercioForm); 
router.post("/tipo-comercio/edit/:id([0-9]+)", authMiddleware, adminController.edittipoComercio); 
router.post("/tipo-comercio/delete/:id([0-9]+)", authMiddleware, adminController.deletetipoComercio);


module.exports = router;
