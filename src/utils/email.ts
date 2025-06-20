// src/utils/email.ts

import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; // Importe dotenv para acessar as variáveis de ambiente

dotenv.config(); // Carregue as variáveis de ambiente

interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}

const sendEmail = async (options: EmailOptions) => {
    // 1) Crie um transporter (configurações do seu serviço de e-mail)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        // Se a porta for 465 (SSL), secure deve ser true. Para outras portas (como 587/2525 com TLS/STARTTLS), secure é false.
        secure: process.env.EMAIL_PORT === '465',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2) Defina as opções do e-mail
    const mailOptions = {
        from: 'FINDIT <contato@findit.com>', // Seu nome/email remetente
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: `<h1>${options.message}</h1>` // Opcional: pode enviar HTML
    };

    // 3) Envie o e-mail
    await transporter.sendMail(mailOptions);
};

export default sendEmail;