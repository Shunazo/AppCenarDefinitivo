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
const Administrador = require("../models/administrador");
const bcrypt = require("bcryptjs");
const { Op, where } = require("sequelize");

exports.home = async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ where: { id: req.session.userId } });

        
        const stats = [
            {
                title: "Pedidos",
                bgColor: "primary",
                textColor: "white",
                details: [
                    { value: await Pedido.count(), label: "Total histórico" },
                    { value: await Pedido.count({
                        where: { 
                            createdAt: {
                                [Op.gte]: new Date().setHours(0, 0, 0, 0),
                                [Op.lte]: new Date().setHours(23, 59, 59, 999)
                            }
                        } 
                    }), label: "Hoy" }
                ]
            },
            {
                title: "Comercios",
                bgColor: "success",
                textColor: "white",
                details: [
                    { value: await Comercio.count({ 
                        include: [{ model: Usuario, as: 'usuario', where: { activo: true } }] 
                    }), label: "Activos" },
                    { value: await Comercio.count({ 
                        include: [{ model: Usuario, as: 'usuario', where: { activo: false } }] 
                    }), label: "Inactivos" }
                ]
            },
            {
                title: "Clientes",
                bgColor: "info",
                textColor: "white",
                details: [
                    { value: await Cliente.count({ 
                        include: [{ model: Usuario, as: 'usuario', where: { activo: true } }] 
                    }), label: "Activos" },
                    { value: await Cliente.count({ 
                        include: [{ model: Usuario, as: 'usuario', where: { activo: false } }] 
                    }), label: "Inactivos" }
                ]
            },
            {
                title: "Delivery",
                bgColor: "warning",
                textColor: "dark",
                details: [
                    { value: await Delivery.count({ 
                        include: [{ model: Usuario, as: 'usuario', where: { activo: true } }] 
                    }), label: "Activos" },
                    { value: await Delivery.count({ 
                        include: [{ model: Usuario, as: 'usuario', where: { activo: false } }] 
                    }), label: "Inactivos" }
                ]
            },
            {
                title: "Productos",
                bgColor: "secondary",
                textColor: "white",
                value: await Producto.count(),
                label: "Total productos creados"
            }
        ];

        // Mensajes faltantes
        const missingData = stats.map(stat => {
            const total = stat.details?.reduce((sum, detail) => sum + detail.value, 0) || stat.value;
            return total === 0 ? `No hay ${stat.title.toLowerCase()} registrados.` : null;
        });

        res.render("administrador/home-administrador", { 
            pageTitle: "Home", 
            usuario,
            stats,
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

        
        const clientesData = clientes.map(c => {
            const clienteData = c.dataValues;
            const usuarioData = clienteData.usuario ? clienteData.usuario.dataValues : {};
            return {
                ...clienteData,
                ...usuarioData,
                pedidosCount: clienteData.pedidos ? clienteData.pedidos.length : 0,
                isActivo: usuarioData.activo
            }
        });

        
        res.render("administrador/Listado-clientes", {
            pageTitle: "Listado de Clientes",
            clientes: clientesData
        });
    } catch (error) {
        console.log(error);
        res.render("administrador/Listado-clientes", {
            pageTitle: "Error al cargar el listado de clientes. Intente más tarde."
        });
    }
};


exports.activateCliente = async (req, res) => {
    try {
      
        const clienteRecord = await Cliente.findByPk(req.params.id, {
            include: [{
                model: Usuario,
                as: "usuario",
            }]
        });

        if (!clienteRecord) {
            return res.status(404).send("Cliente no encontrado");
        }

        const usuarioRecord = clienteRecord.usuario;

       
        await usuarioRecord.update({ activo: true });

        res.redirect("/administrador/clientes");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error activating client");
    }
};

exports.deactivateCliente = async (req, res) => {
    try {
        const clienteRecord = await Cliente.findByPk(req.params.id, {
            include: [{
                model: Usuario,
                as: "usuario",
            }]
        });

        if (!clienteRecord) {
            return res.status(404).send("Cliente no encontrado");
        }

        const usuarioRecord = clienteRecord.usuario;


        await usuarioRecord.update({ activo: false });

        res.redirect("/administrador/clientes");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error deactivating client");
    }
};


exports.deliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.findAll({
            include: [{
                model: Usuario,
                attributes: ['nombre', 'apellido', 'telefono', 'correo', 'activo'],
                as: "usuario"
            },
            {
                model: Pedido,
                where: { estado: "completado" },  
                as: "pedidos",
                required: false
            }]
        });

        const deliveriesData = deliveries.map(d => {
            const deliveryData = d.dataValues;
            const usuarioData = deliveryData.usuario ? deliveryData.usuario.dataValues : {};
            return {
                ...deliveryData,
                ...usuarioData,
                pedidosCount: deliveryData.pedidos ? deliveryData.pedidos.length : 0,
                isActivo: usuarioData.activo
            }
        });

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
        
        res.redirect("/administrador/deliveries")
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
        

        res.redirect("/administrador/deliveries");

    } catch (error) {
        console.log(error);
        res.status(500).send("Error deactivating delivery");
    }
};


exports.comercios = async (req, res) => {
    try {
        const comercios = await Comercio.findAll({
            include: [
              {
                model: Usuario,
                as: 'usuario',
                attributes: ['id', 'nombre', 'telefono', 'correo', 'activo'] 
              },
              {
                model: Pedido,
                as: 'pedidos'
              }
            ],
            attributes: ['id', 'nombreComercio', 'logo', 'horaApertura', 'horaCierre', 'tipoComercioId']
          })

        const comerciosData = comercios.map(c => {
            const comercioData = c.dataValues;
            const usuarioData = comercioData.usuario ? comercioData.usuario.dataValues : {};  
            return {
                ...comercioData,
                ...usuarioData, 
                pedidosCount: comercioData.pedidos ? comercioData.pedidos.length : 0,
                isActivo: usuarioData.activo  
            };
        });
        

        res.render("administrador/Listado-comercio", { 
            pageTitle: "Listado de Comercios", 
            comercios: comerciosData
        });
    } 
    catch (error) {
        console.log(error);
        res.render("administrador/Listado-comercio", { pageTitle: "Error al cargar el listado de comercios. Intente más tarde." });
    }
};

exports.activateComercio = async (req, res) => {
    try {
        
        const comercioRecord = await Comercio.findOne({
            where: { 
                '$usuario.id$': req.params.id  
            },
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                }
            ]
        });

        if (!comercioRecord) {
            return res.status(404).send("Comercio no encontrado para el Usuario con ID " + req.params.id);
        }

        
        const usuarioRecord = comercioRecord.usuario;
        
        
        await usuarioRecord.update({ activo: true });

        res.redirect("/administrador/comercios");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error activating usuario through comercio");
    }
};


exports.deactivateComercio = async (req, res) => {
    try {
        
        const comercioRecord = await Comercio.findOne({
            where: { 
                '$usuario.id$': req.params.id  
            },
            include: [
                {
                    model: Usuario,
                    as: 'usuario',
                }
            ]
        });

        if (!comercioRecord) {
            return res.status(404).send("Comercio no encontrado para el Usuario con ID " + req.params.id);
        }

        
        const usuarioRecord = comercioRecord.usuario;
        
        
        await usuarioRecord.update({ activo: false });

        res.redirect("/administrador/comercios");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error deactivating usuario through comercio");
    }
};


exports.config = async (req, res) => {
    try {
        const config = await Configuracion.findOne();  

        if (!config) {
            return res.status(404).send("Configuración no encontrada");  
        }

        
        const configData = [config.dataValues];  

        res.render("administrador/Listado-configuracion", {
            config: configData  
        });

    } catch (error) {
        console.log(error);
        res.render("administrador/Listado-configuracion", {
            pageTitle: "Error al cargar la configuración. Intente más tarde."
        });
    }
};


exports.editconfigForm = async (req, res) => {
    try {
        const configRecord = await Configuracion.findOne();

        if (!configRecord) {
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

        if (!configRecord) {
            return res.status(404).send("Configuración no encontrada");
        }
        const { itbis } = req.body;
        await configRecord.update({ itbis });

        res.redirect("/administrador/config");
    } catch (error) {
        console.log(error);
        res.render("administrador/editar-configuracion", 
            { pageTitle: "Error al editar la configuración. Intente más tarde." });
    }
}
        
    
exports.administradores = async (req, res) => {
    try {
        // Get the logged-in user's ID from the session
        const currentUserId = req.session.userId;

        // Fetch all administrators from the database
        const admins = await Usuario.findAll({
            where: { rol: "administrador" },
            include: [{ model: Administrador, as: "administrador" }]
        });

        // Map data and include `isCurrentUser` property
        const adminList = admins.map(a => {
            const usuarioData = a.dataValues;
            const administradorData = usuarioData.administrador ? usuarioData.administrador.dataValues : {};
            return {
                ...usuarioData,
                ...administradorData,
                isCurrentUser: usuarioData.id === currentUserId // Check if it's the logged-in user
            };
        });

        // Render the view with the updated list
        res.render("administrador/Listado-administrador", {
            pageTitle: "Listado de Administradores",
            admins: adminList
        });
    } catch (error) {
        console.error(error);
        res.render("administrador/Listado-administrador", {
            pageTitle: "Error al cargar el listado de administradores. Intente más tarde."
        });
    }
};



exports.createAdminForm = (req, res) => {
    res.render("administrador/crear-admin", {
        pageTitle: "Crear Administrador"
    });
};


exports.createAdmin = async (req, res) => {
    try {
        const { nombre, apellido, correo, nombreUsuario, cedula, password, confirmar } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        if (!nombre || !apellido || !correo || !nombreUsuario || !cedula || !password || !confirmar) {
            return res.render("administrador/crear-admin", {
                pageTitle: "Crear Administrador",
                error: "Todos los campos son obligatorios."
            });
        }

        if (password !== confirmar) {
            return res.render("administrador/crear-admin", {
                pageTitle: "Crear Administrador",
                error: "Las contraseñas no coinciden."
            });
        }

        const existingUser = await Usuario.findOne({ where: { correo } });
        if (existingUser) {
            return res.render("administrador/crear-admin", {
                pageTitle: "Crear Administrador",
                error: "Ya existe un usuario registrado con ese correo."
            });
        }

        const existingAdmin = await Usuario.findOne({ where: { nombreUsuario } });
        if (existingAdmin) {
            return res.render("administrador/crear-admin", {
                pageTitle: "Crear Administrador",
                error: "Ya existe un usuario registrado con ese nombre de usuario."
            });
        }
        
    
        const newUser = await Usuario.create({
            nombre,
            apellido,
            correo,
            nombreUsuario,
            password: hashedPassword,
            rol: "administrador",
            activo: false
        });

        await Administrador.create({
            usuarioId: newUser.id,
            cedula
        });

        res.redirect("/administrador/administradores");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al crear el administrador");
    }
};


exports.editAdminForm = async (req, res) => {
    try {
        const adminRecord = await Administrador.findByPk(req.params.id, {
            include: [{ model: Usuario, as: "usuario" }]
        });
        
        if (!adminRecord) {
            return res.status(404).send("Administrador no encontrado");
        }
        
        const usuarioData = adminRecord.usuario ? adminRecord.usuario.dataValues : {};
        const administradorData = adminRecord.dataValues;
        
        res.render("administrador/editar-administrador", {
            pageTitle: "Editar Administrador",
            usuario: usuarioData,
            administrador: administradorData,
            id: req.params.id
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al cargar el administrador");
    }
};


exports.editAdmin = async (req, res) => {
    try {
        const { nombre, apellido, correo, nombreUsuario, cedula, password, confirmar } = req.body;

        const adminRecord = await Administrador.findByPk(req.params.id, {
            include: [{ model: Usuario, as: "usuario" }]
        });
        
        if (!adminRecord || !adminRecord.usuario) {
            return res.status(404).send("Administrador no encontrado");
        }
        
        const usuarioRecord = adminRecord.usuario;
            
        if (password !== confirmar) {
            return res.status(400).send("Las contraseñas no coinciden.");
        }
        
        const existingUsuario = await Usuario.findOne({ where: { correo } });
        if (existingUsuario && existingUsuario.id !== usuarioRecord.id) {
            return res.status(400).send("Ya existe una cuenta registrada con ese correo.");
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        await usuarioRecord.update({
            nombre,
            apellido,
            correo,
            nombreUsuario,
            password: hashedPassword
        });
        
        await adminRecord.update({ cedula });
        
        res.redirect("/administrador/administradores");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al actualizar el administrador");
    }
};



exports.activateAdmin = async (req, res) => {
    try {
        const adminRecord = await Administrador.findByPk(req.params.id, {
            include: [{ model: Usuario, as: 'usuario' }]
        })

        if (!adminRecord) {
            return res.status(404).send("Administrador no encontrado");
        }

       const usuarioRecord = adminRecord.usuario;

        await usuarioRecord.update({ activo: true });

        res.redirect("/administrador/administradores");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al activar el administrador");
    }
};


exports.deactivateAdmin = async (req, res) => {
    try {
        const adminRecord = await Administrador.findByPk(req.params.id, {
            include: [{ model: Usuario, as: 'usuario' }]
        })

        if (!adminRecord) {
            return res.status(404).send("Administrador no encontrado");
        }

        const usuarioRecord = adminRecord.usuario;

        await usuarioRecord.update({ activo: false });

        res.redirect("/administrador/administradores");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al desactivar el administrador");
    }
};


exports.tipoComercio = async (req, res) => {
    try {
        const tipos = await tipoComercio.findAll({
            include: [
                {
                    model: Comercio,
                    as: "comercios",
                }
            ],
            attributes: ["id", "nombre", "icono", "descripcion"],
        });

        const tipocomerciosData = tipos.map(t => {
            const tipocomercioData = t.dataValues;
            const comerciosData = tipocomercioData.comercios ? tipocomercioData.comercios.map(c => c.dataValues) : [];
            return {
                ...tipocomercioData,
                comerciosCount: comerciosData.length,
            };
        });

        res.render("administrador/Listado-tipo", {
            pageTitle: "Listado de Tipos de Comercio",
            tipos: tipocomerciosData
        });
    } catch (error) {
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

        res.redirect("/administrador/tipo-comercio");
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
    } catch (error) {
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

        if (!nombre || !descripcion) {
            return res.status(400).send("Todos los campos son obligatorios.");
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

        res.redirect("/administrador/tipo-comercio");
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

        res.redirect("/administrador/tipo-comercio");
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al eliminar el tipo de comercio. Intente más tarde." });
    }
};



        
