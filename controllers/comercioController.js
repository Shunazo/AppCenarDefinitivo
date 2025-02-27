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
        const comercioRecord = await Comercio.findOne({ where: { id: req.session.comercioId } });
        const estado = req.query.estado || 'todos';
        const filterOptions = estado !== 'todos' ? { estado } : {};
        const pedidos = await Pedido.findAll({
            where: { comercioId: req.session.comercioId, ...filterOptions }, 
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

        // Add total products to each pedido
        const pedidosWithTotalProductos = pedidos.map(p => {
            const totalProductos = p.productosPedido.reduce((acc, prod) => acc + prod.cantidad, 0); 
            return {
                ...p.dataValues,
                totalProductos, 
                fechaHora: p.fechaHora.toLocaleString(),  
                comercio: p.comercio.dataValues // Make sure to include comercio dataValues
            };
        });                                                                                                     

        if (pedidosWithTotalProductos.length === 0) {
            return res.render('comercio/home-comercio', 
                { 
                    pageTitle: 'Home', 
                    comercio: comercioRecord.dataValues,
                    pedidos: [], 
                    message: 'No existen pedidos actualmente' 
                });
        }

        res.render('comercio/home-comercio', {
            pageTitle: 'Home',
            comercio: comercioRecord.dataValues,
            pedidos: pedidosWithTotalProductos,
        });
    } catch (error) {
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

        // Check if there is an available delivery
        const availableDelivery = await Delivery.findOne({
            where: { estado: 'disponible' },
        });

        const pedidoData = pedido.dataValues;
        const comercioData = pedidoData.comercio ? pedidoData.comercio.dataValues : null;
        const productosPedidoData = pedidoData.productosPedido 
            ? pedidoData.productosPedido.map(item => ({
                ...item.dataValues,  
                producto: item.producto ? item.producto.dataValues : null 
            }))
            : [];
        const deliveryData = pedidoData.delivery ? pedidoData.delivery.dataValues : null;

        const fechaHoraFormatted = new Date(pedidoData.fechaHora).toLocaleString();

        const response = {
            pageTitle: 'Detalles del Pedido',
            pedido: {
                ...pedidoData,
                fechaHora: fechaHoraFormatted,  
            },
            comercio: comercioData,
            productosPedido: productosPedidoData,
            delivery: deliveryData,
            availableDelivery: availableDelivery 
        };

        res.render('comercio/pedido-detalle', response);
    } catch (error) {
        console.error(error);
        res.render('404', { pageTitle: 'Error al cargar el detalle del pedido' });
    }
};





exports.assignDelivery = async (req, res) => {
    try {
        const pedidoRecord = await Pedido.findByPk(req.params.id);

        if (!pedidoRecord) {
            console.log(`Pedido not found: ${req.params.id}`);
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        if (pedidoRecord.estado !== 'pendiente') {
            console.log(`Pedido estado is not 'pendiente': ${pedidoRecord.estado}`);
            return res.status(400).json({ error: 'Este pedido ya fue asignado o completado.' });
        }

        const availableDelivery = await Delivery.findOne({
            where: { estado: 'disponible' },
        });

        if (!availableDelivery) {
            console.log('No available delivery found.');
            return res.status(400).json({ error: 'No hay delivery disponible en este momento.' });
        }

        await pedidoRecord.update({ estado: 'en proceso', deliveryId: availableDelivery.id });
        await availableDelivery.update({ estado: 'ocupado' });

        res.redirect('/comercio/home');
    } catch (error) {
        console.error('Error assigning delivery:', error);
        res.status(500).json({ error: 'Error al asignar el delivery' });
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
            usuario: comercioRecord.usuario.dataValues,
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

        // Check if the email is already used by another user
        const existingUser = await Usuario.findOne({
            where: { correo },
        });

        if (existingUser && existingUser.id !== comercioRecord.usuario.id) {
            return res.render("404", {
                pageTitle: "El correo ingresado ya está siendo utilizado por otro usuario.",
            });
        }

        // Update the user and comercio records
        await comercioRecord.usuario.update({
            telefono,
            correo,
            fotoPerfil: logo
        });

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

exports.categorias = async (req, res) => {
    try {
        const comercioRecord = await Comercio.findByPk(req.session.comercioId, {
            include: [{ model: Usuario, as: "usuario" }]
        });
        const categorias = await Categoria.findAll({ 
            where: { comercioId: req.session.comercioId },
            include: [{
                model: Producto,
                as: "productos"  
            }]
        });

        const categoriasData = categorias.map(c => ({
            ...c.dataValues,
            productosCount: c.productos ? c.productos.length : 0
        }))

        res.render("comercio/mantenimiento-Categorias", { 
            pageTitle: "Categorias",
            categorias: categoriasData,
            comercio: comercioRecord.dataValues,
            usuario: comercioRecord.usuario.dataValues,
        });
    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};

exports.createcategoriaForm = async (req, res) => {
    try {
        const comercioRecord = await Comercio.findByPk(req.session.comercioId, {
            include: [{ model: Usuario, as: "usuario" }]
        })
        res.render("comercio/crear-categoria", { 
            pageTitle: "Crear Categoria",
            comercio: comercioRecord.dataValues,
            usuario: comercioRecord.usuario.dataValues,});
    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};

exports.createcategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        await Categoria.create({
            comercioId: req.session.comercioId,
            nombre,
            descripcion
        });

        res.redirect("/comercio/categorias");
    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};

exports.editcategoriaForm = async (req, res) => {
    try {
        const comercioRecord = await Comercio.findByPk(req.session.comercioId, {
            include: [{ model: Usuario, as: "usuario" }]
        })
        const categoriaRecord = await Categoria.findByPk(req.params.id);

        if (!categoriaRecord) {
            return res.render("404", { pageTitle: "Categoria no encontrada." });
        }

        res.render("comercio/editar-categoria", { 
            pageTitle: "Editar Categoria",
            categoria: categoriaRecord.dataValues,
            comercio: comercioRecord.dataValues,
            usuario: comercioRecord.usuario.dataValues,
        });
    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};

exports.editcategoria = async (req, res) => {
    try {
        const categoriaRecord = await Categoria.findByPk(req.params.id);

        if (!categoriaRecord) {
            return res.render("404", { pageTitle: "Categoria no encontrada." });
        }

        const { nombre, descripcion } = req.body;

        await categoriaRecord.update({
            nombre,
            descripcion
        });

        res.redirect("/comercio/categorias");
    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};

exports.deletecategoria = async (req, res) => {
    try {
        const categoriaRecord = await Categoria.findByPk(req.params.id);

        if (!categoriaRecord) {
            return res.render("404", { pageTitle: "Categoria no encontrada." });
        }

        await categoriaRecord.destroy();

        res.redirect("/comercio/categorias");
    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};

exports.productos = async (req, res) => {
    try {
       
        const comercioRecord = await Comercio.findByPk(req.session.comercioId, {
            include: [{ model: Usuario, as: "usuario" }]
        });

        
        const productosRecord = await Producto.findAll({
            where: { comercioId: req.session.comercioId },
            include: [{
                model: Categoria,
                attributes: ['nombre'],  
                as: "categoria",  
            }]
        });


        const productos = productosRecord.map(p => {
            return {
                ...p.dataValues,
                categoria: p.categoria ? p.categoria.dataValues : null  
            };
        });

        res.render("comercio/mantenimiento-productos", {
            pageTitle: "Mantenimiento de Productos",
            productos: productos, 
            comercio: comercioRecord.dataValues, 
            usuario: comercioRecord.usuario.dataValues  
        });
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};


exports.createproductoForm = async (req, res) => {
    try {
        const comercioRecord = await Comercio.findByPk(req.session.comercioId, {
            include: [{ model: Usuario, as: "usuario" }]
        })
        const categorias = await Categoria.findAll({ 
            where: { comercioId: req.session.comercioId }
        });

        res.render("comercio/crear-producto", { 
            pageTitle: "Crear Producto",
            categorias: categorias.map(c => c.dataValues),
            comercio: comercioRecord.dataValues,
            usuario: comercioRecord.usuario.dataValues
        });
    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};

exports.createproducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoriaId } = req.body;
        const imagen = "/images/" + req.files.imagen[0].filename;

        if (!req.files || !req.files.imagen) {
            return res.render("comercio/crear-producto", { 
                pageTitle: "La imagen es obligatoria." });
        }

        if (!nombre || !descripcion || !precio ||   !categoriaId) {
            return res.render("comercio/crear-producto", { 
                pageTitle: "Todos los campos son obligatorios." });
        }

        await Producto.create({
            comercioId: req.session.comercioId,
            nombre,
            descripcion,
            precio,
            imagen,
            categoriaId
        });

        res.redirect("/comercio/productos");
    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};

exports.editproductoForm = async (req, res) => {
    try {
        const productoId = req.params.id;
        const productoRecord = await Producto.findByPk(productoId);

        if (!productoRecord) {
            return res.render("404", { pageTitle: "Producto no encontrado." });
        }

        const [comercioRecord, categorias] = await Promise.all([
            Comercio.findByPk(req.session.comercioId, { include: [{ model: Usuario, as: "usuario" }] }),
            Categoria.findAll({ where: { comercioId: req.session.comercioId } })
        ]);

        if (!categorias) {
            return res.render("404", { pageTitle: "Categorías no encontradas." });
        }

        categorias.forEach(categoria => {
            categoria.selected = categoria.id === productoRecord.categoriaId; 
        });

        res.render("comercio/editar-producto", {
            pageTitle: "Editar Producto",
            producto: productoRecord.dataValues,
            categorias: categorias.map(c => c.dataValues),
            comercio: comercioRecord.dataValues,
            usuario: comercioRecord.usuario.dataValues
        });

    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};


        
exports.editproducto = async (req, res) => {
    try {
        const productoRecord = await Producto.findByPk(req.params.id);

        if (!productoRecord) {
            return res.render("404", { pageTitle: "Producto no encontrado." });
        }

        const { nombre, descripcion, precio, categoriaId } = req.body;
        const imagen = req.files && req.files.imagen ? "/images/" + req.files.imagen[0].filename : productoRecord.imagen;

        if (!nombre || !descripcion || !precio || !categoriaId) {
            return res.render("comercio/editar-producto", { 
                pageTitle: "Todos los campos son obligatorios." });
        }

        await productoRecord.update({
            nombre,
            descripcion,            
            precio,
            imagen,
            categoriaId
        });

        res.redirect("/comercio/productos");
    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};

exports.deleteproducto = async (req, res) => {
    try {
        const productoRecord = await Producto.findByPk(req.params.id);

        if (!productoRecord) {
            return res.render("404", { pageTitle: "Producto no encontrado." });
        }

        await productoRecord.destroy();

        res.redirect("/comercio/productos");
    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Se produjo un error, vuelva al home o intente más tarde." });
    }
};



             




