const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const authMiddleware = require("../middleware/is-auth");

// Home and Profile
router.get("/home", authMiddleware, clienteController.home); 
router.get("/perfil/edit", authMiddleware, clienteController.editPerfilForm);  
router.post("/perfil/edit", authMiddleware, clienteController.editPerfil);  

// Tipo Comercio (Business Category)
router.get("/tipo-comercio/:id([0-9]+)", authMiddleware, clienteController.tipoComercio);
router.post("/favoritos/toggle/:id([0-9]+)", authMiddleware, clienteController.toggleFavorito);
router.get("/favoritos", authMiddleware, clienteController.favoritos);

// Catalogo (Catalog)
router.get("/catalogo/:id([0-9]+)", authMiddleware, clienteController.catalogo); 

// Carrito (Cart)
router.post("/cart/add/:productoId/:comercioId", authMiddleware, clienteController.addToCart);
router.post("/cart/remove/:productoId/:comercioId", authMiddleware, clienteController.removeFromCart);
router.get("/cart", authMiddleware, clienteController.renderCart);  
router.post("/checkout", authMiddleware, clienteController.checkout);

// Orders (Pedidos)
router.get("/pedidos", authMiddleware, clienteController.pedidos);  
router.get("/pedidos/:id([0-9]+)", authMiddleware, clienteController.pedidoDetalle); 

// Direcciones (Addresses)
router.get("/direcciones", authMiddleware, clienteController.direcciones);  
router.get("/direcciones/create", authMiddleware, clienteController.createdireccionForm); 
router.post("/direcciones/create", authMiddleware, clienteController.createdireccion);  
router.get("/direcciones/edit/:id([0-9]+)", authMiddleware, clienteController.editdireccionForm); 
router.post("/direcciones/edit/:id([0-9]+)", authMiddleware, clienteController.editdireccion);  
router.post("/direcciones/delete/:id([0-9]+)", authMiddleware, clienteController.deletedireccion);  

module.exports = router;

