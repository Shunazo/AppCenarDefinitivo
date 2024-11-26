const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const Comercio = require("../models/comercio");
const TipoComercio = require("../models/tipocomercio");
const transporter = require("../services/EmailService");


exports.loginForm = (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect(`/${req.session.rol}/home`);
    }
    res.render("auth/login", { pageTitle: "Iniciar Sesión" });
};


exports.login = async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        if (!correo || !contraseña) {
            return res.render("auth/login", {
                pageTitle: "Iniciar Sesión",
                error: "Todos los campos son obligatorios.",
            });
        }

        const user = await Usuario.findOne({ where: { correo } });

        if (!user || !(await bcrypt.compare(contraseña, user.contraseña))) {
            return res.render("auth/login", {
                pageTitle: "Iniciar Sesión",
                error: "Correo o contraseña incorrectos.",
            });
        }

        if (!user.activo) {
            return res.render("auth/login", {
                pageTitle: "Iniciar Sesión",
                error: "Su cuenta está inactiva. Revise su correo o contacte a un administrador.",
            });
        }

        req.session.isLoggedIn = true;
        req.session.userId = user.id;
        req.session.rol = user.rol;

        res.redirect(`/${user.rol}/home`);
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al iniciar sesión. Intente más tarde." });
    }
};


exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.render("404", { pageTitle: "Error al cerrar sesión. Intente más tarde." });
        }
        res.redirect("/auth/login");
    });
};


exports.registerForm = (req, res) => {
    res.render("auth/register", { pageTitle: "Registro de Usuario" });
};


exports.register = async (req, res) => {
    try {
        const { nombre, apellido, correo, telefono, nombreUsuario, contraseña, confirmar, rol } = req.body;
        const fotoPerfil = "/" + req.file.filepath;

        if (!req.file) {
            return res.render("404", { pageTitle: "La imagen es obligatoria." });
        }

        if (!nombre || !apellido || !correo || !telefono || !nombreUsuario || !contraseña || !confirmar || !rol) {
            return res.render("auth/register", {
                pageTitle: "Registro de Usuario",
                error: "Todos los campos son obligatorios.",
            });
        }

       
        if (contraseña !== confirmar) {
            return res.render("auth/register", {
                pageTitle: "Registro de Usuario",
                error: "Las contraseñas no coinciden.",
            });
        }

        const existingUsuario = await Usuario.findOne({ where: { correo } });
        if (existingUsuario) {
            return res.render("auth/register", {
                pageTitle: "Registro de Usuario",
                error: "Ya existe una cuenta registrada con ese correo.",
            });
        }

        
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        
        const user = await Usuario.create({
            nombre,
            apellido,
            correo,
            telefono,
            nombreUsuario,
            contraseña: hashedPassword,
            rol,
            fotoPerfil, 
            activo: false, 
        });

        
        transporter.sendMail(
            {
                from: "No-Reply <no-reply@example.com>",
                to: correo,
                subject: "Activación de cuenta",
                html: `
                    <p>Hola ${nombre},</p>
                    <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
                    <a href="${process.env.APP_URL}/activate/${user.id}">Activar mi cuenta</a>
                `,
            },
            (err) => {
                if (err) {
                    console.log("Error al enviar el email:", err);
                    return res.render("404", { pageTitle: "Error al enviar el correo de activación." });
                }
            }
        );

        res.render("auth/register", {
            pageTitle: "Registro de Usuario",
            success: "Registro exitoso. Revisa tu correo para activar tu cuenta.",
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al registrar usuario. Intente más tarde." });
    }
};



exports.registerComercioForm = async (req, res) => {
    try {
        const tipoComercios = await TipoComercio.findAll(); 

        res.render("auth/registerComercio", {
            pageTitle: "Registro de Comercio",
            tipoComercios: tipoComercios.map(t => t.dataValues),
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al cargar el formulario. Intente más tarde." });
    }
};


exports.registerComercio = async (req, res) => {
    try {
        const { nombreComercio, telefono, correo, nombreUsuario, contraseña, confirmar, tipoComercioId, horaApertura, horaCierre } = req.body;
        const logo = "/" + req.file.filepath;

        if (!req.file) {
            return res.render("404", { pageTitle: "La imagen es obligatoria." });
        }

        if (!nombreComercio || !telefono || !correo || !nombreUsuario || !contraseña || !confirmar || !tipoComercioId || !horaApertura || !horaCierre) {
            return res.render("auth/registerComercio", {
                pageTitle: "Registro de Comercio",
                error: "Todos los campos son obligatorios.",
            });
        }

        if (contraseña !== confirmar) {
            return res.render("auth/registerComercio", {
                pageTitle: "Registro de Comercio",
                error: "Las contraseñas no coinciden.",
                tipoComercios: await TipoComercio.findAll(), 
            });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);

        const user = await Usuario.create({
            nombre: nombreComercio,
            apellido: "Comercio",
            correo,
            nombreUsuario,
            contraseña: hashedPassword,
            rol: "comercio",
            fotoPerfil: logo,
            activo: false,
        });

        await Comercio.create({
            nombreComercio,
            telefono,
            correo,
            logo,
            horaApertura,
            horaCierre,
            tipoComercioId, 
            usuarioId: user.id,
        });

        res.render("auth/registerComercio", {
            pageTitle: "Registro de Comercio",
            success: "Registro exitoso. Revisa tu correo para activar tu cuenta.",
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al registrar comercio. Intente más tarde." });
    }
};


// Render reset password form
exports.resetForm = (req, res) => {
    res.render("auth/reset", { pageTitle: "Restablecer Contraseña" });
};

// Handle reset token request
exports.resetToken = async (req, res) => {
    const { correo } = req.body;

    try {
        const user = await Usuario.findOne({ where: { correo } });

        if (!user) {
            return res.render("auth/reset", {
                pageTitle: "Restablecer Contraseña",
                error: "Correo no encontrado.",
            });
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: "1h" });

        const resetLink = `${req.protocol}://${req.get("host")}/auth/reset-password/${token}`;

        await transporter.sendMail({
            from: "Sistema <no-reply@example.com>",
            to: correo,
            subject: "Restablecer Contraseña",
            html: `<p>Hola,</p>
                   <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                   <a href="${resetLink}">Restablecer Contraseña</a>`,
        });

        res.render("auth/reset", {
            pageTitle: "Restablecer Contraseña",
            success: "Revisa tu correo para restablecer la contraseña.",
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al procesar solicitud. Intente más tarde." });
    }
};

// Render new password form
exports.passwordForm = (req, res) => {
    const { token } = req.params;

    try {
        jwt.verify(token, process.env.SECRET);

        res.render("auth/new-password", {
            pageTitle: "Nueva Contraseña",
            token,
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Enlace de restablecimiento inválido o expirado." });
    }
};

// Handle new password submission
exports.password = async (req, res) => {
    const { token } = req.params;
    const { contraseña, confirmar } = req.body;

    if (contraseña !== confirmar) {
        return res.render("auth/new-password", {
            pageTitle: "Nueva Contraseña",
            error: "Las contraseñas no coinciden.",
            token,
        });
    }

    try {
        const payload = jwt.verify(token, process.env.SECRET);

        const hashedPassword = await bcrypt.hash(contraseña, 10);

        await Usuario.update({ contraseña: hashedPassword }, { where: { id: payload.id } });

        res.redirect("/auth/login");
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al procesar solicitud. Intente más tarde." });
    }
};
