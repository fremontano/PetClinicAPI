import nodemailer from 'nodemailer';

export const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const { email, nombre, token } = datos;

    // Enviar email
    const info = await transport.sendMail({
        from: 'APV - Administrador de Pacientes Veterinaria',
        to: email,
        subject: 'Comprueba tu cuenta en APV',
        text: 'Comprueba tu cuenta en APV',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en APV.</p>
            <p>Tu cuenta ya está lista. Solo debes comprobarla en el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>
            <p>Si tú no creaste esta cuenta, puedes ignorar este mensaje.</p>
        `,
    });

    console.log('Mensaje enviado %s', info.messageId);
};
