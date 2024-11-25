const express = require("express");
const router = express.Router();
const comercioController = require("../controllers/comercioController");

router.get("/", comercioController.home); 

router.get("/perfil", comercioController.perfil);
router.get("/perfil/edit", comercioController.editperfilForm); 
router.post("/perfil/edit", comercioController.editperfil); 


router.get("/categorias", comercioController.categorias);
router.get("/categorias/create", comercioController.createcategoriaForm); 
router.post("/categorias/create", comercioController.createcategoria);
router.get("/categorias/edit/:id([0-9]+)", comercioController.editcategoriaForm); 
router.post("/categorias/edit/:id([0-9]+)", comercioController.editcategoria); 
router.post("/categorias/delete/:id([0-9]+)", comercioController.deletecategoria);


router.get("/productos", comercioController.productos);
router.get("/productos/create", comercioController.createproductoForm); 
router.post("/productos/create", comercioController.createproducto);
router.get("/productos/edit/:id([0-9]+)", comercioController.editproductoForm); 
router.post("/productos/edit/:id([0-9]+)", comercioController.editproducto); 
router.post("/productos/delete/:id([0-9]+)", comercioController.deleteproducto);


router.get("/ordenes", comercioController.ordenes); 
router.get("/ordenes/:id([0-9]+)", comercioController.ordenDetalle);
router.post("/ordenes/assign/:id([0-9]+)", comercioController.assignDelivery);


module.exports = router;

