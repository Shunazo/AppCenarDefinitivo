const Usuario = require("../models/usuario");
const Cliente = require("../models/cliente");
const Pedido = require("../models/pedido");
const Direccion = require("../models/direccion");
const Favorito = require("../models/favorito");
const tipoComercio = require("../models/tipocomercio");
const Comercio = require("../models/comercio");

exports.home = async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ where: { id: req.session.userId } });
        const tiposComercio = await tipoComercio.findAll({ 
            attributes: ["nombre", "icono"],
            order: [["nombre", "ASC"]]
        });

  
        if (!tiposComercio.length === 0) {
            return res.render("cliente/home-cliente", {
              pageTitle: "Home",
              tiposComercio: [],
              message: "No existen tipos de comercio actualmente.",
            });
          }

          console.log("FotoPerfil:", usuario?.fotoPerfil);

        res.render("cliente/home-cliente", { 
            pageTitle: "Home", 
            usuario: usuario ? usuario.dataValues : null,
            tiposComercio: tiposComercio.map(t => t.dataValues)
        });

    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al cargar el home. Intente más tarde." });
    }
};

exports.perfil = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.session.userId);

        res.render("cliente/perfil-cliente", { 
            pageTitle: "Perfil",
            usuario: usuario ? usuario.dataValues : null });

    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al cargar el perfil. Intente más tarde." });
    }
};

exports.tipoComercio = async (req, res) => {
    try {
      const tipoId = req.params.tipoId; 
      const searchQuery = req.query.search ? req.query.search.toLowerCase() : "";
      const usuarioId = req.session.userId;
  
     
      const comercios = await Comercio.findAll({
        where: { tipoComercioId: tipoId },
        attributes: ["id", "nombreComercio", "logo"],
        order: [["nombre", "ASC"]],
      });
  
      
      const favoritos = await Favorito.findAll({
        where: { usuarioId },
        attributes: ["comercioId"], 
      });
      
      const favoritosSet = new Set(favoritos.map(fav => fav.comercioId));
  
      const filteredComercios = searchQuery
        ? comercios.filter((comercio) =>
            comercio.nombreComercio.toLowerCase().includes(searchQuery)
          )
        : comercios;
  
      const tipoComercio = await TipoComercio.findByPk(tipoId, {
        attributes: ["nombre"],
      });
  
      if (!tipoComercio) {
        return res.status(404).render("404", { pageTitle: "Tipo de Comercio no encontrado" });
      }
  
      const comerciosWithFavoritoStatus = filteredComercios.map((comercio) => {
        return {
          ...comercio.dataValues,
          isFavorito: favoritosSet.has(comercio.id),
          catalogoUrl: `/catalogo/${comercio.id}`, 
        };
      });
  
      res.render("cliente/tipo-comercio", {
        pageTitle: `Comercios de tipo ${tipoComercio.nombre}`,
        tipoNombre: tipoComercio.nombre,
        comercios: comerciosWithFavoritoStatus, 
        cantidad: filteredComercios.length,
        search: req.query.search,
      });
    } catch (error) {
      console.log(error);
      res.render("404", { pageTitle: "Error al cargar el tipo de comercio. Intente más tarde." });
    }
};

  
  exports.toggleFavorito = async (req, res) => {
    try {
      const comercioId = req.params.id;
      const usuarioId = req.session.usuario.id;
      const tipoId = req.params.tipoId; 
  
     
      const favorito = await Favorito.findOne({
        where: { usuarioId, comercioId },
      });
  
     
      if (favorito) {
        await favorito.destroy();
      } else {
        await Favorito.create({ usuarioId, comercioId });
      }
  
      if (tipoId) {
        res.redirect(`/cliente/tipo-comercio/${tipoId}`);
      } else {
        res.redirect("/cliente/favoritos");
      }
    } catch (error) {
      console.log(error);
      res.render("404", { pageTitle: "Error al procesar solicitud. Intente más tarde." });
    }
  };
  

  exports.favoritos = async (req, res) => {
    try {
      const usuarioId = req.session.usuario.id; 
      
      const favoritos = await Favorito.findAll({
        where: { usuarioId },
        include: { model: Comercio, as: "comercio" }, 
      });
  
     
      if (favoritos.length === 0) {
        return res.render("cliente/misFavoritos", {
          pageTitle: "Mis Favoritos",
          favoritos: [],
          message: "No tienes comercios favoritos.",
        });
      }
  
     
      res.render("cliente/misFavoritos", {
        pageTitle: "Mis Favoritos",
        favoritos: favoritos.map(fav => fav.comercio),
      });
    } catch (error) {
      console.log(error);
      res.render("404", { pageTitle: "Error al cargar los favoritos. Intente más tarde." });
    }
  };
  
  exports.catalogo = async (req, res) => {
    try {
      const comercioId = req.params.comercioId;
      const comercio = await Comercio.findByPk(comercioId, {
        include: [
          {
            model: Categoria,
            as: "categorías",
            include: [
              {
                model: Producto,
                as: "productos",
              }
            ]
          }
        ]
      });
  
      if (!comercio) {
        return res.status(404).render("404", { pageTitle: "Comercio no encontrado" });
      }
  
      const cart = req.session.cart || [];
  
      res.render("cliente/catalogo-comercio", {
        pageTitle: `Catálogo de ${comercio.nombreComercio}`,
        comercio,
        cart,
        itbis: await Configuracion.findOne() 
      });
    } catch (error) {
      console.log(error);
      res.render("404", { pageTitle: "Error al cargar el catálogo. Intente más tarde." });
    }
  };
  
  exports.addToCart = async (req, res) => {
    try {
      const productoId = req.params.productoId;
      const producto = await Producto.findByPk(productoId);
  
      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
  
   
      if (!req.session.cart) {
        req.session.cart = [];
      }
  
      
      const existingProduct = req.session.cart.find(item => item.id === producto.id);
  
      if (existingProduct) {
       
        return res.redirect(`/catalogo/${req.params.comercioId}`);
      } else {
        
        req.session.cart.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
        });
      }
  
      
      res.redirect(`/catalogo/${req.params.comercioId}`);
    } catch (error) {
      console.log(error);
      res.render("404", { pageTitle: "Error al agregar al carrito. Intente más tarde." });
    }
  };

  exports.renderCart = async (req, res) => {
    try {
        const cart = req.session.cart || [];
        const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);  
        const itbisConfig = await Configuracion.findOne();
        const itbisRate = itbisConfig ? itbisConfig.itbis : 18;  
        const itbisTotal = total * itbisRate / 100;  
        const grandTotal = total + itbisTotal;  

        res.render("cliente/miCarrito", {
            pageTitle: "Mi Carrito",
            cart,
            total,
            itbisRate,
            itbisTotal,
            grandTotal,
        });
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al cargar el carrito. Intente más tarde." });
    }
};

exports.removeFromCart = (req, res) => {
    try {
        const { productoId } = req.params;
        let cart = req.session.cart || [];

        cart = cart.filter(item => item.id !== parseInt(productoId));

        req.session.cart = cart;  
        res.redirect("cliente/miCarrito");  
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al eliminar del carrito. Intente más tarde." });
    }
};


  exports.checkout = async (req, res) => {
    try {
      const { direccionId } = req.body;  
      const cart = req.session.cart || [];
  
     
      if (!direccionId) {
        return res.status(400).json({ error: "Debe seleccionar una dirección." });
      }
  
     
      if (cart.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío." });
      }
  
      
      const itbisConfig = await Configuracion.findOne();
      if (!itbisConfig) {
        return res.status(500).json({ error: "Configuración de ITBIS no encontrada." });
      }
      
      const itbisRate = itbisConfig.itbis || 18;  
      
      const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  
      const total = subtotal + (subtotal * itbisRate / 100);
  
    
      const pedido = await Pedido.create({
        estado: "pendiente",  
        subtotal,
        itbis: (subtotal * itbisRate / 100),
        total,
        fechaHora: new Date(),  
        clienteId: req.session.usuario.id, 
        comercioId: req.params.comercioId,  
        direccionId,  
      });
  
    
      for (const item of cart) {
        await ProductoPedido.create({
          cantidad: item.cantidad,  
          precio: item.precio,  
          pedidoId: pedido.id,  
          productoId: item.id,  
        });
      }
  
     
      req.session.cart = [];
  
     
      res.redirect("cliente/home-cliente");
  
    } catch (error) {
      console.log(error);
      res.render("404", { pageTitle: "Error al realizar el pedido. Intente más tarde." });
    }
  };
  

  



exports.editPerfilForm = async (req, res) => {
    try {
        const usuarioRecord = await Usuario.findByPk(req.session.usuario.id);
        
        if (!usuarioRecord) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        res.render("cliente/edit-perfil-cliente", {
            pageTitle: "Editar Perfil",
            usuario: usuarioRecord.dataValues,
            currentImage: usuarioRecord.fotoPerfil || null 
        });
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};

  
exports.editPerfil = async (req, res) => {
    try {
        const usuarioRecord = await Usuario.findByPk(req.session.usuario.id);
        
        if (!usuarioRecord) {
            return res.render("404", { pageTitle: "Usuario no encontrado." });
        }

        const { nombre, apellido, email, telefono } = req.body;
        
       
        const fotoPerfil = req.files && req.files.fotoPerfil ? "/" + req.files.fotoPerfil[0].filename : usuario.fotoPerfil;

      
        if (!req.files && !fotoPerfil) {
            return res.render("404", { pageTitle: "La imagen es obligatoria." });
        }

        await usuario.update({
            nombre,
            apellido,
            email,
            telefono,
            fotoPerfil,
        });

        res.redirect("/cliente/perfil");

    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};




exports.pedidos = async (req, res) => {
    try {
      const usuarioId = req.session.usuario.id;
      const pedidos = await Pedido.findAll({ where: { clienteId: usuarioId } });
  
      res.render("cliente/misPedidos", {
        pageTitle: "Mis Pedidos",
        pedidos: pedidos.map(pedido => pedido.dataValues),
      });
    } catch (error) {
      console.log(error);
      res.render("404", { pageTitle: "Error al cargar los pedidos. Intente más tarde." });
    }
  };
  
  exports.pedidoDetalle = async (req, res) => {
    try {
      const pedidoId = req.params.id;
      const pedidoRecord = await Pedido.findByPk(pedidoId, {
        include: [
          {
            model: Producto,
            as: "productos",
            through: { attributes: ["cantidad", "precio"] },
          },
        ],
      });
  
      if (!pedidoRecord) {
        return res.status(404).render("404", { pageTitle: "Pedido no encontrado" });
      }
  
      res.render("cliente/pedido-detalle", {
        pageTitle: `Detalles del Pedido ${pedidoId}`,
        pedido: pedidoRecord.dataValues,
      });
    } catch (error) {
      console.log(error);
      res.render("404", { pageTitle: "Error al cargar el detalle del pedido. Intente más tarde." });
    }
  };
  



exports.direcciones = async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;
        const direcciones = await Direccion.findAll({
            where: { clienteId: usuarioId },
        });

        res.render("cliente/misDirecciones", {
            pageTitle: "Mis Direcciones",
            direcciones: direcciones.map(direccion => direccion.dataValues),
        });
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al cargar las direcciones. Intente más tarde." });
    }
};

exports.createdireccionForm = (req, res) => {
    res.render("cliente/crear-direccion", { pageTitle: "Crear Dirección" });
};

exports.createdireccion = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const direccionRecord = await Direccion.create({
            clienteId: req.session.usuario.id,
            nombre,
            descripcion,
        });

        res.redirect("/cliente/misDirecciones");
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al crear la direccion. Intente más tarde." });
    }
};

exports.editdireccionForm = async (req, res) => {
    try {
        const direccionId = req.params.id;
        const direccionRecord = await Direccion.findByPk(direccionId);

        if (!direccionRecord) {
            return res.status(404).render("404", { pageTitle: "Dirección no encontrada" });
        }

        res.render("cliente/editar-direccion", {
            pageTitle: "Editar Dirección",
            direccion: direccionRecord.dataValues,
        });
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al cargar la direccion. Intente más tarde." });
    }
};

exports.editdireccion = async (req, res) => {
    try {
        const direccionId = req.params.id;
        const { nombre, descripcion } = req.body;

        const direccionRecord = await Direccion.findByPk(direccionId);

        if (!direccionRecord) {
            return res.status(404).json({ error: "Dirección no encontrada." });
        }

        await direccionRecord.update({
            nombre,
            descripcion,
        });

        res.redirect("/cliente/misDirecciones");  
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al editar la direccion. Intente más tarde." });
    }
};


exports.deletedireccion = async (req, res) => {
    try {
        const direccionId = req.params.id;

        const direccionRecord = await Direccion.findByPk(direccionId);

        if (!direccionRecord) {
            return res.status(404).json({ error: "Dirección no encontrada." });
        }

        await direccionRecord.destroy(); 

        res.redirect("/cliente/direcciones");  
    } catch (error) {
       console.log(error);
        res.render("404", { pageTitle: "Error al eliminar la direccion. Intente más tarde." });
    }
};
