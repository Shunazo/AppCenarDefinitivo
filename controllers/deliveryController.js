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
        const delivery = await Delivery.findOne({ where: { usuarioId: req.session.userId } });

        if (!delivery) {
            return res.redirect("/");
        }
        
        const pedidos = await Pedido.findAll({
            where: { 
                deliveryId: delivery.id, 
                estado: { [Op.in]: ['en proceso', 'completado']}
            },  
            include: [
                {
                    model: Comercio,
                    attributes: ['logo', 'nombreComercio'],
                },
                {
                    model: ProductoPedido,
                    as: 'productosPedido',
                    attributes: ['cantidad'],
                    include: [{
                        model: Producto,
                        attributes: ['nombre', 'precio', 'imagen'],
                    }]
                }
            ],
            order: [['fechaHora', 'DESC']],
            attributes: ['estado', 'fechaHora', 'total'],
        });

        res.render("delivery/home-delivery", {
            pageTitle: "Home",
            usuario: usuarioRecord.dataValues,
            pedidos: pedidos.map(p => p.dataValues),
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al cargar el home. Intente más tarde." });
    }
};

exports.pedidoDetalle = async (req, res) => {
    try {
        const pedidoRecord = await Pedido.findByPk(req.params.id, {
            include: [
                { model: Comercio, attributes: ['nombreComercio'] },
                { model: ProductoPedido, as: 'productosPedido', 
                    include: [{ model: Producto, attributes: ['nombre', 'precio', 'imagen'] }] }
            ]
        });

        if (!pedidoRecord) {
            return res.render("404", { pageTitle: "Pedido no encontrado." });
        }

        res.render("delivery/detalle-pedido", {
            pageTitle: "Detalle del Pedido",
            pedido: pedidoRecord.dataValues
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