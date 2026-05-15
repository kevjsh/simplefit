import nodemailer from "nodemailer";
import { simplefitInfo } from "../../config/keys";

// Templates
import newCustomerTemplate from "./templates/auth/newCustomer.template";
import changePasswordTemplate from "./templates/auth/changePassword.email-template";
import recoveryPasswordTemplate from "./templates/auth/recoveryPassword.email-template";


export async function newCustomerMail(name: string, email: string, password: string, subject: string) {
  let transporter = nodemailer.createTransport(simplefitInfo.config);

  simplefitInfo.account.to = email;
  simplefitInfo.account.subject = subject;
  simplefitInfo.account.html = newCustomerTemplate(name, email, password);

  await transporter.sendMail(simplefitInfo.account);
}

export async function changePasswordMail(name: string, email: string, subject: string) {
  let transporter = nodemailer.createTransport(simplefitInfo.config);

  simplefitInfo.account.to = email;
  simplefitInfo.account.subject = subject;
  simplefitInfo.account.html = changePasswordTemplate(name);

  await transporter.sendMail(simplefitInfo.account);
}

export async function recoveryPasswordMail(name: string, email: string, password: string, subject: string) {
  let transporter = nodemailer.createTransport(simplefitInfo.config);

  simplefitInfo.account.to = email;
  simplefitInfo.account.subject = subject;
  simplefitInfo.account.html = recoveryPasswordTemplate(name, email, password);

  await transporter.sendMail(simplefitInfo.account);
}

