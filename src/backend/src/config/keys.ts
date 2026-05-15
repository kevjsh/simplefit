import { Attachment } from "nodemailer/lib/mailer";

/* JSON Web Tokens KEY */
export const SECRET_JWT_KEY: string = process.env.SECRET_JWT_KEY || "";
export const SECRET_REFRESH_JWT_KEY: string = process.env.SECRET_REFRESH_JWT_KEY || "";

/* Cookies settings */
export const COOKIE_SECRET_KEY: string = process.env.COOKIE_SECRET_KEY || "";
export const cookieParams = {
  httpOnly: true,
  secure: true,
  signed: true,
  maxAge: 7 * 24 * 60 * 60 * 1000
}

/* Email accounts */
export const simplefitInfo = {
  config: {
    host: process.env.SIMPLEFIT_SMTP_SERVER,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SIMPLEFIT_EMAIL_USER,
      pass: process.env.SIMPLEFIT_EMAIL_PASS,
    },
  },
  account: {
    from: '"Notificación SimpleFit" <info@simplefitcr.com>',
    to: "",
    cc: "",
    subject: "SIMPLEFIT",
    text: "Este es un mensaje de SIMPLEFIT",
    html: "",
    attachments: [] as Attachment[]
  },
};

export const facturas = {
  config: {
    host: process.env.SIMPLEFIT_SMTP_SERVER,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SIMPLEFIT_EMAIL_USER,
      pass: process.env.SIMPLEFIT_EMAIL_PASS,
    },
  },
  account: {
    from: '"Facturación SimpleFit" <facturas@simplefitcr.com>',
    to: "",
    subject: "Gimnasio Energía y Salud",
    text: "Este es un mensaje de Gimnasio Energía y Salud.",
    html: "",
    attachments: [] as Attachment[]
  },
};
