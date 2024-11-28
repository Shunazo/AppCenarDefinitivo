const Usuario = require("../models/usuario");
const Cliente = require("../models/cliente");
const Pedido = require("../models/pedido");
const Direccion = require("../models/direccion");
const Favorito = require("../models/favorito");
const tipoComercio = require("../models/tipocomercio");
const Comercio = require("../models/comercio");
const { Op, where } = require("sequelize");

exports.home = async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ where: { id: req.session.userId } });

        const totalPedidos = await Pedido.count();
        const pedidosHoy = await Pedido.count({ 
            where: { 
                createdAt: {
                    [Op.gte]: new Date().setHours(0, 0, 0, 0),
                    [Op.lte]: new Date().setHours(23, 59, 59, 999)
                }
            } 
        });

        const comerciosActivos = await Comercio.count({
            include : [{ model: Usuario, where : { activo: true } }],
        });

        const comerciosInactivos = await Comercio.count({
            include : [{ model: Usuario, where : { activo: false } }],
        });

        const clientesActivos = await Cliente.count({
            include : [{ model: Usuario, where : { activo: true } }],
        });

        const clientesInactivos = await Cliente.count({
            include : [{ model: Usuario, where : { activo: false } }],
        });

        const deliveriesActivos = await Delivery.count({
            include : [{ model: Usuario, where : { activo: true } }],
        });

        const deliveriesInactivos = await Delivery.count({
            include : [{ model: Usuario, where : { activo: false } }],
        });

        const totalProductos = await Producto.count();

        const missingData = {
            totalPedidos: totalPedidos === 0 ? "No hay pedidos aun." : null,
            pedidosHoy: pedidosHoy === 0 ? "No hay pedidos hoy." : null,
            comerciosActivos: comerciosActivos === 0 ? "No hay comercios activos." : null,
            comerciosInactivos: comerciosInactivos === 0 ? "No hay comercios inactivos." : null,
            clientesActivos: clientesActivos === 0 ? "No hay clientes activos." : null,
            clientesInactivos: clientesInactivos === 0 ? "No hay clientes inactivos." : null,
            deliveriesActivos: deliveriesActivos === 0 ? "No hay deliveries activos." : null,
            deliveriesInactivos: deliveriesInactivos === 0 ? "No hay deliveries inactivos." : null,
            totalProductos: totalProductos === 0 ? "No hay productos aun." : null
        }
            

        res.render("administrador/home-administrador", { 
            pageTitle: "Home", 
            usuario,
            totalPedidos,
            pedidosHoy,
            comerciosActivos,
            comerciosInactivos,
            clientesActivos,
            clientesInactivos,
            deliveriesActivos,
            deliveriesInactivos,
            totalProductos,
            missingData
        });

    } catch (error) {
        console.log(error);
        res.render("administrador/home-administrador", { pageTitle: "Error al cargar el home. Intente más tarde." });
    }
};

exports.clientes = async (req, res) => {
    try {
        const clientes = await Cliente.findAll({
            include: [{
                model: Usuario,
                attributes: ['nombre', 'apellido', 'telefono', 'correo', 'activo'],
                as: "usuario"
            },
            {
                model: Pedido,
                as: "pedidos"
            }]
        });

        const clientesData = clientes.map(c => ({
            ...c.dataValues,
            pedidosCount: c.pedidos ? c.pedidos.length : 0,
            isActivo: c.usuario.activo
        }));

        res.render("administrador/Listado-clientes", {
             pageTitle: "Listado de Clientes",
             clientes: clientesData      
        });
    } 
    catch (error) {
        console.log(error);
        res.render("administrador/Listado-clientes", { pageTitle: "Error al cargar el listado de clientes. Intente más tarde." });
    }
};

exports.activateCliente = async (req, res) => {
    try {
        const clienteRecord = await Cliente.findByPk(req.params.id, 
            {
            include: [{ model: Usuario,
                as : "usuario",
            }]
        });

        if (!clienteRecord) {
            return res.status(404).send("Cliente no encontrado");
        }

        await clienteRecord.usuario.update({ activo: true });

      
        res.redirect("administrador/Listado-clientes");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error activating client");
    }
};

exports.deactivateCliente = async (req, res) => {
    try {
        const clienteRecord = await Cliente.findByPk(req.params.id, {
            include: [{ model: Usuario,
                as : "usuario",
             }]
        });

        if (!clienteRecord) {
            return res.status(404).send("Cliente no encontrado");
        }

        await clienteRecord.usuario.update({ activo: false });
    
        res.redirect("administrador/Listado-clientes");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error deactivating client");
    }
};

// **Deliveries**
exports.deliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.findAll({
            include: [{
                model: Usuario,
                attributes: ['nombre', 'apellido', 'telefono', 'correo', 'activo']
            },
            {
                model: Pedido,
                where: { estado: "completado" },  
                as: "pedidos",
                required: false
            }]
        });

        const deliveriesData = deliveries.map(d => ({
            ...d.dataValues,
            pedidosCount: d.pedidos ? d.pedidos.length : 0,
            isActivo: d.usuario.activo
        }));

        res.render("administrador/Listado-delivery", { 
            pageTitle: "Listado de Deliveries",
            deliveries: deliveriesData });

    } 
    catch (error) {
        console.log(error);
        res.status(500).send("Error fetching deliveries");
    }
};

exports.activateDelivery = async (req, res) => {
    try {
        const deliveryRecord = await Delivery.findByPk(req.params.id,
           {
                include: [{ model: Usuario,
                    as : "usuario",
                }]
            });

        if (!deliveryRecord) {
            return res.status(404).send("Delivery no encontrado");
        }

        await deliveryRecord.usuario.update({ activo: true });
        
        res.redirect("administrador/Listado-delivery")
    } catch (error) {
        console.log(error);
        res.status(500).send("Error activating delivery");
    }
};

exports.deactivateDelivery = async (req, res) => {
    try {
        const deliveryRecord = await Delivery.findByPk(req.params.id, 
            {
                include: [{ model: Usuario,
                    as : "usuario",
                }]
            });

        if (!deliveryRecord) {
            return res.status(404).send("Delivery no encontrado");
        }

        await deliveryRecord.usuario.update({ activo: false });
        

        res.redirect("administrador/Listado-delivery");

    } catch (error) {
        console.log(error);
        res.status(500).send("Error deactivating delivery");
    }
};

// **Comercios**
exports.comercios = async (req, res) => {
    try {
        const comercios = await Comercio.findAll({
            include: [{
                model: Usuario,
                attributes: ['nombre', 'logo', 'telefono', 'horaApertura', 'horaCierre', 'correo', 'activo']
            },
            {
                model: Pedido,
                as: "pedidos",
                required: false
            }]  
        });

        const comerciosData = comercios.map(c => ({
            ...c.dataValues,
            pedidosCount: c.pedidos ? c.pedidos.length : 0,
            isActivo: c.usuario.activo
        }));

        res.render("administrador/Listado-comercios", { 
            pageTitle: "Listado de Comercios", 
            comercios: comerciosData
        });
    } 
    catch (error) {
        console.log(error);
        res.render("administrador/Listado-comercios", { pageTitle: "Error al cargar el listado de comercios. Intente más tarde." });
    }
};

exports.activateComercio = async (req, res) => {
    try {
        const comercioRecord = await Comercio.findByPk(req.params.id,
            {
                include: [{ model: Usuario,
                    as : "usuario",
                }]
            });

        if (!comercioRecord) {
            return res.status(404).send("Comercio no encontrado");
        }

        await comercioRecord.usuario.update({ activo: true });
        

        res.redirect("administrador/Listado-comercios");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error activating comercio");
    }
};

exports.deactivateComercio = async (req, res) => {
    try {
        const comercioRecord = await Comercio.findByPk(req.params.id,
            {
                include: [{ model: Usuario,
                    as : "usuario",
                }]
            });

        if (!comercioRecord) {
            return res.status(404).send("Comercio no encontrado");
        }

        await comercioRecord.usuario.update({ activo: false });


        res.redirect("administrador/Listado-comercios");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error deactivating comercio");
    }
};

exports.config = async (req, res) => {
    try {
        const config = await Configuracion.findOne();

        if (!config) {
            return res.status(404).send("Configuración no encontrada");
        }

        const configData = config.map(c => ({
            ...c.dataValues,
        }));


        res.render("administrador/Mantenimiento-configuracion", {
             config: configData
            });

    } catch (error) {
        console.log(error);
        res.render("administrador/Mantenimiento-configuracion", 
            { pageTitle: "Error al cargar la configuración. Intente más tarde." });
    }
}











// **Administradores**
exports.administradores = async (req, res) => {
    try {
        const admins = await Usuario.findAll({
            where: { role: 'admin' },
        });

        res.render("admin/administradores", { admins });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching admins");
    }
};

exports.activateAdmin = async (req, res) => {
    try {
        const admin = await Usuario.findByPk(req.params.id);
        admin.isActive = true;
        await admin.save();
        res.redirect("/admin/administradores");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error activating admin");
    }
};

exports.deactivateAdmin = async (req, res) => {
    try {
        const admin = await Usuario.findByPk(req.params.id);
        admin.isActive = false;
        await admin.save();
        res.redirect("/admin/administradores");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deactivating admin");
    }
};
