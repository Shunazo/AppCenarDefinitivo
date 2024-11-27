const Usuario = require("../models/usuario");
const Cliente = require("../models/cliente");
const Pedido = require("../models/pedido");
const Direccion = require("../models/direccion");
const Favorito = require("../models/favorito");
const tipoComercio = require("../models/tipocomercio");

exports.home = async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ where: { id: req.session.userId } });
        const tiposComercio = await tipoComercio.findAll({ 
            attributes: ["nombre", "icono"],
            order: [["nombre", "ASC"]]
        });

        res.render("cliente/home-cliente", { 
            pageTitle: "Home", 
            usuario,
            tiposComercio: tiposComercio.map(t => t.dataValues)
        });

    } 
    catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al cargar el home. Intente más tarde." });
    }
};

exports.perfil = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.session.usuario.id);
        res.render("cliente/perfil-cliente", { 
            pageTitle: "Perfil",
            usuario: usuario.map(u => u.dataValues) });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar el perfil." });
    }
};

//de aqui para abajo esta to meco todo, tengo que refactorizar y jodienda, no haga na
exports.editperfilForm = async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;
        const usuarioRecord = await Usuario.findByPk(req.session.usuario.id);

        if (!usuarioRecord) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        res.render("cliente/editar-perfil", { 
            pageTitle: "Editar Perfil",
            usuario: usuarioRecord.dataValues,
            currentImage: usuarioRecord.fotoPerfil
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar el formulario." });
    }
};


exports.editperfil = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        if (!nombre || !email) {
            return res.status(400).json({ error: "Nombre y correo son obligatorios." });
        }
        const usuario = await Usuario.findByPk(req.session.usuario.id);
        usuario.nombre = nombre;
        usuario.email = email;
        if (password) {
            usuario.password = await bcrypt.hash(password, 10);
        }
        await usuario.save();
        res.redirect("/cliente/perfil");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el perfil." });
    }
};


exports.ordenes = async (req, res) => {
    try {
        const ordenes = await Orden.findAll({ where: { usuarioId: req.session.usuario.id } });
        res.render("cliente/ordenes", { ordenes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar las órdenes." });
    }
};


exports.ordenDetalle = async (req, res) => {
    try {
        const orden = await Orden.findByPk(req.params.id);
        if (!orden || orden.usuarioId !== req.session.usuario.id) {
            return res.status(404).json({ error: "Orden no encontrada." });
        }
        res.render("cliente/ordenDetalle", { orden });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar el detalle de la orden." });
    }
};


exports.direcciones = async (req, res) => {
    try {
        const direcciones = await Direccion.findAll({ where: { usuarioId: req.session.usuario.id } });
        res.render("cliente/direcciones", { direcciones });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar las direcciones." });
    }
};


exports.createdireccionForm = (req, res) => {
    res.render("cliente/createDireccion");
};


exports.createdireccion = async (req, res) => {
    try {
        const { calle, ciudad, estado, codigoPostal } = req.body;
        if (!calle || !ciudad || !estado || !codigoPostal) {
            return res.status(400).json({ error: "Todos los campos son obligatorios." });
        }
        await Direccion.create({
            usuarioId: req.session.usuario.id,
            calle,
            ciudad,
            estado,
            codigoPostal,
        });
        res.redirect("/cliente/direcciones");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear la dirección." });
    }
};


exports.editdireccionForm = async (req, res) => {
    try {
        const direccion = await Direccion.findByPk(req.params.id);
        if (!direccion || direccion.usuarioId !== req.session.usuario.id) {
            return res.status(404).json({ error: "Dirección no encontrada." });
        }
        res.render("cliente/editDireccion", { direccion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar el formulario." });
    }
};


exports.editdireccion = async (req, res) => {
    try {
        const direccion = await Direccion.findByPk(req.params.id);
        if (!direccion || direccion.usuarioId !== req.session.usuario.id) {
            return res.status(404).json({ error: "Dirección no encontrada." });
        }
        const { calle, ciudad, estado, codigoPostal } = req.body;
        direccion.calle = calle;
        direccion.ciudad = ciudad;
        direccion.estado = estado;
        direccion.codigoPostal = codigoPostal;
        await direccion.save();
        res.redirect("/cliente/direcciones");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al editar la dirección." });
    }
};


exports.deletedireccion = async (req, res) => {
    try {
        const direccion = await Direccion.findByPk(req.params.id);
        if (!direccion || direccion.usuarioId !== req.session.usuario.id) {
            return res.status(404).json({ error: "Dirección no encontrada." });
        }
        await direccion.destroy();
        res.redirect("/cliente/direcciones");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar la dirección." });
    }
};

exports.favoritos = async (req, res) => {
    try {
        const favoritos = await Favorito.findAll({
            where: { usuarioId: req.session.usuario.id },
            include: { model: Comercio, as: "comercio" }, 
        });
        res.render("cliente/favoritos", { favoritos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cargar favoritos." });
    }
};


exports.toggleFavorito = async (req, res) => {
    try {
        const comercioId = req.params.id; 
        const favorito = await Favorito.findOne({
            where: { usuarioId: req.session.usuario.id, comercioId },
        });

        if (favorito) {
            await favorito.destroy(); 
        } else {
            await Favorito.create({ usuarioId: req.session.usuario.id, comercioId });
        }

        res.redirect("/cliente/favoritos");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al procesar favorito." });
    }
};


