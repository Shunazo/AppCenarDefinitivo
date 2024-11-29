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
            ],
            attributes: ["id", 'estado', 'fechaHora', 'total']
        });

        if (pedidos.length === 0) {
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

exports.editperfilForm = async (req, res) => {
    try {
        const comercioRecord = await Comercio.findByPk(req.session.comercioId , {
            include: [{ model: Usuario, as: "usuario" }]
        });
        
        if (!comercioRecord) {
            return res.status(404).json({ error: "Comercio no encontrado." });
        }

        res.render("comercio/perfil-comercio", {
            pageTitle: "Editar Perfil",
            comercio: comercioRecord.dataValues,
            currentImage: comercioRecord.logo || null 
        });
    } catch (error) {
        console.log(error);
        res.render("404", { 
            pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }    
};

exports.editperfil = async (req, res) => {
    try {
        const comercioRecord = await Comercio.findByPk(req.session.comercioId, {
            include: [{ model: Usuario, as: "usuario" }]
        });
        
        if (!comercioRecord) {
            return res.render("404", { pageTitle: "Comercio no encontrado." });
        }

        const { horaApertura, horaCierre, telefono, correo } = req.body;
        const logo = req.files && req.files.logo ? "/images/" + req.files.logo[0].filename : comercioRecord.logo;

        if (!req.files && !logo) {
            return res.render("404", { pageTitle: "La imagen es obligatoria." });
        }

        if (!horaApertura || !horaCierre || !telefono || !correo) {
            return res.render("404", { pageTitle: "Todos los campos son obligatorios." });
        }

        await comercioRecord.usuario.update({
            telefono,
            correo,
            fotoPerfil: logo
        })

        await comercioRecord.update({
            horaApertura,
            horaCierre,
            logo
        });

        res.redirect("/comercio/home");
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};

exports.categorias
             




