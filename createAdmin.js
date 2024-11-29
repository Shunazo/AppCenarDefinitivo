/*const Usuario = require('./models/usuario');
const Administrador = require('./models/administrador');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        const hashedPassword = await bcrypt.hash('adminpassword', 10);

        const usuarioRecord = await Usuario.create({
            nombre: 'Admin',
            apellido: 'User',
            correo: 'admin@gmail.com',
            telefono: '1234567890',
            nombreUsuario: 'adminuser',
            password: hashedPassword,
            rol: 'administrador',
            activo: true
        });

      
        const administradorRecord = await Administrador.create({
            usuarioId: usuarioRecord.id,
            cedula: '1234567890'  // Unique ID for the admin
        });

        console.log('Admin created successfully:', administradorRecord);
    } catch (error) {
        console.error('Error creating admin:', error);
    }
};

createAdmin();
*/