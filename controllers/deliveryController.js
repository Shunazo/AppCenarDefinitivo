const Usuario = require("../models/usuario");
const Cliente = require("../models/cliente");
const Pedido = require("../models/pedido");
const Direccion = require("../models/direccion");
const Producto = require("../models/producto");
const ProductoPedido = require("../models/productopedido");
const Delivery = require("../models/delivery");
const Categoria = require("../models/categoria");
const Configuracion = require("../models/configuracion");
const Favorito = require("../models/favorito");
const tipoComercio = require("../models/tipocomercio");
const Comercio = require("../models/comercio");
const { Op } = require("sequelize");

exports.home = async (req, res) => {
    try {
        const usuarioRecord = await Usuario.findOne({ where: { id: req.session.userId } });
        const deliveryRecord = await Delivery.findOne({ where: { usuarioId: req.session.userId } });

        if (!deliveryRecord) {
            return res.redirect("/");
        }
        
        const pedidos = await Pedido.findAll({
            where: { 
                deliveryId: deliveryRecord.id, 
                estado: { [Op.in]: ['en proceso', 'completado'] }
            },  
            include: [
                {
                    model: Comercio,
                    attributes: ['logo', 'nombreComercio'],
                    as: 'comercio',
                },
                {
                    model: ProductoPedido,
                    as: 'productosPedido',
                    attributes: ['cantidad'],
                    include: [{
                        model: Producto,
                        attributes: ['nombre', 'precio', 'imagen'],
                        as: 'producto',
                    }]
                },
                {
                    model: Direccion,  // Include the Direccion model
                    as: 'direccion',   // Assuming this is the alias you have for the relation
                    attributes: ['nombre']  // Only fetch the `nombre` field
                }
            ],
            order: [['fechaHora', 'DESC']],
            attributes: ['id', 'estado', 'fechaHora', 'total'],
        });

        // Mapping and applying `toLocaleString()` to `fechaHora`
        const pedidosFormatted = pedidos.map(pedido => {
            const pedidoData = pedido.dataValues;
            pedidoData.fechaHora = new Date(pedidoData.fechaHora).toLocaleString();
            pedidoData.comercio = pedidoData.comercio.dataValues;
            pedidoData.productosPedido = pedidoData.productosPedido.map(productoPedido => {
                const productoPedidoData = productoPedido.dataValues;
                productoPedidoData.producto = productoPedidoData.producto.dataValues;
                return productoPedidoData;
            });
            if (pedidoData.direccion) {
                pedidoData.direccion = pedidoData.direccion.dataValues.nombre; // Only fetch the `nombre` from direccion
            }
            return pedidoData;
        });

        res.render("delivery/home-delivery", {
            pageTitle: "Home",
            usuario: usuarioRecord.dataValues,
            delivery: deliveryRecord.dataValues,
            pedidos: pedidosFormatted,
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al cargar el home. Intente más tarde." });
    }
};



exports.editperfilForm = async (req, res) => {
    try {
        const deliveryRecord = await Delivery.findOne({ where: { usuarioId: req.session.userId } });

        if (!deliveryRecord) {
            return res.status(404).json({ error: "Delivery no encontrado." });
        }
        const usuarioRecord = await Usuario.findByPk(req.session.userId);
        
        if (!usuarioRecord) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
  
        res.render("delivery/perfil-delivery", {
            pageTitle: "Editar Perfil",
            usuario: usuarioRecord.dataValues,
            delivery: deliveryRecord.dataValues,
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
  
        res.redirect("/delivery/home");
  
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
  };
  

  exports.pedidoDetalle = async (req, res) => {
    try {
        const usuarioRecord = await Usuario.findByPk(req.session.userId);
        const deliveryRecord = await Delivery.findOne({ where: { usuarioId: req.session.userId } });

        if (!usuarioRecord) {
            return res.render("404", { pageTitle: "Usuario no encontrado." });
        }
        const pedidoRecord = await Pedido.findByPk(req.params.id, {
            include: [
                { 
                    model: Comercio, 
                    attributes: ['nombreComercio', 'logo'], 
                    as: 'comercio' 
                },
                { 
                    model: ProductoPedido, 
                    as: 'productosPedido', 
                    include: [{ 
                        model: Producto, 
                        attributes: ['nombre', 'precio', 'imagen'], 
                        as: 'producto' 
                    }] 
                },
                { 
                    model: Direccion, 
                    attributes: ['nombre'], 
                    as: 'direccion' 
                }
            ]
        });

        if (!pedidoRecord) {
            return res.render("404", { pageTitle: "Pedido no encontrado." });
        }

        // Formatear y mapear datos
        const pedidoData = pedidoRecord.dataValues;
        pedidoData.fechaHora = new Date(pedidoData.fechaHora).toLocaleString(); // Formato de fecha y hora local
        pedidoData.comercio = pedidoData.comercio?.dataValues || null;
        pedidoData.direccion = pedidoData.direccion?.dataValues || null;
        pedidoData.productosPedido = pedidoData.productosPedido.map(productoPedido => {
            const productoPedidoData = productoPedido.dataValues;
            productoPedidoData.producto = productoPedidoData.producto?.dataValues || null;
            return productoPedidoData;
        });

        const isPedidoEnProceso = pedidoData.estado === 'en proceso';
        const showAddress = pedidoData.estado !== 'completado';

        res.render("delivery/detalle-pedido", {
            pageTitle: "Detalle del Pedido",
            pedido: pedidoData,
            isPedidoEnProceso,
            showAddress,
            usuario: usuarioRecord.dataValues,
            delivery: deliveryRecord.dataValues
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al cargar el detalle del pedido. Intente más tarde." });
    }
};



exports.completarPedido = async (req, res) => {
    const pedidoId = req.params.id;
    console.log('Pedido ID recibido:', pedidoId); // This will help to check if the ID is being passed correctly

    try {
        // Fetch the pedido from the database
        const pedidoRecord = await Pedido.findByPk(pedidoId);

        if (!pedidoRecord || pedidoRecord.estado !== 'en proceso') {
            return res.render("404", { pageTitle: "Pedido no encontrado o ya completado." });
        }

        // Update the pedido's state to 'completado'
        await pedidoRecord.update({ estado: 'completado' });

        // Update the delivery's state to 'disponible'
        const deliveryRecord = await Delivery.findOne({ where: { usuarioId: req.session.userId } });
        await deliveryRecord.update({ estado: 'disponible' });

        res.redirect("/delivery/home");
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al completar el pedido. Intente más tarde." });
    }
};
