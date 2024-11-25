const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port : 587,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter;