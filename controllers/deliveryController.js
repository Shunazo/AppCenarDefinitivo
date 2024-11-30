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
                estado: { [Op.in]: ['en proceso', 'completado']}
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
                }
            ],
            order: [['fechaHora', 'DESC']],
            attributes: ['estado', 'fechaHora', 'total'],
        });

        res.render("delivery/home-delivery", {
            pageTitle: "Home",
            usuario: usuarioRecord.dataValues,
            delivery: deliveryRecord.dataValues,
            pedidos: pedidos.map(p => p.dataValues),
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al cargar el home. Intente más tarde." });
    }
};

exports.editperfilForm = async (req, res) => {
    try {
        const usuarioRecord = await Usuario.findByPk(req.session.userId);
        
        if (!usuarioRecord) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
  
        res.render("delivery/perfil-delivery", {
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
  

exports.pedidoDetalle = async (req, res) => {
    try {
        const pedidoRecord = await Pedido.findByPk(req.params.id, {
            include: [
                { model: Comercio, attributes: ['nombreComercio'] },
                { model: ProductoPedido, as: 'productosPedido', 
                    include: [{ model: Producto, attributes: ['nombre', 'precio', 'imagen'] }] },
                { model: Direccion, attributes: ['nombre'] }  // Include Direccion here
            ]
        });

        if (!pedidoRecord) {
            return res.render("404", { pageTitle: "Pedido no encontrado." });
        }

        const isPedidoEnProceso = pedidoRecord.estado === 'en proceso';
        const showAddress = pedidoRecord.estado !== 'completado';

        res.render("delivery/detalle-pedido", {
            pageTitle: "Detalle del Pedido",
            pedido: pedidoRecord.dataValues,
            isPedidoEnProceso,
            showAddress,
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al cargar el detalle del pedido. Intente más tarde." });
    }
};


exports.completarPedido = async (req, res) => {
    try {
        const pedidoRecord = await Pedido.findByPk(req.params.id);

        if (!pedidoRecord || pedidoRecord.estado !== 'en proceso') {
            return res.render("404", { pageTitle: "Pedido no encontrado o ya completado." });
        }

        await pedidoRecord.update({ estado: 'completado' });

        const deliveryRecord = await Delivery.findOne({ where: { usuarioId: req.session.userId } });
        await deliveryRecord.update({ estado: 'disponible' });

        res.redirect("/delivery/home");
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al completar el pedido. Intente más tarde." });
    }
};