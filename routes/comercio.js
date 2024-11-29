const express = require("express");
const router = express.Router();
const comercioController = require("../controllers/comercioController");
const authMiddleware = require("../middleware/is-auth");

router.get("/", authMiddleware, comercioController.home); 

router.get("/pedidos/:id([0-9]+)", authMiddleware, comercioController.pedidoDetalle);
router.post("/pedidos/assign/:id([0-9]+)", authMiddleware, comercioController.assignDelivery);

router.get("/perfil/edit", authMiddleware, comercioController.editperfilForm); 
router.post("/perfil/edit", authMiddleware, comercioController.editperfil); 

/*
router.get("/categorias", authMiddleware, comercioController.categorias);
router.get("/categorias/create", authMiddleware, comercioController.createcategoriaForm); 
router.post("/categorias/create", authMiddleware, comercioController.createcategoria);
router.get("/categorias/edit/:id([0-9]+)", authMiddleware, comercioController.editcategoriaForm); 
router.post("/categorias/edit/:id([0-9]+)", authMiddleware, comercioController.editcategoria); 
router.post("/categorias/delete/:id([0-9]+)", authMiddleware, comercioController.deletecategoria);

router.get("/productos", authMiddleware, comercioController.productos);
router.get("/productos/create", authMiddleware, comercioController.createproductoForm); 
router.post("/productos/create", authMiddleware, comercioController.createproducto);
router.get("/productos/edit/:id([0-9]+)", authMiddleware, comercioController.editproductoForm); 
router.post("/productos/edit/:id([0-9]+)", authMiddleware, comercioController.editproducto); 
router.post("/productos/delete/:id([0-9]+)", authMiddleware, comercioController.deleteproducto);

*/
module.exports = router; 

