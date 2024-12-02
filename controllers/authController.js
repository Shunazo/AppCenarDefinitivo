const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const Comercio = require("../models/comercio");
const TipoComercio = require("../models/tipocomercio");
const transporter = require("../services/EmailService");
const Delivery = require("../models/delivery");
const Cliente = require("../models/cliente");


exports.loginForm = (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect(`/${req.session.rol}/home`);
    }
    res.render("auth/login", { pageTitle: "Iniciar Sesión" });
};


exports.login = async (req, res) => {
    const { correo, password } = req.body;

    try {
        if (!correo || !password) {
            return res.render("auth/login", {
                pageTitle: "Iniciar Sesión",
                error: "Todos los campos son obligatorios.",
            });
        }

        const user = await Usuario.findOne({ where: { correo } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
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

        if (user.rol === 'comercio') {
            const comercio = await Comercio.findOne({ where: { usuarioId: user.id } });
            req.session.comercioId = comercio.id;
        }

        if (user.rol === 'cliente') {
            const cliente = await Cliente.findOne({ where: { usuarioId: user.id } });
            req.session.clienteId = cliente.id;
        }

        if (user.rol === 'delivery') {
            const delivery = await Delivery.findOne({ where: { usuarioId: user.id } });
            req.session.deliveryId = delivery.id;
        }

        

        return req.session.save((err) => {
            console.log(err);
            res.redirect(`/${user.rol}/home`);
        });

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

        res.clearCookie("AppCenarCookie");
        res.redirect("/");
    });
};


exports.registerForm = (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect(`/${req.session.rol}/home`);
    }
    res.render("auth/registro-general", { pageTitle: "Registro de Usuario" });
};


exports.register = async (req, res) => {
    try {
        const { nombre, apellido, correo, telefono, nombreUsuario, password, confirmar, rol } = req.body;
        const fotoPerfil = "/images/" + req.files.fotoPerfil[0].filename;

        if (!req.files || !req.files.fotoPerfil) {
            return res.render("404", { pageTitle: "La imagen es obligatoria." });
        }

        if (!nombre || !apellido || !correo || !telefono || !nombreUsuario || !password || !confirmar || !rol) {
            return res.render("auth/registro-general", {
                pageTitle: "Registro de Usuario",
                error: "Todos los campos son obligatorios.",
            });
        }

       
        if (password !== confirmar) {
            return res.render("auth/registro-general", {
                pageTitle: "Registro de Usuario",
                error: "Las contraseñas no coinciden.",
            });
        }

        const existingUsuario = await Usuario.findOne({ where: { correo } });
        if (existingUsuario) {
            return res.render("auth/registro-general", {
                pageTitle: "Registro de Usuario",
                error: "Ya existe una cuenta registrada con ese correo.",
            });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const user = await Usuario.create({
            nombre,
            apellido,
            correo,
            telefono,
            nombreUsuario,
            password: hashedPassword,
            rol,
            fotoPerfil, 
            activo: false, 
        });

        if (rol === "cliente") {
            await Cliente.create({ usuarioId: user.id });
        } else if (rol === "delivery") {
            await Delivery.create({ usuarioId: user.id });
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: '5m' });

        transporter.sendMail(
            {
                from: "No-Reply <no-reply@example.com>",
                to: correo,
                subject: "Activación de cuenta",
                html: `
                    <p>Hola ${nombre},</p>
                    <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
                    <a href="${process.env.APP_URL}/auth/activate/${token}">Activar mi cuenta</a>
                `,
            },
            (err) => {
                if (err) {
                    console.log("Error al enviar el email:", err);
                    return res.render("404", { pageTitle: "Error al enviar el correo de activación." });
                }
            }
        );

        res.render("auth/registro-general", {
            pageTitle: "Registro de Usuario",
            success: "Registro exitoso. Revisa tu correo para activar tu cuenta, tiene 5 minutos.",
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al registrar usuario. Intente más tarde." });
    }
};


exports.registerComercioForm = async (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect(`/${req.session.rol}/home`);
    }
    try {
        const tipoComercios = await TipoComercio.findAll(); 

        res.render("auth/registro-comercio", {
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
        const tipoComercios = await TipoComercio.findAll();
        const { nombreComercio, telefono, correo, password, confirmar, tipoComercioId, horaApertura, horaCierre } = req.body;
        const logo = "/images/" + req.files.logo[0].filename;
        
        if (!req.files || !req.files.logo) {
            return res.render("auth/registro-comercio", {
                pageTitle: "Registro de Comercio",
                error: "La imagen de logo es obligatoria.",
                tipoComercios: tipoComercios.map(t => t.dataValues),
            });
        }

        
        if (password !== confirmar) {
            return res.render("auth/registro-comercio", {
                pageTitle: "Registro de Comercio",
                error: "Las contraseñas no coinciden.",
                tipoComercios: tipoComercios.map(t => t.dataValues),
            });
        }


        const existingCorreo = await Usuario.findOne({ where: { correo } });
        if (existingCorreo) {
            return res.render("auth/registro-comercio", {
                pageTitle: "Registro de Comercio",
                error: "Ya existe una cuenta registrada con ese correo.",
                tipoComercios: tipoComercios.map(t => t.dataValues),
            });
        }

        
        if (!nombreComercio || !telefono || !correo || !password || !confirmar || !tipoComercioId || !horaApertura || !horaCierre) {
            return res.render("auth/registro-comercio", {
                pageTitle: "Registro de Comercio",
                error: "Todos los campos son obligatorios.",
                tipoComercios: tipoComercios.map(t => t.dataValues),
            });
        }

      
        let nombreUsuario = nombreComercio;
        let existingUser = await Usuario.findOne({ where: { nombreUsuario } });
        let counter = 1;

        while (existingUser) {
            nombreUsuario = `${nombreComercio} ${counter}`;
            existingUser = await Usuario.findOne({ where: { nombreUsuario } });
            counter++;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

     
        const user = await Usuario.create({
            nombre: nombreComercio,
            apellido: "Comercio",
            correo,
            telefono,
            nombreUsuario,
            password: hashedPassword,
            rol: "comercio",
            fotoPerfil: logo,
            activo: false,
        });

       
        await Comercio.create({
            nombreComercio,
            logo,
            horaApertura,
            horaCierre,
            tipoComercioId, 
            usuarioId: user.id,
        });

        
        const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: '5m' });

       
        transporter.sendMail(
            {
                from: "No-Reply <no-reply@example.com>",
                to: correo,
                subject: "Activación de cuenta",
                html: `
                    <p>Hola ${nombreComercio},</p>
                    <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
                    <a href="${process.env.APP_URL}/auth/activate/${token}">Activar mi cuenta</a>
                `,
            },
            (err) => {
                if (err) {
                    console.log("Error al enviar el email:", err);
                    return res.render("404", { pageTitle: "Error al enviar el correo de activación." });
                }
            }
        );

        res.render("auth/registro-comercio", {
            pageTitle: "Registro de Comercio",
            success: "Registro exitoso. Revisa tu correo para activar tu cuenta, tiene 5 minutos.",
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al registrar comercio. Intente más tarde." });
    }
};




exports.resetForm = (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect(`/${req.session.rol}/home`);
    }
    res.render("auth/reset-password", { pageTitle: "Restablecer Contraseña" });
};


exports.resetToken = async (req, res) => {
    try {
        const { correo } = req.body;
        const user = await Usuario.findOne({ where: { correo } });

        if (!user) {
            return res.render("auth/reset-password", {
                pageTitle: "Restablecer Contraseña",
                error: "Correo no encontrado.",
            });
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: "5m" });

        const resetLink = `${req.protocol}://${req.get("host")}/new-password/${token}`;

        await transporter.sendMail({
            from: "Sistema <no-reply@example.com>",
            to: correo,
            subject: "Restablecer Contraseña",
            html: `<p>Hola,</p>
                   <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                   <a href="${resetLink}">Restablecer Contraseña</a>`,
        });

        res.render("auth/reset-password", {
            pageTitle: "Restablecer Contraseña",
            success: "Revisa tu correo para restablecer la contraseña, tiene 5 minutos.",
        });
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al procesar solicitud. Intente más tarde." });
    }
};


// Render new password form
exports.passwordForm = (req, res) => {
    if (req.session.isLoggedIn) {
        return res.redirect(`/${req.session.rol}/home`);
    }
    try {
    const { token } = req.params;

        jwt.verify(token, process.env.SECRET);

        res.render("auth/new-password", {
            pageTitle: "Nueva Contraseña",
            token,
        });
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Enlace de restablecimiento inválido o expirado." });
    }
};

// Handle new password submission
exports.password = async (req, res) => {
    try {
    const { token } = req.params;
    const { password, confirmar } = req.body;

    if (password !== confirmar) {
        return res.render("auth/new-password", {
            pageTitle: "Nueva Contraseña",
            error: "Las contraseñas no coinciden.",
            token,
        });
    }

        const payload = jwt.verify(token, process.env.SECRET);

        const hashedPassword = await bcrypt.hash(password, 10);

        await Usuario.update({ password: hashedPassword }, { where: { id: payload.id } });

        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.render("404", { pageTitle: "Error al procesar solicitud. Intente más tarde." });
    }
};

exports.activateAccount = async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, process.env.SECRET);

       
        const user = await Usuario.findOne({ where: { id: decoded.id } });

        if (!user) {
            return res.render("404", { pageTitle: "Usuario no encontrado." });
        }

  
        await Usuario.update({ activo: true }, { where: { id: user.id } });

        req.session.isLoggedIn = true;
        req.session.userId = user.id;
        req.session.rol = user.rol;

        if (user.rol === 'comercio') {
            const comercio = await Comercio.findOne({ where: { usuarioId: user.id } });
            req.session.comercioId = comercio.id;
        }

        if (user.rol === 'cliente') {
            const cliente = await Cliente.findOne({ where: { usuarioId: user.id } });
            req.session.clienteId = cliente.id;
        }

        if (user.rol === 'delivery') {
            const delivery = await Delivery.findOne({ where: { usuarioId: user.id } });
            req.session.deliveryId = delivery.id;
        }


        res.render("auth/activation-success", {
            pageTitle: "Cuenta Activada",
            message: "Tu cuenta ha sido activada exitosamente. Redirigiendo...",
            redirectUrl: `/${user.rol}/home`,
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.render("404", { pageTitle: "El enlace de activación ha expirado." });
        }
        console.error(error);
        return res.render("404", { pageTitle: "Error al activar la cuenta. Intente más tarde." });
    }
};

