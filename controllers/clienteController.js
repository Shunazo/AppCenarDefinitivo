const Usuario = require("../models/usuario");
const Cliente = require("../models/cliente");
const Pedido = require("../models/pedido");
const Direccion = require("../models/direccion");
const Favorito = require("../models/favorito");
const tipoComercio = require("../models/tipocomercio");
const Comercio = require("../models/comercio");
const Producto = require("../models/producto");
const ProductoPedido = require("../models/productopedido");
const Delivery = require("../models/delivery");
const Configuracion = require("../models/configuracion");
const Categoria = require("../models/categoria");
const { productos } = require("./comercioController");
const { clientes } = require("./adminController");

exports.home = async (req, res) => {
    try {
        const usuarioRecord = await Usuario.findOne({ where: { id: req.session.userId } });
        const tiposComercio = await tipoComercio.findAll({ 
            attributes: ["id", "nombre", "icono"],
            order: [["nombre", "ASC"]]
        });

        if (!tiposComercio.length === 0) {
            return res.render("cliente/home-cliente", {
              pageTitle: "Home",
              usuario: usuarioRecord.dataValues,
              tiposComercio: [],
              message: "No existen tipos de comercio actualmente.",
            });
          }

        res.render("cliente/home-cliente", { 
            pageTitle: "Home", 
            usuario: usuarioRecord.dataValues,
            tiposComercio: tiposComercio.map(t => t.dataValues),
        });

    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al cargar el home. Intente más tarde." });
    }
};

exports.editPerfilForm = async (req, res) => {
  try {
      const usuarioRecord = await Usuario.findByPk(req.session.userId);
      
      if (!usuarioRecord) {
          return res.status(404).json({ error: "Usuario no encontrado." });
      }

      res.render("cliente/perfil-cliente", {
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
      const usuarioRecord = await Usuario.findByPk(req.session.userId);
      
      if (!usuarioRecord) {
          return res.render("404", { pageTitle: "Usuario no encontrado." });
      }

      const { nombre, apellido, telefono } = req.body;
      const fotoPerfil = req.files && req.files.fotoPerfil ? "/images/" + req.files.fotoPerfil[0].filename : usuarioRecord.fotoPerfil;

    
      if (!req.files && !fotoPerfil) {
          return res.render("404", { pageTitle: "La imagen es obligatoria." });
      }

      if (!nombre || !apellido || !telefono) {
          return res.render("404", { pageTitle: "Todos los campos son obligatorios." });
      }

      await usuarioRecord.update({
          nombre,
          apellido,
          telefono,
          fotoPerfil,
      });

      res.redirect("/cliente/home");

  } catch (error) {
      console.log(error);
      res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
  }
};

exports.tipoComercio = async (req, res) => {
  try {
      const tipoId = req.query.tipoComercioId || req.params.id; 
      const searchQuery = req.query.search ? req.query.search.toLowerCase() : "";
      const usuarioId = req.session.userId;
      const usuarioRecord = await Usuario.findByPk(req.session.userId);
      const clienteRecord = await Cliente.findOne({ where: { usuarioId } });

      if (!clienteRecord) {
          return res.status(404).render("404", { pageTitle: "Cliente no encontrado" });
      }
  
      const comercios = await Comercio.findAll({
          where: { tipoComercioId: tipoId },
          attributes: ["id", "nombreComercio", "logo"],
          order: [["nombreComercio", "ASC"]],
      });
  
      const favoritos = await Favorito.findAll({
          where: { clienteId: clienteRecord.id },
          attributes: ["comercioId"], 
      });
      
      const favoritosSet = new Set(favoritos.map(fav => fav.comercioId));
  
      const filteredComercios = searchQuery
          ? comercios.filter((comercio) =>
              comercio.nombreComercio.toLowerCase().includes(searchQuery)
            )
          : comercios;
  
      const tipocomercioRecord = await tipoComercio.findByPk(tipoId, {
          attributes: ["nombre"],
      });
  
      if (!tipocomercioRecord) {
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
          pageTitle: `Comercios de tipo ${tipocomercioRecord.nombre}`,
          usuario: usuarioRecord.dataValues,
          cliente: clienteRecord.dataValues,
          tipoNombre: tipocomercioRecord.nombre,
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
    const usuarioId = req.session.userId;
    const clienteRecord = await Cliente.findOne({ where: { usuarioId } });

    if (!clienteRecord) {
      return res.status(404).render("404", { pageTitle: "Cliente no encontrado" });
    }

    const clienteId = clienteRecord.id;
   
    const favorito = await Favorito.findOne({
      where: { clienteId, comercioId },
    });

   
    if (favorito) {
      await favorito.destroy();
    } else {
      await Favorito.create({ clienteId, comercioId });
    }


      res.redirect("/cliente/favoritos");
    
  } catch (error) {
    console.log(error);
    res.render("404", { pageTitle: "Error al procesar solicitud. Intente más tarde." });
  }
};

exports.favoritos = async (req, res) => {
    try {
      const usuarioId = req.session.userId; 
      const usuarioRecord = await Usuario.findByPk(usuarioId);
      const clienteRecord = await Cliente.findOne({ where: { usuarioId } });
  
      
      const favoritos = await Favorito.findAll({
        where: { clienteId: clienteRecord.id },
        include: { model: Comercio, as: "comercio" },
      });
  
      // If the user has no favoritos
      if (favoritos.length === 0) {
        return res.render("cliente/misFavoritos", {
          pageTitle: "Mis Favoritos",
          usuario: usuarioRecord.dataValues,
          cliente: clienteRecord.dataValues,
          favoritos: [],
          message: "No tienes comercios favoritos.",
        });
      }
  
      // Map the favoritos to include a 'catalogoUrl' field for each comercio
      const comerciosFavoritos = favoritos.map(fav => {
        return {
          ...fav.comercio.dataValues,
          catalogoUrl: `/catalogo/${fav.comercio.id}`,  // Add the catalogo URL here
        };
      });
  
      // Render the 'misFavoritos' page with the updated comerciosFavoritos array
      res.render("cliente/misFavoritos", {
        pageTitle: "Mis Favoritos",
        usuario: usuarioRecord.dataValues,
        favoritos: comerciosFavoritos,  // Pass the updated comerciosFavoritos list
      });
    } catch (error) {
      console.log(error);
      res.render("404", { pageTitle: "Error al cargar los favoritos. Intente más tarde." });
    }
};
  

  


  exports.catalogo = async (req, res) => {
    try {
      const usuarioRecord = await Usuario.findByPk(req.session.userId);
        const comercioId = req.params.id;

        if (req.session.comercioId && req.session.comercioId !== comercioId) {
          req.session.cart = [];
      }

      req.session.comercioId = comercioId;

        const comercio = await Comercio.findByPk(comercioId, {
            include: [
                {
                    model: Categoria,
                    as: "categorías",
                    include: [
                        {
                            model: Producto,
                            as: "productos",
                        },
                    ],
                },
            ],
        });

        if (!comercio) {
            return res.status(404).render("404", { pageTitle: "Comercio no encontrado" });
        }
        

        const cart = req.session.cart || [];
        const subtotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

        const categorias = comercio.categorías.map(categoria => ({
            ...categoria.dataValues,
            productos: categoria.productos.map(producto => producto.dataValues),
        }));

        res.render("cliente/catalogo-comercio", {
            pageTitle: `Catálogo de ${comercio.nombreComercio}`,
            usuario: usuarioRecord.dataValues,
            comercioId, 
            comercio: comercio.dataValues,
            categorias: categorias,
            cart,
            subtotal,
            itbis: await Configuracion.findOne(),
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al cargar el catálogo. Intente más tarde." });
    }
};


  
  exports.addToCart = async (req, res) => {
    try {
        const productoId = req.params.productoId;
        const comercioId = req.params.comercioId;
        const producto = await Producto.findByPk(productoId);

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Check if the product is already in the cart
        const existingProduct = req.session.cart.find(item => item.id === producto.id);

        if (!existingProduct) {
            req.session.cart.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1,
            });
        }

        // Redirect back to the catalog page
        res.redirect(`/cliente/catalogo/${comercioId}`);
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al agregar al carrito. Intente más tarde." });
    }
};
exports.removeFromCart = async (req, res) => {
  try {
      const comercioId = req.params.comercioId;
      const productoId = parseInt(req.params.productoId);

      if (!req.session.cart) {
          req.session.cart = [];
      }

      // Check if the product exists in the cart
      const existingProductIndex = req.session.cart.findIndex(item => item.id === productoId);

      if (existingProductIndex !== -1) {
          // Remove the product from the cart
          req.session.cart.splice(existingProductIndex, 1);
      }

      // Redirect back to the catalog page
      res.redirect(`/cliente/catalogo/${comercioId}`);
  } catch (error) {
      console.error(error);
      res.render("404", { pageTitle: "Error al eliminar del carrito. Intente más tarde." });
  }
};



exports.renderCart = async (req, res) => {
  try {
      // Retrieve comercioId from session
      const comercioId = req.session.comercioId;
      
      if (!comercioId) {
          return res.status(404).render("404", { pageTitle: "Comercio no seleccionado" });
      }

      const comercioRecord = await Comercio.findByPk(comercioId);  
      const usuarioRecord = await Usuario.findByPk(req.session.userId);
      const cliente = await Cliente.findOne({ where: { usuarioId: req.session.userId } });
      const direcciones = await Direccion.findAll({ where: { ClienteId: cliente.id } });
      const cart = req.session.cart || [];
      
      const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0).toFixed(2); // Round total to 2 decimals
      const itbisConfig = await Configuracion.findOne();
      const itbisRate = itbisConfig ? itbisConfig.itbis : 18;
      const itbisTotal = (total * itbisRate / 100).toFixed(2);  // Round ITBIS to 2 decimals
      const grandTotal = (parseFloat(total) + parseFloat(itbisTotal)).toFixed(2); // Round grand total to 2 decimals

      // Ensure comercioRecord exists
      if (!comercioRecord) {
          return res.status(404).render("404", { pageTitle: "Comercio no encontrado" });
      }

      res.render("cliente/miCarrito", {
          pageTitle: "Mi Carrito",
          usuario: usuarioRecord.dataValues,
          comercio: comercioRecord.dataValues,
          direcciones: direcciones.map(d => d.dataValues),
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


exports.checkout = async (req, res) => {
  try {
    console.log(req.body);
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

    const itbisRate = itbisConfig.itbis || 18;  // ITBIS rate, default to 18%

    const subtotal = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    
    const itbisAmount = (subtotal * itbisRate / 100).toFixed(2);  // ITBIS amount, rounded to 2 decimal places
    const total = (parseFloat(subtotal) + parseFloat(itbisAmount)).toFixed(2);  // Total, rounded to 2 decimal places

    const pedidoRecord = await Pedido.create({
      estado: "pendiente",  
      subtotal: parseFloat(subtotal.toFixed(2)),  // Round subtotal to 2 decimal places
      itbis: parseFloat(itbisAmount),  // Round ITBIS to 2 decimal places
      total: parseFloat(total),  // Round total to 2 decimal places
      fechaHora: new Date(),  
      clienteId: req.session.clienteId, 
      comercioId: req.session.comercioId,  
      direccionId,  
    });

    for (const item of cart) {
      await ProductoPedido.create({
        cantidad: item.cantidad,  
        precio: item.precio,  
        pedidoId: pedidoRecord.id,  
        productoId: item.id,  
      });
    }

    req.session.cart = [];

    res.redirect("/cliente/home");

  } catch (error) {
    console.log(error);
    res.render("404", { pageTitle: "Error al realizar el pedido. Intente más tarde." });
  }
};

  

  exports.pedidos = async (req, res) => {
    try {
        const usuarioRecord = await Usuario.findByPk(req.session.userId);
        const clienteId = req.session.clienteId;

        // Fetch the pedidos for the logged-in cliente (user)
        const pedidos = await Pedido.findAll({
            where: { clienteId },
            include: [
                {
                    model: ProductoPedido,  // Include the intermediary table ProductoPedido
                    as: "productosPedido",
                    include: [
                        {
                            model: Producto,  // Include related Producto data
                            as: "producto",
                        },
                    ],
                },
                {
                    model: Comercio,  // Include related Comercio data for logo and name
                    as: "comercio",
                },
            ],
        });

        // Map over the pedidos to calculate the total products, add comercio details, and format fechaHora
        const pedidosWithDetails = pedidos.map((pedido) => {
            const totalProductos = pedido.productosPedido.reduce(
                (acc, productoPedido) => acc + productoPedido.cantidad,
                0
            );

            // Format fechaHora to a readable format
            const formattedFechaHora = pedido.fechaHora.toLocaleString();

            // Get the dataValues for all instances
            const pedidoData = pedido.dataValues;
            const comercioData = pedidoData.comercio ? pedidoData.comercio.dataValues : {};
            const productos = pedidoData.productosPedido.map((productoPedido) => ({
                productoId: productoPedido.productoId,
                nombre: productoPedido.producto.dataValues.nombre,
                cantidad: productoPedido.cantidad,
                precio: productoPedido.precio,
            }));

            // Return the modified object with all dataValues
            return {
                ...pedidoData,  // Include original pedido data
                totalProductos,  // Add total count of products in the order
                fechaHora: formattedFechaHora,  // Formatted fechaHora
                comercio: comercioData,  // Comercio data in dataValues
                productos,  // List of products in the pedido
            };
        });

        res.render("cliente/misPedidos", {
            pageTitle: "Mis Pedidos",
            pedidos: pedidosWithDetails,  // Pass the orders with product details
            usuario: usuarioRecord.dataValues,  // Make sure usuario is passed in dataValues
        });
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al cargar los pedidos. Intente más tarde." });
    }
};

  
  exports.pedidoDetalle = async (req, res) => {
    try {
        const usuarioRecord = await Usuario.findByPk(req.session.userId);
        const pedidoId = req.params.id;

        // Fetch the pedido along with its productos and comercio information
        const pedidoRecord = await Pedido.findByPk(pedidoId, {
            include: [
                {
                    model: ProductoPedido,  // Include the intermediary table ProductoPedido
                    as: "productosPedido",
                    include: [
                        {
                            model: Producto,  // Include related Producto data
                            as: "producto",
                        },
                    ],
                },
                {
                    model: Comercio,  // Include related Comercio data for name and logo
                    as: "comercio",
                },
            ],
        });

        if (!pedidoRecord) {
            return res.status(404).render("404", { pageTitle: "Pedido no encontrado" });
        }

        // Access dataValues to get the actual data
        const pedidoData = pedidoRecord.dataValues;

        // Format the fechaHora
        const formattedFechaHora = pedidoData.fechaHora.toLocaleString();

        const productos = pedidoData.productosPedido.map((productoPedido) => ({
            imagen: productoPedido.producto.dataValues.imagen,
            nombre: productoPedido.producto.dataValues.nombre,
            precio: productoPedido.precio,
            cantidad: productoPedido.cantidad,
        }));

        const comercioData = pedidoData.comercio.dataValues;

        res.render("cliente/pedido-detalle", {
            pageTitle: `Detalles del Pedido ${pedidoId}`,
            pedido: {
                ...pedidoData,
                fechaHora: formattedFechaHora, // Pass the formatted fechaHora
            },
            productos,          // Pass the list of products
            comercio: comercioData, // Pass the comercio data
            usuario: usuarioRecord.dataValues,
        });
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al cargar el detalle del pedido. Intente más tarde." });
    }
};





  exports.direcciones = async (req, res) => {
    try {
      const usuarioRecord = await Usuario.findByPk(req.session.userId);
        const usuarioId = req.session.userId;

        const cliente = await Cliente.findOne({ where: { usuarioId } });

        if (!cliente) {
            return res.render("404", { pageTitle: "Usuario no encontrado como cliente." });
        }

        const direcciones = await Direccion.findAll({
            where: { clienteId: cliente.id },
        });

        res.render("cliente/misDirecciones", {
            pageTitle: "Mis Direcciones",
            direcciones: direcciones.map(direccion => direccion.dataValues),
            usuario: usuarioRecord.dataValues,
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

      const cliente = await Cliente.findOne({ where: { usuarioId: req.session.userId } });

      if (!cliente) {
          return res.render("404", { pageTitle: "Usuario no encontrado como cliente." });
      }

      await Direccion.create({
          clienteId: cliente.id,
          nombre,
          descripcion,
      });

      res.redirect("/cliente/direcciones");
  } catch (error) {
      console.log(error);
      res.render("404", { pageTitle: "Error al crear la dirección. Intente más tarde." });
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

        res.redirect("/cliente/direcciones");  
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
