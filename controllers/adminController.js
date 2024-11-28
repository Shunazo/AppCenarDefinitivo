const Usuario = require("../models/usuario");
const Cliente = require("../models/cliente");
const Pedido = require("../models/pedido");
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

exports.editconfigForm = async (req, res) => {
    try {
        const configRecord = await Configuracion.findOne();

        if (!config) {
            return res.status(404).send("Configuración no encontrada");
        }

        res.render("administrador/editar-configuracion", {
             config: configRecord.dataValues
            });

    } catch (error) {
        console.log(error);
        res.render("administrador/editar-configuracion", 
            { pageTitle: "Error al cargar la configuración. Intente más tarde." });
    }
}

exports.editconfig = async (req, res) => {
    try {
        const configRecord = await Configuracion.findOne();

        if (!config) {
            return res.status(404).send("Configuración no encontrada");
        }
        const { itbis } = req.body;
        await configRecord.update({ itbis });

        res.redirect("administrador/Mantenimiento-configuracion");
    } catch (error) {
        console.log(error);
        res.render("administrador/editar-configuracion", 
            { pageTitle: "Error al editar la configuración. Intente más tarde." });
    }
}
        
    
exports.administradores = async (req, res) => {
    try {
        const admins = await Usuario.findAll({
            where: { rol: "administrador" },
            include: [{ model: Administrador, as: "administrador" }]
        });

        res.render("administrador/home-administrador", {
            pageTitle: "Listado de Administradores",
            admins: admins.map(a => a.dataValues)
        });

    } 
    catch (error) {
        console.log(error);
        res.render("administrador/home-administrador", { 
            pageTitle: "Error al cargar el listado de administradores. Intente más tarde." });
    }
};


exports.createAdminForm = (req, res) => {
    res.render("administrador/crear-admin", {
        pageTitle: "Crear Administrador"
    });
};


exports.createAdmin = async (req, res) => {
    try {
        const { nombre, apellido, correo, telefono, password, cedula } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await Usuario.create({
            nombre,
            apellido,
            correo,
            telefono,
            password: hashedPassword,
            rol: "administrador",
            activo: false
        });

        await Administrador.create({
            usuarioId: newUser.id,
            cedula
        });

        res.redirect("administrador/home-administrador");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al crear el administrador");
    }
};


exports.editAdminForm = async (req, res) => {
    try {
        const adminRecord = await Usuario.findByPk(req.params.id, {
            include: [{ model: Administrador, as: "administrador" }]
        });

        if (!adminRecord) {
            return res.status(404).send("Administrador no encontrado");
        }

        res.render("administrador/editar-administrador", {
            pageTitle: "Editar Administrador",
            usuario: adminRecord.dataValues,
            administrador: adminRecord.administrador.dataValues
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al cargar el administrador");
    }
};


exports.editAdmin = async (req, res) => {
    try {
        const { nombre, apellido, correo, telefono, cedula, password, confirmar } = req.body;

        const adminRecord = await Usuario.findByPk(req.params.id, {
            include: [{ model: Administrador, as: "administrador" }]
        });

        if (!adminRecord || !adminRecord.administrador) {
            return res.status(404).send("Administrador no encontrado");
        }

       
        if (!nombre || !apellido || !correo || !telefono || !cedula || !password || !confirmar) {
            return res.status(400).send("Todos los campos son obligatorios.");
        }

       
        if (password !== confirmar) {
            return res.status(400).send("Las contraseñas no coinciden.");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await adminRecord.update({
            nombre,
            apellido,
            correo,
            telefono,
            password: hashedPassword
        });

        await adminRecord.administrador.update({ 
            cedula 
        });

        res.redirect("administrador/home-administrador");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al actualizar el administrador");
    }
};



exports.activateAdmin = async (req, res) => {
    try {
        const adminRecord = await Usuario.findByPk(req.params.id);

        if (!adminRecord || adminRecord.rol !== "administrador") {
            return res.status(404).send("Administrador no encontrado");
        }

        await adminRecord.update({ activo: true });

        res.redirect("administrador/home-administrador");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al activar el administrador");
    }
};


exports.deactivateAdmin = async (req, res) => {
    try {
        const adminRecord = await Usuario.findByPk(req.params.id);

        if (!adminRecord || adminRecord.rol !== "administrador") {
            return res.status(404).send("Administrador no encontrado");
        }

        await adminRecord.update({ activo: false });

        res.redirect("administrador/home-administrador");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al desactivar el administrador");
    }
};


exports.tipoComercio = async (req, res) => {
    try {
        const tipocomercios = await tipoComercio.findAll({
            attributes: ["nombre", "icono", "descripcion"],
            include: [
                {
                    model: Comercio,
                    as: "comercios",
                }
            ]
        });

        const tipocomerciosData =  tipocomercios.map(c => ({
            ...c.dataValues,
            comerciosCount: c.comercios ? c.comercios.length : 0,
        }));

        res.render("administrador/Listado-tipo", {
            pageTitle: "Listado de Tipos de Comercio",
            tipocomercios: tipocomerciosData
        });
    }
    catch(error) {
        console.log(error);
        res.render("administrador/Listado-tipo", { 
            pageTitle: "Error al cargar el listado de tipos de comercio. Intente más tarde." });
    }
};

exports.createtipoComercioForm = (req, res) => {
    res.render("administrador/crear-tipo", {
        pageTitle: "Crear Tipo de Comercio"
    });
};

exports.createtipoComercio = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const icono = "/images/" + req.files.icono[0].filename;

        if (!req.files || !req.files.icono) {
            return res.render("administrador/crear-tipo", { 
                pageTitle: "La imagen es obligatoria." });
        }

        if (!nombre || !descripcion) {
            return res.render("administrador/crear-tipo", { 
                pageTitle: "Todos los campos son obligatorios." });
        }

        await tipoComercio.create({
            nombre,
            icono,
            descripcion,
        });

        res.redirect("administrador/Listado-tipo");
    } catch (error) {
        console.log(error);
        res.render("administrador/crear-tipo", { 
            pageTitle: "Error al crear el tipo de comercio. Intente más tarde." });
    }
};

exports.edittipoComercioForm = async (req, res) => {
    try {
        const tipocomercioRecord = await tipoComercio.findByPk(req.params.id);

        if (!tipocomercioRecord) {
            return res.status(404).send("Tipo de comercio no encontrado");
        }

        res.render("administrador/editar-tipo", {
            pageTitle: "Editar Tipo de Comercio",
            tipocomercio: tipocomercioRecord.dataValues,
            currentImage: tipocomercioRecord.icono
        });
    } 
    catch (error) {
        console.log(error);
        res.status(500).send("Error al cargar el tipo de comercio");
    }
};

exports.edittipoComercio = async (req, res) => {
    try {
        const tipocomercioRecord = await tipoComercio.findByPk(req.params.id);

        if (!tipocomercioRecord) {
            return res.status(404).send("Tipo de comercio no encontrado");
        }

        const { nombre, descripcion } = req.body;
        const icono = req.files && req.files.icono ? "/images/" + req.files.icono[0].filename : tipocomercioRecord.icono;
        

        if (!nombre || !icono || !descripcion) {
            return res.status(400).send("Todos los campos son obligatorios.");
        }

        if (!req.files && !req.files.icono) {
            return res.status(400).send("La imagen es obligatoria.");
        }

        await tipoComercio.update({
            nombre,
            icono,
            descripcion,
        }, {
            where: {
                id: req.params.id
            }
        });

        res.redirect("administrador/Listado-tipo");
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al editar el tipo de comercio. Intente más tarde." });
    }
};

exports.deletetipoComercio = async (req, res) => {
    try {
        const tipocomercioRecord = await tipoComercio.findByPk(req.params.id);

        if (!tipocomercioRecord) {
            return res.status(404).send("Tipo de comercio no encontrado");
        }

        await tipocomercioRecord.destroy();

        res.redirect("administrador/Listado-tipo");
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al eliminar el tipo de comercio. Intente más tarde." });
    }
};



        
