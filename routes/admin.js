const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/", adminController.home); 

router.get("/clientes", adminController.clientes); 
router.post("/clientes/activate/:id([0-9]+)", adminController.activateCliente); 
router.post("/clientes/deactivate/:id([0-9]+)", adminController.deactivateCliente); 

router.get("/deliveries", adminController.deliveries); 
router.post("/deliveries/activate/:id([0-9]+)", adminController.activateDelivery); 
router.post("/deliveries/deactivate/:id([0-9]+)", adminController.deactivateDelivery); 

router.get("/comercios", adminController.comercios); 
router.post("/comercios/activate/:id([0-9]+)", adminController.activateComercio); 
router.post("/comercios/deactivate/:id([0-9]+)", adminController.deactivateComercio);

router.get("/config", adminController.config);
router.get("/config/edit", adminController.editconfigForm);
router.post("/config/edit", adminController.editconfig); 


router.get("/administradores", adminController.administradores);
router.get("/administradores/create", adminController.createAdminForm);
router.post("/administradores/create", adminController.createAdmin);
router.get("/administradores/edit/:id", adminController.editAdminForm);
router.post("/administradores/edit/:id", adminController.editAdmin);
router.post("/administradores/activate/:id", adminController.activateAdmin);
router.post("/administradores/deactivate/:id", adminController.deactivateAdmin);


router.get("/tipo-comercio", adminController.tipoComercio); 
router.get("/tipo-comercio/create", adminController.createtipoComercioForm); 
router.post("/tipo-comercio/create", adminController.createtipoComercio); 
router.get("/tipo-comercio/edit/:id([0-9]+)", adminController.edittipoComercioForm); 
router.post("/tipo-comercio/edit/:id([0-9]+)", adminController.edittipoComercio); 
router.post("/tipo-comercio/delete/:id([0-9]+)", adminController.deletetipoComercio);


module.exports = router;
