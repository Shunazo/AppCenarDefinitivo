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
        
        const pedidos = await Pedido.findAll({
            where: { comercioId: req.session.comercioId }, 
            order: [['fechaHora', 'DESC']],  
            include: [
                {
                    model: Comercio,
                    as: 'comercio',
                    attributes: ['logo', 'nombreComercio'],
                },
                {
                    model: ProductoPedido,
                    as: 'productosPedido',
                    attributes: ['cantidad'],
                    include: [
                        {
                            model: Producto,
                            as: 'producto',
                            attributes: ['nombre', 'precio', 'imagen'],
                        }
                    ]
                }
            ]
        });

        if (!pedidos.length === 0) {
            return res.render('comercio/home-comercio', 
                { pageTitle: 'Home', 
                    usuario: usuarioRecord.dataValues, 
                    pedidos: [], 
                    message: 'No existen pedidos actualmente' 
                });
            }

        res.render('comercio/home-comercio', {
            pageTitle: 'Home',
            usuario: usuarioRecord.dataValues,
            pedidos: pedidos.map(p => p.dataValues),
        });
    } 
    catch (error) {
        console.error(error);
        res.render('404', { pageTitle: 'Error al cargar la home. Intente más tarde.' });
    }
};

exports.pedidoDetalle = async (req, res) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id, {
            include: [
                {
                    model: Comercio,
                    as: 'comercio',
                    attributes: ['nombreComercio', 'logo'],
                },
                {
                    model: ProductoPedido,
                    as: 'productosPedido',
                    include: [
                        {
                            model: Producto,
                            as: 'producto',
                            attributes: ['nombre', 'precio', 'imagen'],
                        }
                    ]
                },
                {
                    model: Delivery,
                    as: 'delivery',
                    attributes: ['id', 'estado'],
                }
            ]
        });

        if (!pedido) {
            return res.status(404).send('Pedido no encontrado');
        }

        res.render('comercio/pedido-detalle', {
            pageTitle: 'Detalles del Pedido',
            pedido,
        });
    } catch (error) {
        console.error(error);
        res.render('404', { pageTitle: 'Error al cargar el detalle del pedido' });
    }
};

exports.assignDelivery = async (req, res) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id);
        
        if (pedido.estado !== 'pendiente') {
            return res.status(400).send('Este pedido no está en estado pendiente.');
        }

        const availableDelivery = await Delivery.findOne({
            where: { estado: 'disponible' },
        });

        if (!availableDelivery) {
            return res.status(400).send('No hay delivery disponible en este momento.');
        }

       await pedido.update({ estado: 'en proceso', deliveryId: availableDelivery.id });
       await availableDelivery.update({ estado: 'ocupado' });

        res.redirect(`/comercio/pedidos/${pedido.id}`);
    } catch (error) {
        console.error(error);
        res.render('404', { pageTitle: 'Error al asignar el delivery' });
    }
};



