const Usuario = require("../models/usuario");

exports.home = async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ where: { id: req.session.userId } });
        res.render("cliente/home-cliente", { pageTitle: "Home", usuario });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al cargar la home. Intente más tarde." });
    }
};