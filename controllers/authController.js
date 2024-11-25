const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const transporter = require("../services/EmailService");

const SECRET = process.env.SECRET; 


exports.loginForm = (req, res) => {
    if (req.cookies.auth_token) {
        try {
            const token = req.cookies.auth_token;
            const { rol } = jwt.verify(token, SECRET);
            return res.redirect(`/${rol}/home`);
        } catch {
            res.clearCookie("auth_token");
        }
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
                error: "Su cuenta está inactiva. Revise su correo o contacte al soporte.",
            });
        }

        const token = jwt.sign({ id: user.id, rol: user.rol }, SECRET, { expiresIn: "1h" });
        res.cookie("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

        res.redirect(`/${user.rol}/home`);
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al iniciar sesión. Intente más tarde." });
    }
};


exports.logout = (req, res) => {
    res.clearCookie("auth_token");
    res.redirect("/auth/login");
};


exports.registerForm = (req, res) => {
    res.render("auth/register", { pageTitle: "Registro de Usuario" });
};


exports.register = async (req, res) => {
    const { nombre, apellido, correo, nombreUsuario, contraseña, confirmar, rol } = req.body;
    const fotoPerfil = req.file ? "/" + req.file.path : null;

    try {
        if (!nombre || !apellido || !correo || !nombreUsuario || !contraseña || !confirmar || !rol) {
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

        const hashedPassword = await bcrypt.hash(contraseña, 10);

        const usuario = await Usuario.create({
            nombre,
            apellido,
            correo,
            nombreUsuario,
            contraseña: hashedPassword,
            rol,
            fotoPerfil,
            activo: false,
        });

        const token = jwt.sign({ id: usuario.id }, SECRET, { expiresIn: "24h" });

        const activationLink = `${req.protocol}://${req.get("host")}/auth/activate/${token}`;

        await transporter.sendMail({
            from: "Sistema <no-reply@example.com>",
            to: correo,
            subject: "Activación de cuenta",
            html: `<p>Hola ${nombre},</p>
                   <p>Por favor haz clic en el siguiente enlace para activar tu cuenta:</p>
                   <a href="${activationLink}">Activar cuenta</a>`,
        });

        res.render("auth/register", {
            pageTitle: "Registro de Usuario",
            success: "Registro exitoso. Revisa tu correo para activar tu cuenta.",
        });
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al registrar usuario. Intente más tarde." });
    }
};


exports.resetForm = (req, res) => {
    res.render("auth/reset", { pageTitle: "Restablecer Contraseña" });
};


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

        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });

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


exports.passwordForm = (req, res) => {
    const { token } = req.params;
    res.render("auth/new-password", { pageTitle: "Nueva Contraseña", token });
};


exports.password = async (req, res) => {
    const { token } = req.params;
    const { contraseña, confirmar } = req.body;

    try {
        if (contraseña !== confirmar) {
            return res.render("auth/new-password", {
                pageTitle: "Nueva Contraseña",
                error: "Las contraseñas no coinciden.",
                token,
            });
        }

        const payload = jwt.verify(token, SECRET);

        const hashedPassword = await bcrypt.hash(contraseña, 10);

        await Usuario.update({ contraseña: hashedPassword }, { where: { id: payload.id } });

        res.redirect("/auth/login");
    } catch (error) {
        console.error(error);
        res.render("404", { pageTitle: "Error al procesar solicitud. Intente más tarde." });
    }
};
