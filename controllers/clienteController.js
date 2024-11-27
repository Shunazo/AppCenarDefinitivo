const Usuario = require("../models/usuario");
const Cliente = require("../models/cliente");
const Pedido = require("../models/pedido");
const Direccion = require("../models/direccion");

exports.home = async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ where: { id: req.session.userId } });
        res.render("cliente/home-cliente", { pageTitle: "Home", usuario });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al cargar la home. Intente más tarde." });
    }
};

